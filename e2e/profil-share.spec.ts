import { test, expect } from "@playwright/test";

// The shareable archetype page is the entry point of the viral loop:
// a friend lands here, sees the profile type, and is pushed into the survey.
test.describe("Public archetype profile page", () => {
  test("renders the archetype and the CTA into the CNEF survey", async ({ page }) => {
    await page.goto("/profil/pionnier-spirituel");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pionnier Spirituel");
    await expect(page.getByText(/quel est votre profil/i)).toBeVisible();

    const cta = page.getByRole("link", { name: /D[ée]couvrir mon profil/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/cnef");

    await expect(page.getByText(/En partenariat avec le CNEF/i)).toBeVisible();
    await expect(page.getByText(/100% anonyme · 5 min/i)).toBeVisible();
  });

  test("exposes a 1200x630 PNG Open Graph image and og meta", async ({ page, request }) => {
    await page.goto("/profil/pionnier-spirituel");

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);

    const ogUrl = await ogImage.getAttribute("content");
    expect(ogUrl).toBeTruthy();

    const response = await request.get(ogUrl as string);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/png");

    // PNG IHDR encodes width/height at bytes 16..24.
    const body = await response.body();
    const width = body.readUInt32BE(16);
    const height = body.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });

  test("unknown archetype slugs return 404", async ({ request }) => {
    const response = await request.get("/profil/ce-profil-nexiste-pas");
    expect(response.status()).toBe(404);
  });
});
