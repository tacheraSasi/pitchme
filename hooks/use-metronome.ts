import { Metronome, MetronomePlayerInterface } from "@/utils/metronome";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalAudioPlayer } from "./use-global-audio-player";

export interface MetronomeOptions {
  bpm: number;
  timeSignature?: string;
  volume?: number;
  accentFirstBeat?: boolean;
}

export function useMetronome(options: MetronomeOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const metronomeRef = useRef<Metronome | null>(null);

  // Audio players for metronome sounds
  const clickPlayer = useGlobalAudioPlayer(require("@/assets/notes/C.m4a"));
  const accentPlayer = useGlobalAudioPlayer(require("@/assets/notes/G.m4a"));

  // Initializing metronome instance
  useEffect(() => {
    if (!metronomeRef.current) {
      metronomeRef.current = new Metronome({
        bpm: options.bpm,
        timeSignature: options.timeSignature || "4/4",
        accentFirstBeat: options.accentFirstBeat !== false,
      });

      // Create audio player interface
      const audioPlayers: MetronomePlayerInterface = {
        playClick: async () => {
          clickPlayer.playExclusive();
        },
        playAccent: async () => {
          accentPlayer.playExclusive();
        },
      };

      // Set audio players
      metronomeRef.current.setAudioPlayers(audioPlayers);

      // Set beat callback to update UI
      metronomeRef.current.setBeatCallback(
        (beat: number, isAccent: boolean) => {
          setCurrentBeat(beat);
        }
      );
    }

    return () => {
      if (metronomeRef.current) {
        metronomeRef.current.unload();
        metronomeRef.current = null;
      }
    };
  }, [
    options.bpm,
    options.timeSignature,
    options.accentFirstBeat,
    clickPlayer,
    accentPlayer,
  ]);

  // Update metronome settings when options change
  useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.setBpm(options.bpm);
      metronomeRef.current.setTimeSignature(options.timeSignature || "4/4");
      metronomeRef.current.setAccentFirstBeat(
        options.accentFirstBeat !== false
      );
    }
  }, [options.bpm, options.timeSignature, options.accentFirstBeat]);

  // Parse time signature to get beats per bar
  const getBeatsPerBar = useCallback(() => {
    const timeSignature = options.timeSignature || "4/4";
    const [beats] = timeSignature.split("/");
    return parseInt(beats, 10);
  }, [options.timeSignature]);

  // Start metronome
  const start = useCallback(async () => {
    if (!metronomeRef.current || isPlaying) return;

    try {
      await metronomeRef.current.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error starting metronome:", error);
    }
  }, [isPlaying]);

  // Stop metronome
  const stop = useCallback(() => {
    if (!metronomeRef.current || !isPlaying) return;

    metronomeRef.current.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
  }, [isPlaying]);

  // Toggle metronome
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Update playing state when metronome settings change
  useEffect(() => {
    if (isPlaying && metronomeRef.current) {
      // Restart with new settings
      metronomeRef.current.stop();
      setTimeout(() => {
        if (metronomeRef.current && isPlaying) {
          metronomeRef.current.start();
        }
      }, 100);
    }
  }, [options.bpm, options.timeSignature, isPlaying]);

  return {
    isPlaying,
    currentBeat,
    start,
    stop,
    toggle,
    beatsPerBar: getBeatsPerBar(),
  };
}
