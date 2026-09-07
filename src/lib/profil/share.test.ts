import { describe, it, expect } from "vitest";
import {
  getProfileShareURL,
  getProfileShareText,
  buildProfileShareLinks,
  getShareBaseURL,
} from "./share";

describe("getProfileShareURL", () => {
  it("builds a slug-only URL with no personal data", () => {
    const url = getProfileShareURL("pionnier-spirituel");
    expect(url).toBe(`${getShareBaseURL()}/profil/pionnier-spirituel`);
    expect(url).not.toMatch(/@|hash|email|token|id=/i);
  });
});

describe("getProfileShareText", () => {
  const url = "https://ia-foi.fr/profil/pionnier-spirituel";

  it("includes the title and the URL in French by default", () => {
    const text = getProfileShareText("Pionnier Spirituel", url);
    expect(text).toContain("Pionnier Spirituel");
    expect(text).toContain(url);
  });

  it("never names the CNEF outside the cnef entry variant", () => {
    expect(getProfileShareText("Pionnier Spirituel", url)).not.toContain("CNEF");
    expect(getProfileShareText("Pionnier Spirituel", url, "fr", "general")).not.toContain("CNEF");
    expect(getProfileShareText("Spiritual Pioneer", url, "en", "general")).not.toContain("CNEF");
  });

  it("names the CNEF for respondents recruited through the CNEF page", () => {
    expect(getProfileShareText("Pionnier Spirituel", url, "fr", "cnef")).toContain("CNEF");
    expect(getProfileShareText("Spiritual Pioneer", url, "en", "cnef")).toContain("CNEF");
  });

  it("never contains an em dash or an emoji", () => {
    const text = getProfileShareText("Gardien de la Tradition", url, "fr");
    expect(text).not.toContain("—");
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("uses a narrow no-break space before the French question mark", () => {
    const text = getProfileShareText("Gardien de la Tradition", url, "fr");
    expect(text).toContain(" ?");
    expect(text).not.toMatch(/ \?/);
  });

  it("supports an English variant", () => {
    const text = getProfileShareText("Spiritual Pioneer", url, "en");
    expect(text).toContain("Spiritual Pioneer");
    expect(text).toContain(url);
    expect(text).not.toContain("—");
  });
});

describe("buildProfileShareLinks", () => {
  const url = "https://ia-foi.fr/profil/pionnier-spirituel";
  const text = getProfileShareText("Pionnier Spirituel", url);
  const links = buildProfileShareLinks(text, url);

  it("uses the wa.me fallback for WhatsApp with encoded text", () => {
    expect(links.whatsapp.startsWith("https://wa.me/?text=")).toBe(true);
    expect(links.whatsapp).toContain(encodeURIComponent(url));
    expect(decodeURIComponent(links.whatsapp)).toContain("Pionnier Spirituel");
  });

  it("builds X and Facebook intents", () => {
    expect(links.x).toContain("twitter.com/intent/tweet");
    expect(links.x).toContain(encodeURIComponent(text));
    expect(links.facebook).toContain("facebook.com/sharer");
    expect(links.facebook).toContain(encodeURIComponent(url));
  });
});
