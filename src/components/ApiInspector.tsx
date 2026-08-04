import React, { useState } from 'react';
import { ExpressionArchetype, FacialMorphTargets, MicroexpressionAnalysis } from '../types/microexpressions';
import { MUSCLE_DESCRIPTIONS } from '../utils/microexpressionsEngine';
import { Code2, Sliders, Activity, Copy, Check, Terminal, Sparkles, Cpu, BarChart2 } from 'lucide-react';

interface ApiInspectorProps {
  microexpressions?: MicroexpressionAnalysis;
  currentMorphs: FacialMorphTargets;
  onManualMorphChange: (updatedMorphs: FacialMorphTargets) => void;
  onSelectArchetypePreset: (archetype: ExpressionArchetype) => void;
  activeTab: 'morphs' | 'muscles' | 'affective' | 'json';
  setActiveTab: (tab: 'morphs' | 'muscles' | 'affective' | 'json') => void;
}

export const ApiInspector: React.FC<ApiInspectorProps> = ({
  microexpressions,
  currentMorphs,
  onManualMorphChange,
  onSelectArchetypePreset,
  activeTab,
  setActiveTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [codeType, setCodeType] = useState<'curl' | 'javascript' | 'python'>('javascript');

  const handleSliderChange = (key: keyof FacialMorphTargets, value: number) => {
    onManualMorphChange({
      ...currentMorphs,
      [key]: value,
    });
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippet = () => {
    if (codeType === 'curl') {
      return `curl -X POST http://localhost:3000/api/microexpressions/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "userPrompt": "¡Eres el mejor avatar de IA!",
    "text": "¡Muchas gracias! Me alegra enormemente tu comentario."
  }'`;
    }
    if (codeType === 'python') {
      return `import requests

response = requests.post("http://localhost:3000/api/microexpressions/analyze", json={
    "userPrompt": "¡Eres el mejor avatar de IA!",
    "text": "¡Muchas gracias! Me alegra enormemente tu comentario."
})

data = response.json()
print("Microexpresión Detectada:", data["primaryExpression"])
print("Morph Targets:", data["morphTargets"])`;
    }
    return `const res = await fetch('/api/microexpressions/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userPrompt: "¡Eres el mejor avatar de IA!",
    text: "¡Muchas gracias! Me alegra enormemente tu comentario."
  })
});

const data = await res.json();
console.log('Archetype:', data.primaryExpression);
console.log('Valence:', data.valence, 'Arousal:', data.arousal);
console.log('Morph Weights:', data.morphTargets);`;
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col h-full">
      {/* Inspector Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            API de Microexpresiones Inspector
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('morphs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'morphs'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Músculos ({Object.keys(currentMorphs).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('muscles')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'muscles'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Anatomía Facial</span>
          </button>

          <button
            onClick={() => setActiveTab('affective')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'affective'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Espacio Afectivo</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON & Code</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Morph Target Sliders */}
      {activeTab === 'morphs' && (
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span>Control manual directo de pesos musculares (0.0 a 1.0)</span>
            <button
              onClick={() => onSelectArchetypePreset('composed_neutral')}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Resetear a Neutro
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {MORPH_SLIDER_DEFINITIONS.map(({ key, label, min = 0, max = 1, step = 0.05 }) => {
              const val = currentMorphs[key] ?? 0;
              return (
                <div key={key} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">{label}</span>
                    <span className="font-mono text-indigo-400 font-bold">{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Anatomical Muscle Heatmap & Activation */}
      {activeTab === 'muscles' && (
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            Análisis biomecánico de grupos musculares faciales activados para esta microexpresión.
          </div>

          {(microexpressions?.muscleActivity || []).map((m, idx) => (
            <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200">{m.spanishName}</span>
                  <span className="text-slate-500 ml-2 font-mono">({m.muscleName})</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {(Math.min(1, Math.max(0, m.activation)) * 100).toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, m.activation * 100))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">{m.functionDescription}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Affective Space Quadrant Chart (Valence vs Arousal) */}
      {activeTab === 'affective' && (
        <div className="flex-1 overflow-y-auto mt-4 pr-1 flex flex-col items-center justify-center space-y-4">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 w-full text-center">
            Modelo Cirecoplejo Afectivo de Russell (Valencia Emocional vs Nivel de Excitación Cognitiva).
          </div>

          <div className="relative w-64 h-64 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
            {/* Axis Lines */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800" />

            {/* Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase text-amber-400 tracking-wider">
              Alta Excitación (Arousal)
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
              Baja Excitación
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-rose-400 -rotate-90">
              Valencia Negativa
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-emerald-400 rotate-90">
              Valencia Positiva
            </span>

            {/* Plotted Node */}
            {microexpressions && (
              <div
                className="absolute w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/50 transition-all duration-700 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `${((microexpressions.valence + 1) / 2) * 100}%`,
                  top: `${(1 - microexpressions.arousal) * 100}%`,
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Valencia</span>
              <span className="font-mono font-bold text-emerald-400">
                {microexpressions?.valence.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Excitación</span>
              <span className="font-mono font-bold text-amber-400">
                {microexpressions?.arousal.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Carga Cognitiva</span>
              <span className="font-mono font-bold text-indigo-400">
                {microexpressions?.cognitiveLoad.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Calidez Social</span>
              <span className="font-mono font-bold text-rose-400">
                {microexpressions?.socialWarmth.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: JSON Output & Code Integration */}
      {activeTab === 'json' && (
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['javascript', 'curl', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeType(lang)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    codeType === lang ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => copySnippet(getCodeSnippet())}
              className="flex items-center gap-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 px-3 py-1.5 rounded-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Snippet'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-emerald-400 overflow-x-auto">
            {getCodeSnippet()}
          </pre>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-300">Respuesta JSON de la API (`/api/microexpressions/analyze`):</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-56">
              {JSON.stringify(microexpressions || { currentMorphs }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const MORPH_SLIDER_DEFINITIONS: Array<{
  key: keyof FacialMorphTargets;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}> = [
  { key: 'lipCornerPuller', label: 'Comisuras Labiales (Sonrisa)', min: -0.5, max: 1.0 },
  { key: 'browLowerer', label: 'Fruncir Ceño (Corrugador)', min: 0.0, max: 1.0 },
  { key: 'browInnerUp', label: 'Cejas Internas Arriba (Prócer)', min: 0.0, max: 1.0 },
  { key: 'browOuterRaiseLeft', label: 'Ceja Izquierda Arriba', min: 0.0, max: 1.0 },
  { key: 'browOuterRaiseRight', label: 'Ceja Derecha Arriba', min: 0.0, max: 1.0 },
  { key: 'eyeSquintLeft', label: 'Entornar Ojo Izquierdo', min: 0.0, max: 1.0 },
  { key: 'eyeSquintRight', label: 'Entornar Ojo Derecho', min: 0.0, max: 1.0 },
  { key: 'eyeWide', label: 'Apertura Ocular (Sorpresa)', min: 0.0, max: 1.0 },
  { key: 'cheekRaiser', label: 'Elevación de Mejillas', min: 0.0, max: 1.0 },
  { key: 'lipPucker', label: 'Fruncido Labial (Cavilar)', min: 0.0, max: 1.0 },
  { key: 'lipPress', label: 'Presión Labial (Enfoque)', min: 0.0, max: 1.0 },
  { key: 'jawOpen', label: 'Apertura de Mandíbula', min: 0.0, max: 1.0 },
  { key: 'headTilt', label: 'Inclinación de Cabeza', min: -0.8, max: 0.8 },
  { key: 'blush', label: 'Rubor Facial', min: 0.0, max: 1.0 },
  { key: 'gazeX', label: 'Mirada Horizontal', min: -1.0, max: 1.0 },
  { key: 'gazeY', label: 'Mirada Vertical', min: -1.0, max: 1.0 },
  { key: 'pupilDilation', label: 'Dilatación Pupilar', min: 0.8, max: 1.4 },
];
