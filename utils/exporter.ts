import { FFmpegKit } from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";

export async function exportAudioAsVideo(audioPath: string, imagePath: string) {
  try {
    // const outputPath = `${FileSystem.cacheDirectory}output_video.mp4`;
    const outputPath = new FileSystem.File(FileSystem.Paths.dirname())

    // Delete if exists
    const info = await FileSystem.getInfoAsync(outputPath);
    if (info.exists) {
      await FileSystem.deleteAsync(outputPath);
    }

    // FFmpeg command
    const command = `
      -loop 1 -i "${imagePath}" -i "${audioPath}" 
      -c:v libx264 -tune stillimage 
      -c:a aac -b:a 192k -pix_fmt yuv420p 
      -shortest "${outputPath}"
    `;

    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (returnCode.isValueSuccess()) {
      console.log(" Video created at:", outputPath);
      return outputPath;
    } else {
      console.error(" FFmpeg failed:", await session.getOutput());
      return null;
    }
  } catch (err) {
    console.error("Error exporting video:", err);
    return null;
  }
}
