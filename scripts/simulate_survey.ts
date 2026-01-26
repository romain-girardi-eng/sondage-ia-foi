import { SURVEY_QUESTIONS, Question, Answers } from '../src/data/surveySchema';
import { calculateProfileSpectrum, ProfileSpectrum } from '../src/lib/scoring/index';

// --- HELPERS ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomSubset = <T>(arr: T[], min = 0, max = arr.length): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = randomInt(min, max);
  return shuffled.slice(0, count);
};

// --- PERSONA DEFINITIONS ---
type PersonaType = 'Random' | 'Traditionalist' | 'Innovator' | 'Skeptic';

interface PersonaConfig {
  religiosity: 'low' | 'high' | 'random';
  aiOpenness: 'low' | 'high' | 'random';
  theology: 'traditionaliste' | 'progressiste' | 'modere' | 'random';
  sacredBoundary: 'strict' | 'loose' | 'random';
}

const PERSONAS: Record<PersonaType, PersonaConfig> = {
  Random: { religiosity: 'random', aiOpenness: 'random', theology: 'random', sacredBoundary: 'random' },
  Traditionalist: { religiosity: 'high', aiOpenness: 'low', theology: 'traditionaliste', sacredBoundary: 'strict' },
  Innovator: { religiosity: 'high', aiOpenness: 'low', theology: 'progressiste', sacredBoundary: 'loose' },
  Skeptic: { religiosity: 'random', aiOpenness: 'low', theology: 'modere', sacredBoundary: 'strict' } // High ethical concern implied by low openness often
};

// --- GENERATOR ---

function generateAnswerForQuestion(question: Question, currentAnswers: Answers, config: PersonaConfig): string | number | string[] | null {
  // Check condition
  if (question.condition && !question.condition(currentAnswers)) {
    return null;
  }

  // --- PERSONA LOGIC OVERRIDES ---
  
  // 1. Theology
  if (question.id === 'theo_orientation') {
    if (config.theology !== 'random') return config.theology;
  }

  // 2. Religiosity (CRS questions)
  if (question.category === 'religiosity') {
    if (config.religiosity === 'high') {
       // Return high indices (indices 3, 4 -> 4th, 5th option usually)
       // CRS options are ordered low->high usually?
       // Let's check schema: jamais -> tres_souvent. Yes.
       // So for 'high', pick last 2 options.
       if (question.options) {
         const len = question.options.length;
         return question.options[randomInt(len - 2, len - 1)].value;
       }
    } else if (config.religiosity === 'low') {
        if (question.options) return question.options[randomInt(0, 1)].value;
    }
  }

  // 3. AI Openness (Usage & Future)
  if (question.category === 'usage' || question.category === 'future') {
    if (question.type === 'choice' && question.options) {
      if (config.aiOpenness === 'high') {
         // Pick later options (usually more usage)
         // e.g. 'quotidien' is last
         const len = question.options.length;
         return question.options[randomInt(len - 2, len - 1)].value;
      } else if (config.aiOpenness === 'low') {
         return question.options[randomInt(0, 1)].value;
      }
    }
    if (question.type === 'scale') {
        if (config.aiOpenness === 'high') return randomInt(4, 5);
        if (config.aiOpenness === 'low') return randomInt(1, 2);
    }
  }

  // 4. Sacred Boundary (Theology of AI)
  if (question.category === 'theology' && question.id !== 'theo_orientation') {
      if (config.sacredBoundary === 'strict') {
          // Strict = No AI in liturgy, impossible inspiration
          if (question.id === 'theo_liturgie_ia') return randomInt(1, 2);
          if (question.id === 'theo_inspiration') return 'impossible';
          if (question.id === 'theo_activites_sacrees' && question.options) {
              // Select many sacred things
              return question.options.filter(o => o.value !== 'aucune').map(o => o.value);
          }
      } else if (config.sacredBoundary === 'loose') {
          if (question.id === 'theo_liturgie_ia') return randomInt(4, 5);
          if (question.id === 'theo_inspiration') return 'possible';
      }
  }

  // --- DEFAULT RANDOM ---
  switch (question.type) {
    case 'choice':
      if (!question.options || question.options.length === 0) return null;
      return randomItem(question.options).value;

    case 'multiple':
      if (!question.options || question.options.length === 0) return [];
      return randomSubset(question.options.map(o => o.value), 1, 3);

    case 'scale':
      return randomInt(1, 5);

    case 'text':
      return "Réponse simulée.";
      
    case 'info':
      return null;

    default:
      return null;
  }
}

function generateSimulatedSubmission(persona: PersonaType): Answers {
  const config = PERSONAS[persona];
  const answers: Answers = {};
  
  for (const question of SURVEY_QUESTIONS) {
    const answer = generateAnswerForQuestion(question, answers, config);
    if (answer !== null) {
      answers[question.id] = answer;
    }
  }
  
  return answers;
}

// Main simulation
async function runSimulation() {
  console.log("🚀 Starting Targeted Persona Simulation (1000 iterations)...");
  
  const ITERATIONS_PER_PERSONA = 250;
  const PERSONA_TYPES: PersonaType[] = ['Random', 'Traditionalist', 'Innovator', 'Skeptic'];
  
  const results: { persona: PersonaType, spectrum: ProfileSpectrum }[] = [];
  
  for (const persona of PERSONA_TYPES) {
      console.log(`\nGenerating ${ITERATIONS_PER_PERSONA} ${persona} profiles...`);
      for (let i = 0; i < ITERATIONS_PER_PERSONA; i++) {
        const answers = generateSimulatedSubmission(persona);
        const spectrum = calculateProfileSpectrum(answers);
        results.push({ persona, spectrum });
      }
  }

  // --- ANALYTICS ---

  console.log("\n\n📊 RESULTS MATRIX (Predicted Persona -> Assigned Profile)");
  
  for (const persona of PERSONA_TYPES) {
      console.log(`\n--- Input Persona: ${persona} ---`);
      
      const subset = results.filter(r => r.persona === persona);
      const profileCounts: Record<string, number> = {};
      
      subset.forEach(r => {
        const pid = r.spectrum.primary.profile;
        profileCounts[pid] = (profileCounts[pid] || 0) + 1;
      });

      Object.entries(profileCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([profile, count]) => {
          const percent = ((count / subset.length) * 100).toFixed(1);
          console.log(`  > ${profile.padEnd(25)}: ${count} (${percent}%)`);
        });
        
      // Check insights for first item
      const sample = subset[0].spectrum;
      console.log(`  [Sample Insight]: ${sample.insights[0]?.title} - ${sample.insights[0]?.message}`);
  }
}

runSimulation();