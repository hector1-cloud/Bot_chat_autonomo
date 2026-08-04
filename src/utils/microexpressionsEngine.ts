import { ExpressionArchetype, FacialMorphTargets, MicroexpressionAnalysis, MuscleInfo } from '../types/microexpressions';

export const DEFAULT_MORPH_TARGETS: Record<ExpressionArchetype, FacialMorphTargets> = {
  subtle_smile: {
    browInnerUp: 0.1,
    browLowerer: 0.0,
    browOuterRaiseLeft: 0.15,
    browOuterRaiseRight: 0.15,
    eyeSquintLeft: 0.35,
    eyeSquintRight: 0.35,
    eyeWide: 0.0,
    cheekRaiser: 0.45,
    lipCornerPuller: 0.55,
    lipPucker: 0.0,
    lipPress: 0.0,
    jawOpen: 0.05,
    headTilt: 0.18,
    headYaw: 0.05,
    blush: 0.35,
    gazeX: 0.02,
    gazeY: 0.0,
    pupilDilation: 1.15,
  },
  deep_concentration: {
    browInnerUp: 0.0,
    browLowerer: 0.65,
    browOuterRaiseLeft: 0.0,
    browOuterRaiseRight: 0.0,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    eyeWide: 0.0,
    cheekRaiser: 0.0,
    lipCornerPuller: -0.1,
    lipPucker: 0.25,
    lipPress: 0.5,
    jawOpen: 0.0,
    headTilt: -0.12,
    headYaw: -0.1,
    blush: 0.0,
    gazeX: 0.25,
    gazeY: -0.2,
    pupilDilation: 1.05,
  },
  empathetic_softness: {
    browInnerUp: 0.55,
    browLowerer: 0.0,
    browOuterRaiseLeft: 0.2,
    browOuterRaiseRight: 0.2,
    eyeSquintLeft: 0.25,
    eyeSquintRight: 0.25,
    eyeWide: 0.1,
    cheekRaiser: 0.2,
    lipCornerPuller: 0.25,
    lipPucker: 0.1,
    lipPress: 0.0,
    jawOpen: 0.05,
    headTilt: 0.25,
    headYaw: 0.08,
    blush: 0.15,
    gazeX: 0.0,
    gazeY: 0.08,
    pupilDilation: 1.25,
  },
  curious_intrigue: {
    browInnerUp: 0.1,
    browLowerer: 0.1,
    browOuterRaiseLeft: 0.55,
    browOuterRaiseRight: 0.15,
    eyeSquintLeft: 0.1,
    eyeSquintRight: 0.3,
    eyeWide: 0.35,
    cheekRaiser: 0.1,
    lipCornerPuller: 0.2,
    lipPucker: 0.3,
    lipPress: 0.0,
    jawOpen: 0.1,
    headTilt: -0.3,
    headYaw: 0.15,
    blush: 0.05,
    gazeX: -0.15,
    gazeY: -0.1,
    pupilDilation: 1.2,
  },
  controlled_surprise: {
    browInnerUp: 0.4,
    browLowerer: 0.0,
    browOuterRaiseLeft: 0.7,
    browOuterRaiseRight: 0.7,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
    eyeWide: 0.75,
    cheekRaiser: 0.1,
    lipCornerPuller: 0.15,
    lipPucker: 0.2,
    lipPress: 0.0,
    jawOpen: 0.3,
    headTilt: -0.05,
    headYaw: 0.0,
    blush: 0.2,
    gazeX: 0.0,
    gazeY: -0.1,
    pupilDilation: 1.35,
  },
  analytical_skepticism: {
    browInnerUp: 0.0,
    browLowerer: 0.3,
    browOuterRaiseLeft: 0.6,
    browOuterRaiseRight: 0.0,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.4,
    eyeWide: 0.1,
    cheekRaiser: 0.0,
    lipCornerPuller: -0.2,
    lipPucker: 0.1,
    lipPress: 0.35,
    jawOpen: 0.0,
    headTilt: -0.18,
    headYaw: -0.2,
    blush: 0.0,
    gazeX: 0.3,
    gazeY: 0.1,
    pupilDilation: 0.95,
  },
  playful_amusement: {
    browInnerUp: 0.2,
    browLowerer: 0.0,
    browOuterRaiseLeft: 0.35,
    browOuterRaiseRight: 0.35,
    eyeSquintLeft: 0.6,
    eyeSquintRight: 0.6,
    eyeWide: 0.0,
    cheekRaiser: 0.7,
    lipCornerPuller: 0.75,
    lipPucker: 0.0,
    lipPress: 0.0,
    jawOpen: 0.25,
    headTilt: 0.22,
    headYaw: 0.12,
    blush: 0.4,
    gazeX: 0.05,
    gazeY: 0.05,
    pupilDilation: 1.25,
  },
  thoughtful_pondering: {
    browInnerUp: 0.2,
    browLowerer: 0.35,
    browOuterRaiseLeft: 0.25,
    browOuterRaiseRight: 0.1,
    eyeSquintLeft: 0.25,
    eyeSquintRight: 0.25,
    eyeWide: 0.0,
    cheekRaiser: 0.05,
    lipCornerPuller: 0.05,
    lipPucker: 0.4,
    lipPress: 0.25,
    jawOpen: 0.0,
    headTilt: -0.15,
    headYaw: 0.1,
    blush: 0.0,
    gazeX: 0.35,
    gazeY: -0.35,
    pupilDilation: 1.1,
  },
  composed_neutral: {
    browInnerUp: 0.05,
    browLowerer: 0.0,
    browOuterRaiseLeft: 0.05,
    browOuterRaiseRight: 0.05,
    eyeSquintLeft: 0.05,
    eyeSquintRight: 0.05,
    eyeWide: 0.0,
    cheekRaiser: 0.05,
    lipCornerPuller: 0.1,
    lipPucker: 0.0,
    lipPress: 0.0,
    jawOpen: 0.0,
    headTilt: 0.0,
    headYaw: 0.0,
    blush: 0.02,
    gazeX: 0.0,
    gazeY: 0.0,
    pupilDilation: 1.0,
  }
};

