import React, { useState } from 'react';
import { Presentation, Video, Plus, ExternalLink, Sparkles, Check, Copy, Calendar, Shield, Users, Layers, Play, RefreshCw, Sliders } from 'lucide-react';

interface Slide {
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

interface MeetingSpace {
  id: string;
  name: string;
  meetingUri: string;
  meetingCode: string;
  createdAt: string;
  accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  hasAvatarHost: boolean;
}

export const WorkspaceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slides' | 'meet'>('slides');

  // Slides State
  const [presentationTopic, setPresentationTopic] = useState('Inteligencia Artificial Cognitiva & Avatares con Microexpresiones');
  const [slideCount, setSlideCount] = useState<number>(4);
  const [themeStyle, setThemeStyle] = useState<'cyberpunk' | 'corporate' | 'modern' | 'minimal'>('cyberpunk');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [createdPresentation, setCreatedPresentation] = useState<{
    title: string;
    presentationId: string;
    embedUrl: string;
    slides: Slide[];
  } | null>({
    title: 'Inteligencia Artificial Cognitiva & Avatares con Microexpresiones',
    presentationId: 'presentation-demo-12345',
    embedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vQdemo/embed',
    slides: [
      {
        title: 'Arquitectura Cognitiva de Hectron',
        subtitle: 'Integración de FastAPI, LiveKit y Gemini 3.6',
        bullets: [
          'Procesamiento neuronal con 48 morfogramas facials en tiempo real',
          'Sincronización labial de baja latencia con Edge-TTS (es-MX)',
          'Memoria vectorial en tiempo real persistida en Firestore'
        ],
        notes: 'Enfatizar la latencia menor a 120ms para interacciones fluídas.'
      },
      {
        title: 'Gaze Tracking & Microexpresiones',
        subtitle: 'Reconocimiento Emocional Continuo',
        bullets: [
          'MediaPipe FaceMesh detecta 468 puntos faciales a 60 FPS',
          'Matriz de afinidad: Calidez, Curiosidad, Empatía y Concentración',
          'Mapeo dinámico a Blender / Three.js Morph Targets'
        ]
      },
      {
        title: 'Integración Google Workspace & Cloud Services',
        subtitle: 'Automatización con Google Slides & Google Meet API',
        bullets: [
          'Generación directa de presentaciones con formato profesional',
          'Creación instantánea de salas Google Meet con co-anfitrión IA',
          'Almacenamiento seguro en Google Cloud Container Environment'
        ]
      },
      {
        title: 'Conclusiones & Escalabilidad',
        subtitle: 'Próximos Pasos en el Despliegue',
        bullets: [
          'Despliegue horizontal en Cloud Run con balanceo de carga',
          'Soporte multi-idioma nativo para avatares sintéticos'
        ]
      }
    ]
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Meet State
  const [meetingTopic, setMeetingTopic] = useState('Sesión de Trabajo Hectron AI & Sync Meeting');
  const [accessType, setAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('TRUSTED');
  const [enableAvatarHost, setEnableAvatarHost] = useState(true);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetingsList, setMeetingsList] = useState<MeetingSpace[]>([
    {
      id: 'space-1',
      name: 'Reunión de Revisión de Avatares & Microexpresiones',
      meetingUri: 'https://meet.google.com/abc-defg-hij',
      meetingCode: 'abc-defg-hij',
      createdAt: new Date(Date.now() - 3600000).toLocaleTimeString(),
      accessType: 'TRUSTED',
      hasAvatarHost: true
    }
  ]);

  // Handle Google Slides Generation
  const handleGenerateSlides = async () => {
    if (!presentationTopic.trim()) return;
    setIsGeneratingSlides(true);
    try {
      const res = await fetch('/api/workspace/slides/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: presentationTopic,
          slideCount,
          theme: themeStyle
        })
      });
      const data = await res.json();
      if (data.presentation) {
        setCreatedPresentation(data.presentation);
        setActiveSlideIndex(0);
      }
    } catch (err) {
      console.error("Error creating slides:", err);
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // Handle Google Meet Space Creation
  const handleCreateMeet = async () => {
    if (!meetingTopic.trim()) return;
    setIsCreatingMeet(true);
    try {
      const res = await fetch('/api/workspace/meet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: meetingTopic,
          accessType,
          hasAvatarHost: enableAvatarHost
        })
      });
      const data = await res.json();
      if (data.meeting) {
        setMeetingsList(prev => [data.meeting, ...prev]);
      }
    } catch (err) {
      console.error("Error creating meet:", err);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border border-slate-800 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="text-slate-200 font-bold text-sm">Google Workspace Integration Hub (Slides & Meet)</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-mono">
          <Check className="w-3 h-3 text-amber-400" /> OAuth Scopes Active
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'slides'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Presentation className="w-4 h-4 text-amber-400" />
          Google Slides Generator
        </button>

        <button
          onClick={() => setActiveTab('meet')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'meet'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-400" />
          Google Meet Spaces
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#080808]">
        {/* TAB 1: GOOGLE SLIDES */}
        {activeTab === 'slides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* Left Controls Column */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Presentation className="w-4 h-4" /> Generar Presentación de Google Slides
                </h3>
                <p className="text-[11px] text-slate-400">
                  Crea diapositivas estructuradas mediante Gemini y exporta directamente a Google Slides API.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tema / Tema de la Presentación</label>
                  <textarea
                    value={presentationTopic}
                    onChange={(e) => setPresentationTopic(e.target.value)}
                    rows={3}
                    placeholder="Escribe el tema de las diapositivas..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nº de Diapositivas</label>
                    <select
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                    >
                      <option value={3}>3 Diapositivas</option>
                      <option value={4}>4 Diapositivas</option>
                      <option value={5}>5 Diapositivas</option>
                      <option value={7}>7 Diapositivas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Estilo Visual</label>
                    <select
                      value={themeStyle}
                      onChange={(e) => setThemeStyle(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                    >
                      <option value="cyberpunk">Cyberpunk Neon</option>
                      <option value="corporate">Corporate Clean</option>
                      <option value="modern">Modern Tech Dark</option>
                      <option value="minimal">Minimal White</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSlides}
                  disabled={isGeneratingSlides}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/50 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingSlides ? 'Generando en Google Slides...' : 'Crear Google Slides Presentation'}
                </button>
              </div>

              {/* Created Deck Info */}
              {createdPresentation && (
                <div className="mt-auto pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Estado API Google:</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Diapositivas Listas
                    </span>
                  </div>

                  <a
                    href={`https://docs.google.com/presentation/create`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700 font-semibold text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    Abrir en Google Slides App
                  </a>
                </div>
              )}
            </div>

            {/* Right Interactive Slide Viewer */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {createdPresentation ? (
                <>
                  {/* Current Active Slide Card Display */}
                  <div className="relative aspect-[16/9] bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden group">
                    {/* Background Subtle Gradient depending on theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-indigo-950/20 pointer-events-none" />

                    {/* Slide Top Metadata */}
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 z-10 border-b border-slate-800/60 pb-3">
                      <span className="text-amber-400 font-bold uppercase tracking-wider">
                        {createdPresentation.title}
                      </span>
                      <span>
                        Diapositiva {activeSlideIndex + 1} de {createdPresentation.slides.length}
                      </span>
                    </div>

                    {/* Main Slide Contents */}
                    <div className="my-auto space-y-4 z-10">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                          {createdPresentation.slides[activeSlideIndex]?.title}
                        </h2>
                        {createdPresentation.slides[activeSlideIndex]?.subtitle && (
                          <p className="text-xs sm:text-sm text-amber-300/80 font-medium mt-1">
                            {createdPresentation.slides[activeSlideIndex]?.subtitle}
                          </p>
                        )}
                      </div>

                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                        {createdPresentation.slides[activeSlideIndex]?.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Speaker Notes */}
                    {createdPresentation.slides[activeSlideIndex]?.notes && (
                      <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg text-[11px] text-slate-400 font-mono z-10">
                        <span className="text-amber-400 font-bold mr-1">Speaker Notes:</span>
                        {createdPresentation.slides[activeSlideIndex]?.notes}
                      </div>
                    )}
                  </div>

                  {/* Slide Selector Thumbnails Carousel */}
                  <div className="grid grid-cols-4 gap-2">
                    {createdPresentation.slides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          activeSlideIndex === idx
                            ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-md scale-[1.02]'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="font-mono text-[10px] text-slate-500 mb-0.5">#{idx + 1}</p>
                        <p className="font-bold truncate text-[11px]">{slide.title}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                  <Presentation className="w-10 h-10 text-slate-700 mb-2" />
                  <p>Completa el formulario a la izquierda para generar tu presentación con Google Slides API.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE MEET */}
        {activeTab === 'meet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* Left Controls */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Video className="w-4 h-4" /> Crear Sala Google Meet (Google Meet API)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Genera espacios de reunión instantáneos con scopes de Google Workspace y co-anfitrión avatar.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre / Tema de la Sala</label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    placeholder="Ej. Sesión de Trabajo Hectron AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel de Acceso (Meeting Settings)</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="TRUSTED">TRUSTED (Organización o con invitación)</option>
                    <option value="OPEN">OPEN (Cualquier usuario con el enlace)</option>
                    <option value="RESTRICTED">RESTRICTED (Solo admitidos manualmente)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="avatarHost"
                    checked={enableAvatarHost}
                    onChange={(e) => setEnableAvatarHost(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <label htmlFor="avatarHost" className="text-slate-300 text-xs font-medium cursor-pointer">
                    Habilitar Hectron Avatar como Co-Host
                  </label>
                </div>

                <button
                  onClick={handleCreateMeet}
                  disabled={isCreatingMeet}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 mt-2"
                >
                  <Video className="w-4 h-4" />
                  {isCreatingMeet ? 'Creando Espacio en Google Meet...' : 'Crear Espacio Google Meet'}
                </button>
              </div>
            </div>

            {/* Right Active Meetings List */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-400" />
                  Salas de Google Meet Creadas ({meetingsList.length})
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Google Meet API v1
                </span>
              </div>

              <div className="space-y-3">
                {meetingsList.map((m) => (
                  <div key={m.id} className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <h4 className="font-bold text-sm text-slate-100">{m.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          Code: {m.meetingCode}
                        </span>
                        <span className="bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60">
                          Acceso: {m.accessType}
                        </span>
                        {m.hasAvatarHost && (
                          <span className="bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/60">
                            Avatar Host Ready
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(m.meetingUri)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-xs flex items-center gap-1 font-semibold"
                        title="Copiar Enlace"
                      >
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        {copiedLink ? 'Copiado!' : 'Copiar'}
                      </button>

                      <a
                        href={m.meetingUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Unirse a Google Meet
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
