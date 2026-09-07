import { test, expect, type Page } from "@playwright/test";

// The screen-out branch never writes to the database in this file: the
// confirmation step is reached and cancelled, and the confirm button (the only
// path that submits) is deliberately never clicked.

const CONFESSION_QUESTION = /branche chr[ée]tienne principale/i;

async function startSurvey(page: Page) {
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

  await expect(page.getByRole("heading", { name: CONFESSION_QUESTION })).toBeVisible();
}

test.describe("Screen-out confirmation", () => {
  test("asks for confirmation on the first click on « Sans religion / Autre »", async ({ page }) => {
    await startSurvey(page);

    const screenOutOption = page.getByRole("radio", { name: "Sans religion / Autre" });
    await expect(screenOutOption).toBeVisible();
    await screenOutOption.click();

    // First click, no second one: the confirmation step must already be there.
    await expect(
      page.getByRole("heading", { name: /Confirmer votre r[ée]ponse/i })
    ).toBeVisible();
    await expect(page.getByText(/confession chr[ée]tienne/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Revenir/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Confirmer et terminer/i })).toBeVisible();

    // Nothing was submitted: the questionnaire has not ended.
    await expect(page.getByText(/Merci de votre int[ée]r[êe]t/i)).toHaveCount(0);
  });

  test("« Revenir » goes back to the question with the options still selectable", async ({ page }) => {
    await startSurvey(page);

    await page.getByRole("radio", { name: "Sans religion / Autre" }).click();
    await page.getByRole("button", { name: /Revenir/i }).click();

    await expect(page.getByRole("heading", { name: CONFESSION_QUESTION })).toBeVisible();

    // The mis-clicked option is still the current answer...
    await expect(page.getByRole("radio", { name: "Sans religion / Autre" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    // ...and the adjacent option can be picked to correct it.
    const otherChristian = page.getByRole("radio", { name: "Autre chrétien" });
    await expect(otherChristian).toBeVisible();
    await otherChristian.click();

    await expect(
      page.getByRole("heading", { name: /Confirmer votre r[ée]ponse/i })
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: CONFESSION_QUESTION })).toHaveCount(0);
  });
});
