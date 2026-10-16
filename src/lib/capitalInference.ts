import { ALL_QUESTIONS, CATEGORIES } from '../data/questionsData';
import { UserAnswer } from '../types';

export interface CapitalScore {
  capital: string;
  score: number;
  category: string;
}

const CAPITAL_KEYWORDS: Record<string, string[]> = {
  'Soberbia': ['orgullo', 'vanidad', 'soberbia', 'superior', 'corrección', 'humildad', 'presunción', 'alabanza'],
  'Avaricia': ['dinero', 'rico', 'riqueza', 'acumular', 'codicia', 'tacaño', 'generosidad', 'material'],
  'Lujuria': ['impuro', 'lujuria', 'sexual', 'pornografía', 'masturbación', 'castidad', 'pensamientos', 'deseos'],
  'Ira': ['ira', 'enojo', 'furioso', 'agresivo', 'insulto', 'paciencia', 'mal genio', 'violencia'],
  'Gula': ['comer', 'beber', 'exceso', 'gula', 'templanza', 'ayuno', 'capricho', 'alcohol'],
  'Envidia': ['envidia', 'celoso', 'prosperidad', 'éxito ajeno', 'alegría', 'bien ajeno', 'comparar'],
  'Pereza': ['pereza', 'acedia', 'desgana', 'deber', 'oración', 'misa', 'espiritual', 'tibieza'],
};

function inferCapitalFromText(text: string): string | null {
  const lower = text.toLowerCase();
  let bestMatch: string | null = null;
  let maxHits = 0;

  for (const [capital, keywords] of Object.entries(CAPITAL_KEYWORDS)) {
    const hits = keywords.filter(k => lower.includes(k)).length;
    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = capital;
    }
  }
  return maxHits > 0 ? bestMatch : null;
}

export function inferirCapitalesDesdeRespuestas(answers: Record<string, UserAnswer>): CapitalScore[] {
  const capitalCounts: Record<string, number> = {};

  Object.entries(answers).forEach(([qId, ans]) => {
    if (ans.status === 'leve' || ans.status === 'grave') {
      const q = ALL_QUESTIONS.find(qq => qq.id === qId);
      const text = q?.text || ans.questionText || '';
      const capital = inferCapitalFromText(text);
      if (capital) {
        capitalCounts[capital] = (capitalCounts[capital] || 0) + 1;
      }
    }
  });

  return Object.entries(capitalCounts)
    .map(([capital, score]) => ({ capital, score, category: '' }))
    .sort((a, b) => b.score - a.score);
}

export function inferirCapitalesDesdeCategorias(
  faltasPorCategoria: Record<string, number>,
  faltasPorCapital?: Record<string, number>
): CapitalScore[] {
  if (faltasPorCapital && Object.keys(faltasPorCapital).length > 0) {
    return Object.entries(faltasPorCapital)
      .map(([capital, score]) => ({ capital, score, category: '' }))
      .sort((a, b) => b.score - a.score);
  }

  const CAT_TO_CAPITAL: Record<string, string> = {
    'Amor a Dios': 'Soberbia',
    'Amor al Prójimo': 'Ira',
    'Vida, Salud y Prójimo': 'Ira',
    'Vida Digital y Tecnología': 'Pereza',
    'Los 7 Pecados Capitales': 'Soberbia',
    'Virtudes y Actitudes': 'Pereza',
  };

  const capitalCounts: Record<string, number> = {};
  for (const [catId, count] of Object.entries(faltasPorCategoria)) {
    const cat = CATEGORIES.find(c => c.id === catId);
    const catTitle = cat?.title || catId;
    const capital = CAT_TO_CAPITAL[catTitle];
    if (capital) {
      capitalCounts[capital] = (capitalCounts[capital] || 0) + count;
    }
  }

  return Object.entries(capitalCounts)
    .map(([capital, score]) => ({ capital, score, category: '' }))
    .sort((a, b) => b.score - a.score);
}

export function getDefectoDominanteDesdeCategorias(
  faltasPorCategoria: Record<string, number>,
  faltasPorCapital?: Record<string, number>
): { capital: string; score: number } | null {
  const scores = inferirCapitalesDesdeCategorias(faltasPorCategoria, faltasPorCapital);
  return scores.length > 0 ? { capital: scores[0].capital, score: scores[0].score } : null;
}

export function getTopCapitales(answers: Record<string, UserAnswer>, limit = 3): CapitalScore[] {
  return inferirCapitalesDesdeRespuestas(answers).slice(0, limit);
}

export function getDefectoDominante(answers: Record<string, UserAnswer>): { capital: string; score: number } | null {
  const top = getTopCapitales(answers, 1);
  return top.length > 0 ? { capital: top[0].capital, score: top[0].score } : null;
}