import { test, expect, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const HERO_HEADING = /Intelligence Artificielle|Artificial Intelligence/i;

async function getCsrfToken(request: APIRequestContext): Promise<string> {
  const csrfResponse = await request.get("/api/csrf");
  expect(csrfResponse.ok()).toBeTruthy();

  const data = await csrfResponse.json();
  expect(data.token).toBeTruthy();

  return data.token as string;
}

test.describe("Survey Flow", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/IA & Vie Spirituelle/);
    await expect(page.getByRole("heading", { name: HERO_HEADING })).toBeVisible();
  });

  test("should display consent checkbox before starting", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const consentText = page.getByText(/J'accepte|consent/i);
    await expect(consentText.first()).toBeVisible();
  });

  test("should navigate to privacy page", async ({ page }) => {
    await page.goto("/privacy");

    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByText(/Politique de Confidentialité|Privacy Policy/i)).toBeVisible();
  });

  test("should navigate to legal page", async ({ page }) => {
    await page.goto("/legal");

    await expect(page).toHaveURL(/\/legal/);
    await expect(page.getByText(/Mentions Légales|Legal Notices/i)).toBeVisible();
  });

  test("should navigate to FAQ page", async ({ page }) => {
    await page.goto("/faq");

    await expect(page).toHaveURL(/\/faq/);
    await expect(
      page.getByRole("heading", {
        name: /Questions Fr[eé]quentes|Frequently Asked Questions|FAQ/i,
      })
    ).toBeVisible();
  });

  test("should handle 404 page", async ({ page }) => {
    await page.goto("/non-existent-page");

    await expect(page.getByText(/404/)).toBeVisible();
  });

  test("should load admin login page", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: /Admin Dashboard/i })).toBeVisible();
    await expect(page.getByLabel(/Admin Password|mot de passe|password/i)).toBeVisible();
  });
});

test.describe("API Endpoints", () => {
  test("should return aggregated results", async ({ request }) => {
    const response = await request.get("/api/results/aggregated");

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("participantCount");
    expect(data).toHaveProperty("results");
    expect(data).toHaveProperty("lastUpdated");
  });

  test("should reject unauthorized export", async ({ request }) => {
    const response = await request.get("/api/results/export");

    expect(response.status()).toBe(401);
  });

  test("should validate survey submission", async ({ request }) => {
    const csrfToken = await getCsrfToken(request);

    const response = await request.post("/api/survey/submit", {
      headers: {
        "x-csrf-token": csrfToken,
        "x-forwarded-for": "203.0.113.10",
      },
      data: {
        sessionId: "invalid-id",
        answers: {},
        consentGiven: true,
      },
    });

    expect(response.status()).toBe(400);
  });

  test("should accept valid survey submission", async ({ request }) => {
    const csrfToken = await getCsrfToken(request);

    const response = await request.post("/api/survey/submit", {
      headers: {
        "x-csrf-token": csrfToken,
        "x-forwarded-for": "203.0.113.11",
      },
      data: {
        sessionId: crypto.randomUUID(),
        answers: { q1: "test" },
        consentGiven: true,
        consentVersion: "1.0",
        anonymousId: crypto.randomUUID(),
        fingerprint: `e2e-${Date.now()}`,
      },
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(typeof data.responseId).toBe("string");
  });
});

test.describe("Accessibility", () => {
  test("homepage should have no critical accessibility issues", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude(".three-canvas")
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("privacy page should have no critical accessibility issues", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });

  test("admin page should have no critical accessibility issues", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });
});

test.describe("Responsive Design", () => {
  test("should be usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: HERO_HEADING })).toBeVisible();
  });

  test("should be usable on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: HERO_HEADING })).toBeVisible();
  });
});
