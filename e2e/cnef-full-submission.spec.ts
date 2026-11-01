import { appendFileSync } from "node:fs";
import { test, expect, type Page, type Response } from "@playwright/test";
import { CNEF_WORDING_VERSION, cnefQuestionText } from "../src/lib/i18n/cnefWording";

// Walks the CNEF questionnaire through the real UI, reads the stored response
// back and erases it through the public data page. Writes real rows, so it only
// runs on explicit opt-in (E2E_ALLOW_WRITES=1). Every anonymous id goes to
// E2E_ID_FILE as soon as it is known, so an interrupted run can still be erased.

const MAX_STEPS = 150;
const OUT = process.env.E2E_OUT_DIR ?? "test-results";
const HIDDEN = ["theo_orientation", "ctrl_mc_1", "ctrl_mc_2", "ctrl_mc_3", "ctrl_mc_4", "ctrl_mc_5"];
const AVOID = /Je ne sais pas|Je préfère ne pas|^Autre|Aucun|Jamais|Sans religion/i;
const BROKEN_TEXT = /\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b|\w+\.\w+\.\w+Key/;

interface Path {
  name: string;
  status: string[];
  canonicalStatus: string;
  email: string;
  wantsPdf: boolean;
  // Question reached only on this path, proving the routing.
  mustVisit: string[];
  mustSkip: string[];
  picks: Record<string, RegExp>;
}

const PATHS: Path[] = [
  {
    name: "pasteur",
    status: ["Pasteur (à temps plein)", "Ancien"],
    canonicalStatus: "clerge",
    email: process.env.E2E_PDF_EMAIL ?? `e2e-cnef-pasteur-${Date.now()}@example.com`,
    wantsPdf: !!process.env.E2E_PDF_EMAIL,
    mustVisit: ["min_pred_usage", "min_pred_nature"],
    mustSkip: ["laic_conseil_spirituel"],
    picks: { ctrl_ia_frequence: /^Plusieurs fois par jour/, min_pred_usage: /^Régulièrement/ },
  },
  {
    name: "membre",
    status: ["Membre de l'association"],
    canonicalStatus: "laic_pratiquant",
    email: `e2e-cnef-membre-${Date.now()}@example.com`,
    wantsPdf: false,
    mustVisit: ["laic_conseil_spirituel"],
    mustSkip: ["min_pred_usage", "min_pred_nature"],
    picks: { ctrl_ia_frequence: /^Occasionnellement/ },
  },
];

// Scrolls through the page so the on-scroll animations finish before a full-page capture.
async function settle(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
}

const questionId = async (page: Page) => {
  const heading = page.locator('[id^="question-"]').first();
  return (await heading.count()) === 0 ? null : (await heading.getAttribute("id"))!.replace("question-", "");
};

async function answer(page: Page, id: string, path: Path) {
  const card = page.locator('[aria-labelledby^="question-"]').first();
  const next = card.getByRole("button", { name: /^Continuer/ });
  const groups = card.getByRole("radiogroup");
  const groupCount = await groups.count();

  if (id === "profil_statut") {
    await expect(card.getByRole("checkbox")).toHaveCount(8);
    for (const label of path.status) await card.getByRole("checkbox", { name: label }).click();
    await next.click();
    return;
  }
  if (groupCount > 1) {
    // Matrix: a different column per row, so the rows are told apart in the stored answer.
    for (let i = 0; i < groupCount; i++) {
      const radios = groups.nth(i).getByRole("radio");
      await radios.nth(Math.min(1 + (i % 3), (await radios.count()) - 1)).click();
    }
    await next.click();
    return;
  }
  const boxes = card.getByRole("checkbox");
  if ((await boxes.count()) > 0) {
    await boxes.first().click();
    await next.click();
    return;
  }
  if (groupCount === 1) {
    const radios = groups.first().getByRole("radio");
    const count = await radios.count();
    const wanted = path.picks[id];
    const labels: string[] = [];
    for (let i = 0; i < count; i++) labels.push(((await radios.nth(i).textContent()) ?? "").trim());
    const index = wanted
      ? labels.findIndex((label) => wanted.test(label))
      : labels.findIndex((label, i) => i > 0 && !AVOID.test(label));
    expect(index, `${id}: no option to pick in ${labels.join(" | ")}`).toBeGreaterThanOrEqual(0);
    await radios.nth(index).click();
    // Single choice advances by itself on most questions, and needs Continue on some.
    await page.waitForTimeout(150);
    if ((await questionId(page)) === id && (await next.isVisible()) && (await next.isEnabled())) await next.click();
    return;
  }
  // Scale or free text: type when a field is there, otherwise move a scale, then continue.
  const scale = card.getByRole("slider");
  if ((await scale.count()) > 0) await scale.first().press("ArrowRight");
  await next.click();
}

