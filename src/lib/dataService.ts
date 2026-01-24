import { SURVEY_QUESTIONS } from "@/data";

export type AggregatedResult = {
  questionId: string;
  total: number;
  distribution: Record<string, number>;
};

// Générateur de données simulées pour les résultats agrégés
export const getMockResults = (): AggregatedResult[] => {
  const TOTAL_RESPONDENTS = 1543;

  return SURVEY_QUESTIONS.map(q => {
    const distribution: Record<string, number> = {};
    let remaining = TOTAL_RESPONDENTS;

    if (q.type === 'choice' || q.type === 'multiple') {
      const optionsCount = q.options?.length || 0;
      if (optionsCount > 0) {
        q.options!.forEach((opt, index) => {
          let count: number;

          // Distributions spécifiques selon les questions
          if (q.id === 'min_pred_usage' && opt.value === 'jamais') {
            // Hypothèse : beaucoup de prêtres résistent encore
            count = Math.floor(remaining * 0.4);
          } else if (q.id === 'crs_private_practice' && opt.value === 'quotidien') {
            // Les chrétiens pratiquants prient souvent
            count = Math.floor(remaining * 0.35);
          } else if (q.id === 'theo_orientation' && opt.value === 'modere') {
            // Distribution centriste dominante
            count = Math.floor(remaining * 0.45);
          } else if (q.id.startsWith('ctrl_mc_') && opt.value === 'true') {
            // Désirabilité sociale : distribution équilibrée
            count = Math.floor(remaining * 0.5);
          } else if (index === optionsCount - 1) {
            count = remaining;
          } else {
            count = Math.floor(remaining / (optionsCount - index + 1));
          }

          // Sécurité
          count = Math.max(0, Math.min(count, remaining));
          distribution[opt.value] = count;
          remaining -= count;
        });
      }
    } else if (q.type === 'scale') {
      // Distribution normale simulée pour les échelles 1-5
      const shares = [0.08, 0.17, 0.40, 0.22, 0.13]; // Légèrement centrée
      [1, 2, 3, 4, 5].forEach((val, index) => {
        let count: number;
        if (index === 4) {
          count = remaining;
        } else {
          count = Math.floor(TOTAL_RESPONDENTS * shares[index]);
          // Petit bruit aléatoire pour réalisme
          count += Math.floor(Math.random() * 20 - 10);
        }
        count = Math.max(0, Math.min(count, remaining));
        distribution[val] = count;
        remaining -= count;
      });
    }

    return {
      questionId: q.id,
      total: TOTAL_RESPONDENTS,
      distribution
    };
  });
};
