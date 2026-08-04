// Cognitive Architecture Types for Relational Agent

export type MemoryCategory = 'working' | 'episodic' | 'semantic' | 'procedural';

export interface CognitiveMemoryItem {
  id: string;
  category: MemoryCategory;
  summary: string;
  importance: number; // 0.0 to 1.0
  tags: string[];
  createdAt: string;
  sourceEvent?: string;
}

export interface PersonalityTraits {
  curiosity: number;   // 0.0 to 1.0 (Iniciativa de preguntas)
  initiative: number;  // 0.0 to 1.0 (Proactividad)
  warmth: number;      // 0.0 to 1.0 (Empatía y calidez)
  humor: number;       // 0.0 to 1.0 (Sarcasmo / bromas)
  formality: number;   // 0.0 to 1.0 (Seriedad técnica)
  persistence: number; // 0.0 to 1.0 (Seguimiento de objetivos)
  energy: number;      // 0.0 to 1.0 (Velocidad / Entusiasmo)
}

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
  progressPercentage: number;
  createdAt: string;
}

export interface CognitiveEvent {
  id: string;
  type:
    | 'USER_MESSAGE_RECEIVED'
    | 'MEMORY_EXTRACTED'
    | 'PERSONALITY_EVOLVED'
    | 'AUTONOMOUS_THOUGHT_GEN'
    | 'GOAL_UPDATED'
    | 'SENSOR_FUSION_FRAME'
    | 'GAZE_TRACKING_SYNC';
  description: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface CognitiveAgentState {
  personality: PersonalityTraits;
  memories: CognitiveMemoryItem[];
  goals: UserGoal[];
  eventLogs: CognitiveEvent[];
  activeMood: string;
  totalConversations: number;
}
