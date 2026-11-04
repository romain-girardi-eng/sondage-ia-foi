export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_CONTENT: Record<'fr' | 'en', FAQItem[]> = {
  fr: [
    {
      q: "Pourquoi cette étude ?",
      a: "L'intelligence artificielle arrive dans certaines pratiques religieuses, de la préparation de sermons à la prière assistée. Cette enquête décrit les usages déclarés par ses participants et les questions éthiques qu'ils soulèvent. Elle ne mesure pas leur fréquence dans une population.",
    },
    {
      q: "Mes réponses sont-elles anonymes ?",
      a: "Elles sont pseudonymisées. Aucun nom, aucun email ni aucune adresse IP n'est conservé en clair : seules des empreintes cryptographiques servent à empêcher les doublons. Si vous demandez vos résultats par email, l'adresse sert à l'envoi puis est effacée. Vos réponses sont agrégées à des fins statistiques, dans le respect du RGPD, et vous pouvez les consulter ou les supprimer à tout moment depuis la page Mes données.",
    },
    {
      q: "Combien de temps dure le sondage ?",
      a: "De 8 à 12 minutes selon votre parcours. Cette estimation sera remplacée par la durée médiane réellement observée. Le questionnaire compte 58 questions au total, mais chacun n'en voit que 46 à 53 selon son statut et son usage déclaré de l'IA : les membres du clergé répondent à des questions supplémentaires sur leur ministère.",
    },
    {
      q: "Qui peut participer ?",
      a: "Toute personne se reconnaissant dans la foi chrétienne, quelle que soit sa dénomination (catholique, protestant, orthodoxe, évangélique) et son niveau d'engagement (clergé, laïc engagé, pratiquant occasionnel).",
    },
    {
      q: "Comment mes données seront-elles utilisées ?",
      a: "Les résultats seront publiés sous forme agrégée dans des rapports publics et présentés lors de conférences. Un jeu de données anonymisé sera aussi publié pour la recherche et la réplication : sans identifiant ni commentaire libre, avec des catégories regroupées pour qu'aucune personne ne puisse être reconnue.",
    },
    {
      q: "Qu'est-ce que le score CRS-5 ?",
      a: "Le CRS-5 (Centrality of Religiosity Scale) reprend les 5 items de Huber & Huber (2012) : intellect, idéologie, pratique publique, pratique privée et expérience. Nous l'employons dans une version adaptée, dont la traduction française n'est pas une version validée de l'échelle. Votre score est la moyenne brute des cinq réponses, sans aucune correction.",
    },
    {
      q: "Qu'est-ce que l'écart d'usage ?",
      a: "C'est une comparaison purement descriptive entre l'usage de l'IA que vous déclarez en général et celui que vous déclarez dans le champ spirituel ou ministériel. Elle distingue quatre situations : usage dans les deux domaines, usage général sans usage spirituel, aucun usage, ou situation indéterminée. Aucune motivation ne vous est prêtée : un écart est une observation, pas une résistance.",
    },
    {
      q: "Puis-je voir les résultats ?",
      a: "Oui. À la fin du sondage, vous recevez vos scores sur 7 dimensions et un profil. Ce profil est une attribution heuristique : ses plages ont été fixées par jugement, jamais dérivées d'une analyse sur des données réelles, et il ne constitue ni un diagnostic ni une catégorie stable. Les résultats agrégés de l'ensemble des participants deviennent consultables à partir de 30 participants.",
    },
  ],
  en: [
    {
      q: "Why this study?",
      a: "Artificial intelligence is reaching some religious practices, from sermon preparation to AI-assisted prayer. This survey describes the uses reported by its participants and the ethical questions they raise. It does not measure how frequent they are in a population.",
    },
    {
      q: "Are my responses anonymous?",
      a: "They are pseudonymised. No name, email or IP address is kept in the clear: only cryptographic fingerprints are used to prevent duplicates. If you ask for your results by email, the address is used for sending and then deleted. Responses are aggregated for statistical purposes, in compliance with GDPR, and you can view or delete them at any time from the My Data page.",
    },
    {
      q: "How long does the survey take?",
      a: "8 to 12 minutes depending on your path. This estimate will be replaced by the median duration actually observed. The instrument has 58 questions in total, but each respondent sees only 46 to 53 of them depending on status and self-reported AI use: clergy members answer additional questions about their ministry.",
    },
    {
      q: "Who can participate?",
      a: "Anyone who identifies with the Christian faith, regardless of denomination (Catholic, Protestant, Orthodox, Evangelical) and level of engagement (clergy, committed layperson, occasional practitioner).",
    },
    {
      q: "How will my data be used?",
      a: "Results will be published in aggregated form in public reports and presented at conferences. An anonymised dataset will also be published for research and replication: with no identifier or free comment, and with categories grouped so that no person can be recognised.",
    },
    {
      q: "What is the CRS-5 score?",
      a: "The CRS-5 (Centrality of Religiosity Scale) reuses the 5 items of Huber & Huber (2012): intellect, ideology, public practice, private practice and experience. We use it in an adapted form, whose French translation is not a validated version of the scale. Your score is the raw mean of the five answers, with no correction.",
    },
    {
      q: "What is the usage gap?",
      a: "It is a purely descriptive comparison between the AI use you report in general and the use you report in the spiritual or ministry domain. It reports four situations: use in both domains, general use without spiritual use, no use at all, or undetermined. No motivation is attributed to you: a gap is an observation, not a resistance.",
    },
    {
      q: "Can I see the results?",
      a: "Yes. At the end of the survey you receive your scores on 7 dimensions and a profile. That profile is a heuristic attribution: its ranges were expert-set, never derived from an analysis of real data, and it is neither a diagnosis nor a stable category. Aggregated results from all participants become available from 30 participants onwards.",
    },
  ],
};
