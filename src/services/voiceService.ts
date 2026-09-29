/**
 * HRVL Digital Disease Surveillance & Analytics Platform
 * Multilingual Voice Narration Service (TTS)
 *
 * Implements an accessible, fault-tolerant text-to-speech engine supporting
 * English (en-US), Amharic (am-ET), and Afaan Oromo (om-ET).
 */

import { Locale } from '../types';

export const ARVL_AUDIO = '/assets/audio/arvl/';
export const HRVL_AUDIO = '/assets/audio/hrvl/';

export type SpeechState = 'idle' | 'playing' | 'paused' | 'unavailable';

export interface VoiceServiceListener {
  onStateChange?: (state: SpeechState) => void;
  onVoicesChanged?: (voices: SpeechSynthesisVoice[]) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

class VoiceService {
  private static instance: VoiceService;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioPlayer: HTMLAudioElement | null = null;
  private isUsingAudioPlayer: boolean = false;
  private state: SpeechState = 'idle';
  private rate: number = 1.0;
  private voices: SpeechSynthesisVoice[] = [];
  private listeners: Set<VoiceServiceListener> = new Set();
  private isVoiceEnabled: boolean = true;
  private keepAliveTimer: any = null;
  private currentText: string = '';
  private currentLanguage: Locale = 'en';
  private currentAudioKey?: string;
  private labContext: string = 'hrvl';

  public setLabContext(labId: string) {
    this.labContext = labId;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
      }

      try {
        this.audioPlayer = new Audio();
        this.audioPlayer.addEventListener('play', () => {
          this.setState('playing');
        });
        this.audioPlayer.addEventListener('pause', () => {
          if (this.state === 'playing') this.setState('paused');
        });
        this.audioPlayer.addEventListener('ended', () => {
          this.setState('idle');
          this.notifyEnd();
        });
        this.audioPlayer.addEventListener('error', (e) => {
          console.warn('[HRVL VoiceService] Audio element playback error, falling back to Web Speech:', e);
          if (this.isUsingAudioPlayer && this.currentText) {
            this.speakWithSpeechSynthesis(this.currentText, this.currentLanguage);
          }
        });
      } catch (err) {
        console.warn('[HRVL VoiceService] HTMLAudioElement not initialized:', err);
      }

      // Read saved preferences
      const savedVoiceEnabled = localStorage.getItem('hrvl_tour_voice_enabled');
      if (savedVoiceEnabled !== null) {
        this.isVoiceEnabled = savedVoiceEnabled === 'true';
      }

