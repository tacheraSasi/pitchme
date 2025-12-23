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
    try {
      if (currentPlayer && currentPlayer !== player) {
        try {
          currentPlayer.pause();
        } catch (error) {
          // Player might have been released, just clear the reference
          console.warn("Failed to pause previous player:", error);
        }
        currentPlayer = null;
      }
      currentPlayer = player;
      player.play();
    } catch (error) {
      console.error("Error in playExclusive:", error);
      currentPlayer = null;
      throw error;
    }
  };

  const pause = async () => {
    try {
      player.pause();
      if (currentPlayer === player) currentPlayer = null;
    } catch (error) {
      console.error("Error pausing player:", error);
      if (currentPlayer === player) currentPlayer = null;
    }
  };

  const stop = async () => {
    try {
      player.pause();
      player.seekTo(0);
      if (currentPlayer === player) currentPlayer = null;
    } catch (error) {
      console.error("Error stopping player:", error);
      if (currentPlayer === player) currentPlayer = null;
    }
  };

  const stopAll = async () => {
    try {
      if (currentPlayer) {
        try {
          currentPlayer.pause();
          currentPlayer.seekTo(0);
        } catch (error) {
          // Player might have been released, just clear the reference
          console.warn("Failed to stop current player:", error);
        }
        currentPlayer = null;
      }
    } catch (error) {
      console.error("Error in stopAll:", error);
      currentPlayer = null;
    }
  };

  return { player, playExclusive, pause, stop, stopAll };
}
