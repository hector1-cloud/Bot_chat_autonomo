// Robust Audio & Speech Synthesis Engine for Avatar Bot
// Handles browser SpeechSynthesis quirks, voice preloading, AudioContext unlock, and Web Audio SFX.

export interface AudioEngineOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onViseme?: (visemeValue: number) => void;
}

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;
  private keepAliveTimer: number | null = null;
  private visemeTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  // Ensure AudioContext is unlocked by user gesture
  public unlockAudioContext(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  // Load and select the best Spanish speech voice available
  private initVoices(): void {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    this.voicesLoaded = true;
    // Prefer natural Spanish voices (es-ES, es-MX, es-US, Google, Microsoft, Apple)
    const spanishVoices = voices.filter((v) => v.lang.startsWith('es') || v.lang.includes('ES') || v.lang.includes('MX'));

    if (spanishVoices.length > 0) {
      // Look for preferred high quality names
      const preferred = spanishVoices.find(
        (v) =>
          v.name.includes('Monica') ||
          v.name.includes('Jorge') ||
          v.name.includes('Helena') ||
          v.name.includes('Paulina') ||
          v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Sabina') ||
          v.name.includes('Spanish')
      );
      this.selectedVoice = preferred || spanishVoices[0];
    } else {
      this.selectedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
    }
  }

  // Play sci-fi chime tone for bot responses
  public playChime(freq = 520, durationMs = 120): void {
    try {
      this.unlockAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.audioCtx.currentTime + durationMs / 1000);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (err) {
      console.warn('AudioContext chime error:', err);
    }
  }

  // Speak text with fallback handling & viseme callback
  public speak(text: string, options: AudioEngineOptions = {}): void {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported in this browser environment.');
      options.onError?.('SpeechSynthesis not supported');
      return;
    }

    this.unlockAudioContext();
    this.stop(); // Stop any active utterance

    if (!this.voicesLoaded || !this.selectedVoice) {
      this.initVoices();
    }

    // Clean text for natural speech synthesis
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*#_~`]/g, '')
      .trim();

    if (!cleanText) return;

    this.playChime(640, 100);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    let started = false;
    let ended = false;
    const maxDurationMs = Math.max(3500, cleanText.length * 90);

    // Viseme simulation interval
    const startVisemes = () => {
      if (this.visemeTimer) clearInterval(this.visemeTimer);
      this.visemeTimer = window.setInterval(() => {
        // Generate dynamic viseme mouth opening (0.2 to 0.95)
        const visemeVal = Math.sin(Date.now() * 0.02) * 0.35 + 0.55 + (Math.random() * 0.15 - 0.075);
        options.onViseme?.(Math.max(0.1, Math.min(1.0, visemeVal)));
      }, 90);
    };

    const stopVisemes = () => {
      if (this.visemeTimer) {
        clearInterval(this.visemeTimer);
        this.visemeTimer = null;
      }
      if (this.keepAliveTimer) {
        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = null;
      }
      options.onViseme?.(0);
    };

    const handleStart = () => {
      if (started) return;
      started = true;
      options.onStart?.();
      startVisemes();

      // Chrome keep-alive bug fix: periodically pause/resume every 8s to prevent cutoffs
      this.keepAliveTimer = window.setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 8000);
    };

    const handleEnd = () => {
      if (ended) return;
      ended = true;
      stopVisemes();
      options.onEnd?.();
    };

    utterance.onstart = () => {
      handleStart();
    };

    utterance.onend = () => {
      handleEnd();
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis utterance error:', err);
      handleEnd();
      options.onError?.(err);
    };

    try {
      // Ensure browser speech queue is clear & resumed
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);

      // Fallback timer if onstart doesn't fire immediately
      setTimeout(() => {
        if (!started && !ended) {
          handleStart();
        }
      }, 200);

      // Max duration safety fallback
      setTimeout(() => {
        if (!ended) {
          handleEnd();
        }
      }, maxDurationMs);
    } catch (err) {
      stopVisemes();
      console.error('Failed to trigger speechSynthesis.speak:', err);
      options.onError?.(err);
    }
  }
  }

  // Stop active speech
  public stop(): void {
    if (this.visemeTimer) {
      clearInterval(this.visemeTimer);
      this.visemeTimer = null;
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
