import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { FFmpegKit } from "ffmpeg-kit-react-native";

export async function exportAudioAsVideo(
  audioPath: string,
  saveToGallery: boolean = false
) {
  try {
    console.log("Starting video export for audio:", audioPath);
    const audioFile = new FileSystem.File(audioPath);
    if (!audioFile.exists) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }


    const imageAsset = Asset.fromModule(
      require("@/assets/images/export-place-holder.png")
    );
    await imageAsset.downloadAsync();

    if (!imageAsset.localUri) {
      throw new Error("Failed to load placeholder image");
    }

    const outputName = `pitch_me_output_video_${Date.now()}.mp4`;
    const outputPath = new FileSystem.File(
      FileSystem.Paths.document,
      outputName
    );

    if (outputPath.exists) {
      outputPath.delete();
    }

    console.log("Input image:", imageAsset.localUri);
    console.log("Input audio:", audioPath);
    console.log("Output path:", outputPath.uri);

    const command = [
      "-loop",
      "1",
      "-i",
      imageAsset.localUri,
      "-i",
      audioPath,
      "-c:v",
      "libx264",
      "-tune",
      "stillimage",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-pix_fmt",
      "yuv420p",
      "-shortest",
      "-y",
      outputPath.uri,
    ].join(" ");

    console.log("Executing FFmpeg command:", command);

    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    const output = await session.getOutput();
    const logs = await session.getAllLogs();

    console.log("FFmpeg return code:", returnCode.getValue());
    console.log("FFmpeg output:", output);

    if (logs && logs.length > 0) {
      console.log(
        "FFmpeg logs:",
        logs.map((log) => log.getMessage()).join("\n")
      );
    }

    if (returnCode.isValueSuccess()) {
      if (outputPath.exists) {
        console.log("Video created successfully at:", outputPath.uri);

        if (saveToGallery) {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              const asset = await MediaLibrary.createAssetAsync(outputPath.uri);
              console.log("Video saved to gallery:", asset.uri);
            } else {
              console.warn(
                "Media library permission not granted, video not saved to gallery"
              );
            }
          } catch (galleryError) {
            console.warn("Failed to save to gallery:", galleryError);
          }
        }

        return outputPath;
      } else {
        throw new Error(
          "FFmpeg reported success but output file was not created"
        );
      }
    } else {
      const errorMessage = `FFmpeg failed with return code: ${returnCode.getValue()}`;
      console.error(errorMessage);
      console.error("FFmpeg output:", output);
      throw new Error(errorMessage);
    }
  } catch (err) {
    console.error("Error exporting video:", err);
    throw err;
  }
}
