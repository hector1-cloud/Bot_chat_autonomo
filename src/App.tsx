import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AvatarCanvas } from './components/AvatarCanvas';
import { ChatInterface } from './components/ChatInterface';
import { ApiInspector } from './components/ApiInspector';
import { WebcamCompanionPanel } from './components/WebcamCompanionPanel';
import { FreeApisHub } from './components/FreeApisHub';
import { CognitiveStudioPanel } from './components/CognitiveStudioPanel';
import { SandboxesHub } from './components/SandboxesHub';
import { SystemConsole } from './components/SystemConsole';
import { ChatMessage, ExpressionArchetype, FacialMorphTargets, MicroexpressionAnalysis, PresetScenario } from './types/microexpressions';
import { DEFAULT_MORPH_TARGETS, analyzeTextHeuristically } from './utils/microexpressionsEngine';
import { audioEngine } from './utils/audioEngine';
import { cognitiveEngine } from './utils/cognitiveEngine';
import { generateGeminiResponse } from './utils/geminiService';
import { Video, Globe, Activity, Eye, Sparkles, Brain, Package, Server } from 'lucide-react';

const DEFAULT_WELCOME_MSG: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: '¡Hola! Soy tu avatar con API de microexpresiones faciales y memoria cognitiva relacional. Mi cerebro aprende de nuestras conversaciones, recuerda tus preferencias y reacciona emocionalmente en tiempo real. ¡Prueba a conversarme!',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  microexpressions: analyzeTextHeuristically("Hola avatar", "¡Hola! Soy tu avatar con API de microexpresiones faciales"),
};

