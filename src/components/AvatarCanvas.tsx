import React, { useEffect, useRef, useState } from 'react';
import { ExpressionArchetype, FacialMorphTargets } from '../types/microexpressions';
import { DEFAULT_MORPH_TARGETS, lerpMorphs } from '../utils/microexpressionsEngine';
import { Eye, Sparkles, Activity, Layers, Volume2, Zap, Heart, Settings, Palette, Flame } from 'lucide-react';

interface AvatarCanvasProps {
  targetMorphs: FacialMorphTargets;
  currentArchetype: ExpressionArchetype;
  explanation?: string;
  isThinking?: boolean;
  isSpeaking?: boolean;
  activeViseme?: number; // 0 to 1 open amount
  showMeshOverlay: boolean;
  setShowMeshOverlay: (show: boolean) => void;
  showMuscleHeatmap: boolean;
  setShowMuscleHeatmap: (show: boolean) => void;
  avatarStyle: 'modern' | 'cyberpunk' | 'anime' | 'humanoid';
  setAvatarStyle: (style: 'modern' | 'cyberpunk' | 'anime' | 'humanoid') => void;
  webcamGaze?: { x: number; y: number };
  activeStudioView?: 'chat' | 'apis' | 'inspector' | 'cognitive';
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  targetMorphs,
  currentArchetype,
  explanation,
  isThinking = false,
  isSpeaking = false,
  activeViseme = 0,
  showMeshOverlay,
  setShowMeshOverlay,
  showMuscleHeatmap,
  setShowMuscleHeatmap,
  avatarStyle,
  setAvatarStyle,
  webcamGaze,
  activeStudioView = 'chat',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentMorphs, setCurrentMorphs] = useState<FacialMorphTargets>(targetMorphs);

  // Cute 3D & Astronaut Flame transformation parameters
  const [hairColor, setHairColor] = useState<'pink' | 'violet' | 'gold' | 'cyan'>('pink');
  const [eyeColorOption, setEyeColorOption] = useState<'violet' | 'sapphire' | 'emerald' | 'ruby'>('violet');
  const [accessory, setAccessory] = useState<'ribbon' | 'catears' | 'headphones' | 'flower'>('ribbon');
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  // Gaze Tracking state: 'cursor' | 'webcam' | 'attention' | 'auto'
  const [gazeMode, setGazeMode] = useState<'cursor' | 'webcam' | 'attention' | 'auto'>('cursor');
  const [gazeDisplayCoords, setGazeDisplayCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Astronaut & Flaming Skeleton Transformation state
  const [transformationMode, setTransformationMode] = useState<'normal' | 'astronaut_flora' | 'flaming_skeleton'>('normal');
  const [cameraZoom, setCameraZoom] = useState<number>(1.0); // 1.0 (Close) to 0.65 (Drifting distance)
  const [ignitionProgress, setIgnitionProgress] = useState<number>(0); // 0 (skin intact) to 1.0 (flaming skeleton)
  const [showCinematicRender, setShowCinematicRender] = useState<boolean>(false);

  // References for continuous animation loop
  const currentMorphsRef = useRef<FacialMorphTargets>(targetMorphs);
  const targetMorphsRef = useRef<FacialMorphTargets>(targetMorphs);
  const blinkRef = useRef<number>(0);
  const blinkTimerRef = useRef<number>(0);
  const gazeDriftRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const gazeTimerRef = useRef<number>(0);
  const breatheRef = useRef<number>(0);
  const hairPhysicsRef = useRef<number>(0);
  const flameTimeRef = useRef<number>(0);

  // Mouse Move Listener for Real-Time Cursor Gaze Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gazeMode !== 'cursor') return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Compute normalized gaze offset relative to viewport (-1.0 to 1.0)
      const relX = Math.min(1.0, Math.max(-1.0, (e.clientX - centerX) / (window.innerWidth / 2)));
      const relY = Math.min(1.0, Math.max(-1.0, (e.clientY - centerY) / (window.innerHeight / 2)));

      cursorGazeRef.current = {
        x: relX * 0.75, // Scale to natural eye pupil range
        y: relY * 0.55,
      };

      setGazeDisplayCoords({
        x: Math.round(relX * 100) / 100,
        y: Math.round(relY * 100) / 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gazeMode]);

  // Keep target morphs ref updated
  useEffect(() => {
    targetMorphsRef.current = targetMorphs;
  }, [targetMorphs]);

  // Main rendering & physics loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Natural Blinking logic
      blinkTimerRef.current += dt;
      if (blinkTimerRef.current > 3.0) {
        blinkRef.current = Math.sin((blinkTimerRef.current - 3.0) * 18); // Natural soft blink
        if (blinkTimerRef.current > 3.35) {
          blinkTimerRef.current = Math.random() * -1.8;
          blinkRef.current = 0;
        }
      } else {
        blinkRef.current = 0;
      }

      // 2. Micro-saccadic eye drift (life-like gaze adjustments)
      gazeTimerRef.current += dt;
      if (gazeTimerRef.current > 1.6) {
        gazeDriftRef.current = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.07,
        };
        gazeTimerRef.current = 0;
      }

      // 3. Smooth Gaze Target Calculation
      let targetGazeX = gazeDriftRef.current.x;
      let targetGazeY = gazeDriftRef.current.y;

      if (gazeMode === 'cursor') {
        targetGazeX += cursorGazeRef.current.x;
        targetGazeY += cursorGazeRef.current.y;
      } else if (gazeMode === 'webcam' && webcamGaze) {
        targetGazeX += webcamGaze.x;
        targetGazeY += webcamGaze.y;
      } else if (gazeMode === 'attention') {
        // Fixate gaze on current active studio topic/panel
        if (activeStudioView === 'chat') {
          targetGazeX += -0.55;
          targetGazeY += 0.15;
        } else if (activeStudioView === 'cognitive') {
          targetGazeX += 0.60;
          targetGazeY += -0.18;
        } else if (activeStudioView === 'apis') {
          targetGazeX += 0.55;
          targetGazeY += 0.25;
        } else if (activeStudioView === 'inspector') {
          targetGazeX += 0.05;
          targetGazeY += 0.55;
        }
      }

      // Update display coords for HUD if in attention mode
      if (gazeMode === 'attention') {
        setGazeDisplayCoords({
          x: Math.round(targetGazeX * 100) / 100,
          y: Math.round(targetGazeY * 100) / 100,
        });
      }

      // Smooth lerp gaze offset towards target
      smoothGazeRef.current.x += (targetGazeX - smoothGazeRef.current.x) * 0.14;
      smoothGazeRef.current.y += (targetGazeY - smoothGazeRef.current.y) * 0.14;

      // 4. Breathing & Hair bounce physics
      breatheRef.current += dt * 1.6;
      flameTimeRef.current += dt;
      const breatheOffset = Math.sin(breatheRef.current) * 2.8;
      hairPhysicsRef.current = Math.sin(breatheRef.current * 1.8) * 3;

      // 5. Spring lerp morphs towards target
      const lerpSpeed = isThinking ? 0.12 : 0.085;
      const interpolated = lerpMorphs(currentMorphsRef.current, targetMorphsRef.current, lerpSpeed);
      currentMorphsRef.current = interpolated;
      setCurrentMorphs(interpolated);

      // Draw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          draw3DFemaleAvatar(
            ctx,
            canvas.width,
            canvas.height,
            interpolated,
            blinkRef.current,
            smoothGazeRef.current,
            breatheOffset,
            hairPhysicsRef.current,
            isThinking,
            isSpeaking,
            activeViseme,
            showMeshOverlay,
            showMuscleHeatmap,
            avatarStyle,
            hairColor,
            eyeColorOption,
            accessory,
            transformationMode,
            cameraZoom,
            ignitionProgress,
            flameTimeRef.current
          );
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isThinking,
    isSpeaking,
    activeViseme,
    showMeshOverlay,
    showMuscleHeatmap,
    avatarStyle,
    hairColor,
    eyeColorOption,
    accessory,
    transformationMode,
    cameraZoom,
    ignitionProgress,
    gazeMode,
    webcamGaze,
  ]);

  return (
    <div className="relative flex flex-col items-center w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
      {/* Top Bar: Expression Archetype Badge & Quick Controls */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isThinking ? 'bg-amber-400 opacity-75' : 'bg-pink-400 opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isThinking ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
            {isThinking ? 'Calculando Músculos...' : ARCHETYPE_LABELS[currentArchetype] || 'Neutro'}
          </span>
        </div>

        {/* Style & Customization Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              showCustomizer
                ? 'bg-pink-600/30 border-pink-500 text-pink-300 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Personalizar Apariencia Tierna 3D"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Personalizar</span>
          </button>

          {/* Avatar Style Picker */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
            {(['anime', 'modern', 'cyberpunk', 'humanoid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setAvatarStyle(st)}
                className={`px-2 py-0.5 rounded transition-all capitalize ${
                  avatarStyle === st
                    ? 'bg-pink-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'anime' ? 'Cute 3D' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customizable Drawer Panel */}
      {showCustomizer && (
        <div className="w-full mb-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-pink-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>Estilo Personaje Femenino 3D</span>
            </span>
            <button
              onClick={() => setShowCustomizer(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Hair Color */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Cabello 3D:</span>
              <div className="flex gap-1">
                {[
                  { id: 'pink', name: 'Rosado', bg: 'bg-pink-500' },
                  { id: 'violet', name: 'Violeta', bg: 'bg-purple-500' },
                  { id: 'gold', name: 'Rubio', bg: 'bg-amber-400' },
                  { id: 'cyan', name: 'Celeste', bg: 'bg-cyan-400' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setHairColor(c.id as any)}
                    className={`flex-1 py-1 px-1 rounded text-[10px] border flex items-center justify-center gap-1 transition-all ${
                      hairColor === c.id
                        ? 'border-pink-500 bg-pink-500/20 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.bg}`} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Eye Color */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Ojos 3D Cristalinos:</span>
              <div className="flex gap-1">
                {[
                  { id: 'violet', name: 'Violeta', bg: 'bg-violet-400' },
                  { id: 'sapphire', name: 'Azul', bg: 'bg-sky-400' },
                  { id: 'emerald', name: 'Verde', bg: 'bg-emerald-400' },
                  { id: 'ruby', name: 'Rubí', bg: 'bg-rose-500' },
                ].map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEyeColorOption(e.id as any)}
                    className={`flex-1 py-1 px-1 rounded text-[10px] border flex items-center justify-center gap-1 transition-all ${
                      eyeColorOption === e.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${e.bg}`} />
                    <span className="truncate">{e.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessory */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Accesorio Tierna:</span>
              <div className="flex gap-1">
                {[
                  { id: 'ribbon', name: 'Lazos' },
                  { id: 'catears', name: 'Gatito' },
                  { id: 'flower', name: 'Flor' },
                  { id: 'headphones', name: 'Audífonos' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccessory(a.id as any)}
                    className={`flex-1 py-1 px-1 rounded text-[10px] border transition-all ${
                      accessory === a.id
                        ? 'border-pink-500 bg-pink-500/20 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Container */}
      <div className="relative w-full aspect-square max-w-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-2xl flex items-center justify-center">
        {/* Ambient volumetric lighting halo */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${getHaloColor(currentArchetype, avatarStyle)}, transparent 75%)`,
          }}
        />

        {/* HTML Canvas */}
        <canvas
          ref={canvasRef}
          width={520}
          height={520}
          className="w-full h-full object-contain relative z-10"
        />

        {/* Thinking Overlay Spinner */}
        {isThinking && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Sintetizando Emoción...</span>
          </div>
        )}

        {/* Speaking Viseme Indicator */}
        {isSpeaking && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-pink-950/80 border border-pink-500/30 text-pink-300 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md">
            <Volume2 className="w-3.5 h-3.5 animate-bounce text-pink-400" />
            <span>Hablando con Visemas</span>
          </div>
        )}

        {/* Explanation Toast Overlay */}
        {explanation && (
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-950/90 border border-slate-800/80 text-slate-200 text-xs p-2.5 rounded-xl backdrop-blur-md shadow-lg flex items-start gap-2">
            <Zap className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      {/* Astronaut & Ignited Transformation Control Bar */}
      <div className="w-full mt-3 p-2.5 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Escena Cinemática & Ignición</span>
          </span>
          <button
            onClick={() => setShowCinematicRender(true)}
            className="px-2 py-0.5 bg-orange-600/30 border border-orange-500/50 hover:bg-orange-600/50 text-orange-200 rounded font-medium flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Ver Render HD</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              setTransformationMode('astronaut_flora');
              setIgnitionProgress(0);
              setCameraZoom(1.0);
            }}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              transformationMode === 'astronaut_flora' && ignitionProgress === 0
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🧑‍🚀 Astronauta + Flores
          </button>

          <button
            onClick={() => {
              setTransformationMode('flaming_skeleton');
              setIgnitionProgress(0.55);
              setCameraZoom(0.8);
            }}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              transformationMode === 'flaming_skeleton' && ignitionProgress < 0.9
                ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Ignición Lenta
          </button>

          <button
            onClick={() => {
              setTransformationMode('flaming_skeleton');
              setIgnitionProgress(1.0);
              setCameraZoom(0.68);
            }}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              transformationMode === 'flaming_skeleton' && ignitionProgress >= 0.9
                ? 'bg-red-600/30 border-red-500 text-red-200 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            💀 Esqueleto Fuego
          </button>
        </div>

        {/* Camera Zoom Distance Slider */}
        {transformationMode !== 'normal' && (
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="shrink-0 flex items-center gap-1 text-slate-300">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>Distancia de Cámara (Alejamiento):</span>
            </span>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.02"
              value={cameraZoom}
              onChange={(e) => setCameraZoom(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-amber-300 w-10 text-right">
              {Math.round((1.1 - cameraZoom + 0.5) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Cinematic Modal Artwork */}
      {showCinematicRender && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-orange-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Render Cinemático 8K: Transformación Astronauta de Fuego
                </h3>
              </div>
              <button
                onClick={() => setShowCinematicRender(false)}
                className="text-slate-400 hover:text-slate-100 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video group">
                <img
                  src="/src/assets/images/astronaut_flame_transformation_1785801402062.jpg"
                  alt="Astronaut Flame Transformation Render"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-xs text-orange-200/90 font-serif italic bg-slate-950/70 p-2.5 rounded-lg border border-orange-500/30 backdrop-blur-sm">
                  "Una joven con casco de astronauta lleno de flores en un campo colorido. Su piel, cabello y ojos se encienden en cámara lenta revelando un esqueleto llameante con fuego brotando de sus cuencas..."
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Iluminación dramática • Humo en espiral • Pétalos ardientes</span>
                <button
                  onClick={() => {
                    setShowCinematicRender(false);
                    setTransformationMode('flaming_skeleton');
                    setIgnitionProgress(1.0);
                  }}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-all"
                >
                  Activar en Lienzo 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gaze Tracking Control HUD */}
      <div className="w-full mt-3 p-2.5 bg-slate-950/90 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Seguimiento Ocular en Tiempo Real (Gaze Tracking)</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            X: {gazeDisplayCoords.x > 0 ? `+${gazeDisplayCoords.x}` : gazeDisplayCoords.x} | Y: {gazeDisplayCoords.y > 0 ? `+${gazeDisplayCoords.y}` : gazeDisplayCoords.y}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setGazeMode('cursor')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              gazeMode === 'cursor'
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🖱️ Cursor
          </button>

          <button
            onClick={() => setGazeMode('webcam')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              gazeMode === 'webcam'
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            📷 Cámara
          </button>

          <button
            onClick={() => setGazeMode('attention')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              gazeMode === 'attention'
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 shadow font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Atención Foco
          </button>

          <button
            onClick={() => setGazeMode('auto')}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
              gazeMode === 'auto'
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Sácadas Auto
          </button>
        </div>

        {gazeMode === 'attention' && (
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-300 font-mono">
            <span>Fijación Visual Activa:</span>
            <span className="bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 font-semibold uppercase">
              {activeStudioView === 'chat' && '💬 Panel de Conversación'}
              {activeStudioView === 'cognitive' && '🧠 Cerebro Cognitivo & Memoria'}
              {activeStudioView === 'apis' && '🌐 Hub de APIs & Conocimiento'}
              {activeStudioView === 'inspector' && '📊 Inspector de Músculos'}
            </span>
          </div>
        )}
      </div>

      {/* Canvas Mode Toggles */}
      <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <button
          onClick={() => setShowMeshOverlay(!showMeshOverlay)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            showMeshOverlay
              ? 'bg-pink-600/20 border-pink-500 text-pink-300 font-medium'
              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Malla 3D Landmarks</span>
        </button>

        <button
          onClick={() => setShowMuscleHeatmap(!showMuscleHeatmap)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            showMuscleHeatmap
              ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-medium'
              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Actividad Muscular</span>
        </button>
      </div>
    </div>
  );
};

const ARCHETYPE_LABELS: Record<ExpressionArchetype, string> = {
  subtle_smile: 'Leve Sonrisa Dulce',
  deep_concentration: 'Concentración Atenta',
  empathetic_softness: 'Empatía & Ternura',
  curious_intrigue: 'Curiosidad Adorable',
  controlled_surprise: 'Sorpresa Encantadora',
  analytical_skepticism: 'Escepticismo Analítico',
  playful_amusement: 'Risa & Diversión',
  thoughtful_pondering: 'Reflexión Profunda',
  composed_neutral: 'Postura Serena Atenta',
};

function getHaloColor(archetype: ExpressionArchetype, style: string): string {
  if (style === 'cyberpunk') return 'rgba(6, 182, 212, 0.25)';
  switch (archetype) {
    case 'subtle_smile':
    case 'playful_amusement':
      return 'rgba(244, 114, 182, 0.3)'; // Pretty pink
    case 'deep_concentration':
    case 'analytical_skepticism':
      return 'rgba(245, 158, 11, 0.25)'; // Amber/gold
    case 'empathetic_softness':
      return 'rgba(52, 211, 153, 0.25)'; // Soft emerald
    case 'curious_intrigue':
    case 'controlled_surprise':
      return 'rgba(167, 139, 250, 0.3)'; // Lavender/violet
    default:
      return 'rgba(236, 72, 153, 0.2)';  // Rose halo
  }
}

// Draw 3D Volumetric Cute Female / Astronaut Flame Transformation Avatar
function draw3DFemaleAvatar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  m: FacialMorphTargets,
  blink: number,
  gazeDrift: { x: number; y: number },
  breatheY: number,
  hairBounce: number,
  isThinking: boolean,
  isSpeaking: boolean,
  activeViseme: number,
  showMesh: boolean,
  showHeatmap: boolean,
  style: string,
  hairColorOpt: string,
  eyeColorOpt: string,
  accessoryOpt: string,
  transformationMode: 'normal' | 'astronaut_flora' | 'flaming_skeleton' = 'normal',
  cameraZoom: number = 1.0,
  ignitionProgress: number = 0,
  flameTime: number = 0
) {
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  // Camera Pull-Back Scale Zoom (centered)
  ctx.translate(w / 2, h / 2);
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(-w / 2, -h / 2);

  // 3D Head center with 3D Yaw & Tilt perspective shift
  const cx = w / 2 + m.headYaw * 38;
  const cy = h / 2 - 12 + breatheY;
  const yawOffset = m.headYaw * 28;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(m.headTilt * 0.25);
  ctx.translate(-cx, -cy);

  // Is this an astronaut or flaming scene?
  const isAstronautScene = transformationMode !== 'normal';

  // 1. Draw Suit / Shoulders
  const neckX = cx + yawOffset * 0.4;
  const neckY = cy + 110;

  if (isAstronautScene) {
    drawOrangeAstronautSuit(ctx, neckX, neckY, ignitionProgress, flameTime);
  } else {
    // Normal Cute Outfit Neck & Shoulders
    const neckGrad = ctx.createLinearGradient(neckX, neckY, neckX, neckY + 70);
    neckGrad.addColorStop(0, '#fbcfe8');
    neckGrad.addColorStop(0.3, '#fde047');
    neckGrad.addColorStop(1, '#fce7f3');

    ctx.beginPath();
    ctx.moveTo(neckX - 110, neckY + 70);
    ctx.quadraticCurveTo(neckX, neckY + 45, neckX + 110, neckY + 70);
    ctx.lineTo(neckX + 45, neckY + 10);
    ctx.lineTo(neckX - 45, neckY + 10);
    ctx.closePath();
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(neckX - 45, neckY + 10);
    ctx.lineTo(neckX, neckY + 35);
    ctx.lineTo(neckX + 45, neckY + 10);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f472b6';
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(neckX - 26, neckY - 20, 52, 50);
    const neckSkinGrad = ctx.createLinearGradient(neckX - 26, neckY, neckX + 26, neckY);
    neckSkinGrad.addColorStop(0, '#f472b6');
    neckSkinGrad.addColorStop(0.3, '#fff1f2');
    neckSkinGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = neckSkinGrad;
    ctx.fill();
  }

  // Head Position
  const headX = cx + yawOffset * 0.6;
  const headY = cy;

  // 2. Draw Head: Either Human Face OR Flaming Skeleton (or blend during ignition!)
  if (ignitionProgress > 0.3) {
    // Render Flaming Skeleton Face
    drawFlamingSkeletonFace(ctx, headX, headY, m, flameTime, ignitionProgress, activeViseme, isSpeaking);
  } else {
    // Render Human Female Face with Skin & Hair
    let hairPrimary = '#f472b6';
    let hairHighlight = '#fbcfe8';
    let hairShadow = '#db2777';

    if (hairColorOpt === 'violet') {
      hairPrimary = '#c084fc';
      hairHighlight = '#f3e8ff';
      hairShadow = '#9333ea';
    } else if (hairColorOpt === 'gold') {
      hairPrimary = '#fbbf24';
      hairHighlight = '#fef08a';
      hairShadow = '#d97706';
    } else if (hairColorOpt === 'cyan') {
      hairPrimary = '#38bdf8';
      hairHighlight = '#e0f2fe';
      hairShadow = '#0284c7';
    }

    let irisPrimaryGradient = ['#8b5cf6', '#a855f7', '#6366f1'];
    if (eyeColorOpt === 'sapphire') {
      irisPrimaryGradient = ['#0284c7', '#38bdf8', '#1e40af'];
    } else if (eyeColorOpt === 'emerald') {
      irisPrimaryGradient = ['#059669', '#34d399', '#065f46'];
    } else if (eyeColorOpt === 'ruby') {
      irisPrimaryGradient = ['#e11d48', '#fb7185', '#9f1239'];
    }

    // Back Hair
    ctx.save();
    const leftPonytailX = cx - 110 + yawOffset * 0.3;
    const rightPonytailX = cx + 110 + yawOffset * 0.3;
    const ponytailY = cy + 40 + hairBounce;

    const leftPonyGrad = ctx.createLinearGradient(leftPonytailX, ponytailY - 80, leftPonytailX - 40, ponytailY + 120);
    leftPonyGrad.addColorStop(0, hairPrimary);
    leftPonyGrad.addColorStop(0.5, hairShadow);
    leftPonyGrad.addColorStop(1, hairHighlight);

    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 30);
    ctx.bezierCurveTo(leftPonytailX - 30, ponytailY - 60, leftPonytailX - 80, ponytailY + 40, leftPonytailX - 20, ponytailY + 120);
    ctx.bezierCurveTo(leftPonytailX, ponytailY + 80, cx - 80, cy + 60, cx - 75, cy + 20);
    ctx.fillStyle = leftPonyGrad;
    ctx.fill();

    const rightPonyGrad = ctx.createLinearGradient(rightPonytailX, ponytailY - 80, rightPonytailX + 40, ponytailY + 120);
    rightPonyGrad.addColorStop(0, hairPrimary);
    rightPonyGrad.addColorStop(0.5, hairShadow);
    rightPonyGrad.addColorStop(1, hairHighlight);

    ctx.beginPath();
    ctx.moveTo(cx + 70, cy - 30);
    ctx.bezierCurveTo(rightPonytailX + 30, ponytailY - 60, rightPonytailX + 80, ponytailY + 40, rightPonytailX + 20, ponytailY + 120);
    ctx.bezierCurveTo(rightPonytailX, ponytailY + 80, cx + 80, cy + 60, cx + 75, cy + 20);
    ctx.fillStyle = rightPonyGrad;
    ctx.fill();
    ctx.restore();

    // 3. Volumetric Skin Base
    ctx.save();
    const headSkinGrad = ctx.createRadialGradient(
      headX - 20 + yawOffset * 0.2,
      headY - 30,
      15,
      headX,
      headY + 10,
      145
    );
    headSkinGrad.addColorStop(0, '#ffffff');
    headSkinGrad.addColorStop(0.35, '#fff1f2');
    headSkinGrad.addColorStop(0.85, '#ffe4e6');
    headSkinGrad.addColorStop(1, '#fecdd3');

    ctx.beginPath();
    ctx.moveTo(headX - 110, headY - 40);
    ctx.bezierCurveTo(headX - 115, headY + 30, headX - 80, headY + 100, headX - 22, headY + 125);
    ctx.quadraticCurveTo(headX, headY + 129, headX + 22, headY + 125);
    ctx.bezierCurveTo(headX + 80, headY + 100, headX + 115, headY + 30, headX + 110, headY - 40);
    ctx.bezierCurveTo(headX + 100, headY - 120, headX - 100, headY - 120, headX - 110, headY - 40);
    ctx.closePath();
    ctx.fillStyle = headSkinGrad;
    ctx.fill();

    // Rosy Blush
    const leftCheekX = headX - 58 + yawOffset * 0.2;
    const rightCheekX = headX + 58 + yawOffset * 0.2;
    const cheekY = headY + 34;
    const blushIntensity = Math.max(0.25, m.blush);

    ctx.save();
    ctx.globalAlpha = Math.min(0.7, blushIntensity * 0.85);

    const leftBlushGrad = ctx.createRadialGradient(leftCheekX, cheekY, 2, leftCheekX, cheekY, 26);
    leftBlushGrad.addColorStop(0, '#fb7185');
    leftBlushGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(leftCheekX, cheekY, 26, 16, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = leftBlushGrad;
    ctx.fill();

    const rightBlushGrad = ctx.createRadialGradient(rightCheekX, cheekY, 2, rightCheekX, cheekY, 26);
    rightBlushGrad.addColorStop(0, '#fb7185');
    rightBlushGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(rightCheekX, cheekY, 26, 16, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = rightBlushGrad;
    ctx.fill();
    ctx.restore();

    // Eyes
    const eyeDistance = 54;
    const leftEyeX = headX - eyeDistance + yawOffset * 0.4;
    const rightEyeX = headX + eyeDistance + yawOffset * 0.4;
    const eyeY = headY - 12;

    const rawSquintLeft = Math.max(0, m.eyeSquintLeft);
    const rawSquintRight = Math.max(0, m.eyeSquintRight);
    const eyeWideOffset = m.eyeWide * 10;

    const eyeHeightLeft = Math.max(2, (34 + eyeWideOffset - rawSquintLeft * 16) * (1 - blink));
    const eyeHeightRight = Math.max(2, (34 + eyeWideOffset - rawSquintRight * 16) * (1 - blink));

    renderCute3DEye(
      ctx,
      leftEyeX,
      eyeY,
      30,
      eyeHeightLeft,
      m.gazeX + gazeDrift.x,
      m.gazeY + gazeDrift.y,
      m.pupilDilation,
      irisPrimaryGradient,
      true
    );

    renderCute3DEye(
      ctx,
      rightEyeX,
      eyeY,
      30,
      eyeHeightRight,
      m.gazeX + gazeDrift.x,
      m.gazeY + gazeDrift.y,
      m.pupilDilation,
      irisPrimaryGradient,
      false
    );

    // Eyebrows
    const browBaseY = eyeY - 28;
    const innerUpOffset = m.browInnerUp * 16;
    const furrowOffset = m.browLowerer * 12;
    const outerLeftOffset = m.browOuterRaiseLeft * 14;
    const outerRightOffset = m.browOuterRaiseRight * 14;

    const lBrowInX = headX - 16 + yawOffset * 0.4;
    const lBrowInY = browBaseY - innerUpOffset + furrowOffset;
    const lBrowMidX = leftEyeX;
    const lBrowMidY = browBaseY - 8 + furrowOffset;
    const lBrowOutX = leftEyeX - 32;
    const lBrowOutY = browBaseY - outerLeftOffset + furrowOffset;

    ctx.beginPath();
    ctx.moveTo(lBrowInX, lBrowInY);
    ctx.quadraticCurveTo(lBrowMidX, lBrowMidY, lBrowOutX, lBrowOutY);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = hairShadow;
    ctx.stroke();

    const rBrowInX = headX + 16 + yawOffset * 0.4;
    const rBrowInY = browBaseY - innerUpOffset + furrowOffset;
    const rBrowMidX = rightEyeX;
    const rBrowMidY = browBaseY - 8 + furrowOffset;
    const rBrowOutX = rightEyeX + 32;
    const rBrowOutY = browBaseY - outerRightOffset + furrowOffset;

    ctx.beginPath();
    ctx.moveTo(rBrowInX, rBrowInY);
    ctx.quadraticCurveTo(rBrowMidX, rBrowMidY, rBrowOutX, rBrowOutY);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = hairShadow;
    ctx.stroke();

    // Nose
    const noseX = headX + yawOffset * 0.5;
    const noseY = headY + 30;

    ctx.beginPath();
    ctx.ellipse(noseX, noseY, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 113, 133, 0.5)';
    ctx.fill();

    // Lips & Mouth
    const mouthX = headX + yawOffset * 0.5;
    const mouthY = headY + 65;
    const cornerPull = m.lipCornerPuller * 20;
    const puckerWidth = m.lipPucker * 12;
    const mouthWidth = Math.max(18, 44 + (m.cheekRaiser * 10) - puckerWidth);
    const visemeOpen = isSpeaking ? activeViseme * 26 : 0;
    const totalJawOpen = Math.max(visemeOpen, m.jawOpen * 26);

    if (totalJawOpen > 3) {
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + totalJawOpen * 0.45, mouthWidth * 0.75, totalJawOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4c0519';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + totalJawOpen * 0.7, mouthWidth * 0.45, totalJawOpen * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fb7185';
      ctx.fill();
    }

    const lowerLipGrad = ctx.createLinearGradient(mouthX, mouthY, mouthX, mouthY + 12);
    lowerLipGrad.addColorStop(0, '#fb7185');
    lowerLipGrad.addColorStop(1, '#e11d48');

    ctx.beginPath();
    ctx.moveTo(mouthX - mouthWidth, mouthY);
    ctx.quadraticCurveTo(mouthX, mouthY + 10 - cornerPull + totalJawOpen, mouthX + mouthWidth, mouthY);
    ctx.quadraticCurveTo(mouthX, mouthY + 2 - cornerPull + (totalJawOpen * 0.35), mouthX - mouthWidth, mouthY);
    ctx.fillStyle = lowerLipGrad;
    ctx.fill();

    // Front Hair Bangs
    ctx.save();
    const frontHairX = headX;
    const frontHairY = headY - 70;
    const hairGrad = ctx.createLinearGradient(frontHairX, frontHairY - 60, frontHairX, frontHairY + 80);
    hairGrad.addColorStop(0, hairHighlight);
    hairGrad.addColorStop(0.35, hairPrimary);
    hairGrad.addColorStop(1, hairShadow);

    ctx.beginPath();
    ctx.moveTo(frontHairX - 75, frontHairY - 30);
    ctx.quadraticCurveTo(frontHairX - 35, frontHairY + 25, frontHairX - 10, frontHairY + 38);
    ctx.quadraticCurveTo(frontHairX, frontHairY + 20, frontHairX + 20, frontHairX + 38);
    ctx.quadraticCurveTo(frontHairX + 45, frontHairY + 20, frontHairX + 75, frontHairY - 30);
    ctx.quadraticCurveTo(frontHairX, frontHairY - 65, frontHairX - 75, frontHairY - 30);
    ctx.fillStyle = hairGrad;
    ctx.fill();
    ctx.restore();

    if (accessoryOpt === 'ribbon') {
      renderCuteRibbonBows(ctx, headX - 85, headY - 70, headX + 85, headY - 70);
    } else if (accessoryOpt === 'flower') {
      renderCuteFlower(ctx, headX - 75, headY - 65);
    }
    ctx.restore();
  }

  // 4. If Astronaut Mode or Ignited: Render Glass Helmet with Floating Flowers / Burning Petals!
  if (isAstronautScene) {
    drawAstronautHelmetVisorWithFlowers(ctx, headX, headY - 10, flameTime, ignitionProgress);
    drawSwirlingSmokeAndEmbers(ctx, headX, headY, flameTime, ignitionProgress);
  }

  // Muscle Heatmap
  if (showHeatmap && ignitionProgress < 0.5) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    if (m.browLowerer > 0.08) {
      ctx.beginPath();
      ctx.arc(headX, headY - 30, m.browLowerer * 32, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }
    ctx.restore();
  }

  // Mesh Landmarks
  if (showMesh) {
    ctx.save();
    ctx.strokeStyle = ignitionProgress > 0.5 ? '#f97316' : 'rgba(244, 114, 182, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(headX, headY, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // Rotate / Translate head
  ctx.restore(); // Camera zoom
}

// Draw Orange NASA Astronaut Suit with Chest Unit & Glowing Patches
function drawOrangeAstronautSuit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ignitionProgress: number,
  flameTime: number
) {
  ctx.save();

  // Suit Base Color (Orange NASA Suit)
  const suitGrad = ctx.createLinearGradient(x, y - 10, x, y + 150);
  suitGrad.addColorStop(0, '#f97316'); // Vibrant orange
  suitGrad.addColorStop(0.5, '#ea580c'); // Deep orange
  suitGrad.addColorStop(1, '#c2410c'); // Shadow orange

  // Shoulders & Chest Bulk
  ctx.beginPath();
  ctx.moveTo(x - 160, y + 140);
  ctx.quadraticCurveTo(x - 120, y + 30, x - 75, y - 5);
  ctx.lineTo(x + 75, y - 5);
  ctx.quadraticCurveTo(x + 120, y + 30, x + 160, y + 140);
  ctx.closePath();
  ctx.fillStyle = suitGrad;
  ctx.fill();

  // Suit Neck Seal Collar (Heavy metallic ring)
  const ringGrad = ctx.createLinearGradient(x - 80, y - 10, x + 80, y + 15);
  ringGrad.addColorStop(0, '#94a3b8');
  ringGrad.addColorStop(0.5, '#f1f5f9');
  ringGrad.addColorStop(1, '#64748b');

  ctx.beginPath();
  ctx.ellipse(x, y, 82, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Chest Life-Support Control Pack
  ctx.beginPath();
  ctx.roundRect(x - 48, y + 35, 96, 70, 8);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Glowing Control Lights & Gauges
  const pulseLight = Math.sin(flameTime * 4) * 0.3 + 0.7;
  ctx.beginPath();
  ctx.arc(x - 24, y + 55, 6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(34, 197, 94, ${pulseLight})`; // Green gauge
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y + 55, 6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(59, 130, 246, ${pulseLight})`; // Blue gauge
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 24, y + 55, 6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(239, 68, 68, ${pulseLight})`; // Red alert light
  ctx.fill();

  // Mission Patch
  ctx.beginPath();
  ctx.arc(x - 85, y + 55, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a'; // Deep NASA blue
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fbbf24'; // Gold rim
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x - 85, y + 55, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444'; // Red vector
  ctx.fill();

  // Burning Suit Embers & Flames overlay if ignited
  if (ignitionProgress > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const emberX = x - 100 + Math.sin(flameTime * 3 + i) * 110;
      const emberY = y + 40 + (Math.cos(flameTime * 2 + i * 2) * 50);
      const radius = 6 + Math.sin(flameTime * 5 + i) * 4;

      const fireGrad = ctx.createRadialGradient(emberX, emberY, 1, emberX, emberY, radius * 2);
      fireGrad.addColorStop(0, '#fef08a');
      fireGrad.addColorStop(0.5, '#f97316');
      fireGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(emberX, emberY, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = fireGrad;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

// Draw Flaming Skeleton Face with Fire Gushing from Eye Sockets & Mouth
function drawFlamingSkeletonFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  m: FacialMorphTargets,
  flameTime: number,
  ignitionProgress: number,
  activeViseme: number,
  isSpeaking: boolean
) {
  ctx.save();

  // Bone Skull Color Gradient
  const skullGrad = ctx.createRadialGradient(x - 15, y - 20, 10, x, y, 110);
  skullGrad.addColorStop(0, '#f8fafc'); // White bone
  skullGrad.addColorStop(0.6, '#e2e8f0'); // Aged ivory
  skullGrad.addColorStop(1, '#94a3b8'); // Dark bone shadow

  // Cranium Skull Base
  ctx.beginPath();
  ctx.moveTo(x - 90, y - 50);
  ctx.bezierCurveTo(x - 95, y - 130, x + 95, y - 130, x + 90, y - 50);
  ctx.bezierCurveTo(x + 100, y + 20, x + 70, y + 60, x + 40, y + 70);
  // Cheekbones (Zygomatic Arches)
  ctx.bezierCurveTo(x + 20, y + 110, x - 20, y + 110, x - 40, y + 70);
  ctx.bezierCurveTo(x - 70, y + 60, x - 100, y + 20, x - 90, y - 50);
  ctx.fillStyle = skullGrad;
  ctx.fill();

  // Dark Jaw / Teeth Structure with morph target movement
  const jawOpenAmount = isSpeaking ? Math.max(m.jawOpen, activeViseme) * 28 : m.jawOpen * 28;
  const jawY = y + 75 + jawOpenAmount;

  ctx.beginPath();
  ctx.moveTo(x - 40, y + 65);
  ctx.lineTo(x - 30, jawY + 25);
  ctx.lineTo(x + 30, jawY + 25);
  ctx.lineTo(x + 40, y + 65);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();

  // Teeth Grid Lines
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  for (let i = -20; i <= 20; i += 8) {
    ctx.moveTo(x + i, y + 60);
    ctx.lineTo(x + i, jawY + 20);
  }
  ctx.stroke();

  // Nasal Cavity (Inverted Heart)
  ctx.beginPath();
  ctx.moveTo(x, y + 12);
  ctx.bezierCurveTo(x - 12, y + 28, x - 12, y + 36, x, y + 38);
  ctx.bezierCurveTo(x + 12, y + 36, x + 12, y + 28, x, y + 12);
  ctx.fillStyle = '#090d16';
  ctx.fill();

  // Large Hollow Eye Sockets
  const socketXOffset = 42;
  const leftSocketX = x - socketXOffset;
  const rightSocketX = x + socketXOffset;
  const socketY = y - 18;

  ctx.beginPath();
  ctx.ellipse(leftSocketX, socketY, 26, 30, -0.1, 0, Math.PI * 2);
  ctx.ellipse(rightSocketX, socketY, 26, 30, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#050811';
  ctx.fill();

  // FIRE GUSHING FROM EYE SOCKETS
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  [leftSocketX, rightSocketX].forEach((socketX) => {
    // Fire plume gushing upwards & outwards
    for (let p = 0; p < 12; p++) {
      const pOffset = Math.sin(flameTime * 8 + p * 1.5) * 14;
      const pHeight = 25 + Math.cos(flameTime * 10 + p) * 20;
      const px = socketX + Math.sin(p + flameTime * 5) * 10;
      const py = socketY - pHeight;

      const plumeGrad = ctx.createRadialGradient(px, py, 2, px, py, 24);
      plumeGrad.addColorStop(0, '#ffffff'); // Intense white core
      plumeGrad.addColorStop(0.3, '#fef08a'); // Bright yellow
      plumeGrad.addColorStop(0.7, '#f97316'); // Orange fire
      plumeGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fillStyle = plumeGrad;
      ctx.fill();
    }

    // Glowing intense core inside socket
    ctx.beginPath();
    ctx.arc(socketX, socketY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  });

  // Fire gushing from Jaw / Mouth if open
  if (jawOpenAmount > 4) {
    for (let mP = 0; mP < 8; mP++) {
      const mX = x + (Math.sin(flameTime * 6 + mP) * 20);
      const mY = y + 70 + Math.cos(flameTime * 8 + mP) * 15;
      const mouthFireGrad = ctx.createRadialGradient(mX, mY, 2, mX, mY, 16);
      mouthFireGrad.addColorStop(0, '#fef08a');
      mouthFireGrad.addColorStop(0.6, '#ea580c');
      mouthFireGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(mX, mY, 14, 0, Math.PI * 2);
      ctx.fillStyle = mouthFireGrad;
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.restore();
}

// Draw Glass Astronaut Visor Helmet enclosing head with floating/burning flower petals
function drawAstronautHelmetVisorWithFlowers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flameTime: number,
  ignitionProgress: number
) {
  ctx.save();

  // Glass Bubble Helmet Radius
  const helmetR = 150;

  // 1. Floating Flower Petals Inside Visor
  const petalColors = ['#f472b6', '#fb7185', '#a855f7', '#fbbf24', '#34d399', '#38bdf8'];

  for (let i = 0; i < 22; i++) {
    const angle = i * 0.28 + flameTime * (0.3 + (i % 3) * 0.1);
    const dist = 60 + Math.sin(flameTime * 0.8 + i) * 65;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist * 0.85;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + flameTime);

    if (ignitionProgress > 0.4) {
      // Petals Burning Gently inside helmet!
      const burnGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
      burnGrad.addColorStop(0, '#fef08a');
      burnGrad.addColorStop(0.5, '#f97316');
      burnGrad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = burnGrad;
      ctx.fill();
    } else {
      // Beautiful Colorful Flower Petals
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = petalColors[i % petalColors.length];
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Glass Visor Dome Outer Glass Shading
  const visorGrad = ctx.createRadialGradient(
    x - 45,
    y - 50,
    20,
    x,
    y,
    helmetR
  );

  if (ignitionProgress > 0.5) {
    // Fiery golden reflective glass tint when ignited
    visorGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    visorGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.15)');
    visorGrad.addColorStop(0.9, 'rgba(15, 23, 42, 0.4)');
    visorGrad.addColorStop(1, 'rgba(249, 115, 22, 0.7)');
  } else {
    // Crystal clear glass visor with cyan/violet iridescence
    visorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    visorGrad.addColorStop(0.4, 'rgba(186, 230, 253, 0.12)');
    visorGrad.addColorStop(0.85, 'rgba(192, 132, 252, 0.15)');
    visorGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
  }

  ctx.beginPath();
  ctx.arc(x, y, helmetR, 0, Math.PI * 2);
  ctx.fillStyle = visorGrad;
  ctx.fill();

  // Glass Specular Curved Highlights (Visor Reflection Rim)
  ctx.beginPath();
  ctx.arc(x, y, helmetR - 6, Math.PI * 1.15, Math.PI * 1.7);
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, helmetR - 12, Math.PI * 1.2, Math.PI * 1.55);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.stroke();

  // Metallic Visor Rim Ring
  ctx.beginPath();
  ctx.arc(x, y, helmetR, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = ignitionProgress > 0.5 ? '#f97316' : '#38bdf8';
  ctx.stroke();

  ctx.restore();
}

// Draw Swirling Smoke & Glowing Embers
function drawSwirlingSmokeAndEmbers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flameTime: number,
  ignitionProgress: number
) {
  if (ignitionProgress < 0.1) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Swirling Smoke Particles
  for (let s = 0; s < 14; s++) {
    const sAngle = s * 0.45 + flameTime * 0.5;
    const sDist = 120 + Math.sin(flameTime + s) * 50;
    const sx = x + Math.cos(sAngle) * sDist;
    const sy = y - 40 + Math.sin(sAngle) * 60 - (s * 8);

    const smokeGrad = ctx.createRadialGradient(sx, sy, 5, sx, sy, 35);
    smokeGrad.addColorStop(0, 'rgba(253, 186, 116, 0.25)');
    smokeGrad.addColorStop(0.5, 'rgba(100, 116, 139, 0.15)');
    smokeGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(sx, sy, 35, 0, Math.PI * 2);
    ctx.fillStyle = smokeGrad;
    ctx.fill();
  }

  // Floating Glowing Embers
  for (let e = 0; e < 18; e++) {
    const ex = x - 180 + ((e * 23 + flameTime * 40) % 360);
    const ey = y + 120 - ((flameTime * 60 + e * 35) % 320);
    const eRadius = 1.5 + (e % 3);

    ctx.beginPath();
    ctx.arc(ex, ey, eRadius, 0, Math.PI * 2);
    ctx.fillStyle = e % 2 === 0 ? '#fef08a' : '#f97316';
    ctx.fill();
  }

  ctx.restore();
}

// Render Cute 3D Eye with Glass Reflections, Multi-Layer Iris, and Eyelashes
function renderCute3DEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  heightY: number,
  gazeX: number,
  gazeY: number,
  pupilDilation: number,
  irisGradients: string[],
  isLeft: boolean
) {
  ctx.save();

  // Eye Socket Base (Sclera / Eye White with subtle top shadow)
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, heightY, 0, 0, Math.PI * 2);
  const scleraGrad = ctx.createLinearGradient(x, y - heightY, x, y + heightY);
  scleraGrad.addColorStop(0, '#cbd5e1'); // Upper eyelid shadow
  scleraGrad.addColorStop(0.3, '#ffffff');
  scleraGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = scleraGrad;
  ctx.fill();

  // Thick Luscious Eyeliner & Lash Outline
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#1e1b4b';
  ctx.stroke();

  // Eyelash Wing
  const lashDir = isLeft ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x + lashDir * (radiusX * 0.7), y - heightY * 0.8);
  ctx.quadraticCurveTo(x + lashDir * (radiusX * 1.3), y - heightY * 1.2, x + lashDir * (radiusX * 1.5), y - heightY * 0.5);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1e1b4b';
  ctx.stroke();

  if (heightY > 5) {
    // Iris Movement with Gaze Shift
    const totalGazeX = gazeX * 11;
    const totalGazeY = gazeY * 8;
    const irisX = x + totalGazeX;
    const irisY = y + totalGazeY;
    const irisRadius = Math.min(radiusX * 0.62, heightY * 0.85);

    // Multi-Layer 3D Iris Gradient
    const irisGrad = ctx.createRadialGradient(irisX, irisY - irisRadius * 0.3, 2, irisX, irisY, irisRadius);
    irisGrad.addColorStop(0, irisGradients[1]);
    irisGrad.addColorStop(0.6, irisGradients[0]);
    irisGrad.addColorStop(1, irisGradients[2]);

    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Pupil
    const pupilR = Math.max(3, irisRadius * 0.45 * pupilDilation);
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Double Glass Catchlight Glints (Cute Anime Eye Shine)
    // Primary big sparkle
    ctx.beginPath();
    ctx.ellipse(irisX - irisRadius * 0.35, irisY - irisRadius * 0.35, irisRadius * 0.35, irisRadius * 0.25, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Secondary cute glint
    ctx.beginPath();
    ctx.arc(irisX + irisRadius * 0.35, irisY + irisRadius * 0.35, irisRadius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  }

  ctx.restore();
}

// Render Cute Ribbon Bows for Ponytail
function renderCuteRibbonBows(ctx: CanvasRenderingContext2D, lx: number, ly: number, rx: number, ry: number) {
  ctx.save();
  ctx.fillStyle = '#f43f5e';

  // Left Bow
  ctx.beginPath();
  ctx.ellipse(lx - 12, ly - 6, 12, 8, -0.3, 0, Math.PI * 2);
  ctx.ellipse(lx + 12, ly - 6, 12, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx, ly - 6, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe4e6';
  ctx.fill();

  // Right Bow
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(rx - 12, ry - 6, 12, 8, -0.3, 0, Math.PI * 2);
  ctx.ellipse(rx + 12, ry - 6, 12, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx, ry - 6, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe4e6';
  ctx.fill();

  ctx.restore();
}

// Render Cute Cat Ears
function renderCuteCatEars(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  primaryColor: string,
  shadowColor: string
) {
  ctx.save();

  // Left Ear Outer
  ctx.beginPath();
  ctx.moveTo(lx - 20, ly + 25);
  ctx.lineTo(lx - 15, ly - 30);
  ctx.lineTo(lx + 25, ly + 15);
  ctx.closePath();
  ctx.fillStyle = primaryColor;
  ctx.fill();

  // Left Ear Inner Pink
  ctx.beginPath();
  ctx.moveTo(lx - 14, ly + 20);
  ctx.lineTo(lx - 10, ly - 18);
  ctx.lineTo(lx + 18, ly + 12);
  ctx.closePath();
  ctx.fillStyle = '#fda4af';
  ctx.fill();

  // Right Ear Outer
  ctx.beginPath();
  ctx.moveTo(rx + 20, ry + 25);
  ctx.lineTo(rx + 15, ry - 30);
  ctx.lineTo(rx - 25, ry + 15);
  ctx.closePath();
  ctx.fillStyle = primaryColor;
  ctx.fill();

  // Right Ear Inner Pink
  ctx.beginPath();
  ctx.moveTo(rx + 14, ry + 20);
  ctx.lineTo(rx + 10, ry - 18);
  ctx.lineTo(rx - 18, ry + 12);
  ctx.closePath();
  ctx.fillStyle = '#fda4af';
  ctx.fill();

  ctx.restore();
}

// Render Cute Flower Clip
function renderCuteFlower(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#ffffff';

  // 5 Petals
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const px = x + Math.cos(angle) * 10;
    const py = y + Math.sin(angle) * 10;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Yellow Center
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.restore();
}

// Render Cyber Headphones
function renderCyberHeadphones(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Headband arc
  ctx.beginPath();
  ctx.arc(x, y - 55, 95, Math.PI * 1.1, Math.PI * 1.9);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0284c7';
  ctx.stroke();

  // Ear pads
  ctx.beginPath();
  ctx.ellipse(x - 90, y + 20, 16, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 90, y + 20, 16, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.restore();
}
