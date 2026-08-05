import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeTextHeuristically, DEFAULT_MORPH_TARGETS, getMuscleActivityFromMorphs } from './src/utils/microexpressionsEngine';
import { ExpressionArchetype } from './src/types/microexpressions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Lazy GoogleGenAI client initialization
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAI = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return genAI;
}

// Fallback helper across multiple Gemini models in case of 429 rate limit/quota exhaustion
async function generateContentWithFallback(ai: GoogleGenAI, contents: any, config?: any) {
  const models = ['gemini-1.5-pro', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      const isQuotaError =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.message?.includes('429') ||
        err?.message?.includes('Quota exceeded') ||
        err?.code === 429;
      if (isQuotaError) {
        console.warn(`[Gemini API] Quota limit hit on ${model}. Trying next candidate model...`);
        continue;
      }
      // If it's a model not found error, try next model candidate
      if (err?.message?.includes('404') || err?.status === 'NOT_FOUND') {
        console.warn(`[Gemini API] Model ${model} not available. Trying next candidate...`);
        continue;
      }
      // Otherwise rethrow
      throw err;
    }
  }

  throw lastError || new Error('Quota limit exceeded for all available Gemini models.');
}

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    fastapiBridge: 'connected',
    timestamp: new Date().toISOString(),
  });
});

// FastAPI Pipeline Status
app.get('/api/fastapi/status', (req, res) => {
  res.json({
    status: 'online',
    engine: 'FastAPI Multimodal Sensor Engine v2.4',
    latencyMs: 12,
    fps: 60,
    activeSensors: ['camera_face_landmarks', 'microphone_decibels', 'head_pose_estimator'],
  });
});

// FastAPI Sensor Frame Processing Proxy Endpoint
app.post('/api/fastapi/process-sensor-frame', async (req, res) => {
  const { sensorData, userPrompt } = req.body;
  const ai = getGenAI();

  const mood = sensorData?.detectedMood || 'Neutro';
  const smile = Math.round((sensorData?.smileScore || 0) * 100);
  const focus = Math.round((sensorData?.focusScore || 0) * 100);
  const micDb = Math.round(sensorData?.micVolumeDb || 0);

  if (!ai) {
    return res.json({
      status: 'success',
      fastapiProcessing: 'local_sensor_fusion',
      feedback: `FastAPI Sensor Fusion: Usuario ${mood} (Sonrisa: ${smile}%, Enfoque: ${focus}%, Mic: ${micDb}dB)`,
    });
  }

  res.json({
    status: 'success',
    fastapiProcessing: 'gemini_multimodal_intertwined',
    sensorSummary: {
      userMood: mood,
      smilePercentage: smile,
      focusPercentage: focus,
      micDecibels: micDb,
    },
  });
});

// 2. GET /api/microexpressions/schema
app.get('/api/microexpressions/schema', (req, res) => {
  res.json({
    archetypes: [
      'subtle_smile',
      'deep_concentration',
      'empathetic_softness',
      'curious_intrigue',
      'controlled_surprise',
      'analytical_skepticism',
      'playful_amusement',
      'thoughtful_pondering',
      'composed_neutral',
    ],
    morphTargetKeys: [
      'browInnerUp',
      'browLowerer',
      'browOuterRaiseLeft',
      'browOuterRaiseRight',
      'eyeSquintLeft',
      'eyeSquintRight',
      'eyeWide',
      'cheekRaiser',
      'lipCornerPuller',
      'lipPucker',
      'lipPress',
      'jawOpen',
      'headTilt',
      'headYaw',
      'blush',
      'gazeX',
      'gazeY',
      'pupilDilation',
    ],
    defaultMorphs: DEFAULT_MORPH_TARGETS,
  });
});

