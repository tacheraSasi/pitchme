import { useAudioPlayer } from "expo-audio";

let currentPlayer: any = null;

export function useGlobalAudioPlayer(source: string | number) {
  // I Handle both URI strings and module references (numbers from require())
  let audioSource: any;

  if (typeof source === "string") {
    // It's a URI string (like from recordings)
    // TODO: Add file existence validation later
    audioSource = { uri: source };
  } else {
    // It's a module reference (number from require(), like from noteAssets)
    audioSource = source;
  }

  const player = useAudioPlayer(audioSource);

  const playExclusive = async () => {
    if (currentPlayer && currentPlayer !== player) {
      currentPlayer.pause();
    }
    currentPlayer = player;
    player.play();
  };

  const pause = async () => {
    player.pause();
    if (currentPlayer === player) currentPlayer = null;
  };

  const stop = async () => {
    player.pause();
    player.seekTo(0)
    if (currentPlayer === player) currentPlayer = null;
  }

  const stopAll  = async ()=>{
    if (currentPlayer) {
      currentPlayer.pause();
      currentPlayer.seekTo(0);
      currentPlayer = null;
    }
  }

  return { player, playExclusive, pause, stop, stopAll };
}
