import * as FileSystem from "expo-file-system/legacy";
import Pitchfinder from "pitchfinder";

interface FileInfo {
    exists: boolean;
}

interface ReadAsStringOptions {
    encoding: FileSystem.EncodingType;
}

export async function getPcmDataFromWav(uri: string): Promise<Float32Array | null> {
    const { exists }: FileInfo = await FileSystem.getInfoAsync(uri);
    if (!exists) return null;

    const base64: string = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
    } as ReadAsStringOptions);
    const buffer: Buffer = Buffer.from(base64, "base64"); // React Native has Buffer

    // Parse WAV header (assuming standard WAV, mono, 16-bit PCM)
    const dataOffset: number = buffer.readUInt32LE(40) + 44; // 'data' chunk size + header
    const audioData: Buffer = buffer.slice(dataOffset);

    // Convert int16 to Float32Array (-1 to 1 range)
    const float32Array: Float32Array = new Float32Array(audioData.length / 2);
    for (let i: number = 0; i < float32Array.length; i++) {
        float32Array[i] = buffer.readInt16LE(i * 2) / 32768; // Normalize
    }

    return float32Array;
}


export function frequencyToNote(freq: number): string {
  if (!freq || freq <= 0) return "Unknown";

  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const midiNote = 12 * Math.log2(freq / 440) + 69;
  const noteIndex = Math.round(midiNote) % 12;
  const octave = Math.floor(midiNote / 12) - 1;

  return `${notes[noteIndex]}${octave}`;
}

export async function detectPitch(pcmData: Float32Array, sampleRate = 44100): Promise<number | null> {
  const detectPitch = Pitchfinder.YIN({ sampleRate });
  const pitch = detectPitch(pcmData);
  return pitch; // Frequency in Hz, or null if undetectable
}