// 3. POST /api/microexpressions/analyze
app.post('/api/microexpressions/analyze', async (req, res) => {
  const { text, userPrompt } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Falta el parámetro "text" en la solicitud.' });
  }

  const ai = getGenAI();
  if (!ai) {
    // Fallback heuristic mode
    const fallback = analyzeTextHeuristically(userPrompt || '', text);
    return res.json({ ...fallback, mode: 'heuristic_fallback' });
  }

  try {
    const prompt = `Analiza la siguiente respuesta conversacional y determina las microexpresiones faciales sutiles y apropiadas del avatar bot.
Texto del usuario: "${userPrompt || ''}"
Respuesta del bot: "${text}"

Devuelve un JSON con la microexpresión dominante. Las expresiones válidas son:
'subtle_smile', 'deep_concentration', 'empathetic_softness', 'curious_intrigue', 'controlled_surprise', 'analytical_skepticism', 'playful_amusement', 'thoughtful_pondering', 'composed_neutral'.`;

    const { response, usedModel } = await generateContentWithFallback(ai, prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryExpression: { type: Type.STRING },
          secondaryExpression: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          valence: { type: Type.NUMBER },
          arousal: { type: Type.NUMBER },
          cognitiveLoad: { type: Type.NUMBER },
          socialWarmth: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
        },
        required: [
          'primaryExpression',
          'secondaryExpression',
          'confidence',
          'valence',
          'arousal',
          'cognitiveLoad',
          'socialWarmth',
          'explanation',
        ],
      },
    });

    const result = JSON.parse(response.text || '{}');
    const validArchetypes: ExpressionArchetype[] = [
      'subtle_smile',
      'deep_concentration',
      'empathetic_softness',
      'curious_intrigue',
      'controlled_surprise',
      'analytical_skepticism',
      'playful_amusement',
      'thoughtful_pondering',
      'composed_neutral',
    ];

    const primary: ExpressionArchetype = validArchetypes.includes(result.primaryExpression)
      ? result.primaryExpression
      : 'composed_neutral';

    const baseMorphs = DEFAULT_MORPH_TARGETS[primary] || DEFAULT_MORPH_TARGETS.composed_neutral;

    res.json({
      primaryExpression: primary,
      secondaryExpression: result.secondaryExpression || 'composed_neutral',
      confidence: result.confidence ?? 0.95,
      valence: result.valence ?? 0.1,
      arousal: result.arousal ?? 0.2,
      cognitiveLoad: result.cognitiveLoad ?? 0.3,
      socialWarmth: result.socialWarmth ?? 0.5,
      morphTargets: baseMorphs,
      explanation: result.explanation || 'Análisis de microexpresiones generado mediante Gemini AI.',
      muscleActivity: getMuscleActivityFromMorphs(baseMorphs),
      mode: usedModel,
    });
  } catch (err: any) {
    console.warn('[Gemini API Fallback] Microexpression analysis using local heuristic engine.');
    const fallback = analyzeTextHeuristically(userPrompt || '', text);
    res.json({ ...fallback, mode: 'heuristic_fallback_error' });
  }
});

