import { PresetScenario } from '../types/microexpressions';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'compliment',
    title: 'Cumplido Afectuoso',
    category: 'compliment',
    prompt: '¡Hola! Quería decirte que eres un avatar súper inteligente y bonito. Me encanta cómo me respondes.',
    description: 'Activa leve sonrisa Duchenne, comisuras labiales elevadas y suave rubor facial.',
    expectedArchetype: 'subtle_smile',
  },
  {
    id: 'complex_stem',
    title: 'Pregunta Científica Compleja',
    category: 'stem',
    prompt: '¿Podrías explicarme la tensión entre la mecánica cuántica de campos y la relatividad general a escala de Planck, y cómo la teoría de cuerdas intenta unificarlas?',
    description: 'Provoca mirada de pensamiento, fruncimiento del corrugador superciliar y ligera compresión labial.',
    expectedArchetype: 'deep_concentration',
  },
  {
    id: 'empathy_support',
    title: 'Expresión de Preocupación / Apoyo',
    category: 'empathy',
    prompt: 'Hoy fue un día increíblemente duro en el trabajo. Me siento agotado y algo desanimado por los resultados...',
    description: 'Desencadena elevación de la ceja interna (músculo prócer), mirada cálida e inclinación receptiva de cabeza.',
    expectedArchetype: 'empathetic_softness',
  },
  {
    id: 'curiosity_fact',
    title: 'Dato Fascinante / Curioso',
    category: 'curiosity',
    prompt: '¿Sabías que los pulpos tienen tres corazones, sangre azul basada en cobre y que dos tercios de sus neuronas están en sus brazos?',
    description: 'Genera elevación asimétrica de la ceja, dilatación pupilar e inclinación llena de interés.',
    expectedArchetype: 'curious_intrigue',
  },
  {
    id: 'humor_joke',
    title: 'Chiste / Humor Inteligente',
    category: 'humor',
    prompt: '¿Por qué los químicos aman los nitratos? ¡Porque son más baratos que las tarifas de noche! jajaja',
    description: 'Activa squint ocular marcado, mejillas elevadas y micro-reacción de amena diversión.',
    expectedArchetype: 'playful_amusement',
  },
  {
    id: 'philosophical_doubt',
    title: 'Reflexión Filosófica Profunda',
    category: 'philosophical',
    prompt: 'Si un sistema de IA llegara a experimentar estados cualitativos internos (qualia), ¿cómo podríamos probarlo empíricamente sin caer en el problema de otras mentes?',
    description: 'Provoca desviación de mirada hacia arriba-derecha, fruncido labial y reflexión analítica.',
    expectedArchetype: 'thoughtful_pondering',
  },
];
