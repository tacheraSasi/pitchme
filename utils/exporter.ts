import { FFmpegKit } from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";

const imagePath = require("@/assets/images/export-place-holder.png");

export async function exportAudioAsVideo(audioPath: string) {
  try {
    const outPutName = `pitch_me_output_video_${Date.now()}.mp4`;
    const outputPath = new FileSystem.File(FileSystem.Paths.document, outPutName);

    if (outputPath.exists) {
      outputPath.delete();
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