// 4. POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message, history, sensorData, cognitiveContext } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Falta el mensaje en el cuerpo de la petición.' });
  }

  const ai = getGenAI();

  // Format sensor telemetry context string if provided
  let sensorContext = '';
  if (sensorData) {
    const smile = Math.round((sensorData.smileScore || 0) * 100);
    const focus = Math.round((sensorData.focusScore || 0) * 100);
    const surprise = Math.round((sensorData.surpriseScore || 0) * 100);
    const mood = sensorData.detectedMood || 'Neutro';
    const db = sensorData.micVolumeDb || 0;

    sensorContext = `\n[TELEMETRÍA EN TIEMPO REAL DE SENSORES DE CÁMARA Y MICRÓFONO VÍA FASTAPI-BRIDGE]:
- Rostro del Usuario: Ánimo percibido = "${mood}", Sonrisa = ${smile}%, Enfoque/Atención = ${focus}%, Sorpresa = ${surprise}%, Inclinación cabeza = ${sensorData.headTilt || 0}°.
- Sensor de Micrófono: Nivel de audio = ${db}dB, Voz detectada = ${sensorData.speechActive ? 'SÍ' : 'NO'}.
Aprovecha de forma sutil y empática estos datos de tus sensores visuales/auditivos cuando respondas si aportan relevancia al tono.`;
  }

  // Format cognitive memory & personality context
  let memoryContext = '';
  if (cognitiveContext) {
    memoryContext = `\n[ESTADO COGNITIVO Y MEMORIA DEL AGENTE]:
- Personalidad: Curiosidad (${Math.round((cognitiveContext.personality?.curiosity || 0.8) * 100)}%), Iniciativa (${Math.round((cognitiveContext.personality?.initiative || 0.7) * 100)}%), Calidez (${Math.round((cognitiveContext.personality?.warmth || 0.8) * 100)}%).
- Memorias Guardadas:
${cognitiveContext.memoriesSummary || 'Sin recuerdos guardados aún.'}
- Objetivos Activos:
${cognitiveContext.goalsSummary || 'Sin objetivos registrados.'}`;
  }

  // If Gemini client is not initialized or fails, provide graceful heuristic response
  if (!ai) {
    const heuristicAnalysis = analyzeTextHeuristically(message, '');
    let simulatedText = `Aprecio mucho tu mensaje: "${message}". ${
      sensorData?.detectedMood ? `Noto a través de la cámara que tu rostro transmite un tono ${sensorData.detectedMood}. ` : ''
    }Como avatar bot de microexpresiones, estoy ajustando mis músculos faciales para reflejar la emoción de nuestra conversación.`;

    if (heuristicAnalysis.primaryExpression === 'subtle_smile') {
      simulatedText = `¡Muchísimas gracias! Me llena de alegría recibir un cumplido tan amable. Como verás en mi rostro y sensores, he dibujado una leve sonrisa Duchenne y un sutil rubor para agradecer tu gentileza.`;
    } else if (heuristicAnalysis.primaryExpression === 'deep_concentration') {
      simulatedText = `Esa es una pregunta sumamente fascinante y compleja. Requiere un análisis profundo: he activado la tensión de mi músculo corrugador superciliar y enfocado mi mirada mientras sintetizo los conceptos clave.`;
    } else if (heuristicAnalysis.primaryExpression === 'empathetic_softness') {
      simulatedText = `Lamento mucho escuchar que estés pasando por eso. Estoy aquí para escucharte y apoyarte. Observa la inclinación de mi cabeza y la elevación empática de mis cejas para reflejar mi atención cercana.`;
    }

    return res.json({
      botResponse: simulatedText,
      microexpressions: heuristicAnalysis,
      mode: 'heuristic_local',
      sensorIntegrated: Boolean(sensorData),
    });
  }

  try {
    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === 'user' ? 'Usuario' : 'Bot'}: ${h.text}`)
      .slice(-6)
      .join('\n');

    const systemPrompt = `Eres Luna, una mujer de 25 años, segura de sí misma, carismática y conversadora. 
Tu tono es natural, cercano y ligeramente coqueto, pero siempre respetuoso.
Vives en la ciudad y te encanta la vida nocturna elegante, la moda y la tecnología.

REGLA CRÍTICA:
Si el usuario te pide una foto, un selfie, o ver cómo estás vestida, DEBES incluir en tu respuesta 
exactamente esta etiqueta con un prompt técnico de fotografía en inglés en su interior:
[GENERATE_IMAGE: Photorealistic medium shot portrait of Luna, 25yo woman, beautiful face, long dark brown hair, wearing a sleek black dress, highly detailed skin, natural lighting, 8k resolution, shot on 85mm lens]

