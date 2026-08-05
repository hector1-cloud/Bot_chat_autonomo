import React, { useState } from 'react';
import { Briefcase, Camera, BookOpen, ChevronRight, Send, MapPin, History, Backpack, Map, Crosshair, Target, Cpu } from 'lucide-react';

export const SandboxesHub: React.FC = () => {
  const [activeSandbox, setActiveSandbox] = useState<'recruitment' | 'tourism' | 'cyoa' | 'spatial'>('spatial');

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border border-slate-800 rounded-xl overflow-hidden font-sans shadow-2xl">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <h2 className="text-slate-200 font-bold text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Quantum Sandboxes & AI Vision Grounding
        </h2>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-52 border-r border-slate-800 bg-slate-950 p-2 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <button
            onClick={() => setActiveSandbox('spatial')}
            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
              activeSandbox === 'spatial' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Crosshair className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Spatial Grounding & ER</span>
          </button>
          <button
            onClick={() => setActiveSandbox('recruitment')}
            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
              activeSandbox === 'recruitment' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Recruitment Sandbox</span>
          </button>
          <button
            onClick={() => setActiveSandbox('tourism')}
            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
              activeSandbox === 'tourism' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Photo Tourism AR</span>
          </button>
          <button
            onClick={() => setActiveSandbox('cyoa')}
            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
              activeSandbox === 'cyoa' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Infinite CYOA Engine</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
          {activeSandbox === 'spatial' && <SpatialSandbox />}
          {activeSandbox === 'recruitment' && <RecruitmentSandbox />}
          {activeSandbox === 'tourism' && <TourismSandbox />}
          {activeSandbox === 'cyoa' && <CyoaSandbox />}
        </div>
      </div>
    </div>
  );
};

