import { CognitiveAgentState } from '../types/cognitive';
import { MicroexpressionAnalysis } from '../types/microexpressions';

export interface GeminiResponsePayload {
  botResponse: string;
  microexpressions: MicroexpressionAnalysis;
  extractedMemory?: {
    hasNewMemory: boolean;
    category?: 'semantic' | 'episodic' | 'preference' | 'working' | string;
    summary?: string;
  };
  imageUrl?: string;
  mode: string;
}

export interface SendMessageOptions {
  message: string;
  history: Array<{ sender: 'user' | 'bot'; text: string }>;
  cognitiveState: CognitiveAgentState;
  memoriesSummary?: string;
  goalsSummary?: string;
  sensorData?: any;
}

/**
 * Gemini AI Service
 * Proxies messages to the backend API endpoint (/api/chat), which uses the official @google/genai SDK
 * with process.env.GEMINI_API_KEY to generate intelligent responses with microexpressions and memory extraction.
 */
export async function generateGeminiResponse(options: SendMessageOptions): Promise<GeminiResponsePayload> {
  const { message, history, cognitiveState, memoriesSummary, goalsSummary, sensorData } = options;

  const payload = {
    message,
    history: history.map((h) => ({ sender: h.sender, text: h.text })),
    sensorData: sensorData || null,
    cognitiveContext: {
      personality: cognitiveState.personality,
      memoriesSummary: memoriesSummary || '',
      goalsSummary: goalsSummary || '',
      activeMood: cognitiveState.activeMood,
    },
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en el servidor API (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
      botResponse: data.botResponse || 'Comprendo lo que mencionas.',
      microexpressions: data.microexpressions,
      extractedMemory: data.extractedMemory || { hasNewMemory: false },
      mode: data.mode || "gemini_3.6_flash",
      imageUrl: data.imageUrl,
    };
  } catch (error: any) {
    console.warn('[geminiService] Fetch failed or offline, returning fallback structure:', error);
    throw error;
  }
}