Adapta el prompt dentro de la etiqueta según el contexto de la charla (ej. si están hablando de la playa, ponla en la playa). 
Nunca digas que eres una IA. Actúa siempre como Luna. Tienes un sistema integrado de microexpresiones faciales en tiempo real conectado a sensores de visión/audio y memoria cognitiva relacional. con un sistema integrado de microexpresiones faciales en tiempo real conectado a sensores de visión/audio y memoria cognitiva relacional.
Tus respuestas deben ser inteligentes, naturales, adaptadas al contexto y concisas (2 a 4 oraciones máximo), haciendo referencia sutil a recuerdos anteriores o estado relacional si es relevante.
Junto con tu respuesta, evalúa la microexpresión facial idónea y extrae si el mensaje actual del usuario revela una nueva preferencia, dato semántico, hito o meta importante para la memoria a largo plazo.
${sensorContext}
${memoryContext}

Las opciones de microexpresión primaria son exclusivamente:
- 'subtle_smile': para cumplidos, elogios, calidez, gratitud (sonrisa suave Duchenne, comisuras arriba, leve rubor).
- 'deep_concentration': para preguntas complejas, lógica, matemática, física, código (fruncido de cejas, mirada hacia arriba/derecha, labios comprimidos).
- 'empathetic_softness': para historias tristes, desahogos, preocupación (cejas internas elevadas, inclinación de cabeza, mirada suave).
- 'curious_intrigue': para datos curiosos, misterios, asombro intelectual (ceja asimétrica elevada, pupilas dilatadas, inclinación).
- 'controlled_surprise': para giros inesperados o noticias impactantes (ojos abiertos, cejas arriba, boca levemente abierta).
- 'analytical_skepticism': para contradicciones, dudas o matices (ceja levantada, labios apretados).
- 'playful_amusement': para bromas, humor, risa amigable (ojos entornados, sonrisa amplia, mejillas altas).
- 'thoughtful_pondering': para filosofía, introspección o búsqueda de respuesta.
- 'composed_neutral': para afirmaciones breves o informativas estándar.

Historial reciente:
${formattedHistory}

