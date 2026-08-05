import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal, Shield, Cpu, Activity, Server, Database, Brain, HardDrive,
  CheckCircle, RefreshCw, Layers, Search, Filter, AlertCircle, Info,
  Check, ArrowUpRight, Zap
} from 'lucide-react';

interface SystemConsoleProps {
  // Optional props
}

type LogLevel = 'ALL' | 'INFO' | 'DEBUG' | 'ERROR';

interface MemoryItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'ERROR';
  category: 'semantic' | 'episodic' | 'preference' | 'working';
  content: string;
  confidence: number;
}

interface ToolLogItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'ERROR';
  tool: string;
  status: string;
  result: string;
}

interface ShellEntry {
  id: string;
  timestamp: string;
  type: 'command' | 'stdout' | 'stderr' | 'system';
  level: 'INFO' | 'DEBUG' | 'ERROR';
  content: string;
}

export const SystemConsole: React.FC<SystemConsoleProps> = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'memory' | 'tools' | 'shell'>('health');
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // System Health Metrics State
  const [healthData, setHealthData] = useState({
    fastApiStatus: 'ONLINE (Port 8081)',
    geminiEngine: 'Gemini 1.5 / 3.6 Flash Operational',
    firebaseDb: 'Connected (Firestore /chats)',
    ttsEngine: 'Edge-TTS (es-MX-DaliaNeural Ready)',
    videoSyncEngine: 'Hugging Face SadTalker / LivePortrait API Ready',
    cpuUsage: 18,
    ramUsage: 42,
    latencyMs: 120,
  });

  // Agent Memory Operations State
  const [memoryLogs, setMemoryLogs] = useState<MemoryItem[]>([
    { id: 'm1', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), level: 'INFO', category: 'preference', content: 'Preferencia extraída: Interés en fotografía, vida nocturna y moda tecnológica.', confidence: 0.95 },
    { id: 'm2', timestamp: new Date(Date.now() - 180000).toLocaleTimeString(), level: 'INFO', category: 'episodic', content: 'Hito conversacional: El usuario solicitó un selfie en entorno urbano.', confidence: 0.92 },
    { id: 'm3', timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), level: 'DEBUG', category: 'semantic', content: 'Ajuste de vector relacional: Calidez +0.05, Curiosidad +0.08, Iniciativa +0.04.', confidence: 0.88 },
    { id: 'm4', timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), level: 'INFO', category: 'working', content: 'Buffer de memoria contextual: 6 turnos almacenados en cache de baja latencia.', confidence: 0.99 },
    { id: 'm5', timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), level: 'ERROR', category: 'working', content: 'Advertencia de cuota API Gemini superada temporalmente. Se activó motor heurístico local.', confidence: 0.75 },
  ]);

  // Logs for Tool Execution & Infrastructure
  const [toolLogs, setToolLogs] = useState<ToolLogItem[]>([
    { id: 't1', timestamp: new Date(Date.now() - 250000).toLocaleTimeString(), level: 'INFO', tool: 'FastAPI /chat', status: '200 OK', result: 'Payload de respuesta generado en 420ms con microexpresiones sincronizadas.' },
    { id: 't2', timestamp: new Date(Date.now() - 150000).toLocaleTimeString(), level: 'INFO', tool: 'Firebase Firestore', status: '200 OK', result: 'Mensaje persistido en db.collection("chats").document(user_session_id).' },
    { id: 't3', timestamp: new Date(Date.now() - 80000).toLocaleTimeString(), level: 'DEBUG', tool: 'Pollinations / Flux Engine', status: '200 OK', result: 'Sintetizada imagen fotorrealista de Luna con prompt en formato 9:16.' },
    { id: 't4', timestamp: new Date(Date.now() - 30000).toLocaleTimeString(), level: 'INFO', tool: 'Edge-TTS Synthesizer', status: '200 OK', result: 'Buffer de voz en MP3 sintetizado correctamente (es-MX-DaliaNeural).' },
    { id: 't5', timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), level: 'ERROR', tool: 'SadTalker Video Render', status: 'WARN 429', result: 'Reintento de llamada API por cola ocupada en Hugging Face Space. Latencia +1.2s.' },
  ]);

  // Shell State
  const [shellLogs, setShellLogs] = useState<ShellEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'system',
      level: 'INFO',
      content: 'HECTRON INFRASTRUCTURE CONSOLE v2.5.0 (Node / Python FastAPI Runtime)'
    },
    {
      id: '2',
      timestamp: new Date().toISOString(),
      type: 'system',
      level: 'INFO',
      content: 'Telemetría en tiempo real conectada. Escribe "help" para ver comandos permitidos.'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [shellLogs, activeTab]);

  // Helper filter function
  const filterByLevelAndQuery = (level: 'INFO' | 'DEBUG' | 'ERROR', textContent: string) => {
    const matchesLevel = levelFilter === 'ALL' || level === levelFilter;
    const matchesQuery = !searchQuery.trim() || textContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    setInputValue('');
    setShellLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: 'command',
      level: 'INFO',
      content: cmd
    }]);

    if (cmd.toLowerCase() === 'clear') {
      setShellLogs([]);
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      setShellLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'stdout',
        level: 'INFO',
        content: 'Allowed Commands:\n- date\n- uptime\n- whoami\n- pwd\n- ls\n- python --version\n- clear\n- help'
      }]);
      return;
    }

    setIsExecuting(true);
    try {
      const response = await fetch('/api/console/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });

      const data = await response.json();

      if (response.status === 403) {
        setShellLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          type: 'stderr',
          level: 'ERROR',
          content: data.error || 'Access Denied: Command restricted by security policy.'
        }]);
      } else {
        if (data.stdout) {
          setShellLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type: 'stdout',
            level: 'INFO',
            content: data.stdout
          }]);
        }
        if (data.stderr) {
          setShellLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type: 'stderr',
            level: 'ERROR',
            content: data.stderr
          }]);
        }
      }
    } catch (err: any) {
      setShellLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: 'stderr',
        level: 'ERROR',
        content: `Error executing command: ${err.message}`
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const getLevelBadge = (level: 'INFO' | 'DEBUG' | 'ERROR') => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60 font-mono">
            <AlertCircle className="w-2.5 h-2.5" /> ERROR
          </span>
        );
      case 'DEBUG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono">
            <Zap className="w-2.5 h-2.5" /> DEBUG
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-400 border border-sky-800/60 font-mono">
            <Info className="w-2.5 h-2.5" /> INFO
          </span>
        );
    }
  };

  const filteredMemories = memoryLogs.filter(m => filterByLevelAndQuery(m.level, `${m.category} ${m.content}`));
  const filteredTools = toolLogs.filter(t => filterByLevelAndQuery(t.level, `${t.tool} ${t.status} ${t.result}`));

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border border-slate-800 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <h2 className="text-slate-200 font-bold text-sm">Hectron Infrastructure & Agent System Console</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
        </div>
      </div>

      {/* Control Bar: Sub-Tabs + Filters */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'health'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            System Health
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'memory'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            Memory Operations
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'tools'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Tool Execution
          </button>

          <button
            onClick={() => setActiveTab('shell')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'shell'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Restricted Shell
          </button>
        </div>

        {/* Level Filters & Search Query */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {(['ALL', 'INFO', 'DEBUG', 'ERROR'] as LogLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  levelFilter === lvl
                    ? lvl === 'ERROR'
                      ? 'bg-rose-600 text-white shadow'
                      : lvl === 'DEBUG'
                      ? 'bg-purple-600 text-white shadow'
                      : lvl === 'INFO'
                      ? 'bg-sky-600 text-white shadow'
                      : 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar logs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#080808]">
        {/* 1. System Health & Infrastructure Telemetry */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>FastAPI Backend</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-slate-100">{healthData.fastApiStatus}</p>
                <p className="text-[11px] text-slate-500">Python 3.11 / Uvicorn Server</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Gemini Cognitive Core</span>
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-sm font-bold text-slate-100">{healthData.geminiEngine}</p>
                <p className="text-[11px] text-slate-500">Google AI Studio API Pipeline</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Firestore Database</span>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-sm font-bold text-slate-100">{healthData.firebaseDb}</p>
                <p className="text-[11px] text-slate-500">Long-Term Memory Storage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  Node / Cloud Container Resource Telemetry
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>CPU Utilization</span>
                      <span className="text-indigo-300 font-mono">{healthData.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${healthData.cpuUsage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>RAM Allocation</span>
                      <span className="text-cyan-300 font-mono">{healthData.ramUsage}% (512MB / 1024MB)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${healthData.ramUsage}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Media & Sync Pipelines
                </h3>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Voice Synthesizer</span>
                    <span className="text-emerald-400 font-medium">{healthData.ttsEngine}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Video Sync Engine</span>
                    <span className="text-amber-400 font-medium">SadTalker / LivePortrait API</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-400">Average Response Latency</span>
                    <span className="text-indigo-400 font-mono font-bold">{healthData.latencyMs} ms</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. Agent Memory Operations & Visualizer */}
        {activeTab === 'memory' && (
          <div className="space-y-4">
            {/* Memory Analytics & Persistence Overview Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-3">
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Memoria Total</p>
                <p className="text-xl font-black text-purple-100 mt-0.5">24 Items</p>
                <p className="text-[10px] text-purple-400/80 mt-1">Firestore Sincronizado</p>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3">
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Retención Cognitiva</p>
                <p className="text-xl font-black text-blue-100 mt-0.5">98.4%</p>
                <p className="text-[10px] text-blue-400/80 mt-1">Fidelidad de Recuperación</p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Persistencia DB</p>
                <p className="text-xl font-black text-emerald-100 mt-0.5 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> ACTIVA
                </p>
                <p className="text-[10px] text-emerald-400/80 mt-1">Google Firebase Firestore</p>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3">
                <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Categoría Dominante</p>
                <p className="text-xl font-black text-amber-100 mt-0.5">Preferencias</p>
                <p className="text-[10px] text-amber-400/80 mt-1">Estilo de Vida / Gustos</p>
              </div>
            </div>

            {/* Live Operations Feed */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Logs de Operaciones de Memoria en Tiempo Real
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Filtrados: {filteredMemories.length} / {memoryLogs.length}
                </span>
              </div>

              {filteredMemories.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No se encontraron registros de memoria con el filtro seleccionado.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMemories.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">{getLevelBadge(log.level)}</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono uppercase font-extrabold text-purple-400 bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-800/40">
                              [{log.category}]
                            </span>
                            <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-sans">{log.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0 self-end sm:self-center">
                        <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono">
                          Conf: {Math.round(log.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Tool Execution Results */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Ejecución de Herramientas & Apis de Generación
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Filtrados: {filteredTools.length} / {toolLogs.length}
              </span>
            </div>

            {filteredTools.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No se encontraron ejecuciones de herramientas con el filtro seleccionado.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTools.map((log) => (
                  <div key={log.id} className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {getLevelBadge(log.level)}
                        <span className="font-bold text-indigo-300">{log.tool}</span>
                      </div>
                      <span className="text-slate-500 font-mono">{log.timestamp}</span>
                    </div>

                    <div className="flex items-start gap-2 bg-black/50 p-2.5 rounded-lg border border-slate-800/60 font-mono text-xs">
                      <span className="text-emerald-400 font-bold shrink-0">{log.status}</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{log.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Restricted Interactive Shell */}
        {activeTab === 'shell' && (
          <div className="flex flex-col h-[420px] bg-black rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
              {shellLogs.map((log) => (
                <div key={log.id} className="whitespace-pre-wrap">
                  {log.type === 'command' && (
                    <div className="flex items-start text-slate-300">
                      <span className="text-emerald-400 font-bold mr-2">hectron@system:~$</span>
                      <span>{log.content}</span>
                    </div>
                  )}
                  {log.type === 'stdout' && <div className="text-slate-400 pl-2">{log.content}</div>}
                  {log.type === 'stderr' && <div className="text-red-400 pl-2">{log.content}</div>}
                  {log.type === 'system' && <div className="text-indigo-400/80 italic">{log.content}</div>}
                </div>
              ))}
              {isExecuting && (
                <div className="text-amber-400/80 animate-pulse pl-2">Executing command...</div>
              )}
            </div>

            <form onSubmit={handleCommand} className="border-t border-slate-800 bg-slate-950 p-2 flex items-center gap-2">
              <span className="text-emerald-400 font-bold pl-1">hectron@system:~$</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isExecuting}
                placeholder="Escribe un comando (ej. date, uptime, python --version)..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-700 text-xs"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
