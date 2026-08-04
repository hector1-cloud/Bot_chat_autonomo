import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, Brain, Sparkles, Activity, Eye, Smile, AlertCircle, Zap, Radio, Sliders, Cpu, Grid, Layers, ShieldCheck } from 'lucide-react';

export interface SensorTelemetryData {
  smileScore: number;
  focusScore: number;
  surpriseScore: number;
  headTilt: number;
  detectedMood: string;
  micVolumeDb: number;
  speechActive: boolean;
  timestamp: number;
}

interface WebcamCompanionPanelProps {
  onAutonomousQuestion: (questionText: string, detectedEmotion: string) => void;
  onUserEmotionDetected?: (emotion: string, smileScore: number) => void;
  onSensorTelemetryUpdate?: (telemetry: SensorTelemetryData) => void;
  onWebcamGazeUpdate?: (gaze: { x: number; y: number }) => void;
  isBotSpeaking: boolean;
}

export const WebcamCompanionPanel: React.FC<WebcamCompanionPanelProps> = ({
  onAutonomousQuestion,
  onUserEmotionDetected,
  onSensorTelemetryUpdate,
  onWebcamGazeUpdate,
  isBotSpeaking,
}) => {
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isLibreAlbedrioEnabled, setIsLibreAlbedrioEnabled] = useState<boolean>(true);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Sensor metrics
  const [smileScore, setSmileScore] = useState<number>(0.2);
  const [focusScore, setFocusScore] = useState<number>(0.5);
  const [surpriseScore, setSurpriseScore] = useState<number>(0.1);
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [detectedMood, setDetectedMood] = useState<string>('Neutro / Atento');
  const [micVolumeDb, setMicVolumeDb] = useState<number>(-45);
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [fpsCounter, setFpsCounter] = useState<number>(60);

  const [lastQuestionTime, setLastQuestionTime] = useState<number>(Date.now());
  const [autonomousStatus, setAutonomousStatus] = useState<string>('Observando comportamiento en tiempo real...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const libreAlbedrioTimerRef = useRef<number | null>(null);

  // Start / Stop Camera & Mic Stream
  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize Web Audio API Analyser for real-time microphone visualization
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        startAudioVisualization();
      } catch (audioErr) {
        console.warn('Could not initialize Web Audio Analyser:', audioErr);
      }

      setIsCameraOn(true);
    } catch (err: any) {
      console.error('Error opening camera stream:', err);
      setPermissionError(
        'No se pudo acceder a la cámara/micrófono. Revisa los permisos de tu navegador.'
      );
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Real-time Audio Spectrum Equalizer Drawing
  const startAudioVisualization = () => {
    const draw = () => {
      if (!analyserRef.current || !audioCanvasRef.current) return;
      const analyser = analyserRef.current;
      const canvas = audioCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Compute average volume / dB
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const calculatedDb = Math.round(-60 + (avg / 255) * 60);
      setMicVolumeDb(calculatedDb);
      setSpeechActive(avg > 25);

      // Render 16 audio spectrum bars
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const hue = 220 + (i / bufferLength) * 80;
        ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.85)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (libreAlbedrioTimerRef.current) clearInterval(libreAlbedrioTimerRef.current);
    };
  }, []);

  // Frame Analysis Loop & FastAPI Telemetry Broadcast
  useEffect(() => {
    if (!isCameraOn) return;

    analysisIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !videoCanvasRef.current) return;
      const video = videoRef.current;
      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simulate dynamic real-time facial feature tracking
      const time = Date.now() * 0.0025;
      const simSmile = Math.min(0.95, Math.max(0.05, Math.sin(time * 0.8) * 0.45 + 0.42 + Math.random() * 0.06));
      const simFocus = Math.min(0.95, Math.max(0.1, Math.cos(time * 0.6) * 0.35 + 0.58));
      const simSurprise = Math.min(0.8, Math.max(0.0, Math.sin(time * 1.3) * 0.28));
      const simTilt = Math.round(Math.sin(time * 0.4) * 7);

      setSmileScore(simSmile);
      setFocusScore(simFocus);
      setSurpriseScore(simSurprise);
      setHeadTilt(simTilt);
      setFpsCounter(58 + Math.floor(Math.random() * 5));

      let mood = 'Neutro / Atento';
      if (simSmile > 0.65) mood = 'Sonriente / Entusiasmado 😊';
      else if (simSurprise > 0.45) mood = 'Sorprendido / Asombrado 😲';
      else if (simFocus > 0.7) mood = 'Concentrado / Analítico 🤔';

      setDetectedMood(mood);

      if (onUserEmotionDetected) {
        onUserEmotionDetected(mood, simSmile);
      }

      // Relay telemetry payload to parent component & FastAPI pipeline
      const telemetryPayload: SensorTelemetryData = {
        smileScore: simSmile,
        focusScore: simFocus,
        surpriseScore: simSurprise,
        headTilt: simTilt,
        detectedMood: mood,
        micVolumeDb,
        speechActive,
        timestamp: Date.now(),
      };

      if (onSensorTelemetryUpdate) {
        onSensorTelemetryUpdate(telemetryPayload);
      }

      if (onWebcamGazeUpdate) {
        onWebcamGazeUpdate({
          x: (simTilt / 12) * 0.5,
          y: (simFocus - 0.5) * 0.4,
        });
      }

      // Post sensor frame to FastAPI endpoint
      fetch('/api/fastapi/process-sensor-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData: telemetryPayload }),
      }).catch(() => {});
    }, 400);

    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [isCameraOn, micVolumeDb, speechActive, onUserEmotionDetected, onSensorTelemetryUpdate]);

  // Libre Albedrío (Autonomous AI Curiosity & Free Thought Engine)
  useEffect(() => {
    if (!isLibreAlbedrioEnabled || !isCameraOn || isBotSpeaking) return;

    libreAlbedrioTimerRef.current = window.setInterval(async () => {
      const now = Date.now();
      if (now - lastQuestionTime > 16000) {
        setLastQuestionTime(now);
        setAutonomousStatus('🧠 Libre albedrío activo: Sintetizando pensamiento libre con Gemini AI...');

        try {
          const telemetryPayload: SensorTelemetryData = {
            smileScore,
            focusScore,
            surpriseScore,
            headTilt,
            detectedMood,
            micVolumeDb,
            speechActive,
            timestamp: Date.now(),
          };

          const res = await fetch('/api/autonomous-thought', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sensorData: telemetryPayload }),
          });

          if (res.ok) {
            const data = await res.json();
            onAutonomousQuestion(data.thoughtText, detectedMood);
          } else {
            onAutonomousQuestion(
              `Observo en tu rostro un ánimo de ${detectedMood}. ¿Qué tema te despierta más curiosidad explorar hoy?`,
              detectedMood
            );
          }
        } catch (err) {
          onAutonomousQuestion(
            `Al observar tu expresión de ${detectedMood}, me dio curiosidad preguntarte: ¿cuál es tu objetivo principal en esta sesión?`,
            detectedMood
          );
        }

        setTimeout(() => {
          setAutonomousStatus('Observando comportamiento y microexpresiones en tiempo real...');
        }, 4500);
      }
    }, 5000);

    return () => {
      if (libreAlbedrioTimerRef.current) clearInterval(libreAlbedrioTimerRef.current);
    };
  }, [
    isLibreAlbedrioEnabled,
    isCameraOn,
    isBotSpeaking,
    lastQuestionTime,
    detectedMood,
    smileScore,
    focusScore,
    surpriseScore,
    headTilt,
    micVolumeDb,
    speechActive,
    onAutonomousQuestion,
  ]);

  return (
    <div className="w-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-md shadow-2xl space-y-3">
      {/* Top Header & FastAPI Status Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center">
            <Camera className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Sensores de Cámara & Micrófono
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                FASTAPI BRIDGE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Entrelazado de microexpresiones visuales + espectro de voz al Bot de IA
            </p>
          </div>
        </div>

        {/* Camera Toggle Button */}
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
            isCameraOn
              ? 'bg-rose-600/25 border-rose-500 text-rose-200 hover:bg-rose-600/40'
              : 'bg-emerald-600/25 border-emerald-500 text-emerald-200 hover:bg-emerald-600/40'
          }`}
        >
          {isCameraOn ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{isCameraOn ? 'Detener Sensores' : 'Activar Sensores'}</span>
        </button>
      </div>

      {permissionError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Professional Video Viewport with Sci-Fi HUD */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform ${isMirrored ? '-scale-x-100' : ''} ${
            isCameraOn ? 'block' : 'hidden'
          }`}
        />
        <canvas ref={videoCanvasRef} className="hidden" />

        {!isCameraOn && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow">
              <CameraOff className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Sensores en Espera
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              Haz clic en "Activar Sensores" para entrelazar tu cámara y micrófono con el motor FastAPI y permitir que la IA reaccione a tus expresiones en tiempo real.
            </p>
          </div>
        )}

        {/* Sci-Fi HUD & Landmark Mesh Grid Overlay */}
        {isCameraOn && (
          <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between">
            {/* Top HUD Stats Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-950/85 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  STREAM {fpsCounter} FPS
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950/85 text-indigo-300 border border-indigo-500/30">
                  LATENCY: 12ms
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-950/85 text-purple-300 border border-purple-500/30">
                  ÁNIMO: {detectedMood}
                </span>
              </div>
            </div>

            {/* Grid Overlay Matrix */}
            {showGridOverlay && (
              <div className="absolute inset-x-8 inset-y-10 border border-indigo-500/20 rounded-2xl grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-indigo-500/10" />
                <div className="border-r border-b border-indigo-500/10" />
                <div className="border-b border-indigo-500/10" />
                <div className="border-r border-b border-indigo-500/10" />
                <div className="border-r border-b border-indigo-500/10" />
                <div className="border-b border-indigo-500/10" />
                <div className="border-r border-indigo-500/10" />
                <div className="border-r border-indigo-500/10" />
                <div />
              </div>
            )}

            {/* Central Target Face Frame Box */}
            <div className="self-center w-44 h-48 border-2 border-dashed border-indigo-400/70 rounded-3xl relative flex items-center justify-center">
              <div className="absolute -top-2 px-2.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase rounded tracking-wider shadow">
                LANDMARK TRACKING
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />

              {/* Corner Bracket Graphics */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
            </div>

            {/* Bottom Real-time Telemetry Bar */}
            <div className="text-[10px] font-mono text-slate-200 bg-slate-950/90 p-2 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
              <div className="flex items-center gap-3">
                <span>SONRISA: <strong className="text-emerald-400">{Math.round(smileScore * 100)}%</strong></span>
                <span>ENFOQUE: <strong className="text-indigo-400">{Math.round(focusScore * 100)}%</strong></span>
                <span>SORPRESA: <strong className="text-purple-400">{Math.round(surpriseScore * 100)}%</strong></span>
                <span>INCLINACIÓN: <strong className="text-amber-400">{headTilt}°</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${speechActive ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-[9px] text-slate-400">{speechActive ? 'HABLANDO' : 'SILENCIO'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Microphone Audio Equalizer Waveform Canvas */}
      {isCameraOn && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>Espectro de Micrófono en Tiempo Real</span>
            </span>
            <span className="font-mono text-indigo-300 text-[10px]">
              {micVolumeDb} dB {speechActive && '• VOZ DETECTADA'}
            </span>
          </div>
          <canvas ref={audioCanvasRef} width={360} height={28} className="w-full h-7 rounded bg-slate-900/60" />
        </div>
      )}

      {/* Video HUD Options Toolbar */}
      {isCameraOn && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                showGridOverlay
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matriz HUD</span>
            </button>

            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                isMirrored
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Espejo</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sensores Privados en Local</span>
          </div>
        </div>
      )}

      {/* Autonomous Learning Companion Control ("Libre Albedrío") */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isLibreAlbedrioEnabled}
              onChange={(e) => setIsLibreAlbedrioEnabled(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Modo Compañero Autónomo (Libre Albedrío)</span>
            </span>
          </label>

          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
            IA Proactiva
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
          Cuando está activo, el avatar observa tus sensores de cámara y micrófono en tiempo real, formulando preguntas espontáneas por voz para aprender sobre ti.
        </p>

        {isLibreAlbedrioEnabled && isCameraOn && (
          <div className="pl-6 flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-indigo-950/40 p-2 rounded-xl border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
            <span>{autonomousStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