export const MUSCLE_DESCRIPTIONS = [
  { muscleName: 'Corrugator Supercilii', spanishName: 'Fruncidor de la ceja', key: 'browLowerer', functionDescription: 'Tensión de concentración y análisis analítico.' },
  { muscleName: 'Procerus & Depressor Supercilii', spanishName: 'Músculo prócer', key: 'browInnerUp', functionDescription: 'Expresa empatía, compasión y elevación interna.' },
  { muscleName: 'Frontalis (Pars Lateralis)', spanishName: 'Vientre frontal lateral', key: 'browOuterRaiseLeft', functionDescription: 'Elevación asimétrica para curiosidad o sospecha.' },
  { muscleName: 'Orbicularis Oculi (Pars Orbitalis)', spanishName: 'Orbicular de los ojos', key: 'eyeSquintLeft', functionDescription: 'Arruga Duchenne de alegría auténtica o enfoque.' },
  { muscleName: 'Levator Palpebrae Superioris', spanishName: 'Elevador del párpado', key: 'eyeWide', functionDescription: 'Apertura ocular de asombro, alerta o intriga.' },
  { muscleName: 'Zygomaticus Major', spanishName: 'Cigomático mayor', key: 'lipCornerPuller', functionDescription: 'Tracción de comisuras labiales hacia arriba (sonrisa).' },
  { muscleName: 'Orbicularis Oris', spanishName: 'Orbicular de la boca', key: 'lipPucker', functionDescription: 'Fruncimiento de labios para cavilar o sintetizar.' },
  { muscleName: 'Risorius & Buccinator', spanishName: 'Músculo risorio y buccinador', key: 'lipPress', functionDescription: 'Compresión labial durante alta carga cognitiva.' },
  { muscleName: 'Capitis Lateralis', spanishName: 'Inclinadores cervicales', key: 'headTilt', functionDescription: 'Inclinación de cabeza para receptividad y escucha activa.' },
];

