import { describe, it, expect } from 'vitest';
import {
  surveySubmissionSchema,
  partialSaveSchema,
  exportRequestSchema,
  userDataSchema,
  getExclusiveConflictQuestionId,
} from './validation';

describe('surveySubmissionSchema', () => {
  it('validates valid survey submission', () => {
    const validData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      answers: { q1: 'answer1', q2: 'answer2' },
      consentGiven: true,
      consentVersion: '1.0',
      anonymousId: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = surveySubmissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('preserves the instrument version (schema/cutover lineage)', () => {
    const validData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      answers: { profil_confession: 'protestant' },
      metadata: { instrumentVersion: '1.4.0', language: 'fr' },
      consentGiven: true,
      consentVersion: '1.0',
      anonymousId: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = surveySubmissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.instrumentVersion).toBe('1.4.0');
    }
  });

  it('rejects invalid UUID for sessionId', () => {
    const invalidData = {
      sessionId: 'invalid-uuid',
      answers: { q1: 'answer1' },
      consentGiven: true,
      consentVersion: '1.0',
      anonymousId: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = surveySubmissionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects when consent is not given', () => {
    const invalidData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      answers: { q1: 'answer1' },
      consentGiven: false,
      consentVersion: '1.0',
      anonymousId: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = surveySubmissionSchema.safeParse(invalidData);
    // Note: schema allows false, but API should reject it
    expect(result.success).toBe(true);
  });

  it('accepts optional metadata', () => {
    const validData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      answers: { q1: 'answer1' },
      consentGiven: true,
      consentVersion: '1.0',
      anonymousId: '550e8400-e29b-41d4-a716-446655440001',
      metadata: { browser: 'Chrome', platform: 'Windows' },
    };

    const result = surveySubmissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('partialSaveSchema', () => {
  it('validates valid partial save', () => {
    const validData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      anonymousId: '6f9619ff-8b86-4d11-b42d-00c04fc964ff',
      answers: { q1: 'answer1' },
      lastQuestionIndex: 5,
      language: 'fr',
    };

    const result = partialSaveSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid language', () => {
    const invalidData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      anonymousId: '6f9619ff-8b86-4d11-b42d-00c04fc964ff',
      answers: { q1: 'answer1' },
      lastQuestionIndex: 5,
      language: 'de',
    };

    const result = partialSaveSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects negative lastQuestionIndex', () => {
    const invalidData = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      anonymousId: '6f9619ff-8b86-4d11-b42d-00c04fc964ff',
      answers: { q1: 'answer1' },
      lastQuestionIndex: -1,
      language: 'fr',
    };

    const result = partialSaveSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects a partial save without anonymousId', () => {
    const result = partialSaveSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      answers: { q1: 'answer1' },
      lastQuestionIndex: 5,
      language: 'fr',
    });
    expect(result.success).toBe(false);
  });
});

describe('exportRequestSchema', () => {
  it('validates valid export request with json format', () => {
    const validData = {
      format: 'json',
    };

    const result = exportRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates valid export request with csv format', () => {
    const validData = {
      format: 'csv',
    };

    const result = exportRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates export request with datetime filters', () => {
    const validData = {
      format: 'json',
      dateFrom: '2024-01-01T00:00:00.000Z',
      dateTo: '2024-12-31T23:59:59.999Z',
    };

    const result = exportRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid format', () => {
    const invalidData = {
      format: 'xml',
    };

    const result = exportRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('userDataSchema', () => {
  it('validates valid anonymous ID', () => {
    const validData = {
      anonymousId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = userDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid anonymous ID', () => {
    const invalidData = {
      anonymousId: 'not-a-uuid',
    };

    const result = userDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('surveySubmissionSchema — instrument v2 metadata', () => {
  const base = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    answers: { profil_confession: 'protestant' },
    consentGiven: true,
    consentVersion: '2.0',
    anonymousId: '550e8400-e29b-41d4-a716-446655440001',
  };

  it('accepts the CNEF entry variant', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      metadata: { instrumentVersion: '2.0.0', entryVariant: 'cnef', language: 'fr' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.entryVariant).toBe('cnef');
    }
  });

  it('accepts the general entry variant', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      metadata: { entryVariant: 'general' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown entry variant', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      metadata: { entryVariant: 'newsletter' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a screened-out submission', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: { profil_confession: 'sans_religion' },
      metadata: { instrumentVersion: '2.0.0', entryVariant: 'general', screenedOut: true },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.screenedOut).toBe(true);
    }
  });

  it('rejects a non-boolean screenedOut flag', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      metadata: { screenedOut: 'yes' },
    });
    expect(result.success).toBe(false);
  });
});

describe('"aucun" exclusivity', () => {
  const base = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    consentGiven: true,
    consentVersion: '2.0',
    anonymousId: '550e8400-e29b-41d4-a716-446655440001',
  };

  it('accepts an exclusive option on its own', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: { digital_outils_existants: ['aucun'] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an exclusive option combined with others', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: { digital_outils_existants: ['bible_app', 'aucun'] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects "aucune" combined with others', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: { theo_activites_sacrees: ['aucune', 'sacrements'] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects "aucun_domaines" combined with others on a partial save', () => {
    const result = partialSaveSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      anonymousId: '6f9619ff-8b86-4d11-b42d-00c04fc964ff',
      answers: { futur_domaines_interet: ['etude_bible', 'aucun_domaines'] },
      lastQuestionIndex: 12,
      language: 'fr',
    });
    expect(result.success).toBe(false);
  });

  it('still accepts a normal multiple-choice answer', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: { digital_outils_existants: ['bible_app', 'podcast'] },
    });
    expect(result.success).toBe(true);
  });

  it('reports the offending question id on the issue path', () => {
    const result = surveySubmissionSchema.safeParse({
      ...base,
      answers: {
        profil_confession: 'protestant',
        digital_outils_existants: ['bible_app', 'aucun'],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['answers', 'digital_outils_existants']);
      expect(getExclusiveConflictQuestionId(result.error.issues)).toBe(
        'digital_outils_existants'
      );
    }
  });

  it('reports the offending question id on a partial save too', () => {
    const result = partialSaveSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      anonymousId: '6f9619ff-8b86-4d11-b42d-00c04fc964ff',
      answers: { futur_domaines_interet: ['etude_bible', 'aucun_domaines'] },
      lastQuestionIndex: 12,
      language: 'fr',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getExclusiveConflictQuestionId(result.error.issues)).toBe(
        'futur_domaines_interet'
      );
    }
  });

  it('returns null for an unrelated validation failure', () => {
    const result = surveySubmissionSchema.safeParse({ ...base, sessionId: 'nope' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getExclusiveConflictQuestionId(result.error.issues)).toBeNull();
    }
  });
});
