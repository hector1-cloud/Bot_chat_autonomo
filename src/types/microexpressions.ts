export type ExpressionArchetype =
  | 'subtle_smile'
  | 'deep_concentration'
  | 'empathetic_softness'
  | 'curious_intrigue'
  | 'controlled_surprise'
  | 'analytical_skepticism'
  | 'playful_amusement'
  | 'thoughtful_pondering'
  | 'composed_neutral';

export interface FacialMorphTargets {
  browInnerUp: number;       // Elevación interna de cejas (empatía / preocupación)
  browLowerer: number;       // Fruncimiento / fruncir el ceño (concentración)
  browOuterRaiseLeft: number; // Elevación ceja izquierda (curiosidad / asombro)
  browOuterRaiseRight: number;// Elevación ceja derecha
  eyeSquintLeft: number;     // Entornar ojo izquierdo (sonrisa genuina / enfoque)
  eyeSquintRight: number;    // Entornar ojo derecho
  eyeWide: number;           // Apertura ocular (sorpresa / atención)
  cheekRaiser: number;       // Elevación de mejillas (músculo cigomático)
  lipCornerPuller: number;   // Comisuras hacia arriba (sonrisa leve / cálida)
  lipPucker: number;         // Fruncido de labios (pensativo)
  lipPress: number;          // Presión de labios (concentración intensa)
  jawOpen: number;           // Apertura de boca (habla / sorpresa)
  headTilt: number;          // Inclinación lateral de cabeza (-1 a +1)
  headYaw: number;           // Giro de cabeza (-1 a +1)
  blush: number;             // Rubor facial (0 a 1)
  gazeX: number;             // Dirección de mirada horizontal (-1 a +1)
  gazeY: number;             // Dirección de mirada vertical (-1 a +1)
  pupilDilation: number;     // Dilatación pupilar (0.8 a 1.4)
}

export interface MuscleInfo {
  muscleName: string;
  spanishName: string;
  activation: number;
  functionDescription: string;
}

export interface MicroexpressionAnalysis {
  primaryExpression: ExpressionArchetype;
  secondaryExpression: ExpressionArchetype;
  confidence: number;
  valence: number;            // -1.0 (negativo) a +1.0 (positivo)
  arousal: number;            // 0.0 (calma) a 1.0 (alta excitación/intensidad)
  cognitiveLoad: number;      // 0.0 (baja carga) a 1.0 (alta concentración)
  socialWarmth: number;       // 0.0 (formal/distante) a 1.0 (cálido/cercano)
  morphTargets: FacialMorphTargets;
  explanation: string;
  muscleActivity: MuscleInfo[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  microexpressions?: MicroexpressionAnalysis;
  processingState?: 'thinking' | 'ready' | 'speaking';
}

export interface PresetScenario {
  id: string;
  title: string;
  category: 'compliment' | 'stem' | 'empathy' | 'curiosity' | 'humor' | 'philosophical';
  prompt: string;
  description: string;
  expectedArchetype: ExpressionArchetype;
}
