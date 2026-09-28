import { test, expect, type Page } from "@playwright/test";

// Walks the questionnaire through the real UI. Both tests write real rows, so
// they only run on explicit opt-in (E2E_ALLOW_WRITES=1); the rows they create
// must be deleted afterwards through delete_user_data, with the anonymous id
// each test prints.

const MAX_STEPS = 150;
const SCREEN_OUT = /Sans religion/i;

async function currentQuestionId(page: Page): Promise<string | null> {
  const heading = page.locator('[id^="question-"]').first();
  if ((await heading.count()) === 0) return null;
  return heading.getAttribute("id");
}

async function answerCurrentQuestion(page: Page): Promise<void> {
  const card = page.locator('[aria-labelledby^="question-"]').first();
  const continueButton = card.getByRole("button", { name: /^Continuer/ });
  const radiogroups = card.getByRole("radiogroup");
  const groupCount = await radiogroups.count();

  if (groupCount > 1) {
    for (let i = 0; i < groupCount; i++) {
      await radiogroups.nth(i).getByRole("radio").first().click();
    }
    await continueButton.click();
    return;
  }

  const checkboxes = card.getByRole("checkbox");
  if ((await checkboxes.count()) > 0) {
    await checkboxes.first().click();
    await continueButton.click();
    return;
  }

  if (groupCount === 1) {
    const radios = radiogroups.first().getByRole("radio");
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      const label = (await radios.nth(i).textContent()) ?? "";
      if (!SCREEN_OUT.test(label)) {
        await radios.nth(i).click();
        return;
      }
    }
  }

  // Free-text question: optional, skipped.
  await continueButton.click();
}

async function startSurvey(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      // Private mode: nothing to clear.
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByText(/j'accepte les conditions/i).click();
  await page.getByRole("button", { name: /Commencer le sondage/i }).click();
}

test.beforeEach(({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== "1", "writes real rows; set E2E_ALLOW_WRITES=1");
  test.setTimeout(10 * 60 * 1000);
  page.setDefaultTimeout(15_000);
});

test("saves progress server-side when the questionnaire is abandoned", async ({ page }) => {
  await startSurvey(page);

  for (let step = 0; step < 5; step++) {
    const id = await currentQuestionId(page);
    await answerCurrentQuestion(page);
    await expect.poll(() => currentQuestionId(page), { timeout: 10_000 }).not.toBe(id);
  }

  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/survey/partial") && r.request().method() === "POST"
  );
  const response = await saved;
  const body = response.request().postDataJSON() as {
    anonymousId: string;
    answers: Record<string, unknown>;
  };
  console.log(`E2E_ANONYMOUS_ID=${body.anonymousId} (abandoned)`);
  expect(response.status()).toBe(200);
  expect(Object.keys(body.answers).length).toBeGreaterThanOrEqual(5);
});

test("submits a complete questionnaire end to end", async ({ page }) => {
  await startSurvey(page);

  const emailInput = page.locator('input[type="email"]');
  const visited: string[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    if (await emailInput.isVisible()) break;
    const id = await currentQuestionId(page);
    expect(id, `no question on screen after ${visited.join(", ")}`).not.toBeNull();
    visited.push(id!.replace("question-", ""));
    await answerCurrentQuestion(page);
    await expect
      .poll(async () => (await emailInput.isVisible()) || (await currentQuestionId(page)) !== id, {
        timeout: 10_000,
      })
      .toBe(true);
  }
  console.log(`answered ${visited.length} questions: ${visited.join(", ")}`);
  await expect(emailInput).toBeVisible();

  await emailInput.fill(`e2e-full-${Date.now()}@example.com`);
  const submitResponse = page.waitForResponse(
    (r) => r.url().includes("/api/survey/submit") && r.request().method() === "POST"
  );
  await page.getByRole("button", { name: /Vérifier et continuer/i }).click();

  const response = await submitResponse;
  const requestBody = response.request().postDataJSON() as {
    sessionId: string;
    anonymousId: string;
    metadata: { instrumentVersion: string };
  };
  const body = (await response.json()) as { success?: boolean; responseId?: string };
  console.log(
    `E2E_ANONYMOUS_ID=${requestBody.anonymousId} E2E_SESSION_ID=${requestBody.sessionId} E2E_RESPONSE_ID=${body.responseId}`
  );

  expect(response.status()).toBe(201);
  expect(body.success).toBe(true);
  expect(requestBody.metadata.instrumentVersion).toMatch(/^2\./);
  await expect(page.getByText(/Découvrez vos résultats/i)).toBeVisible({ timeout: 20_000 });
});
