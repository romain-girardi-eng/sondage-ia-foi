import { test, expect } from "@playwright/test";

test.describe("CNEF co-branded landing", () => {
  test("shows CNEF co-branding, placeholder TODO and prominent anonymity", async ({ page }) => {
    await page.goto("/cnef");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/partenariat avec le CNEF/i)).toBeVisible();
    await expect(page.getByAltText(/Logo du CNEF|CNEF logo/i)).toBeVisible();
    // Anonymity reassurance reinforced just before the CTA.
    await expect(page.getByText(/Aucune donn[ée]e identifiante/i)).toBeVisible();
  });

  test("deep-links into the same survey pre-filled as Protestant", async ({ page }) => {
    await page.goto("/cnef");
    await page.waitForLoadState("networkidle");

    // Consent is required before the CTA enables.
    await page.getByText(/J'accepte les conditions/i).click();
    await page.getByRole("button", { name: /Commencer l'enqu[êe]te/i }).click();

    // Lands directly on the charismatic / non-charismatic question
    // (confession + evangelical background are pre-filled).
    await expect(
      page.getByRole("heading", { name: /protestantisme [ée]vang[ée]lique/i })
    ).toBeVisible();

    // Both stable segments are present, charismatic with examples.
    await expect(page.getByText(/Non-charismatique/i)).toBeVisible();
    await expect(page.getByText(/Assembl[ée]es de Dieu/i)).toBeVisible();

    // Answer the question, then assert the pre-filled values persisted.
    await page.getByRole("radio", { name: /Non-charismatique/i }).click();
    await page.waitForTimeout(1500); // debounced localStorage write

    const answers = await page.evaluate(() => {
      const raw = localStorage.getItem("survey-progress");
      return raw ? JSON.parse(raw).answers : null;
    });

    expect(answers).toMatchObject({
      profil_confession: "protestant",
      profil_confession_protestante: "evangelique",
      profil_confession_evangelique: "non_charismatique",
    });
  });
});

test.describe("Aggregated results privacy", () => {
  test("public endpoint never exposes free-text verbatims", async ({ request }) => {
    const response = await request.get("/api/results/aggregated");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const ids = (data.results as Array<{ questionId: string }>).map((r) => r.questionId);
    expect(ids).not.toContain("commentaires_libres");
  });
});
