import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

export async function exportAudio(
  audioPath: string,
  saveToGallery: boolean = true
) {
  try {
    console.log("Starting audio export for:", audioPath);

    const audioFile = new FileSystem.File(audioPath);
    if (!audioFile.exists) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Share the audio file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(audioPath, {
        mimeType: "audio/m4a",
        dialogTitle: "Share your musical idea",
      });

      // Only try to save to gallery if not in Expo Go
      if (saveToGallery && !Constants.appOwnership) {
        console.warn(
          "Media library access is limited in Expo Go. Skipping gallery save."
        );
      } else if (saveToGallery) {
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            const asset = await MediaLibrary.createAssetAsync(audioPath);
            console.log("Audio saved to gallery:", asset.uri);
          } else {
            console.warn("Media library permission not granted");
          }
        } catch (galleryError) {
          console.warn("Failed to save to gallery:", galleryError);
        }
      }

      return audioFile;
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (err) {
    console.error("Error exporting audio:", err);
    throw err;
  }
}

interface SongExportData {
  title: string;
  key: string;
  bpm: number;
  timeSignature: string;
  description?: string;
  inspiration?: string;
  genre?: string;
  lyrics?: string;
  tags: string[];
  isCompleted: boolean;
  chordProgressions: {
    name: string;
    chords: string[];
    bars: number;
  }[];
  dateCreated: string;
  dateModified: string;
}

/**
 * Format song data as a readable text string
 */
export function formatSongAsText(song: SongExportData): string {
  let content = `${song.title}\n`;
  content += `${"=".repeat(song.title.length)}\n\n`;

  // Musical Info
  content += `Key: ${song.key}\n`;
  content += `BPM: ${song.bpm}\n`;
  content += `Time Signature: ${song.timeSignature}\n`;
  if (song.genre) content += `Genre: ${song.genre}\n`;
  content += `Status: ${song.isCompleted ? "Completed" : "In Progress"}\n`;
  content += `\n`;

  // Tags
  if (song.tags.length > 0) {
    content += `Tags: ${song.tags.join(", ")}\n\n`;
  }

  // Description
  if (song.description) {
    content += `Description\n-----------\n${song.description}\n\n`;
  }

  // Inspiration
  if (song.inspiration) {
    content += `Inspiration\n-----------\n${song.inspiration}\n\n`;
  }

  // Chord Progressions
  if (song.chordProgressions.length > 0) {
    content += `Chord Progressions\n------------------\n`;
    song.chordProgressions.forEach((prog) => {
      content += `${prog.name}: ${prog.chords.join(" - ")} (${prog.bars} bars)\n`;
    });
    content += `\n`;
  }

  // Lyrics
  if (song.lyrics) {
    content += `Lyrics\n------\n${song.lyrics}\n\n`;
  }

  // Dates
  content += `---\n`;
  content += `Created: ${new Date(song.dateCreated).toLocaleDateString()}\n`;
  content += `Modified: ${new Date(song.dateModified).toLocaleDateString()}\n`;

  return content;
}

/**
 * Export song data as a text file and share
 */
export async function exportSong(song: SongExportData): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    const content = formatSongAsText(song);
    const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;

    // Use the new FileSystem.Paths API - cache is already a Directory instance
    const cacheDir = FileSystem.Paths.cache;
    const file = new FileSystem.File(cacheDir, fileName);

    // Write content to file
    await file.write(content);

    await Sharing.shareAsync(file.uri, {
      mimeType: "text/plain",
      dialogTitle: `Share "${song.title}"`,
    });

    return true;
  } catch (err) {
    console.error("Error exporting song:", err);
    throw err;
  }
}

/**
 * Export song data as JSON for backup/import
 */
export async function exportSongAsJSON(song: SongExportData): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    const content = JSON.stringify(song, null, 2);
    const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;

    // Use the new FileSystem.Paths API - cache is already a Directory instance
    const cacheDir = FileSystem.Paths.cache;
    const file = new FileSystem.File(cacheDir, fileName);

    // Write content to file
    await file.write(content);

    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: `Export "${song.title}" Data`,
    });

    return true;
  } catch (err) {
    console.error("Error exporting song as JSON:", err);
    throw err;
  }
}
