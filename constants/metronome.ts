import { setAudioModeAsync } from "expo-audio";

export interface MetronomePlayerInterface {
  playClick: () => Promise<void>;
  playAccent: () => Promise<void>;
}

export interface MetronomeConfig {
  bpm?: number;
  lookahead?: number;
  scheduleAheadTime?: number;
  subdivision?: number;
  timeSignature?: string;
  accentFirstBeat?: boolean;
}

export class Metronome {
  bpm: number;
  lookahead: number; // ms
  scheduleAheadTime: number; // seconds
  subdivision: number;
  timeSignature: string;
  accentFirstBeat: boolean;
  nextNoteTime: number;
  isRunning: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  audioPlayers: MetronomePlayerInterface | null;
  lastScheduleTimestamp: number;
  currentBeat: number;
  beatsPerBar: number;
  onBeatCallback?: (beat: number, isAccent: boolean) => void;

  constructor({
    bpm = 120,
    lookahead = 50,
    scheduleAheadTime = 0.1,
    subdivision = 1,
    timeSignature = "4/4",
    accentFirstBeat = true,
  }: MetronomeConfig = {}) {
    this.bpm = bpm;
    this.lookahead = lookahead;
    this.scheduleAheadTime = scheduleAheadTime;
    this.subdivision = subdivision;
    this.timeSignature = timeSignature;
    this.accentFirstBeat = accentFirstBeat;
    this.nextNoteTime = 0;
    this.isRunning = false;
    this.timer = null;
    this.audioPlayers = null;
    this.lastScheduleTimestamp = 0;
    this.currentBeat = 1;
    this.beatsPerBar = this.parseTimeSignature(timeSignature);
  }

  private parseTimeSignature(timeSignature: string): number {
    const [beats] = timeSignature.split("/");
    return parseInt(beats, 10);
  }

  setAudioPlayers(audioPlayers: MetronomePlayerInterface) {
    this.audioPlayers = audioPlayers;
  }

  async init() {
    if (this.audioPlayers) return;

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      // Audio players will be set externally via setAudioPlayers
      console.log("Metronome initialized, waiting for audio players");
    } catch (error) {
      console.error("Error initializing metronome sounds:", error);
    }
  }

  getIntervalSeconds(): number {
    return 60.0 / this.bpm / this.subdivision;
  }

  async start(bpm = this.bpm, subdivision = this.subdivision) {
    await this.init();
    this.bpm = bpm;
    this.subdivision = subdivision;
    this.beatsPerBar = this.parseTimeSignature(this.timeSignature);
    this.currentBeat = 1;
    this.nextNoteTime = Date.now() / 1000 + 0.05;
    this.isRunning = true;
    this.schedulerLoop();
  }

  async schedulerLoop() {
    if (!this.isRunning) return;

    const now = Date.now() / 1000;
    const intervalSec = this.getIntervalSeconds();

    while (this.nextNoteTime < now + this.scheduleAheadTime) {
      const isFirstBeat = this.currentBeat === 1;
      const shouldAccent = isFirstBeat && this.accentFirstBeat;

      // Play scheduled click
      try {
        if (shouldAccent && this.audioPlayers) {
          await this.audioPlayers.playAccent();
        } else if (this.audioPlayers) {
          await this.audioPlayers.playClick();
        }
      } catch (e) {
        // Ignore play errors
        console.warn("Error playing metronome click:", e);
      }

      // Trigger beat callback
      if (this.onBeatCallback) {
        this.onBeatCallback(this.currentBeat, shouldAccent);
      }

      // Advance to next beat
      this.currentBeat = (this.currentBeat % this.beatsPerBar) + 1;
      this.nextNoteTime += intervalSec;
    }

    this.timer = setTimeout(() => this.schedulerLoop(), this.lookahead);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.currentBeat = 1;
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  setSubdivision(subdivision: number) {
    this.subdivision = subdivision;
  }

  setTimeSignature(timeSignature: string) {
    this.timeSignature = timeSignature;
    this.beatsPerBar = this.parseTimeSignature(timeSignature);
    if (this.currentBeat > this.beatsPerBar) {
      this.currentBeat = 1;
    }
  }

  setAccentFirstBeat(accent: boolean) {
    this.accentFirstBeat = accent;
  }

  setBeatCallback(callback: (beat: number, isAccent: boolean) => void) {
    this.onBeatCallback = callback;
  }

  async unload() {
    this.stop();
    // Audio players are managed externally, just clear the reference
    this.audioPlayers = null;
  }
}

// Legacy exports for backwards compatibility
export const metronomeAssets = {
  click: require("@/assets/notes/C.m4a"),
  accent: require("@/assets/notes/G.m4a"),
};

export default Metronome;
