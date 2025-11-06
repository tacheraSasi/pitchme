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

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(audioPath, {
        mimeType: "audio/m4a",
        dialogTitle: "Share your musical idea",
      });

      if (saveToGallery) {
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            const asset = await MediaLibrary.createAssetAsync(audioPath);
            console.log("Audio saved to gallery:", asset.uri);
            return audioFile;
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
