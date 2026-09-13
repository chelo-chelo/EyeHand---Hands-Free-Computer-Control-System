// ============================================================================
// Voice Command Controller: Web Speech API with Strict Whitelisted Grammar
// ============================================================================

export interface VoiceCommandMatch {
  rawTranscript: string;
  command: string;
  action: string;
  confidence: number;
}

export type VoiceListener = (match: VoiceCommandMatch) => void;

// Whitelisted voice command patterns
export const VOICE_COMMANDS = [
  { phrase: 'click', action: 'LEFT_CLICK', desc: 'Triggers left click' },
  { phrase: 'right click', action: 'RIGHT_CLICK', desc: 'Triggers right click' },
  { phrase: 'double click', action: 'DOUBLE_CLICK', desc: 'Triggers double click' },
  { phrase: 'scroll down', action: 'SCROLL_DOWN', desc: 'Scrolls page down' },
  { phrase: 'scroll up', action: 'SCROLL_UP', desc: 'Scrolls page up' },
  { phrase: 'pause control', action: 'PAUSE', desc: 'Pauses computer control' },
  { phrase: 'resume control', action: 'RESUME', desc: 'Resumes computer control' },
  { phrase: 'press enter', action: 'ENTER', desc: 'Presses Enter key' },
  { phrase: 'go back', action: 'ESCAPE', desc: 'Presses Escape or back' },
  { phrase: 'open browser', action: 'APP_BROWSER', desc: 'Opens default web browser' },
  { phrase: 'open explorer', action: 'APP_EXPLORER', desc: 'Opens Windows File Explorer' },
  { phrase: 'open calculator', action: 'APP_CALCULATOR', desc: 'Opens Calculator' },
  { phrase: 'open settings', action: 'APP_SETTINGS', desc: 'Opens System Settings' },
];

export class VoiceController {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private listeners: Set<VoiceListener> = new Set();
  private lastTranscript: string = '';

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.trim().toLowerCase();
        const confidence = event.results[current][0].confidence || 0.9;
        this.lastTranscript = transcript;
        this.processTranscript(transcript, confidence);
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('[Voice] Recognition error:', event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {}
        }
      };
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getLastTranscript(): string {
    return this.lastTranscript;
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public start() {
    if (!this.isSupported || !this.recognition || this.isListening) return;
    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      console.warn('[Voice] Start error:', e);
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) return;
    this.isListening = false;
    try {
      this.recognition.stop();
    } catch {}
  }

  private processTranscript(transcript: string, confidence: number) {
    for (const cmd of VOICE_COMMANDS) {
      if (transcript.includes(cmd.phrase)) {
        const match: VoiceCommandMatch = {
          rawTranscript: transcript,
          command: cmd.phrase,
          action: cmd.action,
          confidence,
        };
        this.listeners.forEach((l) => l(match));
        return;
      }
    }

    // Check "type [text]" syntax
    if (transcript.startsWith('type ')) {
      const textToType = transcript.substring(5);
      const match: VoiceCommandMatch = {
        rawTranscript: transcript,
        command: 'type',
        action: 'TYPE_TEXT',
        confidence,
      };
      this.listeners.forEach((l) => l({ ...match, rawTranscript: textToType }));
    }
  }
}

export const voiceController = new VoiceController();