export const App: React.FC = () => {
  // Load initial messages from localStorage if available
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('avatar_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading chat messages from localStorage:', err);
    }
    return [DEFAULT_WELCOME_MSG];
  });

  const [currentMorphs, setCurrentMorphs] = useState<FacialMorphTargets>(DEFAULT_MORPH_TARGETS.composed_neutral);
  const [currentArchetype, setCurrentArchetype] = useState<ExpressionArchetype>('subtle_smile');
  const [activeMicroexpressions, setActiveMicroexpressions] = useState<MicroexpressionAnalysis | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeViseme, setActiveViseme] = useState<number>(0);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(false);
  const [showMuscleHeatmap, setShowMuscleHeatmap] = useState<boolean>(false);

  // Load avatarStyle from localStorage if available
  const [avatarStyle, setAvatarStyle] = useState<'modern' | 'cyberpunk' | 'anime' | 'humanoid'>(() => {
    try {
      const saved = localStorage.getItem('avatar_style');
      if (saved === 'modern' || saved === 'cyberpunk' || saved === 'anime' || saved === 'humanoid') {
        return saved;
      }
    } catch (err) {
      console.warn('Error reading avatar style from localStorage:', err);
    }
    return 'anime';
  });

  const [inspectorTab, setInspectorTab] = useState<'morphs' | 'muscles' | 'affective' | 'json'>('morphs');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);

  // Navigation Studio Mode Tab
  const [activeStudioView, setActiveStudioView] = useState<'chat' | 'apis' | 'inspector' | 'cognitive' | 'sandboxes' | 'infrastructure'>('chat');
  const [webcamGaze, setWebcamGaze] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const visemeIntervalRef = useRef<number | null>(null);
  const latestSensorTelemetryRef = useRef<any>(null);

  // Persist avatarStyle to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('avatar_style', avatarStyle);
    } catch (err) {
      console.warn('Error saving avatar style to localStorage:', err);
    }
  }, [avatarStyle]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('avatar_chat_messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('Error saving chat messages to localStorage:', err);
    }
  }, [messages]);

  // Check backend health and set initial active microexpression on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey !== undefined) {
          setHasApiKey(data.hasGeminiKey);
        }
      })
      .catch(() => setHasApiKey(false));

    // Find latest bot message with microexpressions to initialize stage
    const lastBotMsgWithMicro = [...messages].reverse().find((m) => m.sender === 'bot' && m.microexpressions);
    const activeMsg = lastBotMsgWithMicro || messages[0] || DEFAULT_WELCOME_MSG;

    if (activeMsg && activeMsg.microexpressions) {
      setActiveMicroexpressions(activeMsg.microexpressions);
      setCurrentMorphs(activeMsg.microexpressions.morphTargets);
      setCurrentArchetype(activeMsg.microexpressions.primaryExpression);
      setSelectedMessageId(activeMsg.id);
    }

    const handleUserInteraction = () => {
      audioEngine.unlockAudioContext();
    };
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Clear chat history
  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    setSelectedMessageId(DEFAULT_WELCOME_MSG.id);
    if (DEFAULT_WELCOME_MSG.microexpressions) {
      setActiveMicroexpressions(DEFAULT_WELCOME_MSG.microexpressions);
      setCurrentMorphs(DEFAULT_WELCOME_MSG.microexpressions.morphTargets);
      setCurrentArchetype(DEFAULT_WELCOME_MSG.microexpressions.primaryExpression);
    }
    try {
      localStorage.removeItem('avatar_chat_messages');
    } catch (err) {
      console.warn('Error clearing localStorage:', err);
    }
  };

  // Speech synthesis & viseme mouth sync using robust audioEngine
  const speakText = (text: string) => {
    if (!audioEnabled) return;

    audioEngine.speak(text, {
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setActiveViseme(0);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setActiveViseme(0);
        console.warn('Audio engine playback notice:', err);
      },
      onViseme: (v) => {
        setActiveViseme(v);
      },
    });
  };

  // Send message handler
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let injectedData = '';
      if (text.toLowerCase().startsWith('/clima')) {
        const city = text.slice(6).trim() || 'Madrid';
        try {
          const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
          const weatherData = await res.json();
          const temp = weatherData.current_condition[0].temp_C;
          const desc = weatherData.current_condition[0].weatherDesc[0].value;
          injectedData = `\n[SISTEMA: Datos del clima en tiempo real obtenidos para ${city}: ${temp}°C, ${desc}. Integra esta información en tu respuesta de forma natural y tierna.]`;
        } catch (e) {
          injectedData = `\n[SISTEMA: No se pudo obtener el clima en tiempo real para ${city}. Disculpa amablemente la indisponibilidad.]`;
        }
      }

      const cognitiveState = cognitiveEngine.getState();
      
      // Call Gemini Service
      const data = await generateGeminiResponse({
        message: text + injectedData,
        history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        cognitiveState,
        memoriesSummary: cognitiveEngine.getMemoriesSummaryForPrompt(),
        goalsSummary: cognitiveEngine.getActiveGoalsSummaryForPrompt(),
        sensorData: latestSensorTelemetryRef.current,
      });

      // 1. Check if new memory extracted
      if (data.extractedMemory?.hasNewMemory && data.extractedMemory.summary) {
        cognitiveEngine.addMemory(
          (data.extractedMemory.category as any) || 'semantic',
          data.extractedMemory.summary,
          0.85
        );
      }

      // 2. Evaluate interaction & dynamically evolve personality traits (calidez, curiosidad, iniciativa)
      cognitiveEngine.evaluateAndEvolvePersonality(
        text,
        data.botResponse,
        data.microexpressions,
        data.extractedMemory
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.botResponse || 'Comprendo lo que mencionas.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        microexpressions: data.microexpressions,
        imageUrl: (data as any).imageUrl,
      };

      setMessages((prev) => [...prev, botMsg]);
      setSelectedMessageId(botMsg.id);

      if (data.microexpressions) {
        setActiveMicroexpressions(data.microexpressions);
        setCurrentMorphs(data.microexpressions.morphTargets);
        setCurrentArchetype(data.microexpressions.primaryExpression);
      }

      speakText(botMsg.text);
    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      // Fallback
      const heuristic = analyzeTextHeuristically(text, '');
      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        text: 'He recibido tu mensaje y ajustado mi microexpresión facial correspondiente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        microexpressions: heuristic,
      };

      cognitiveEngine.evaluateAndEvolvePersonality(text, fallbackMsg.text, heuristic);

      setMessages((prev) => [...prev, fallbackMsg]);
      setActiveMicroexpressions(heuristic);
      setCurrentMorphs(heuristic.morphTargets);
      setCurrentArchetype(heuristic.primaryExpression);
      setSelectedMessageId(fallbackMsg.id);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Scenario Handler
  const handleSelectPreset = (preset: PresetScenario) => {
    handleSendMessage(preset.prompt);
  };

  // Select message to inspect
  const handleSelectMessageMicroexpressions = (msg: ChatMessage) => {
    if (msg.microexpressions) {
      setSelectedMessageId(msg.id);
      setActiveMicroexpressions(msg.microexpressions);
      setCurrentMorphs(msg.microexpressions.morphTargets);
      setCurrentArchetype(msg.microexpressions.primaryExpression);
    }
  };

  // Manual Morph Override Slider Change
  const handleManualMorphChange = (updatedMorphs: FacialMorphTargets) => {
    setCurrentMorphs(updatedMorphs);
  };

  // Manual Archetype Preset Selection
  const handleSelectArchetypePreset = (archetype: ExpressionArchetype) => {
    const baseMorphs = DEFAULT_MORPH_TARGETS[archetype] || DEFAULT_MORPH_TARGETS.composed_neutral;
    setCurrentArchetype(archetype);
    setCurrentMorphs(baseMorphs);
  };

  // Autonomous Learning Companion Question Trigger ("Libre Albedrío")
  const handleAutonomousQuestion = (questionText: string, detectedEmotion: string) => {
    const heuristic = analyzeTextHeuristically(questionText, '');
    const autoMsg: ChatMessage = {
      id: `bot-libre-${Date.now()}`,
      sender: 'bot',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      microexpressions: {
        ...heuristic,
        primaryExpression: 'curious_intrigue',
        explanation: `Pregunta espontánea basada en observación en tiempo real. Estado percibido del usuario: ${detectedEmotion}`,
      },
    };

    setMessages((prev) => [...prev, autoMsg]);
    setSelectedMessageId(autoMsg.id);
    setActiveMicroexpressions(autoMsg.microexpressions);
    setCurrentArchetype('curious_intrigue');
    setCurrentMorphs(DEFAULT_MORPH_TARGETS.curious_intrigue);

    speakText(questionText);
  };

  return (
    
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header hasApiKey={hasApiKey} realtimeConnected={realtimeConnected} />

      {/* Studio View Navigation Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveStudioView('chat')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'chat'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4 text-indigo-300" />
              <span>Vídeo Chat Studio</span>
            </button>

            <button
              onClick={() => setActiveStudioView('cognitive')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'cognitive'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Cerebro Cognitivo & Memoria</span>
            </button>

            <button
              onClick={() => setActiveStudioView('apis')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'apis'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-purple-300" />
              <span>APIs Libres & Conocimiento</span>
            </button>

            <button
              onClick={() => setActiveStudioView('inspector')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'inspector'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Inspector de Microexpresiones</span>
            </button>
            <button
              onClick={() => setActiveStudioView('sandboxes')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'sandboxes'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4 text-orange-300" />
              <span>Mini Apps & Sandboxes</span>
            </button>
            <button
              onClick={() => setActiveStudioView('infrastructure')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeStudioView === 'infrastructure'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Infrastructure</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] text-slate-300">Gaze Tracking + Open APIs Active</span>
          </div>
        </div>
      </div>

      {/* Main Studio View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Stage Column: 3D Avatar Stage & Webcam Companion Sensors */}
        <div className="lg:col-span-5 w-full flex flex-col gap-4">
          <AvatarCanvas
            targetMorphs={currentMorphs}
            currentArchetype={currentArchetype}
            explanation={activeMicroexpressions?.explanation}
            isThinking={isLoading}
            isSpeaking={isSpeaking}
            activeViseme={activeViseme}
            showMeshOverlay={showMeshOverlay}
            setShowMeshOverlay={setShowMeshOverlay}
            showMuscleHeatmap={showMuscleHeatmap}
            setShowMuscleHeatmap={setShowMuscleHeatmap}
            avatarStyle={avatarStyle}
            setAvatarStyle={setAvatarStyle}
            webcamGaze={webcamGaze}
            activeStudioView={activeStudioView}
          />

          {/* Real-time Camera & Microexpression Webcam Companion Panel */}
          <WebcamCompanionPanel
            onAutonomousQuestion={handleAutonomousQuestion}
            onSensorTelemetryUpdate={(telemetry) => {
              latestSensorTelemetryRef.current = telemetry;
              
              // Mirror or react to user's microexpressions if not actively answering/speaking
              if (!isSpeaking && !isLoading) {
                if (telemetry.smileScore > 0.65) {
                  setCurrentArchetype('subtle_smile');
                  setCurrentMorphs({ ...DEFAULT_MORPH_TARGETS.subtle_smile, lipCornerPuller: 0.3, cheekRaiser: 0.3 });
                } else if (telemetry.surpriseScore > 0.45) {
                  setCurrentArchetype('controlled_surprise');
                  setCurrentMorphs({ ...DEFAULT_MORPH_TARGETS.controlled_surprise, browInnerUp: 0.5, eyeWide: 0.5 });
                } else if (telemetry.focusScore > 0.7) {
                  setCurrentArchetype('deep_concentration');
                  setCurrentMorphs({ ...DEFAULT_MORPH_TARGETS.deep_concentration, browLowerer: 0.4, eyeSquintLeft: 0.3, eyeSquintRight: 0.3 });
                }
              }
            }}
            onWebcamGazeUpdate={(gaze) => {
              setWebcamGaze(gaze);
            }}
            isBotSpeaking={isSpeaking}
          />
        </div>

        {/* Right Stage Column: View-Dependent Studio Component */}
        <div className="lg:col-span-7 w-full flex flex-col gap-6">
          {activeStudioView === 'chat' && (
            <div className="h-[620px]">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                onSelectPreset={handleSelectPreset}
                onSelectMessageMicroexpressions={handleSelectMessageMicroexpressions}
                selectedMessageId={selectedMessageId}
                onClearHistory={handleClearHistory}
              />
            </div>
          )}

          {activeStudioView === 'cognitive' && (
            <div className="h-[620px]">
              <CognitiveStudioPanel />
            </div>
          )}

          {activeStudioView === 'apis' && (
            <div className="h-[620px]">
              <FreeApisHub onInjectIntoChat={handleSendMessage} />
            </div>
          )}

          {activeStudioView === 'inspector' && (
            <div className="h-[620px]">
              <ApiInspector
                microexpressions={activeMicroexpressions}
                currentMorphs={currentMorphs}
                onManualMorphChange={handleManualMorphChange}
                onSelectArchetypePreset={handleSelectArchetypePreset}
                activeTab={inspectorTab}
                setActiveTab={setInspectorTab}
              />
            </div>
          )}

          {activeStudioView === 'sandboxes' && (
            <div className="h-[620px]">
              <SandboxesHub />
            </div>
          )}

          {activeStudioView === 'infrastructure' && (
            <div className="h-[620px]">
              <SystemConsole />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