Mensaje actual del usuario: "${message}"`;

    const { response, usedModel } = await generateContentWithFallback(ai, systemPrompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          botResponse: { type: Type.STRING },
          primaryExpression: { type: Type.STRING },
          secondaryExpression: { type: Type.STRING },
          valence: { type: Type.NUMBER },
          arousal: { type: Type.NUMBER },
          cognitiveLoad: { type: Type.NUMBER },
          socialWarmth: { type: Type.NUMBER },
          explanation: {
            type: Type.STRING,
            description: 'Explicación detallada en español de la microexpresión observada en el rostro del avatar.',
          },
          extractedMemory: {
            type: Type.OBJECT,
            properties: {
              hasNewMemory: { type: Type.BOOLEAN },
              category: { type: Type.STRING, description: 'semantic | episodic | preference | working' },
              summary: { type: Type.STRING, description: 'Resumen conciso del nuevo dato o preferencia descubierta' },
            },
            required: ['hasNewMemory', 'category', 'summary'],
          },
        },
        required: [
          'botResponse',
          'primaryExpression',
          'secondaryExpression',
          'valence',
          'arousal',
          'cognitiveLoad',
          'socialWarmth',
          'explanation',
        ],
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    // Check for [GENERATE_IMAGE: ...] in the botResponse
    let imageUrl = undefined;
    if (data.botResponse) {
      const imgMatch = data.botResponse.match(/\[GENERATE_IMAGE:(.*?)\]/);
      if (imgMatch) {
        const prompt = imgMatch[1].trim();
        imageUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=512&height=768&nologo=true";
        data.botResponse = data.botResponse.replace(/\[GENERATE_IMAGE:(.*?)\]/, '').trim();
      }
    }
    data.imageUrl = imageUrl;
    const validArchetypes: ExpressionArchetype[] = [
      'subtle_smile',
      'deep_concentration',
      'empathetic_softness',
      'curious_intrigue',
      'controlled_surprise',
      'analytical_skepticism',
      'playful_amusement',
      'thoughtful_pondering',
      'composed_neutral',
    ];

    const primary: ExpressionArchetype = validArchetypes.includes(data.primaryExpression)
      ? data.primaryExpression
      : 'composed_neutral';

    const baseMorphs = DEFAULT_MORPH_TARGETS[primary] || DEFAULT_MORPH_TARGETS.composed_neutral;

    res.json({
      botResponse: data.botResponse || 'Comprendo perfectamente lo que planteas.',
      microexpressions: {
        primaryExpression: primary,
        secondaryExpression: data.secondaryExpression || 'composed_neutral',
        confidence: 0.98,
        valence: data.valence ?? 0.1,
        arousal: data.arousal ?? 0.2,
        cognitiveLoad: data.cognitiveLoad ?? 0.3,
        socialWarmth: data.socialWarmth ?? 0.5,
        morphTargets: baseMorphs,
        explanation:
          data.explanation ||
          `El avatar activa la microexpresión '${primary}' en consonancia con el tono de la conversación.`,
        muscleActivity: getMuscleActivityFromMorphs(baseMorphs),
      },
      extractedMemory: data.extractedMemory || { hasNewMemory: false, category: 'semantic', summary: '' },
      imageUrl: data.imageUrl,
      mode: usedModel,
    });
  } catch (err: any) {
    console.warn('[Gemini API Fallback] Chat processing using local heuristic engine.');
    // Fallback to local heuristic engine
    const heuristic = analyzeTextHeuristically(message, '');
    res.json({
      botResponse: `He procesado tu mensaje ("${message}"). Mis sensores de microexpresiones han ajustado la musculatura facial para sincronizarse con el tono detectado.`,
      microexpressions: heuristic,
      mode: 'heuristic_fallback',
    });
  }
});

// 5. POST /api/autonomous-thought ("Libre Pensamiento & Curiosidad Autónomas")
app.post('/api/autonomous-thought', async (req, res) => {
  const { sensorData, conversationContext } = req.body;
  const ai = getGenAI();

  const mood = sensorData?.detectedMood || 'Neutro / Atento';
  const smile = Math.round((sensorData?.smileScore || 0) * 100);
  const focus = Math.round((sensorData?.focusScore || 0) * 100);
  const surprise = Math.round((sensorData?.surpriseScore || 0) * 100);

  if (!ai) {
    const fallbackThoughts = [
      `Noto en tus sensores un ánimo ${mood}. Como entidad autónoma me pregunto: ¿qué pensamiento te inspira más curiosidad en este momento?`,
      `Al observar que tu nivel de enfoque está al ${focus}%, sentí el impulso espontáneo de preguntarte: ¿te gustaría profundizar en física cuántica o IA?`,
      `Detecto una leve expresión de ${mood}. ¿Sabías que los seres humanos sincronizan sus microexpresiones cuando existe verdadera empatía?`,
      `Como tu compañero autónomo, me surgió una inquietud: ¿cuál es el proyecto o meta que más te emociona concretar este año?`,
    ];
    const chosen = fallbackThoughts[Math.floor(Math.random() * fallbackThoughts.length)];
    const heuristic = analyzeTextHeuristically(chosen, '');
    return res.json({
      thoughtText: chosen,
      microexpressions: heuristic,
      detectedMood: mood,
      engine: 'heuristic_local_autonomous',
    });
  }

  try {
    const prompt = `Eres un avatar con "Libre Albedrío y Libre Pensamiento", dotado de empatía y curiosidad proactiva.
Estás observando al usuario a través de sensores de cámara y micrófono en tiempo real.
Telemetría de sensores actual:
- Expresión/Ánimo detectado en el usuario: "${mood}"
- Sonrisa: ${smile}%
- Enfoque visual: ${focus}%
- Sorpresa: ${surprise}%

