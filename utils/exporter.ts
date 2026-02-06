import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SongExportData {
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

export interface BrandingConfig {
  appName?: string;
  accentColor?: string;
  backgroundColor?: string;
  logo?: string; // base64 image data
  headerText?: string;
  footerText?: string;
}

// ============================================================================
// APP BRANDING - Using app's theme colors
// ============================================================================

const APP_COLORS = {
  light: {
    primary: "#965997", // App's tint color
    text: "#11181C",
    background: "#ffffff",
    muted: "#687076",
    border: "#e0e0e0",
    success: "#10b981",
    warning: "#f59e0b",
  },
  dark: {
    primary: "#965997",
    text: "#ECEDEE",
    background: "#151718",
    muted: "#9BA1A6",
    border: "#333333",
    success: "#10b981",
    warning: "#f59e0b",
  },
};

const DEFAULT_BRANDING: BrandingConfig = {
  appName: "PitchMe",
  accentColor: APP_COLORS.light.primary,
  backgroundColor: APP_COLORS.light.background,
  footerText: "Created with PitchMe ♪",
};

// ============================================================================
// AUDIO EXPORT
// ============================================================================

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

// ============================================================================
// PDF GENERATION
// ============================================================================

/**
 * Generate beautiful HTML for PDF with custom branding
 */
function generatePDFHTML(
  song: SongExportData,
  branding?: BrandingConfig
): string {
  const {
    appName = DEFAULT_BRANDING.appName,
    accentColor = DEFAULT_BRANDING.accentColor,
    backgroundColor = DEFAULT_BRANDING.backgroundColor,
    logo = "",
    headerText = "",
    footerText = DEFAULT_BRANDING.footerText,
  } = branding || {};

  const logoHTML = logo
    ? `<img src="${logo}" alt="Logo" style="max-width: 120px; max-height: 60px; margin-bottom: 20px;" />`
    : "";

  const headerHTML = headerText
    ? `<div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 10px;">${headerText}</div>`
    : "";

  // Format chord progressions for display
  const progressionsHTML =
    song.chordProgressions.length > 0
      ? `
    <div style="margin-top: 30px;">
      <h2 style="color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; font-size: 20px; margin-bottom: 20px;">
        Chord Progressions
      </h2>
      ${song.chordProgressions
        .map(
          (prog) => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid ${accentColor}; border-radius: 4px;">
          <div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 8px;">
            ${prog.name}
          </div>
          <div style="font-size: 14px; color: #475569; margin-bottom: 6px;">
            ${prog.chords.join(" → ")}
          </div>
          <div style="font-size: 13px; color: #94a3b8;">
            ${prog.bars} bars
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : "";

  const lyricsHTML = song.lyrics
    ? `
    <div style="margin-top: 30px;">
      <h2 style="color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; font-size: 20px; margin-bottom: 20px;">
        Lyrics
      </h2>
      <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.8; color: #334155; background: #f8fafc; padding: 20px; border-radius: 8px;">
${song.lyrics}
      </div>
    </div>
  `
    : "";

  const descriptionHTML = song.description
    ? `
    <div style="margin-top: 30px;">
      <h2 style="color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; font-size: 20px; margin-bottom: 20px;">
        Description
      </h2>
      <p style="font-size: 15px; line-height: 1.7; color: #475569;">
        ${song.description}
      </p>
    </div>
  `
    : "";

  const inspirationHTML = song.inspiration
    ? `
    <div style="margin-top: 30px;">
      <h2 style="color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; font-size: 20px; margin-bottom: 20px;">
        Inspiration
      </h2>
      <p style="font-size: 15px; line-height: 1.7; color: #475569; font-style: italic;">
        ${song.inspiration}
      </p>
    </div>
  `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      margin: 40px;
      size: A4;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      color: #1e293b;
      background: ${backgroundColor};
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid ${accentColor};
    }
    
    .title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    
    .metadata {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 30px;
      padding: 25px;
      background: linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%);
      border-radius: 12px;
      border: 1px solid ${accentColor}30;
    }
    
    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .metadata-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    
    .metadata-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 20px;
    }
    
    .tag {
      display: inline-block;
      padding: 6px 14px;
      background: ${accentColor};
      color: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      background: ${song.isCompleted ? "#10b981" : "#f59e0b"};
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
    }
    
    .footer-dates {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 15px;
    }
    
    .footer-date {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .footer-date-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
    }
    
    .footer-date-value {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoHTML}
      ${headerHTML}
      <h1 class="title">${song.title}</h1>
      <div class="status-badge">
        ${song.isCompleted ? "✓ Completed" : "⚡ In Progress"}
      </div>
      ${song.tags.length > 0
      ? `
        <div class="tags">
          ${song.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      `
      : ""
    }
    </div>
    
    <div class="metadata">
      <div class="metadata-item">
        <div class="metadata-label">Key</div>
        <div class="metadata-value">${song.key}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Tempo</div>
        <div class="metadata-value">${song.bpm} BPM</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Time Signature</div>
        <div class="metadata-value">${song.timeSignature}</div>
      </div>
      ${song.genre
      ? `
        <div class="metadata-item">
          <div class="metadata-label">Genre</div>
          <div class="metadata-value">${song.genre}</div>
        </div>
      `
      : ""
    }
    </div>
    
    ${descriptionHTML}
    ${inspirationHTML}
    ${progressionsHTML}
    ${lyricsHTML}
    
    <div class="footer">
      <div class="footer-dates">
        <div class="footer-date">
          <div class="footer-date-label">Created</div>
          <div class="footer-date-value">${new Date(song.dateCreated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div class="footer-date">
          <div class="footer-date-label">Last Modified</div>
          <div class="footer-date-value">${new Date(song.dateModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </div>
      <div style="margin-top: 15px;">${footerText}</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Export song as a beautifully formatted PDF with custom branding
 */
export async function exportSongAsPDF(
  song: SongExportData,
  branding?: BrandingConfig
): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    // Generate the HTML content
    const html = generatePDFHTML(song, branding);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    console.log("PDF generated at:", uri);

    // Create a better filename
    const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    // Copy to a shareable location with proper name
    const cacheDir = FileSystem.Paths.cache;
    const finalFile = new FileSystem.File(cacheDir, fileName);
    await FileSystem.copyAsync({ from: uri, to: finalFile.uri });

    // Share the PDF
    await Sharing.shareAsync(finalFile.uri, {
      mimeType: "application/pdf",
      dialogTitle: `Share "${song.title}"`,
    });

    return true;
  } catch (err) {
    console.error("Error exporting song as PDF:", err);
    throw err;
  }
}

// ============================================================================
// TEXT EXPORT (Enhanced)
// ============================================================================

/**
 * Format song data as a beautifully formatted text string
 */
export function formatSongAsText(song: SongExportData): string {
  const width = 60;
  const separator = "═".repeat(width);
  const thinSeparator = "─".repeat(width);

  let content = "";

  // Header with title
  content += separator + "\n";
  content += centerText(song.title.toUpperCase(), width) + "\n";
  content += separator + "\n\n";

  // Status badge
  const status = song.isCompleted ? "✓ COMPLETED" : "⚡ IN PROGRESS";
  content += centerText(status, width) + "\n\n";

  // Musical Information
  content += "MUSICAL DETAILS\n";
  content += thinSeparator + "\n";
  content += `Key:            ${song.key}\n`;
  content += `Tempo:          ${song.bpm} BPM\n`;
  content += `Time Signature: ${song.timeSignature}\n`;
  if (song.genre) content += `Genre:          ${song.genre}\n`;
  content += `\n`;

  // Tags
  if (song.tags.length > 0) {
    content += `Tags: ${song.tags.map((t) => `#${t}`).join(" ")}\n\n`;
  }

  // Description
  if (song.description) {
    content += "DESCRIPTION\n";
    content += thinSeparator + "\n";
    content += wrapText(song.description, width) + "\n\n";
  }

  // Inspiration
  if (song.inspiration) {
    content += "INSPIRATION\n";
    content += thinSeparator + "\n";
    content += wrapText(song.inspiration, width) + "\n\n";
  }

  // Chord Progressions
  if (song.chordProgressions.length > 0) {
    content += "CHORD PROGRESSIONS\n";
    content += thinSeparator + "\n";
    song.chordProgressions.forEach((prog, idx) => {
      content += `${idx + 1}. ${prog.name}\n`;
      content += `   ${prog.chords.join(" → ")}\n`;
      content += `   (${prog.bars} bars)\n\n`;
    });
  }

  // Lyrics
  if (song.lyrics) {
    content += "LYRICS\n";
    content += thinSeparator + "\n";
    content += song.lyrics + "\n\n";
  }

  // Footer with dates
  content += separator + "\n";
  content += `Created:  ${new Date(song.dateCreated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`;
  content += `Modified: ${new Date(song.dateModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`;
  content += separator + "\n";

  return content;
}

// Helper functions for text formatting
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text;
}

function wrapText(text: string, width: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > width) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
}

/**
 * Export song data as a formatted text file and share
 */
export async function exportSong(song: SongExportData): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    const content = formatSongAsText(song);
    const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;

    const cacheDir = FileSystem.Paths.cache;
    const file = new FileSystem.File(cacheDir, fileName);

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

// ============================================================================
// JSON EXPORT (Enhanced)
// ============================================================================

/**
 * Export song data as beautifully formatted JSON for backup/import
 */
export async function exportSongAsJSON(song: SongExportData): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    // Add metadata to JSON export
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      data: song,
    };

    const content = JSON.stringify(exportData, null, 2);
    const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;

    const cacheDir = FileSystem.Paths.cache;
    const file = new FileSystem.File(cacheDir, fileName);

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

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * Export multiple songs at once (useful for backup)
 */
export async function exportMultipleSongs(
  songs: SongExportData[],
  format: "json" | "pdf" | "text" = "json"
): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Sharing is not available on this device");
    }

    if (format === "json") {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        songCount: songs.length,
        songs: songs,
      };

      const content = JSON.stringify(exportData, null, 2);
      const fileName = `songs_backup_${new Date().toISOString().split("T")[0]}.json`;

      const cacheDir = FileSystem.Paths.cache;
      const file = new FileSystem.File(cacheDir, fileName);

      await file.write(content);

      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: `Export ${songs.length} Songs`,
      });

      return true;
    }

    // For PDF/text, we'd need to combine or zip files
    // For now, just export the first song as an example
    throw new Error("Batch PDF/text export not yet implemented");
  } catch (err) {
    console.error("Error batch exporting songs:", err);
    throw err;
  }
}