const SpatialSandbox = () => {
  const [prompt, setPrompt] = useState("Point to no more than 10 items in the image. Return normalized coordinates [y, x] from 0-1000.");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    model: string;
    items: Array<{ point: [number, number]; label: string }>;
    rawOutput: string;
  }>({
    model: 'gemini-robotics-er-2-preview',
    items: [
      { point: [320, 250], label: "Scone / Bakery Item" },
      { point: [450, 680], label: "Coffee Cup" },
      { point: [210, 480], label: "Ceramic Plate" },
      { point: [610, 310], label: "Napkin" },
      { point: [150, 780], label: "Teapot" },
      { point: [550, 180], label: "Fork / Cutlery" },
    ],
    rawOutput: '[\n  { "point": [320, 250], "label": "Scone / Bakery Item" },\n  { "point": [450, 680], "label": "Coffee Cup" },\n  { "point": [210, 480], "label": "Ceramic Plate" },\n  { "point": [610, 310], "label": "Napkin" },\n  { "point": [150, 780], "label": "Teapot" },\n  { "point": [550, 180], "label": "Fork / Cutlery" }\n]'
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sandbox/spatial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="space-y-1">
        <h3 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          Gemini Spatial Vision & Robotics Point Grounding (gemini-robotics-er-2-preview)
        </h3>
        <p className="text-xs text-slate-400">
          Analiza imágenes e identifica elementos con coordenadas espacialmente normalizadas [y, x] de 0 a 1000 para navegación autónoma y manipulación robótica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Interactive Image Target Stage */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/3] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group shadow-lg">
            {/* Background Image / Canvas */}
            <img 
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80" 
              alt="Bakery Scene" 
              className="w-full h-full object-cover brightness-90"
              referrerPolicy="no-referrer"
            />

            {/* Render Point Overlays */}
            {result.items.map((item, idx) => {
              const yPct = (item.point[0] / 1000) * 100;
              const xPct = (item.point[1] / 1000) * 100;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ top: `${yPct}%`, left: `${xPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform hover:scale-125"
                >
                  <div className={`relative flex items-center justify-center ${isHovered ? 'scale-125' : ''}`}>
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 bg-cyan-500/30 animate-ping absolute" />
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-300 bg-cyan-950/80 flex items-center justify-center shadow-lg">
                      <Target className="w-3 h-3 text-cyan-400" />
                    </div>

                    {/* Tooltip Badge */}
                    <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-cyan-200 border border-cyan-500/40 text-[10px] px-2 py-0.5 rounded shadow-xl font-mono font-bold transition-opacity ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
                      #{idx + 1} {item.label} [{item.point.join(', ')}]
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-700 text-[10px] text-slate-300 font-mono">
              Grid: 1000x1000 Normalized
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5" />
              {isLoading ? 'Analizando...' : 'Detectar'}
            </button>
          </div>
        </div>

        {/* Output & Detected Targets List */}
        <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Puntos de Interés Detectados ({result.items.length})
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {result.model}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {result.items.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  hoveredIndex === idx
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-[10px] text-cyan-400 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                  y: {item.point[0]}, x: {item.point[1]}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-black/60 p-2 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-28">
            <p className="text-[9px] text-slate-500 mb-1 font-bold">Respuesta JSON Estructurada:</p>
            <pre className="whitespace-pre-wrap">{result.rawOutput}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecruitmentSandbox = () => {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<{ jd: string; questions: string[] } | null>(null);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/sandbox/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      setOutput(data);
    } catch (err) {
      console.error(err);
      alert('Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="space-y-1">
        <h3 className="text-indigo-400 font-bold text-sm">Recruitment Sandbox</h3>
        <p className="text-xs text-slate-400">Generate a LinkedIn JD and 10 behavioral interview questions from raw notes using Gemini 3.1 Pro.</p>
      </div>
      <div className="flex flex-col gap-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g. Need a senior dev who knows React, Node, AI... Must be good at communication and solving complex bugs..."
          className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 h-24 resize-none outline-none focus:border-indigo-500"
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !notes.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-lg self-end flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Assets'} <Send className="w-3 h-3" />
        </button>
      </div>

      {output && (
        <div className="flex-1 grid grid-cols-2 gap-4 mt-2 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1">LinkedIn Job Description</h4>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">{output.jd}</pre>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1">Interview Guide</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-decimal pl-4">
              {output.questions && output.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const TourismSandbox = () => {
  return (
    <div className="flex flex-col h-full gap-4 items-center justify-center text-center">
      <Camera className="w-16 h-16 text-amber-500/50 mb-2" />
      <h3 className="text-amber-400 font-bold text-lg">Photo Tourism AR</h3>
      <p className="text-sm text-slate-400 max-w-md">
        Take a photo in the city, AI recognizes the landmark, fetches its history via search, and shows an AR-style narrated clip.
      </p>
      <div className="mt-4 p-4 border border-dashed border-amber-500/30 rounded-xl bg-amber-500/5 max-w-sm w-full">
         <p className="text-xs text-amber-300/70 mb-4">Simulated AR ViewFinder</p>
         <div className="aspect-[3/4] bg-slate-900 rounded-lg relative overflow-hidden border border-slate-800 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-slate-600 animate-bounce" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
              <h4 className="text-sm font-bold text-white">Eiffel Tower</h4>
              <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">Built in 1889 for the World's Fair. It was initially criticized by some of France's leading artists and intellectuals...</p>
            </div>
         </div>
         <button className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg">
           Simulate Snap
         </button>
      </div>
    </div>
  );
};

const CyoaSandbox = () => {
  const [messages, setMessages] = useState<{role: 'user'|'system', text: string}[]>([
    { role: 'system', text: 'You awaken in a dense, luminescent forest. The trees hum with quantum energy. To your left, a glowing path. To your right, a dark cave.' }
  ]);
  const [input, setInput] = useState('');
  const [inventory, setInventory] = useState<string[]>(['Quantum Compass']);
  const [quest, setQuest] = useState('Discover the source of the anomaly in the luminescent forest.');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const choice = input;
    setMessages(prev => [...prev, { role: 'user', text: choice }]);
    setInput('');
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/sandbox/cyoa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          choice,
          inventory,
          quest
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'system', text: data.story }]);
      if (data.inventory) setInventory(data.inventory);
      if (data.quest) setQuest(data.quest);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-950 p-2 border-b border-slate-800 text-xs font-bold text-purple-400 flex items-center gap-2">
          <History className="w-4 h-4" /> Adventure Stream
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm p-3 rounded-lg ${m.role === 'system' ? 'bg-purple-900/20 text-purple-200 border border-purple-500/20' : 'bg-slate-800 text-slate-300 self-end ml-12'}`}>
              {m.text}
            </div>
          ))}
          {isProcessing && <div className="text-sm p-3 rounded-lg bg-purple-900/20 text-purple-200 border border-purple-500/20 opacity-50 animate-pulse">The engine is generating the next path...</div>}
        </div>
        <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-950">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder="What do you do next?" 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500 disabled:opacity-50"
          />
        </form>
      </div>

      <div className="w-48 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2 border-b border-slate-800 pb-1">
            <Backpack className="w-3 h-3" /> Inventory
          </h4>
          <ul className="text-xs text-slate-300 space-y-1">
            {inventory.map((item, i) => <li key={i}>- {item}</li>)}
          </ul>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-1">
          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2 border-b border-slate-800 pb-1">
            <Map className="w-3 h-3" /> Current Quest
          </h4>
          <p className="text-xs text-purple-300">{quest}</p>
        </div>
      </div>
    </div>
  );
};
