import { useAudioPlayer } from "expo-audio";

let currentPlayer: any = null;

export function useGlobalAudioPlayer(uri: string) {
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
