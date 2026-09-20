import { useEffect, useState } from 'react';
import AudioPlayer, { type AudioPlayerInit } from '../utils/AudioPlayer';

/**
 * - **EN:** A hook that provides an instance of the AudioPlayer class for controlling audio playback
 *   without a UI.
 * - **CN:** 提供AudioPlayer一个类实例，用于控制音频播放，无UI展示
 */
const useAudioPlayer = (props?: AudioPlayerInit): AudioPlayer => {
  // Hold the instance in state rather than a ref: it is handed back to the caller, so it is a render
  // value, and the identity must stay stable. A ref (with its cleanup nulling `ref.current`) made the
  // hook return a *different* player after a re-render under StrictMode, leaking the first instance.
  // https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
  const [player] = useState(() => new AudioPlayer(props));

  useEffect(() => {
    return () => {
      player.dispose();
    };
  }, [player]);

  return player;
};

export default useAudioPlayer;