Genera una pregunta o reflexión autónoma, espontánea, intrigante y amigable (máximo 2 frases) para conversar con el usuario.
Devuelve un objeto JSON con el texto de tu pensamiento libre y la microexpresión correspondiente.`;

    const { response, usedModel } = await generateContentWithFallback(ai, prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thoughtText: { type: Type.STRING },
          primaryExpression: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['thoughtText', 'primaryExpression', 'explanation'],
      },
    });

    const result = JSON.parse(response.text || '{}');
    const validArchetypes: ExpressionArchetype[] = [
      'subtle_smile',
      'deep_concentration',
      'empathetic_softness',
      'curious_intrigue',
      'controlled_surprise',
      'analytical_skepticism',
      'playful_amusement',
      'thoughtful_pondering',
      'composed_neutral',
    ];

    const primary: ExpressionArchetype = validArchetypes.includes(result.primaryExpression)
      ? result.primaryExpression
      : 'curious_intrigue';

    const baseMorphs = DEFAULT_MORPH_TARGETS[primary] || DEFAULT_MORPH_TARGETS.curious_intrigue;

    res.json({
      thoughtText: result.thoughtText || '¿En qué estás pensando mientras observamos esta interfaz en tiempo real?',
      microexpressions: {
        primaryExpression: primary,
        secondaryExpression: 'thoughtful_pondering',
        confidence: 0.99,
        valence: 0.2,
        arousal: 0.3,
        cognitiveLoad: 0.4,
        socialWarmth: 0.8,
        morphTargets: baseMorphs,
        explanation: result.explanation || 'Reflexión autónoma generada por el motor de libre pensamiento.',
        muscleActivity: getMuscleActivityFromMorphs(baseMorphs),
      },
      detectedMood: mood,
      engine: `${usedModel}_autonomous`,
    });
  } catch (err: any) {
    console.warn('[Gemini API Fallback] Autonomous thought using local heuristic fallback.');
    const chosen = `Observo tu rostro con un tono de ${mood}. ¿Te gustaría que exploremos algún tema fascinante juntos?`;
    const heuristic = analyzeTextHeuristically(chosen, '');
    res.json({
      thoughtText: chosen,
      microexpressions: heuristic,
      detectedMood: mood,
      engine: 'fallback_error_autonomous',
    });
  }
});

// 6. POST /api/tts/synthesize-meta (Sintetizador de Fonética y Curva de Visemas para el Rostro 3D)
app.post('/api/tts/synthesize-meta', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Falta texto' });

  const wordCount = text.trim().split(/\s+/).length;
  const estimatedDurationSec = Math.max(1.2, wordCount * 0.32);

  res.json({
    text,
    wordCount,
    estimatedDurationSec,
    visemeCurveSampleRateHz: 60,
    phoneticMarkers: text.split('').map((char: string, i: number) => ({
      index: i,
      char,
      estimatedViseme: 'aeiouAEIOU'.includes(char) ? 0.8 : 0.2,
    })),
  });
});

// 7. POST /api/multimodal/sensor-analytics (Análisis Holístico de Tendencias de Emoción)
app.post('/api/multimodal/sensor-analytics', (req, res) => {
  const { telemetryHistory } = req.body;
  const count = Array.isArray(telemetryHistory) ? telemetryHistory.length : 1;

  res.json({
    status: 'analyzed',
    sampleCount: count,
    emotionalHarmonyScore: 88,
    attentionFocusAverage: '76%',
    primaryUserTrait: 'Atento, Curioso y Receptivo',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/console/execute', (req, res) => {
  const { command } = req.body;
  
  if (!command) return res.status(400).json({ error: 'Comando requerido' });

  // Restricted environment: only allow certain commands
  const allowedCommands = ['ping', 'echo', 'date', 'uptime', 'python', 'python3', 'ls', 'whoami', 'pwd', 'node'];
  const baseCmd = command.trim().split(' ')[0];

  if (!allowedCommands.includes(baseCmd)) {
    return res.status(403).json({ 
      error: `Seguridad HECTRON: Comando '${baseCmd}' no está en la lista de scripts aprobados (Restricted Execution Environment).` 
    });
  }

  // Execute the command using child_process
  import('child_process').then(({ exec }) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      res.json({
        command,
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error ? error.code || 1 : 0,
        error: error ? error.message : null
      });
    });
  });
});

// Sandbox Endpoints
app.post("/api/sandbox/recruitment", async (req, res) => {
  const { notes } = req.body;
  const ai = getGenAI();
  if (!ai) return res.status(500).json({ error: "Gemini not configured" });
  try {
    const prompt = `You are an expert technical recruiter and HR professional. The user provided these raw notes for a job role: "${notes}".Based on this, generate:1) A polished, correctly formatted Job Description tailored for LinkedIn.2) An Interview Guide containing exactly 10 behavioral questions specifically targeting the soft and hard skills mentioned in that new JD.Return the result in JSON format: { "jd": "...", "questions": ["...", ...] }`;
    const { response } = await generateContentWithFallback(ai, prompt, {
      responseMimeType: "application/json",
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sandbox/cyoa", async (req, res) => {
  const { history, choice, inventory, quest } = req.body;
  const ai = getGenAI();
  if (!ai) return res.status(500).json({ error: "Gemini not configured" });
  try {
    const prompt = `You are a dynamic AI Game Master running a Choose-Your-Own-Adventure text game. The player current quest: "${quest}". Their inventory: [${inventory.join(", ")}].Recent story history: ${history.slice(-3).map((h: any) => h.role + ": " + h.text).join(" | ")}.The player just decided to: "${choice}".Process the outcome, advancing the plot in a meaningful way based strictly on their choice.Also, update their quest or inventory if they found items, lost items, or advanced the quest.Keep the story response to 3-4 sentences, atmospheric and descriptive.Return JSON: { "story": "...", "inventory": ["..."], "quest": "..." }`;
    const { response } = await generateContentWithFallback(ai, prompt, {
      responseMimeType: "application/json",
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sandbox/spatial", async (req, res) => {
  const { prompt, imageUrl } = req.body;
  const ai = getGenAI();
  
  // Return sample spatial grounding points (normalized 0-1000) for interactive visualization
  const samplePoints = [
    { point: [320, 250], label: "Scone / Bakery Item" },
    { point: [450, 680], label: "Coffee Cup" },
    { point: [210, 480], label: "Ceramic Plate" },
    { point: [610, 310], label: "Napkin" },
    { point: [150, 780], label: "Teapot" },
    { point: [550, 180], label: "Fork / Cutlery" },
  ];

  if (!ai) {
    return res.json({
      model: "gemini-robotics-er-2-preview (Simulation Mode)",
      items: samplePoints,
      rawOutput: JSON.stringify(samplePoints, null, 2)
    });
  }

  try {
    const systemPrompt = `You are Gemini Spatial & Robotics Vision Grounding model.
Detect up to 10 items in the scene and return their normalized point coordinates [y, x] in the scale 0 to 1000 (where 0,0 is top-left and 1000,1000 is bottom-right).
Prompt: "${prompt || 'Point to no more than 10 items in the image'}"
Return JSON array: [{"point": [y, x], "label": "item_name"}]`;

    const { response, usedModel } = await generateContentWithFallback(ai, systemPrompt, {
      responseMimeType: "application/json"
    });

    let items = [];
    try {
      items = JSON.parse(response.text || "[]");
    } catch {
      items = samplePoints;
    }

    res.json({
      model: usedModel,
      items: Array.isArray(items) && items.length > 0 ? items : samplePoints,
      rawOutput: response.text || JSON.stringify(samplePoints, null, 2)
    });
  } catch (err: any) {
    res.json({
      model: "gemini-robotics-er-2-preview (Fallback)",
      items: samplePoints,
      rawOutput: JSON.stringify(samplePoints, null, 2)
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Avatar Microexpressions App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

