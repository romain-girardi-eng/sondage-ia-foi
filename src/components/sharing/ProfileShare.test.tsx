import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/lib";
import { ProfileShare } from "./ProfileShare";
import { getProfileShareURL } from "@/lib/profil/share";

function renderShare() {
  return render(
    <LanguageProvider initialLanguage="fr" initialSource="default">
      <ProfileShare profileId="pionnier_spirituel" />
    </LanguageProvider>,
  );
}

describe("ProfileShare", () => {
  const openSpy = vi.fn();

  beforeEach(() => {
    openSpy.mockReset();
    vi.stubGlobal("open", openSpy);
    // Desktop case: no native share sheet -> wa.me fallback.
    if ("share" in navigator) {
      // @ts-expect-error allow deleting the optional API for the test
      delete navigator.share;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens WhatsApp pre-filled with the profile text and URL", () => {
    renderShare();
    fireEvent.click(screen.getByText("Partager sur WhatsApp"));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const href = openSpy.mock.calls[0][0] as string;
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);

    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("Pionnier Spirituel");
    expect(decoded).toContain(getProfileShareURL("pionnier-spirituel"));
    expect(decoded).not.toContain("—");
  });

  it("copies the slug-only link to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderShare();
    fireEvent.click(screen.getByLabelText("Copier le lien"));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(getProfileShareURL("pionnier-spirituel")),
    );
  });
});
