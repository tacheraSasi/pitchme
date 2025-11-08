import { useAudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system";

let currentPlayer: any = null;

export function useGlobalAudioPlayer(uri: string) {
  const audioFile = new FileSystem.File(uri);
  if (!audioFile) throw new Error("Invalid audio file"); //TODO: i will handle such errors better

  if (!audioFile.exists) throw new Error("Audio file does not exist");

  const player = useAudioPlayer({ uri });

  const playExclusive = async () => {
    if (currentPlayer && currentPlayer !== player) {
      currentPlayer.pause();
    }
    currentPlayer = player;
    await player.play();
  };

  const pause = async () => {
    await player.pause();
    if (currentPlayer === player) currentPlayer = null;
  };

  return { player, playExclusive, pause };
}
