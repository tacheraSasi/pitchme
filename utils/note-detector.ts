import { PitchMeBuffer } from "@/utils/buffer";
import * as FileSystem from "expo-file-system/legacy";
import Pitchfinder from "pitchfinder";

interface FileInfo {
  exists: boolean;
}

interface ReadAsStringOptions {
  encoding: FileSystem.EncodingType;
}

export async function getPcmDataFromWav(
  uri: string
): Promise<Float32Array | null> {
  try {
    const { exists }: FileInfo = await FileSystem.getInfoAsync(uri);
    if (!exists) {
      console.error("Audio file does not exist:", uri);
      return null;
    }

    console.log("Reading audio file:", uri);
    const base64: string = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    } as ReadAsStringOptions);

    const buffer: PitchMeBuffer = PitchMeBuffer.from(base64, "base64");
    console.log("Audio file size:", buffer.length, "bytes");

    if (buffer.length < 44) {
      console.error("File too small to be a valid WAV");
      return null;
    }

    // Parse WAV header (assuming standard WAV, mono, 16-bit PCM)
    const dataOffset: number = buffer.readUInt32LE(40) + 44; // 'data' chunk size + header
    const audioData: PitchMeBuffer = buffer.slice(dataOffset);

    console.log(
      "Data offset:",
      dataOffset,
      "Audio data length:",
      audioData.length
    );

    // Convert int16 to Float32Array (-1 to 1 range)
    const sampleCount = Math.floor(audioData.length / 2);
    const float32Array: Float32Array = new Float32Array(sampleCount);

    for (let i: number = 0; i < sampleCount; i++) {
      if (i * 2 + 1 < audioData.length) {
        float32Array[i] = audioData.readInt16LE(i * 2) / 32768; // Normalize
      }
    }

    console.log("PCM data extracted:", float32Array.length, "samples");

    // Check audio amplitude
    const maxValue = Math.max(...Array.from(float32Array).map(Math.abs));
    const rms = Math.sqrt(
      float32Array.reduce((sum, val) => sum + val * val, 0) /
        float32Array.length
    );

    console.log(
      `Audio stats - Max amplitude: ${maxValue.toFixed(4)}, RMS: ${rms.toFixed(
        4
      )}`
    );

    if (maxValue < 0.001) {
      console.warn("Audio appears to be silent or very quiet");
      return null;
    }

    return float32Array;
  } catch (error) {
    console.error("Error processing WAV file:", error);
    return null;
  }
}

export function frequencyToNote(freq: number | null): string {
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

export async function detectPitch(
  pcmData: Float32Array,
  sampleRate = 44100
): Promise<number | null> {
  try {
    // Validate input data
    if (!pcmData || pcmData.length === 0) {
      console.warn("No PCM data provided for pitch detection");
      return null;
    }

    console.log(`Analyzing ${pcmData.length} samples at ${sampleRate}Hz`);

    // Use YIN algorithm from Pitchfinder
    const detectPitch = Pitchfinder.YIN({
      sampleRate,
      threshold: 0.1,
      probabilityThreshold: 0.1,
    });

    let pitch = detectPitch(pcmData);

    // If YIN fails, try autocorrelation as fallback
    if (!pitch || pitch <= 0) {
      console.log("YIN failed, trying autocorrelation fallback");
      pitch = autocorrelateDetection(pcmData, sampleRate);
    }

    console.log(`Detected pitch: ${pitch} Hz`);
    return pitch && pitch > 0 ? pitch : null;
  } catch (error) {
    console.error("Error in pitch detection:", error);
    return null;
  }
}

// Fallback autocorrelation implementation
function autocorrelateDetection(
  buf: Float32Array,
  sampleRate: number
): number | null {
  const SIZE = buf.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  // Calculate RMS for silence detection
  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If too quiet, return null
  if (rms < 0.01) {
    console.log("Audio too quiet for pitch detection");
    return null;
  }

  let lastCorrelation = 1;
  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buf[i] - buf[i + offset]);
    }

    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01 && bestOffset > 0) {
    const frequency = sampleRate / bestOffset;
    // Filter out unreasonable frequencies
    if (frequency >= 80 && frequency <= 2000) {
      return frequency;
    }
  }

  return null;
}