for (const path of PATHS) {
  test(`CNEF questionnaire, ${path.name} path, end to end and erased`, async ({ page }, info) => {
    test.skip(process.env.E2E_ALLOW_WRITES !== "1", "writes real rows; set E2E_ALLOW_WRITES=1");
    test.setTimeout(10 * 60 * 1000);
    page.setDefaultTimeout(20_000);

    const shot = (name: string) => page.screenshot({ path: `${OUT}/${path.name}-${name}.png`, fullPage: true });
    const problems: string[] = [];
    const partialStatus: number[] = [];
    let anonymousId: string | null = null;
    const remember = (id?: string) => {
      if (id && id !== anonymousId) {
        anonymousId = id;
        if (process.env.E2E_ID_FILE) appendFileSync(process.env.E2E_ID_FILE, `${id}\n`);
        console.log(`E2E_ANONYMOUS_ID=${id}`);
      }
    };
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text().slice(0, 200)}`);
    });
    page.on("response", (r: Response) => {
      const url = r.url();
      if (url.includes("/api/survey/partial") && r.request().method() === "POST") {
        partialStatus.push(r.status());
        remember((r.request().postDataJSON() as { anonymousId?: string }).anonymousId);
      }
      if (r.status() >= 400 && new URL(url).pathname.startsWith("/api/")) problems.push(`${r.status()} ${url}`);
    });

    await page.goto("/cnef");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass(/\blight\b/);
    await expect(page.getByText("Usage de l'IA par les protestants évangéliques", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tech & Foi" })).toHaveAttribute("href", /lecnef\.org\/page\/4147098/);
    await shot("01-accueil");

    await page.getByText(/J'accepte les conditions/i).click();
    await page.getByRole("button", { name: /Commencer l'enqu[êe]te/i }).click();

    const emailInput = page.locator('input[type="email"]');
    const visited: string[] = [];
    for (let step = 0; step < MAX_STEPS; step++) {
      if (await emailInput.isVisible()) break;
      const id = await questionId(page);
      expect(id, `no question on screen after ${visited.join(", ")}`).not.toBeNull();
      visited.push(id!);

      const heading = ((await page.locator(`[id="question-${id}"]`).textContent()) ?? "").trim();
      const expected = cnefQuestionText[id!];
      if (expected) expect.soft(heading, `wording of ${id}`).toContain(expected);
      if (id === "ctrl_ia_frequence") await expect(page.getByText("Plusieurs fois par jour")).toBeVisible();
      if (id === "min_pred_nature") await expect(page.getByText("Relecture ou reformulation")).toBeVisible();
      if (id === "profil_genre") await expect(page.getByRole("radio", { name: /^Autre/ })).toHaveCount(0);
      if (["profil_statut", "ctrl_ia_frequence", "min_pred_nature", "profil_genre"].includes(id!)) await shot(`q-${id}`);

      await answer(page, id!, path);
      await expect
        .poll(async () => (await emailInput.isVisible()) || (await questionId(page)) !== id, { timeout: 12_000 })
        .toBe(true);
    }
    console.log(`${path.name}: ${visited.length} questions: ${visited.join(", ")}`);
    await expect(emailInput).toBeVisible();
    for (const id of HIDDEN) expect(visited, `${id} must not be asked`).not.toContain(id);
    for (const id of path.mustVisit) expect(visited, `${id} is on this path`).toContain(id);
    for (const id of path.mustSkip) expect(visited, `${id} is not on this path`).not.toContain(id);
    await shot("02-courriel");

    const pdfBox = page.locator('input[type="checkbox"]').first();
    if ((await pdfBox.isChecked()) !== path.wantsPdf) await pdfBox.evaluate((el: HTMLInputElement) => el.click());
    await emailInput.fill(path.email);
    const submitted = page.waitForResponse((r) => r.url().includes("/api/survey/submit") && r.request().method() === "POST");
    const pdf = path.wantsPdf
      ? page.waitForResponse((r) => r.url().includes("/api/email/send-pdf"), { timeout: 60_000 })
      : null;
    await page.getByRole("button", { name: /Vérifier et continuer/i }).click();

    const response = await submitted;
    const sent = response.request().postDataJSON() as {
      anonymousId: string;
      answers: Record<string, unknown>;
      metadata: Record<string, unknown>;
    };
    remember(sent.anonymousId);
    const body = (await response.json()) as { success?: boolean; responseId?: string; demo?: boolean };
    console.log(`${path.name}: submit ${response.status()} demo=${body.demo ?? false}`);
    expect(response.status()).toBe(201);
    expect(sent.metadata.wordingVariant).toBe(CNEF_WORDING_VERSION);
    expect(sent.metadata.entryVariant).toBe("cnef");
    expect(sent.answers.profil_confession).toBe("protestant");
    expect(sent.answers.profil_confession_protestante).toBe("evangelique");
    expect(sent.answers.profil_statut).toBe(path.canonicalStatus);
    expect(Array.isArray(sent.answers._cnef_profil_statut)).toBe(true);
    for (const id of HIDDEN) expect(sent.answers).not.toHaveProperty(id);
    if (path.name === "pasteur") {
      expect(sent.answers._cnef_ctrl_ia_frequence).toBe("plusieurs_par_jour");
      expect(sent.answers.ctrl_ia_frequence).toBe("quotidien");
      expect(sent.answers.min_pred_nature).toHaveProperty("relecture");
    }
    if (pdf) {
      const pdfResponse = await pdf;
      console.log(`${path.name}: send-pdf ${pdfResponse.status()}`);
      expect(pdfResponse.status()).toBe(200);
    }

    // Results as the respondent reads them.
    await expect(page.getByText(/Découvrez vos résultats/i)).toBeVisible({ timeout: 30_000 });
    await page.waitForLoadState("networkidle");
    await settle(page);
    await shot("03-feedback");
    const feedback = await page.locator("body").innerText();
    expect.soft(feedback, "feedback screen text").not.toMatch(BROKEN_TEXT);
    await page.getByRole("button", { name: /Continuer|Voir|Suivant/i }).last().click();
    await settle(page);
    await shot("04-merci");
    const results = page.getByRole("button", { name: /résultats/i }).first();
    if (await results.isVisible()) {
      await results.click();
      await page.waitForLoadState("networkidle");
      await settle(page);
      await shot("05-resultats");
      expect.soft(await page.locator("body").innerText(), "results text").not.toMatch(BROKEN_TEXT);
    }

    // A second attempt from the same browser must be refused.
    const again = await page.evaluate(async () => {
      const csrf = await (await fetch("/api/csrf")).json();
      const r = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf.token },
        body: JSON.stringify({}),
      });
      return r.status;
    });
    console.log(`${path.name}: second submission ${again}`);
    expect.soft(again).toBe(403);

    console.log(`${path.name}: partial saves ${JSON.stringify(partialStatus)}`);
    console.log(`${path.name}: problems ${JSON.stringify(problems, null, 1)}`);
    if (body.demo) return; // No database behind this server: nothing stored, nothing to erase.

    // Read the stored row back, then erase it, through the public data page.
    await page.goto("/mes-donnees");
    await page.waitForLoadState("networkidle");
    await shot("06-mes-donnees");
    const idField = page.locator("input").first();
    await idField.fill(sent.anonymousId);
    const exported = page.waitForResponse((r) => r.url().includes("/api/user/data") && r.request().method() === "POST");
    await idField.press("Enter").catch(() => undefined);
    await page.locator("button").filter({ has: page.locator("svg") }).first().click().catch(() => undefined);
    const stored = (await (await exported).json()) as { data: { responses?: Array<Record<string, unknown>> } | null };
    const row = stored.data?.responses?.[0] as
      | { answers?: Record<string, unknown>; metadata?: Record<string, unknown> }
      | undefined;
    expect(row, "stored response readable through the data page").toBeTruthy();
    expect(row!.metadata?.wordingVariant).toBe(CNEF_WORDING_VERSION);
    expect(row!.answers?.profil_statut).toBe(path.canonicalStatus);
    expect(row!.answers).toHaveProperty("_cnef_profil_statut");
    expect(Object.keys(row!.answers ?? {}).length).toBe(Object.keys(sent.answers).length);
    await shot("07-mes-donnees-trouve");

    page.once("dialog", (dialog) => dialog.accept());
    const erased = page.waitForResponse((r) => r.url().includes("/api/user/data") && r.request().method() === "DELETE");
    await page.getByRole("button", { name: /supprimer/i }).first().click();
    const erasedResponse = await erased;
    const erasedBody = (await erasedResponse.json()) as { details?: Record<string, number> };
    console.log(`${path.name}: erased ${JSON.stringify(erasedBody.details)}`);
    expect(erasedResponse.status()).toBe(200);
    expect(erasedBody.details?.responses).toBe(1);
    await page.waitForTimeout(1000);
    await shot("08-efface");

    const after = await page.evaluate(async (id) => {
      const csrf = await (await fetch("/api/csrf")).json();
      const r = await fetch("/api/user/data", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf.token },
        body: JSON.stringify({ anonymousId: id }),
      });
      return r.json();
    }, sent.anonymousId);
    console.log(`${path.name}: after erasure ${JSON.stringify(after).slice(0, 300)}`);
    expect.soft(after.data?.responses ?? []).toHaveLength(0);
    expect.soft(after.data?.sessions ?? []).toHaveLength(0);

    console.log(`${path.name}: problems at the end ${JSON.stringify(problems, null, 1)}`);
    info.annotations.push({ type: "problems", description: problems.join(" ; ") });
  });
}
