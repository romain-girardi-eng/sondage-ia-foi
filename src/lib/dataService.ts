import { SURVEY_QUESTIONS } from "@/data";

export type AggregatedResult = {
  questionId: string;
  total: number;
  distribution: Record<string, number>;
};

// Générateur de données simulées mis à jour
export const getMockResults = (): AggregatedResult[] => {
  const TOTAL_RESPONDENTS = 1543;

  return SURVEY_QUESTIONS.map(q => {
    const distribution: Record<string, number> = {};
    let remaining = TOTAL_RESPONDENTS;

    // Simulation intelligente selon le type de question
    if (q.type === 'choice' || q.type === 'multiple') { // Traitement simple pour multiple pour l'instant
      const optionsCount = q.options?.length || 0;
      if (optionsCount > 0) {
        q.options!.forEach((opt, index) => {
          let count;
          // Logique spécifique pour les nouvelles questions
          if (q.id === 'min_pred_usage' && opt.value === 'jamais') {
             // Hypothèse : beaucoup de prêtres résistent encore
             count = Math.floor(remaining * 0.4); 
          } else if (q.id === 'min_pred_sentiment' && index === 0) { // Pas de culpabilité
             count = Math.floor(remaining * 0.3);
          } else if (index === optionsCount - 1) {
            count = remaining;
          } else {
            count = Math.floor(remaining / (optionsCount - index + 1));
          }
          
          distribution[opt.value] = count;
          remaining -= count;
        });
      }
    } else if (q.type === 'scale') {
      [1, 2, 3, 4, 5].forEach((val, index) => {
        let count;
        if (index === 4) {
          count = remaining;
        } else {
          // Distribution normale simulée
          const share = [0.1, 0.2, 0.4, 0.2, 0.1]; // Centré sur 3
          count = Math.floor(TOTAL_RESPONDENTS * share[index]);
          // Petit bruit aléatoire
          count += Math.floor(Math.random() * 20 - 10);
        }
        // Sécurité
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