export function getMuscleActivityFromMorphs(morphs: FacialMorphTargets): MuscleInfo[] {
  return [
    {
      muscleName: 'Corrugator Supercilii',
      spanishName: 'Fruncidor de la ceja',
      activation: morphs.browLowerer,
      functionDescription: 'Procesa lógica intensa o preguntas complejas.'
    },
    {
      muscleName: 'Zygomaticus Major',
      spanishName: 'Cigomático mayor',
      activation: Math.max(0, morphs.lipCornerPuller),
      functionDescription: 'Respuesta sutil de simpatía o agrado.'
    },
    {
      muscleName: 'Orbicularis Oculi',
      spanishName: 'Orbicular de los ojos',
      activation: (morphs.eyeSquintLeft + morphs.eyeSquintRight) / 2,
      functionDescription: 'Microexpresión Duchenne de calidez humana.'
    },
    {
      muscleName: 'Frontalis Pars Medialis',
      spanishName: 'Frontal interno',
      activation: morphs.browInnerUp,
      functionDescription: 'Refleja empatía y preocupación atenta.'
    },
    {
      muscleName: 'Frontalis Pars Lateralis',
      spanishName: 'Frontal asimétrico',
      activation: Math.abs(morphs.browOuterRaiseLeft - morphs.browOuterRaiseRight),
      functionDescription: 'Indica curiosidad, intriga o escepticismo.'
    },
    {
      muscleName: 'Levator Palpebrae',
      spanishName: 'Elevador palpebral',
      activation: morphs.eyeWide,
      functionDescription: 'Respuesta instantánea de sorpresa o revelación.'
    },
    {
      muscleName: 'Orbicularis Oris & Mentalis',
      spanishName: 'Orbicular de la boca / Barba',
      activation: Math.max(morphs.lipPucker, morphs.lipPress),
      functionDescription: 'Fruncimiento reflexivo de labios.'
    }
  ];
}

// Linear interpolation for smooth spring physics
export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

export function lerpMorphs(a: FacialMorphTargets, b: FacialMorphTargets, t: number): FacialMorphTargets {
  return {
    browInnerUp: lerp(a.browInnerUp, b.browInnerUp, t),
    browLowerer: lerp(a.browLowerer, b.browLowerer, t),
    browOuterRaiseLeft: lerp(a.browOuterRaiseLeft, b.browOuterRaiseLeft, t),
    browOuterRaiseRight: lerp(a.browOuterRaiseRight, b.browOuterRaiseRight, t),
    eyeSquintLeft: lerp(a.eyeSquintLeft, b.eyeSquintLeft, t),
    eyeSquintRight: lerp(a.eyeSquintRight, b.eyeSquintRight, t),
    eyeWide: lerp(a.eyeWide, b.eyeWide, t),
    cheekRaiser: lerp(a.cheekRaiser, b.cheekRaiser, t),
    lipCornerPuller: lerp(a.lipCornerPuller, b.lipCornerPuller, t),
    lipPucker: lerp(a.lipPucker, b.lipPucker, t),
    lipPress: lerp(a.lipPress, b.lipPress, t),
    jawOpen: lerp(a.jawOpen, b.jawOpen, t),
    headTilt: lerp(a.headTilt, b.headTilt, t),
    headYaw: lerp(a.headYaw, b.headYaw, t),
    blush: lerp(a.blush, b.blush, t),
    gazeX: lerp(a.gazeX, b.gazeX, t),
    gazeY: lerp(a.gazeY, b.gazeY, t),
    pupilDilation: lerp(a.pupilDilation, b.pupilDilation, t),
  };
}

