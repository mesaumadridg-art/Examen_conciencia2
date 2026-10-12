import { QuestionCategory, QuestionItem, UserPersonalization } from '../types';
import { QUESTIONS_KIDS } from './questionsKids';
import { QUESTIONS_YOUTH } from './questionsYouth';
import { QUESTIONS_ADULTS } from './questionsAdults';
import { PRAYERS } from './prayersData';

export { PRAYERS };

export const CATEGORIES: QuestionCategory[] = [
  {
    id: 'dios',
    title: 'Amor a Dios',
    subtitle: '1.º, 2.º y 3.º Mandamiento',
    iconName: 'Cross',
    description: 'Relación teologal con Dios: fe, esperanza, oración, respeto a su Santo Nombre y Misa Dominical.',
    mandamentNumber: 1,
  },
  {
    id: 'familia',
    title: 'Familia, Padres y Autoridad',
    subtitle: '4.º Mandamiento',
    iconName: 'HeartHandshake',
    description: 'Deberes como hijo, educación de los hijos, cuidado a los ancianos y obediencia legítima.',
    mandamentNumber: 4,
  },
  {
    id: 'matrimonio',
    title: 'Matrimonio y Vida Conyugal',
    subtitle: 'Sacramento del Matrimonio',
    iconName: 'Heart',
    description: 'Fidelidad, amor conyugal, apertura a la vida, respeto y donación mutua.',
  },
  {
    id: 'vida',
    title: 'Vida, Salud y Prójimo',
    subtitle: '5.º Mandamiento',
    iconName: 'ShieldAlert',
    description: 'Respeto a la vida humana, perdón, paciencia, cuidado del cuerpo y evitar el rencor o la violencia.',
    mandamentNumber: 5,
  },
  {
    id: 'pureza',
    title: 'Pureza y Afectividad',
    subtitle: '6.º y 9.º Mandamiento',
    iconName: 'Sparkles',
    description: 'Castidad en pensamientos, miradas, palabras y acciones. Dignidad del cuerpo como templo del Espíritu Santo.',
    mandamentNumber: 6,
  },
  {
    id: 'justicia',
    title: 'Honradez y Justicia',
    subtitle: '7.º y 10.º Mandamiento',
    iconName: 'Scale',
    description: 'Respeto a los bienes ajenos, rectitud en los negocios, deudas, limosna y desprendimiento.',
    mandamentNumber: 7,
  },
  {
    id: 'verdad',
    title: 'Verdad y Reputación',
    subtitle: '8.º Mandamiento',
    iconName: 'MessageSquareCheck',
    description: 'Veracidad, secreto profesional, evitar chismes, calumnias, juicios temerarios y reparar el daño.',
    mandamentNumber: 8,
  },
  {
    id: 'profesion',
    title: 'Deberes de Estado y Trabajo',
    subtitle: 'Vocación Laboral, Estudios y Cívica',
    iconName: 'Briefcase',
    description: 'Cumplimiento honesto del trabajo o estudios, trato a colegas/empleados y responsabilidad social.',
  },
  {
    id: 'digital',
    title: 'Vida Digital y Tecnología',
    subtitle: 'Uso de Pantallas y Redes',
    iconName: 'Smartphone',
    description: 'Moderación en redes sociales, evitar adicción a pantallas, contenidos limpios y tiempo en familia.',
  },
  {
    id: 'capitales',
    title: 'Los 7 Pecados Capitales',
    subtitle: 'Examen Particular y Defecto Dominante',
    iconName: 'Target',
    description: 'Discernimiento de la raíz de las caídas recurrentes para combatir el defecto dominante.',
  },
  {
    id: 'misericordia',
    title: 'Obras de Misericordia',
    subtitle: 'Caridad Material y Espiritual',
    iconName: 'HandHeart',
    description: 'Evaluación del mandato de amar con obras corporales y espirituales al prójimo.',
  },
];

export const ALL_QUESTIONS: QuestionItem[] = [
  ...QUESTIONS_KIDS,
  ...QUESTIONS_YOUTH,
  ...QUESTIONS_ADULTS,
];

