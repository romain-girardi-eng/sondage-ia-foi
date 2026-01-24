import { describe, it, expect } from 'vitest';
import { translations } from './translations';

describe('translations', () => {
  it('has both fr and en translations', () => {
    expect(translations.fr).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('has matching top-level keys for fr and en', () => {
    const frKeys = Object.keys(translations.fr);
    const enKeys = Object.keys(translations.en);

    // Both should have the same set of keys
    expect(frKeys.sort()).toEqual(enKeys.sort());
  });

  it('has intro section with required keys', () => {
    const requiredKeys = ['title', 'subtitle', 'cta', 'startButton'];

    for (const key of requiredKeys) {
      expect(translations.fr.intro[key as keyof typeof translations.fr.intro]).toBeDefined();
      expect(translations.en.intro[key as keyof typeof translations.en.intro]).toBeDefined();
    }
  });

  it('has survey section with required keys', () => {
    const requiredKeys = ['questionOf', 'previous', 'continue'];

    for (const key of requiredKeys) {
      expect(translations.fr.survey[key as keyof typeof translations.fr.survey]).toBeDefined();
      expect(translations.en.survey[key as keyof typeof translations.en.survey]).toBeDefined();
    }
  });

  it('has feedback section', () => {
    expect(translations.fr.feedback).toBeDefined();
    expect(translations.en.feedback).toBeDefined();
  });

  it('has non-empty string values in intro', () => {
    for (const key of Object.keys(translations.fr.intro)) {
      const value = translations.fr.intro[key as keyof typeof translations.fr.intro];
      expect(typeof value).toBe('string');
      expect(value).not.toBe('');
    }
  });
});