// Fallback heuristic engine for client/server when offline or testing
export function analyzeTextHeuristically(userPrompt: string, botText: string): MicroexpressionAnalysis {
  const text = (userPrompt + " " + botText).toLowerCase();
  
  let primary: ExpressionArchetype = 'composed_neutral';
  let secondary: ExpressionArchetype = 'thoughtful_pondering';
  let explanation = "Microexpresión neutra atenta en respuesta a conversación general.";
  let valence = 0.1;
  let arousal = 0.2;
  let cognitiveLoad = 0.2;
  let socialWarmth = 0.4;

  // Compliment / Praise keywords
  if (/guapo|bonita|inteligente|increible|excelente|gracias|genial|crack|maestro|adoro|me gustas|crack|lindo|hermoso/i.test(text)) {
    primary = 'subtle_smile';
    secondary = 'playful_amusement';
    explanation = "Se detectó un cumplido o muestra de afecto. El avatar reacciona con una leve sonrisa Duchenne, elevación de comisuras labiales y suave rubor facial.";
    valence = 0.8;
    arousal = 0.5;
    cognitiveLoad = 0.1;
    socialWarmth = 0.95;
  }
  // Complex STEM / Math / Logic / Science
  else if (/física|cuántica|relatividad|matemática|cálculo|algoritmo|código|diferencia|arquitectura|cuantizar|astrofísica|ecuación|filosofía/i.test(text)) {
    primary = 'deep_concentration';
    secondary = 'thoughtful_pondering';
    explanation = "Pregunta compleja de alta demanda cognitiva. El avatar activa fruncimiento del corrugador superciliar, mirada hacia arriba/derecha y leve tensión labial de enfoque.";
    valence = 0.1;
    arousal = 0.6;
    cognitiveLoad = 0.9;
    socialWarmth = 0.3;
  }
  // Empathy / Sadness / Concern
  else if (/triste|perdí|problema|dolor|preocupado|miedo|falleció|solo|solo|difícil|estrés|angustia|ayuda/i.test(text)) {
    primary = 'empathetic_softness';
    secondary = 'thoughtful_pondering';
    explanation = "Tono de vulnerabilidad o dificultad emocional. El avatar muestra elevación del frontal interno (ceja triste/empática), mirada suave e inclinación de cabeza.";
    valence = -0.4;
    arousal = 0.3;
    cognitiveLoad = 0.4;
    socialWarmth = 0.9;
  }
  // Curiosity / Intrigue / Facts
  else if (/sabías|curioso|extraño|por qué|sabías que|secreto|misterio|planeta|descubrimiento|mira/i.test(text)) {
    primary = 'curious_intrigue';
    secondary = 'controlled_surprise';
    explanation = "Dato novedoso o curiosidad. El avatar eleva asimétricamente una ceja, dilata pupilas e inclina la cabeza mostrando atención fascinada.";
    valence = 0.5;
    arousal = 0.7;
    cognitiveLoad = 0.5;
    socialWarmth = 0.7;
  }
  // Humor / Joke
  else if (/jaja|chiste|divertido|broma|risa|jajaja|cómico/i.test(text)) {
    primary = 'playful_amusement';
    secondary = 'subtle_smile';
    explanation = "Humor o chiste detectado. El avatar activa entornamiento ocular pronunciado, elevación de mejillas y leve apertura de boca en amigable risa sutil.";
    valence = 0.9;
    arousal = 0.8;
    cognitiveLoad = 0.2;
    socialWarmth = 0.85;
  }

  const baseMorphs = DEFAULT_MORPH_TARGETS[primary];
  const muscleActivity = getMuscleActivityFromMorphs(baseMorphs);

  return {
    primaryExpression: primary,
    secondaryExpression: secondary,
    confidence: 0.92,
    valence,
    arousal,
    cognitiveLoad,
    socialWarmth,
    morphTargets: { ...baseMorphs },
    explanation,
    muscleActivity,
  };
}