// Fallback legacy export
export const QUESTIONS = ALL_QUESTIONS;

export function getQuestionById(id: string): QuestionItem | undefined {
  if (!id) return undefined;

  // 1. Direct exact match
  const exact = ALL_QUESTIONS.find((q) => q.id === id);
  if (exact) return exact;

  const normalized = id.trim().toLowerCase();

  // 2. Try prefixed variants (e.g. 'fam_1', 'fam-1', 'mat_2', 'pur_3', 'jus-4', 'dios-1', etc.)
  const match = normalized.match(/^([a-z0-9]+)[_\.-](\d+)$/i);
  if (match) {
    const [_, rawPrefix, numStr] = match;
    const num = parseInt(numStr, 10);

    const categoryMap: Record<string, string> = {
      god: 'dios',
      dios: 'dios',
      fe: 'dios',
      fam: 'familia',
      familia: 'familia',
      family: 'familia',
      padres: 'familia',
      mat: 'matrimonio',
      matrimonio: 'matrimonio',
      marriage: 'matrimonio',
      matrimony: 'matrimonio',
      hij: 'hijos',
      hijos: 'hijos',
      children: 'hijos',
      kids: 'hijos',
      vid: 'vida',
      vida: 'vida',
      life: 'vida',
      pur: 'pureza',
      pureza: 'pureza',
      purity: 'pureza',
      castidad: 'pureza',
      jus: 'justicia',
      justicia: 'justicia',
      justice: 'justicia',
      bienes: 'justicia',
      ver: 'verdad',
      verdad: 'verdad',
      truth: 'verdad',
      honestidad: 'verdad',
      pro: 'profesion',
      profesion: 'profesion',
      profession: 'profesion',
      trabajo: 'profesion',
      dig: 'digital',
      digital: 'digital',
      redes: 'digital',
      cap: 'capitales',
      capital: 'capitales',
      capitales: 'capitales',
      mis: 'misericordia',
      misericordia: 'misericordia',
      mercy: 'misericordia',
    };

    const targetCategory = categoryMap[rawPrefix];
    if (targetCategory) {
      const categoryQuestions = ALL_QUESTIONS.filter((q) => q.categoryId === targetCategory);
      
      // Try matching by suffix '-num'
      const matchedBySuffix = ALL_QUESTIONS.find(
        (q) => q.categoryId === targetCategory && q.id.endsWith(`-${num}`)
      );
      if (matchedBySuffix) return matchedBySuffix;

      // Try matching by 1-based index in that category
      if (categoryQuestions[num - 1]) return categoryQuestions[num - 1];
      if (categoryQuestions[0]) return categoryQuestions[0];
    }
  }

  // 3. Match pure numbers or q1 / q-1
  const numOnly = normalized.replace(/^[q_.-]+/i, '');
  if (/^\d+$/.test(numOnly)) {
    const idx = parseInt(numOnly, 10) - 1;
    if (ALL_QUESTIONS[idx]) return ALL_QUESTIONS[idx];
  }

  // 4. Fuzzy substring match on ID
  const foundBySubstring = ALL_QUESTIONS.find(
    (q) => q.id.toLowerCase().includes(normalized) || normalized.includes(q.id.toLowerCase())
  );
  if (foundBySubstring) return foundBySubstring;

  return undefined;
}

export function filterQuestionsByPersonalization(
  questions: QuestionItem[],
  p?: UserPersonalization
): QuestionItem[] {
  if (!p) return questions;

  return questions.filter((q) => {
    // 1. Profile mode check (kids, youth, adults, particular)
    if (p.profileMode === 'kids' && !q.profileModes.includes('kids')) return false;
    if (p.profileMode === 'youth' && !q.profileModes.includes('youth')) return false;
    if (p.profileMode === 'adults' && !q.profileModes.includes('adults') && !q.profileModes.includes('particular')) return false;

    // 2. Gender target check
    if (q.genderTarget && q.genderTarget !== 'all' && q.genderTarget !== p.gender) {
      return false;
    }

    // 3. Civil status target check
    if (q.civilStatusTarget && q.civilStatusTarget.length > 0) {
      if (!q.civilStatusTarget.includes(p.civilStatus)) {
        return false;
      }
    }

    // 4. Children requirement
    if (q.requiresChildren && !p.hasChildren) {
      return false;
    }

    // 5. Working requirement
    if (q.requiresWorking && !p.isWorking) {
      return false;
    }

    // 6. Employees requirement
    if (q.requiresEmployees && !p.hasEmployees) {
      return false;
    }

    // 7. Student requirement
    if (q.requiresStudent && !p.isStudent) {
      return false;
    }

    // 8. Partner / Dating relationship requirement
    if (q.requiresPartner && !p.hasPartner) {
      return false;
    }

    return true;
  });
}

