import React, { useState, useEffect, useRef } from 'react';
import { cognitiveEngine } from '../utils/cognitiveEngine';
import { CognitiveAgentState, MemoryCategory, UserGoal } from '../types/cognitive';
import { Brain, Sparkles, Target, Activity, Plus, Trash2, ShieldCheck, RefreshCw, Layers, Sliders, Zap, Download, Upload, CheckCircle, Server, Database, Code, Copy, Check } from 'lucide-react';

export const CognitiveStudioPanel: React.FC = () => {
  const [state, setState] = useState<CognitiveAgentState>(() => cognitiveEngine.getState());
  const [activeTab, setActiveTab] = useState<'memories' | 'personality' | 'goals' | 'events' | 'hectron'>('memories');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<MemoryCategory | 'all'>('all');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Memory Modal / Inputs
  const [newMemSummary, setNewMemSummary] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<MemoryCategory>('semantic');
  const [newMemImportance, setNewMemImportance] = useState(0.8);

  // New Goal Inputs
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<UserGoal['priority']>('high');

  useEffect(() => {
    const unsubscribe = cognitiveEngine.subscribe(() => {
      setState({ ...cognitiveEngine.getState() });
    });
    return unsubscribe;
  }, []);

  const handleExportJson = () => {
    cognitiveEngine.downloadProfileJson();
    setStatusNotice('Perfil y memoria exportados exitosamente a JSON');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = cognitiveEngine.importProfileFromJson(content);
        if (success) {
          setStatusNotice('¡Perfil relacional y base de conocimiento cargados con éxito!');
        } else {
          setStatusNotice('Error al leer el archivo JSON de perfil.');
        }
        setTimeout(() => setStatusNotice(null), 5000);
      }
    };
    reader.readAsText(file);
    // reset file input
    e.target.value = '';
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemSummary.trim()) return;
    cognitiveEngine.addMemory(newMemCategory, newMemSummary.trim(), newMemImportance, ['manual']);
    setNewMemSummary('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    cognitiveEngine.addGoal(newGoalTitle.trim(), newGoalDesc.trim(), newGoalPriority);
    setNewGoalTitle('');
    setNewGoalDesc('');
  };

  const handlePersonalityChange = (traitKey: keyof typeof state.personality, value: number) => {
    cognitiveEngine.updatePersonality({ [traitKey]: value });
  };

  const filteredMemories = state.memories.filter((m) =>
    selectedCategoryFilter === 'all' ? true : m.category === selectedCategoryFilter
  );

  return (
    <div className="w-full h-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-slate-200 overflow-hidden">
      {/* Hidden File Input for JSON Migration */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/40 text-indigo-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Cerebro Cognitivo & Memoria Relacional</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30 font-mono">
                Active State
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Arquitectura de aprendizaje continuo, memoria episódica y evolución de personalidad.
            </p>
          </div>
        </div>

        {/* Action Buttons: Export & Import JSON Migration */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-xl text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition-all shadow"
            title="Exportar base de conocimiento y perfil a JSON local"
          >
            <Download className="w-3.5 h-3.5 text-indigo-300" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 rounded-xl text-xs font-semibold border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow"
            title="Importar perfil previo desde archivo JSON"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-300" />
            <span>Importar JSON</span>
          </button>
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('memories')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'memories'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="truncate">Memorias ({state.memories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('personality')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'personality'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="truncate">Personalidad</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'goals'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span className="truncate">Objetivos ({state.goals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="truncate">Event Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('hectron')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'hectron'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-cyan-400 hover:text-cyan-200'
          }`}
        >
          <Server className="w-4 h-4 text-cyan-300" />
          <span className="truncate font-bold">HECTRON API</span>
        </button>
      </div>

      {/* Tab 1: Memories Manager */}
      {activeTab === 'memories' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          {/* Add Memory Form */}
          <form onSubmit={handleAddMemory} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Guardar Nuevo Recuerdo
              </span>
              <span className="text-[10px] text-slate-400">Almacenamiento persistente en local state</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Ejemplo: 'El usuario trabaja en proyectos de IA y prefiere explicaciones concretas.'"
                value={newMemSummary}
                onChange={(e) => setNewMemSummary(e.target.value)}
                className="sm:col-span-7 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newMemCategory}
                onChange={(e) => setNewMemCategory(e.target.value as MemoryCategory)}
                className="sm:col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="semantic">Semántica (Hechos)</option>
                <option value="episodic">Episódica (Hitos)</option>
                <option value="procedural">Procedimental (Estilo)</option>
                <option value="working">Trabajo (Corto Plazo)</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs py-1.5 transition-all shadow"
              >
                Guardar
              </button>
            </div>
          </form>

          {/* Category Filter & Clear */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'semantic', 'episodic', 'procedural', 'working'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all capitalize ${
                    selectedCategoryFilter === cat
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => cognitiveEngine.clearAllMemories()}
              className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Todo</span>
            </button>
          </div>

          {/* Memory List */}
          <div className="space-y-2">
            {filteredMemories.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No hay recuerdos en esta categoría.</p>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-slate-950/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-3 flex items-start justify-between gap-3 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {mem.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Importancia: {Math.round(mem.importance * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{mem.summary}</p>
                  </div>
                  <button
                    onClick={() => cognitiveEngine.removeMemory(mem.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                    title="Eliminar memoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Dynamic Personality Sliders */}
      {activeTab === 'personality' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Estos parámetros adaptan en tiempo real la iniciativa del bot, la calidez de sus frases, el nivel de humor y la persistencia de preguntas autónomas.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'curiosity', label: '🧠 Curiosidad & Preguntas Proactivas', desc: 'Frecuencia de preguntas para profundizar en intereses.' },
              { key: 'initiative', label: '🚀 Iniciativa de Interacción', desc: 'Capacidad de iniciar nuevos temas en silencios.' },
              { key: 'warmth', label: '❤️ Calidez & Empatía', desc: 'Nivel de suavidad emocional y soporte verbal.' },
              { key: 'humor', label: '😄 Humor & Espontaneidad', desc: 'Comentarios desenfadados y bromas oportunas.' },
              { key: 'formality', label: '🏛️ Formalidad & Rigor Técnico', desc: 'Nivel de lenguaje técnico estructurado.' },
              { key: 'persistence', label: '🎯 Persistencia en Objetivos', desc: 'Seguimiento constante de proyectos del usuario.' },
            ].map(({ key, label, desc }) => {
              const val = state.personality[key as keyof typeof state.personality];
              return (
                <div key={key} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{Math.round(val * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={val}
                    onChange={(e) => handlePersonalityChange(key as keyof typeof state.personality, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Goal Planner */}
      {activeTab === 'goals' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Registrar Objetivo de Usuario
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Título del objetivo (ej. 'Aprender visión por computadora')"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="sm:col-span-5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Descripción o hito clave..."
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                className="sm:col-span-5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs py-1.5 transition-all shadow"
              >
                Agregar
              </button>
            </div>
          </form>

          {/* Goal List */}
          <div className="space-y-2.5">
            {state.goals.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No hay objetivos activos.</p>
            ) : (
              state.goals.map((g) => (
                <div key={g.id} className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{g.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {g.progressPercentage}%
                      </span>
                      <button
                        onClick={() => cognitiveEngine.removeGoal(g.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{g.description}</p>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${g.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => cognitiveEngine.updateGoalProgress(g.id, Math.min(100, g.progressPercentage + 15))}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700"
                    >
                      +15% Avanzar
                    </button>
                    <button
                      onClick={() => cognitiveEngine.updateGoalProgress(g.id, 100, 'completed')}
                      className="text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 px-2 py-1 rounded border border-emerald-800"
                    >
                      ✓ Marcar Completado
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Event Stream Logs */}
      {activeTab === 'events' && (
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
          {state.eventLogs.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No hay registros de eventos aún.</p>
          ) : (
            state.eventLogs.map((ev) => (
              <div key={ev.id} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-indigo-400">{ev.type}</span>
                  <span>{ev.timestamp}</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">{ev.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: HECTRON FastAPI & Backend Blueprint */}
      {activeTab === 'hectron' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 space-y-3">
          <div className="bg-slate-950/80 border border-cyan-500/30 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>HECTRON Backend Architecture: FastAPI + Postgres + pgvector</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">
                Fases 1, 2, 3 Sincronizadas
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta arquitectura desacopla el <strong>Agente Orquestador Cognitivo</strong>, el <strong>Motor de Curiosidad</strong>, y la <strong>Memoria Vectorial de Larga Duración</strong> utilizando FastAPI, SQLAlchemy 2.0 y pgvector para búsquedas por similitud de cosenos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. Postgres + pgvector</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tablas <code className="text-cyan-300">users</code>, <code className="text-cyan-300">conversations</code>, <code className="text-cyan-300">messages</code>, <code className="text-cyan-300">memories</code> (embedding Vector 1536) y <code className="text-cyan-300">user_profiles</code>.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Curiosity & Planner</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Determina si debe interrumpir con preguntas de seguimiento e infiere estilos de respuesta (neutral, direct, supportive).
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Agent Orchestrator</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recupera memorias con distancia coseno, genera respuesta con LLMProvider y guarda automáticamente episodios y preferencias.
              </p>
            </div>
          </div>

          {/* Code Spec & Requirements */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono">
                requirements.txt & docker-compose.yml
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`fastapi==0.115.6\nuvicorn[standard]==0.34.0\nSQLAlchemy==2.0.36\npsycopg[binary]==3.2.3\npydantic==2.10.4\npydantic-settings==2.7.0\npython-dotenv==1.0.1\nalembic==1.14.0\npgvector==0.3.6\nhttpx==0.28.1\norjson==3.10.12\ntenacity==9.0.0`);
                  setCopiedSnippet('req');
                  setTimeout(() => setCopiedSnippet(null), 3000);
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 rounded flex items-center gap-1"
              >
                {copiedSnippet === 'req' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'req' ? 'Copiado' : 'Copiar Requisitos'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto border border-slate-800">
{`fastapi==0.115.6
uvicorn[standard]==0.34.0
SQLAlchemy==2.0.36
psycopg[binary]==3.2.3
pydantic==2.10.4
pgvector==0.3.6
httpx==0.28.1`}
            </pre>
          </div>

          {/* Orchestrator Snippet */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono">
                app/services/agent/orchestrator.py
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`class AgentOrchestrator:\n    def __init__(self, db: Session):\n        self.db = db\n        self.embedding_provider = EmbeddingProvider()\n        self.memory_manager = MemoryManager(db, self.embedding_provider)\n        self.planner = Planner()\n        self.curiosity = CuriosityEngine()\n        self.llm = LLMProvider()\n        self.response_generator = ResponseGenerator(self.llm)`);
                  setCopiedSnippet('orch');
                  setTimeout(() => setCopiedSnippet(null), 3000);
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 rounded flex items-center gap-1"
              >
                {copiedSnippet === 'orch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet === 'orch' ? 'Copiado' : 'Copiar Orchestrator'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`class AgentOrchestrator:
    async def handle_message(self, user_id: UUID, text: str, conversation_id: UUID | None = None) -> ChatResponse:
        user = get_or_create_user(self.db, user_id=user_id)
        memories = await self.memory_manager.retrieve_relevant(user_id=user.id, query=text, limit=5)
        plan = self.planner.plan(user_text=text, memories=memories)
        
        reply = await self.response_generator.generate(system_prompt=system_prompt, user_prompt=user_prompt)
        await self.memory_manager.save_episode(user_id=user.id, text=text, importance=0.6)
        
        return ChatResponse(
            conversation_id=conv.id,
            reply=reply,
            should_ask_followup=bool(followup),
            followup_question=followup,
            memories_used=[...]
        )`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
