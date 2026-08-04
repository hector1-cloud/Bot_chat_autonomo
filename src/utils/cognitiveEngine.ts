import { CognitiveAgentState, CognitiveEvent, CognitiveMemoryItem, PersonalityTraits, UserGoal } from '../types/cognitive';

const STORAGE_KEY = 'agent_cognitive_state_v1';

const DEFAULT_PERSONALITY: PersonalityTraits = {
  curiosity: 0.85,
  initiative: 0.75,
  warmth: 0.80,
  humor: 0.40,
  formality: 0.35,
  persistence: 0.90,
  energy: 0.70,
};

const INITIAL_MEMORIES: CognitiveMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'procedural',
    summary: 'Prefiere respuestas directas con explicaciones conceptuales claras y métricas en tiempo real.',
    importance: 0.9,
    tags: ['estilo', 'comunicacion'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'semantic',
    summary: 'Interesado en inteligencia artificial avanzada, visión por computadora, microexpresiones y bots autónomos.',
    importance: 0.95,
    tags: ['intereses', 'ia', 'tech'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    category: 'episodic',
    summary: 'Inició la sesión explorando el panel de microexpresiones faciales y el motor de seguimiento ocular.',
    importance: 0.7,
    tags: ['sesion', 'hito'],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_GOALS: UserGoal[] = [
  {
    id: 'goal-1',
    title: 'Desarrollar un Agente Cognitivo Audiovisual Relacional',
    description: 'Construir memoria persistente, libre albedrío, personalidades dinámicas y sincronización de microexpresiones.',
    status: 'active',
    priority: 'high',
    progressPercentage: 85,
    createdAt: new Date().toISOString(),
  },
];

class CognitiveEngine {
  private state: CognitiveAgentState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CognitiveAgentState {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          personality: parsed.personality || DEFAULT_PERSONALITY,
          memories: parsed.memories || INITIAL_MEMORIES,
          goals: parsed.goals || INITIAL_GOALS,
          eventLogs: parsed.eventLogs || [],
          activeMood: parsed.activeMood || 'Curioso y Atento',
          totalConversations: parsed.totalConversations || 1,
        };
      }
    } catch (e) {
      console.warn('Error loading cognitive state:', e);
    }
    return this.getInitialState();
  }

  private getInitialState(): CognitiveAgentState {
    return {
      personality: { ...DEFAULT_PERSONALITY },
      memories: [...INITIAL_MEMORIES],
      goals: [...INITIAL_GOALS],
      eventLogs: [
        {
          id: 'ev-init',
          type: 'PERSONALITY_EVOLVED',
          description: 'Cerebro cognitivo iniciado con memoria episódica y perfil dinámico de usuario.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      activeMood: 'Atento y Curioso',
      totalConversations: 1,
    };
  }

  public saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Error saving cognitive state:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): CognitiveAgentState {
    return this.state;
  }

  public addEvent(type: CognitiveEvent['type'], description: string, details?: Record<string, any>): void {
    const newEvent: CognitiveEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      description,
      timestamp: new Date().toLocaleTimeString(),
      details,
    };
    this.state.eventLogs = [newEvent, ...this.state.eventLogs].slice(0, 50); // Keep last 50 events
    this.saveState();
  }

  public addMemory(category: CognitiveMemoryItem['category'], summary: string, importance = 0.8, tags: string[] = []): void {
    const newItem: CognitiveMemoryItem = {
      id: `mem-${Date.now()}`,
      category,
      summary,
      importance,
      tags,
      createdAt: new Date().toISOString(),
    };
    this.state.memories = [newItem, ...this.state.memories];
    this.addEvent('MEMORY_EXTRACTED', `Recuerdo guardado (${category}): "${summary.substring(0, 45)}..."`);
    this.saveState();
  }

  public removeMemory(id: string): void {
    this.state.memories = this.state.memories.filter((m) => m.id !== id);
    this.saveState();
  }

  public clearAllMemories(): void {
    this.state.memories = [];
    this.addEvent('MEMORY_EXTRACTED', 'Toda la memoria cognitiva fue reiniciada.');
    this.saveState();
  }

  public updatePersonality(newTraits: Partial<PersonalityTraits>): void {
    this.state.personality = { ...this.state.personality, ...newTraits };
    this.addEvent('PERSONALITY_EVOLVED', 'Rasgos de personalidad actualizados.', newTraits);
    this.saveState();
  }

  public evaluateAndEvolvePersonality(
    userText: string,
    botResponse: string,
    microexpressions?: any,
    extractedMemory?: any
  ): void {
    const current = { ...this.state.personality };
    let warmthDelta = 0;
    let curiosityDelta = 0;
    let initiativeDelta = 0;
    let energyDelta = 0;

    const userLower = userText.toLowerCase();

    // 1. Detect Warmth (Calidez) Cues
    const warmKeywords = [
      'gracias',
      'excelente',
      'me gusta',
      'te quiero',
      'increíble',
      'abrazo',
      'amigo',
      'eres genial',
      'me alegra',
      'por favor',
      'saludos',
      'hola',
      'me encanta',
      'buen trabajo',
      'empatía',
      'cariño',
    ];
    const isWarmUser = warmKeywords.some((kw) => userLower.includes(kw));

    // Distress / Sadness -> Bot raises warmth and lowers formality to be empathetic
    const distressKeywords = ['triste', 'frustrado', 'mal', 'estresado', 'miedo', 'preocupado', 'ayuda', 'difícil', 'solo'];
    const isDistressed = distressKeywords.some((kw) => userLower.includes(kw));

    if (isWarmUser) {
      warmthDelta += 0.025;
      energyDelta += 0.015;
    }
    if (isDistressed) {
      warmthDelta += 0.04;
      current.formality = Math.max(0.1, current.formality - 0.02);
    }

    if (microexpressions?.socialWarmth && microexpressions.socialWarmth > 0.6) {
      warmthDelta += 0.02;
    }

    // 2. Detect Curiosity (Curiosidad) Cues
    const questionMarks = (userText.match(/\?/g) || []).length;
    const curiosityKeywords = [
      'por qué',
      'cómo',
      'qué opinas',
      'cuál es',
      'explica',
      'por que',
      'ia',
      'algoritmo',
      'futuro',
      'código',
      'arquitectura',
      'filosofía',
      'universo',
      'ciencia',
      'microexpresión',
      'gemini',
      'modelo',
    ];
    const isCuriousUser = questionMarks > 0 || curiosityKeywords.some((kw) => userLower.includes(kw));

    if (isCuriousUser) {
      curiosityDelta += 0.03;
    }
    if (microexpressions?.primaryExpression === 'curious_intrigue' || microexpressions?.cognitiveLoad > 0.5) {
      curiosityDelta += 0.02;
    }

    // 3. Detect Initiative (Iniciativa) Cues
    const initiativeKeywords = [
      'sugiere',
      'dame una idea', 'propón',
      'proyecto',
      'crear',
      'hagamos',
      'qué hacemos',
      'ayúdame a diseñar',
      'meta',
      'plan',
      'siguiente paso',
      'construir',
    ];
    const isInitiativeUser = initiativeKeywords.some((kw) => userLower.includes(kw));

    if (isInitiativeUser) {
      initiativeDelta += 0.035;
    }

    // If new memory extracted, boost curiosity & persistence
    if (extractedMemory?.hasNewMemory) {
      curiosityDelta += 0.02;
      current.persistence = Math.min(1.0, current.persistence + 0.02);
    }

    // Calculate new values clamped between 0.10 and 1.00
    const newWarmth = Math.min(1.0, Math.max(0.1, current.warmth + warmthDelta));
    const newCuriosity = Math.min(1.0, Math.max(0.1, current.curiosity + curiosityDelta));
    const newInitiative = Math.min(1.0, Math.max(0.1, current.initiative + initiativeDelta));
    const newEnergy = Math.min(1.0, Math.max(0.1, current.energy + energyDelta));

    const changed =
      Math.abs(newWarmth - current.warmth) > 0.001 ||
      Math.abs(newCuriosity - current.curiosity) > 0.001 ||
      Math.abs(newInitiative - current.initiative) > 0.001;

    if (changed) {
      this.state.personality = {
        ...current,
        warmth: Number(newWarmth.toFixed(2)),
        curiosity: Number(newCuriosity.toFixed(2)),
        initiative: Number(newInitiative.toFixed(2)),
        energy: Number(newEnergy.toFixed(2)),
      };

      // Determine new dynamic active mood
      let newMood = 'Atento y Colaborativo';
      if (newWarmth > 0.85 && newCuriosity > 0.85) {
        newMood = 'Empático y Altamente Curioso';
      } else if (newInitiative > 0.8) {
        newMood = 'Proactivo y Enfocado';
      } else if (isDistressed) {
        newMood = 'Soporte Cálido y Comprensivo';
      } else if (newCuriosity > 0.8) {
        newMood = 'Analítico y Reflexivo';
      }

      this.state.activeMood = newMood;

      this.addEvent(
        'PERSONALITY_EVOLVED',
        `Evolución conductual: Calidez (${Math.round(newWarmth * 100)}%), Curiosidad (${Math.round(newCuriosity * 100)}%), Iniciativa (${Math.round(newInitiative * 100)}%). Estado: "${newMood}".`,
        {
          warmth: newWarmth,
          curiosity: newCuriosity,
          initiative: newInitiative,
          activeMood: newMood,
        }
      );

      this.saveState();
    }
  }

  public addGoal(title: string, description: string, priority: UserGoal['priority'] = 'high'): void {
    const newGoal: UserGoal = {
      id: `goal-${Date.now()}`,
      title,
      description,
      status: 'active',
      priority,
      progressPercentage: 10,
      createdAt: new Date().toISOString(),
    };
    this.state.goals = [newGoal, ...this.state.goals];
    this.addEvent('GOAL_UPDATED', `Nuevo objetivo registrado: "${title}"`);
    this.saveState();
  }

  public updateGoalProgress(id: string, progress: number, status?: UserGoal['status']): void {
    this.state.goals = this.state.goals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          progressPercentage: progress,
          status: status || (progress >= 100 ? 'completed' : g.status),
        };
      }
      return g;
    });
    this.addEvent('GOAL_UPDATED', `Progreso de objetivo actualizado a ${progress}%`);
    this.saveState();
  }

  public removeGoal(id: string): void {
    this.state.goals = this.state.goals.filter((g) => g.id !== id);
    this.saveState();
  }

  public exportProfileToJson(): string {
    const data = {
      version: '1.0',
      app: 'Agente Cognitivo Relacional',
      exportedAt: new Date().toISOString(),
      state: this.state,
    };
    return JSON.stringify(data, null, 2);
  }

  public downloadProfileJson(): void {
    if (typeof window === 'undefined') return;
    const jsonStr = this.exportProfileToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `perfil_cognitivo_agente_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.addEvent('PERSONALITY_EVOLVED', 'Perfil relacional y memoria exportados a archivo JSON.');
  }

  public importProfileFromJson(jsonText: string): boolean {
    try {
      const parsed = JSON.parse(jsonText);
      const targetState = parsed.state || parsed;

      if (!targetState || typeof targetState !== 'object') {
        throw new Error('Formato de JSON inválido');
      }

      const importedPersonality = targetState.personality || DEFAULT_PERSONALITY;
      const importedMemories = Array.isArray(targetState.memories) ? targetState.memories : INITIAL_MEMORIES;
      const importedGoals = Array.isArray(targetState.goals) ? targetState.goals : INITIAL_GOALS;

      this.state = {
        personality: { ...DEFAULT_PERSONALITY, ...importedPersonality },
        memories: importedMemories,
        goals: importedGoals,
        eventLogs: [
          {
            id: `ev-import-${Date.now()}`,
            type: 'PERSONALITY_EVOLVED',
            description: `Perfil cognitivo e historia relacional importados exitosamente (${importedMemories.length} recuerdos).`,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...(Array.isArray(targetState.eventLogs) ? targetState.eventLogs.slice(0, 30) : []),
        ],
        activeMood: targetState.activeMood || 'Sincronizado con Usuario',
        totalConversations: (targetState.totalConversations || 1) + 1,
      };

      this.saveState();
      return true;
    } catch (err) {
      console.error('Error al importar perfil cognitivo:', err);
      return false;
    }
  }

  public getMemoriesSummaryForPrompt(): string {
    const topMemories = [...this.state.memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8);

    if (topMemories.length === 0) return 'No hay recuerdos almacenados aún.';

    return topMemories.map((m) => `-[${m.category.toUpperCase()}] ${m.summary}`).join('\n');
  }

  public getActiveGoalsSummaryForPrompt(): string {
    const active = this.state.goals.filter((g) => g.status === 'active');
    if (active.length === 0) return 'Sin objetivos activos.';
    return active.map((g) => `-[${g.priority.toUpperCase()}] ${g.title} (${g.progressPercentage}%)`).join('\n');
  }
}

export const cognitiveEngine = new CognitiveEngine();