/**
 * Transforms a question into a direct statement of sin for confession accusations.
 */
export function getSinStatement(q?: QuestionItem, fallbackText?: string): string {
  if (q?.sinStatement) {
    return q.sinStatement;
  }

  const raw = q?.text || fallbackText || 'Falta señalada en el examen';
  
  // Clean question marks and whitespace
  let clean = raw.trim().replace(/^¿+/, '').replace(/\?+$/, '').trim();

  // Pattern replacements to turn questions into direct confession statements (Acusaciones)
  clean = clean
    .replace(/^He callado voluntariamente /i, 'Ocultar voluntariamente ')
    .replace(/^He callado /i, 'Ocultar ')
    .replace(/^He faltado voluntariamente a /i, 'Falta voluntaria a ')
    .replace(/^He faltado a /i, 'Falta a ')
    .replace(/^He faltado el /i, 'Falta del ')
    .replace(/^He faltado /i, 'Falta de ')
    .replace(/^He descuidado /i, 'Descuido de ')
    .replace(/^He dejado de /i, 'Omisión de ')
    .replace(/^He participado en /i, 'Participación en ')
    .replace(/^He jurado /i, 'Juramento indebido: ')
    .replace(/^He juzgado /i, 'Juicio temerario sobre ')
    .replace(/^He mentido /i, 'Mentiras o engaño: ')
    .replace(/^He consumido /i, 'Consumo de ')
    .replace(/^He murmurado /i, 'Murmuración o chismes sobre ')
    .replace(/^He sentido /i, 'Sentimientos de ')
    .replace(/^He tenido /i, 'Actitud de ')
    .replace(/^He discutido /i, 'Discusiones o altercados: ')
    .replace(/^He tratado /i, 'Trato duro o irrespetuoso a ')
    .replace(/^He usado /i, 'Uso indebido de ')
    .replace(/^He cometido /i, 'Cometer ')
    .replace(/^He buscado /i, 'Búsqueda de ')
    .replace(/^He dado /i, 'Dar ')
    .replace(/^He provocado /i, 'Provocar ')
    .replace(/^He impedido /i, 'Impedir ')
    .replace(/^He guardado /i, 'Rencor o resentimiento: ')
    .replace(/^He robado /i, 'Robo o apropiación indebida de ')
    .replace(/^He cobrado /i, 'Cobro excesivo o injusto de ')
    .replace(/^He incumplido /i, 'Incumplimiento de ')
    .replace(/^Me he quejado /i, 'Quejas e impaciencia ante ')
    .replace(/^Me he molestado /i, 'Mal humor e ira con ')
    .replace(/^Me he dejado /i, 'Dejarse llevar por ')
    .replace(/^Me he aprovechado /i, 'Abuso o aprovechamiento de ')
    .replace(/^Me he avergonzado /i, 'Respeto humano o vergüenza de ')
    .replace(/^Me he distraído /i, 'Distracción voluntaria en ')
    .replace(/^Me he negado /i, 'Negativa a ')
    .replace(/^Me he /i, 'Caer en ')
    .replace(/^Me acerco /i, 'Falta de devoción o preparación al ')
    .replace(/^Considero /i, 'Tener por carga el sacramento de ')
    .replace(/^Tengo /i, 'Falta de ')
    .replace(/^Pretendo /i, 'Pretensión de ')
    .replace(/^Reconozco /i, 'Falta de reconocimiento de ');

  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

