import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { LanguageProvider, ThemeProvider } from "@/lib";
import { calculateProfileSpectrum } from "@/lib/scoring";
import { translations } from "@/lib/i18n/translations";
import type { Answers } from "@/data";
import type { ProfileSpectrum } from "@/lib/scoring/types";
import {
  gardienTraditionAnswers,
  emptyAnswers,
} from "@/lib/scoring/__tests__/fixtures";
import { FeedbackScreen } from "./FeedbackScreen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/fr",
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * The screen reads the spectrum through `useMemoizedProfileSpectrum`. Two of
 * the three states below come straight from the scoring engine; the "low
 * confidence" state is unreachable with real answers today (every full
 * response scores at least 45 on its primary profile), so it is exercised by
 * overriding that one field of a genuine spectrum.
 */
let spectrumOverride: ProfileSpectrum | null = null;

vi.mock("@/lib", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib")>();
  return {
    ...actual,
    useMemoizedProfileSpectrum: (answers: Answers) =>
      spectrumOverride ?? actual.useMemoizedProfileSpectrum(answers),
  };
});

async function renderFeedback(answers: Answers) {
  const result = render(
    <ThemeProvider>
      <LanguageProvider initialLanguage="fr" initialSource="default">
        <FeedbackScreen answers={answers} onContinue={vi.fn()} />
      </LanguageProvider>
    </ThemeProvider>,
  );
  // Let the norms fetch settle so its state update happens inside act().
  await act(async () => {
    await Promise.resolve();
  });
  return result;
}

describe("FeedbackScreen", () => {
  beforeEach(() => {
    spectrumOverride = null;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ n: 4, mode: "insufficient" }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows one profile, the heuristic caveat and a raw match score", async () => {
    await renderFeedback(gardienTraditionAnswers);

    expect(screen.getByText(/Attribution heuristique, non validée/)).toBeInTheDocument();
    expect(screen.getAllByText("Gardien de la Tradition").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/correspondance \d+ \/ 100/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Deux profils proches")).toBeNull();
  });

  it("never shows a Top X % or a vs-others comparison", async () => {
    await renderFeedback(gardienTraditionAnswers);

    expect(screen.queryByText(/Top \d/)).toBeNull();
    expect(screen.queryByText(/vs autres/)).toBeNull();
    expect(
      screen.getAllByText("Comparaison disponible à partir de 30 participants").length,
    ).toBe(2);
  });

  it("replaces the resistance index with the ordinal usage gap", async () => {
    await renderFeedback(gardienTraditionAnswers);

    expect(screen.getByText("Écart d'usage")).toBeInTheDocument();
    expect(screen.getByText("Aucun usage de l'IA déclaré")).toBeInTheDocument();
    expect(screen.queryByText(/Résistance [Ss]pirituelle/)).toBeNull();
    expect(screen.queryByText("IA Général")).toBeNull();
  });

  it("presents two close profiles when the attribution confidence is low", async () => {
    const spectrum = calculateProfileSpectrum(gardienTraditionAnswers);
    spectrumOverride = { ...spectrum, profileConfidence: "low" };

    await renderFeedback(gardienTraditionAnswers);

    const runnerUpName = translations.fr.profiles[spectrum.allMatches[1].profile];

    expect(screen.getByText("Deux profils proches")).toBeInTheDocument();
    expect(screen.getAllByText("Gardien de la Tradition").length).toBeGreaterThan(0);
    expect(screen.getAllByText(runnerUpName).length).toBeGreaterThan(0);
    // Both are shown with their raw score, neither is announced as the winner.
    expect(screen.getAllByText(/correspondance \d+ \/ 100/).length).toBeGreaterThanOrEqual(2);
  });

  it("falls back to a calm no-profile state with the raw dimension list", async () => {
    await renderFeedback(emptyAnswers);

    expect(
      screen.getByText(/Profil non attribuable.*trop peu de dimensions mesurées/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Dimensions mesurées.*0 sur 7/)).toBeInTheDocument();
    expect(screen.getAllByText("Non mesuré (trop peu de réponses)").length).toBe(9);
    expect(screen.queryByText("Spectre de votre profil")).toBeNull();
    expect(screen.queryByText("Partager mon profil")).toBeNull();
  });
});
