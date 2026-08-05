import React, { useState } from 'react';
import { Cpu, Sparkles, BookOpen, Layers, X, ShieldCheck, Zap, Activity, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  realtimeConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ hasApiKey, realtimeConnected = false }) => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <>
      <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Avatar Microexpresiones AI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.5 API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sincronización biomecánica facial con Gemini 3.6 Flash
              </p>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-2 text-xs">
            {/* Realtime Pipeline Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              realtimeConnected 
                ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' 
                : 'bg-rose-950/30 border-rose-900/50 text-rose-400'
            }`}>
              {realtimeConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{realtimeConnected ? 'Pipeline Conectado' : 'Pipeline Desconectado'}</span>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hasApiKey ? 'Gemini 3.6 Flash Server' : 'Modo Heurístico Local'}</span>
            </div>

            {/* Docs Modal Button */}
            <button
              onClick={() => setShowDocsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Especificación API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Docs Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Documentación de API de Microexpresiones Facial
                </h3>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                Esta API analiza el contenido semántico y el tono afectivo de las respuestas para calcular en tiempo real los vectores musculares faciales del avatar bot.
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 block text-sm">Arquetipos Facial Soportados:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <li>• <strong className="text-amber-400">subtle_smile</strong>: Sonrisa Duchenne (Cumplidos)</li>
                  <li>• <strong className="text-amber-400">deep_concentration</strong>: Enfoque/Corrugador (STEM)</li>
                  <li>• <strong className="text-amber-400">empathetic_softness</strong>: Ceja interna alta (Empatía)</li>
                  <li>• <strong className="text-amber-400">curious_intrigue</strong>: Ceja asimétrica (Curiosidad)</li>
                  <li>• <strong className="text-amber-400">controlled_surprise</strong>: Apertura ocular (Sorpresa)</li>
                  <li>• <strong className="text-amber-400">playful_amusement</strong>: Risita/Squint (Humor)</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 block text-sm">Endpoints Disponibles:</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <p className="text-emerald-400">POST /api/chat</p>
                  <p className="text-slate-400">Genera la respuesta del bot con Gemini 3.6 Flash e incluye la microexpresión sincronizada.</p>
                  <p className="text-emerald-400 pt-1">POST /api/microexpressions/analyze</p>
                  <p className="text-slate-400">Endpoint REST independiente para analizar cualquier texto y obtener los morph targets faciales.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl"
              >
                Cerrar Documentación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
