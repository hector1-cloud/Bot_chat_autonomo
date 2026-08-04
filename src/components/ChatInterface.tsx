import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PresetScenario } from '../types/microexpressions';
import { PRESET_SCENARIOS } from '../utils/presets';
import { Send, Volume2, VolumeX, Sparkles, RefreshCw, MessageSquare, Bot, User, CornerDownLeft, Smile, Mic, MicOff, Radio } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onSelectPreset: (preset: PresetScenario) => void;
  onSelectMessageMicroexpressions: (msg: ChatMessage) => void;
  selectedMessageId?: string;
  onClearHistory?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  audioEnabled,
  setAudioEnabled,
  onSelectPreset,
  onSelectMessageMicroexpressions,
  selectedMessageId,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll removed as requested for manual control
  // Scroll button can be used if needed

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleVoiceListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Tu navegador no soporta Web Speech API de manera nativa (SpeechRecognition). Te recomendamos Chrome o Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Conversación con Bot Expresivo
            </h2>
            <p className="text-[11px] text-slate-400">Sincronización en tiempo real de microexpresiones faciales</p>
          </div>
        </div>

        {/* Controls: Clear History & Audio TTS Toggle */}
        <div className="flex items-center gap-2">
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-medium transition-all"
              title="Borrar historial guardado en localStorage"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar Chat</span>
            </button>
          )}

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              audioEnabled
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Activa o desactiva voz sintetizada con visemas"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{audioEnabled ? 'Voz & Visemas ON' : 'Voz Mute'}</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Bar */}
      <div className="my-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Probar Escenarios de Microexpresiones:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800/90 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2 min-h-[220px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2 border border-dashed border-slate-800/80 rounded-2xl">
            <Smile className="w-8 h-8 text-indigo-400/60" />
            <p className="text-sm font-medium text-slate-400">Inicia la conversación o selecciona un escenario arriba</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Escribe un cumplido, una pregunta científica compleja o una historia triste para ver cómo reacciona la musculatura facial del avatar.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSelected = selectedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 border border-slate-700 text-indigo-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div className={`max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Microexpression Tag for Bot Messages */}
                  {!isUser && msg.microexpressions && (
                    <button
                      onClick={() => onSelectMessageMicroexpressions(msg)}
                      className={`mt-1.5 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-medium ring-1 ring-indigo-500'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>
                        Microexpresión: <strong className="text-indigo-300 capitalize">{msg.microexpressions.primaryExpression.replace('_', ' ')}</strong>
                      </span>
                    </button>
                  )}

                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 text-slate-400 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Calculando respuesta & vector musculatorio facial...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Web Speech API Dictation */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-800 space-y-1.5">
        {isListening && (
          <div className="flex items-center gap-2 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span>Escuchando tu voz por micrófono... habla para dictar mensaje</span>
          </div>
        )}

        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Dictando voz en tiempo real...'
                : 'Escribe un mensaje o habla usando el micrófono...'
            }
            disabled={isLoading}
            className={`w-full bg-slate-950 border rounded-xl py-3 pl-4 pr-24 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50 ${
              isListening
                ? 'border-rose-500/80 ring-1 ring-rose-500/50'
                : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              disabled={isLoading}
              title={isListening ? 'Detener dictado por voz' : 'Iniciar dictado por voz (Web Speech API)'}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