      const savedRate = localStorage.getItem('hrvl_tour_voice_rate');
      if (savedRate !== null) {
        const parsed = parseFloat(savedRate);
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
          this.rate = parsed;
        }
      }
    } else {
      this.state = 'unavailable';
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initVoices(): void {
    if (!this.synth) return;

    const loadVoices = () => {
      this.voices = this.synth?.getVoices() || [];
      this.notifyVoicesChanged();
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null || this.audioPlayer !== null;
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.isVoiceEnabled = enabled;
    localStorage.setItem('hrvl_tour_voice_enabled', String(enabled));
    if (!enabled) {
      this.stop();
    }
  }

  public getState(): SpeechState {
    return this.state;
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(rate: number): void {
    this.rate = Math.max(0.8, Math.min(1.2, rate));
    localStorage.setItem('hrvl_tour_voice_rate', String(this.rate));
    
    if (this.audioPlayer) {
      this.audioPlayer.playbackRate = this.rate;
    }

    // If currently playing, replay at new rate
    if (this.state === 'playing' && this.currentText) {
      this.speak(this.currentText, this.currentLanguage);
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Finds best matching SpeechSynthesisVoice for the target language.
   * Gracefully falls back when exact voice is not installed on the OS.
   */
  public getBestVoiceForLanguage(lang: Locale): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) return null;

    const langCodes: Record<Locale, string[]> = {
      en: ['en-US', 'en-GB', 'en-CA', 'en-AU', 'en'],
      am: ['am-ET', 'am_ET', 'am', 'gez-ET'],
      om: ['om-ET', 'om_ET', 'om', 'orm-ET', 'gaz-ET', 'orm']
    };

    const targetCodes = langCodes[lang] || ['en-US'];

    // 1. Check for exact match in language code
    for (const code of targetCodes) {
      const match = this.voices.find(v => v.lang.toLowerCase() === code.toLowerCase());
      if (match) return match;
    }

    // 2. Check for prefix match (e.g. "am", "om", "en")
    for (const code of targetCodes) {
      const match = this.voices.find(v => v.lang.toLowerCase().startsWith(code.toLowerCase()));
      if (match) return match;
    }

    // 3. Fallback for Amharic or Afaan Oromo: check voice name metadata
    if (lang === 'am') {
      const amMatch = this.voices.find(v => 
        v.name.toLowerCase().includes('amharic') || v.name.toLowerCase().includes('ethiopia')
      );
      if (amMatch) return amMatch;
    }

    if (lang === 'om') {
      const omMatch = this.voices.find(v => 
        v.name.toLowerCase().includes('oromo') || v.name.toLowerCase().includes('oromoo')
      );
      if (omMatch) return omMatch;
    }

    // 4. Fallback to default or English voice
    const defaultVoice = this.voices.find(v => v.default) || this.voices[0] || null;
    return defaultVoice;
  }

  public speak(text: string, language: Locale, onEnd?: () => void, onError?: (err: any) => void): void {
    if (!this.isVoiceEnabled || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Stop existing speech to prevent audio overlaps
    this.stop();

    this.currentText = text;
    this.currentLanguage = language;

    // First attempt server-side TTS audio streaming for natural pronunciation in Amharic, Afan Oromo, and English
    if (this.audioPlayer) {
      try {
        this.isUsingAudioPlayer = true;
        const sourceFolder = this.labContext === 'arvl' ? ARVL_AUDIO : HRVL_AUDIO;
        // The TTS API endpoint acts as a proxy for the dynamic source folders
        const audioSrc = `${sourceFolder}api/tts?lang=${encodeURIComponent(language)}&text=${encodeURIComponent(text.trim())}`;
        this.audioPlayer.src = audioSrc;
        this.audioPlayer.playbackRate = this.rate;

        const playPromise = this.audioPlayer.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.setState('playing');
            })
            .catch((err) => {
              console.warn('[HRVL VoiceService] Audio play error, falling back to SpeechSynthesis:', err);
              this.speakWithSpeechSynthesis(text, language, onEnd, onError);
            });
        }
        return;
      } catch (err) {
        console.warn('[HRVL VoiceService] Failed to stream server audio, falling back to SpeechSynthesis:', err);
      }
    }

    this.speakWithSpeechSynthesis(text, language, onEnd, onError);
  }

  private speakWithSpeechSynthesis(text: string, language: Locale, onEnd?: () => void, onError?: (err: any) => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.isUsingAudioPlayer = false;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Set voice and language code
      const voice = this.getBestVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
      }
      
      const langMapping: Record<Locale, string> = {
        en: 'en-US',
        am: 'am-ET',
        om: 'om-ET'
      };
      utterance.lang = langMapping[language] || 'en-US';
      utterance.rate = this.rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.setState('playing');
        this.startKeepAlive();
      };

      utterance.onend = () => {
        this.stopKeepAlive();
        this.setState('idle');
        this.notifyEnd();
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        this.stopKeepAlive();
        this.setState('idle');
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.warn('[HRVL VoiceService] Speech synthesis error:', event.error);
          this.notifyError(event.error);
          if (onError) onError(event);
        }
      };

      utterance.onpause = () => {
        this.setState('paused');
      };

      utterance.onresume = () => {
        this.setState('playing');
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[HRVL VoiceService] Failed to speak:', err);
      this.setState('idle');
      if (onError) onError(err);
    }
  }

  public pause(): void {
    if (this.isUsingAudioPlayer && this.audioPlayer && !this.audioPlayer.paused) {
      this.audioPlayer.pause();
      this.setState('paused');
      return;
    }

    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.setState('paused');
    }
  }

  public resume(): void {
    if (this.isUsingAudioPlayer && this.audioPlayer && this.audioPlayer.paused) {
      this.audioPlayer.play().catch(() => {});
      this.setState('playing');
      return;
    }

    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.setState('playing');
    } else if (this.state === 'idle' && this.currentText) {
      this.speak(this.currentText, this.currentLanguage);
    }
  }

  public stop(): void {
    this.stopKeepAlive();
    
    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      } catch {}
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }

    this.currentUtterance = null;
    this.setState('idle');
  }

  public replay(): void {
    if (this.currentText) {
      this.speak(this.currentText, this.currentLanguage);
    }
  }

  /**
   * Workaround for Chromium SpeechSynthesis pause-after-15s bug
   */
  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this.synth.speaking && !this.synth.paused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private setState(state: SpeechState): void {
    this.state = state;
    this.listeners.forEach(l => l.onStateChange?.(state));
  }

  private notifyVoicesChanged(): void {
    this.listeners.forEach(l => l.onVoicesChanged?.(this.voices));
  }

  private notifyError(err: string): void {
    this.listeners.forEach(l => l.onError?.(err));
  }

  private notifyEnd(): void {
    this.listeners.forEach(l => l.onEnd?.());
  }

  public subscribe(listener: VoiceServiceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const voiceService = VoiceService.getInstance();
