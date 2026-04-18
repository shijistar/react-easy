import { useEffect, useRef } from 'react';
import AudioPlayer, { type AudioPlayerInit } from '../utils/AudioPlayer';

/**
 * - **EN:** A hook that provides an instance of the AudioPlayer class for controlling audio playback
 *   without a UI.
 * - **CN:** 提供AudioPlayer一个类实例，用于控制音频播放，无UI展示
 */
const useAudioPlayer = (props?: AudioPlayerInit): AudioPlayer => {
  const ref = useRef<AudioPlayer | null>(null);

  if (!ref.current) {
    ref.current = new AudioPlayer(props);
  }

  useEffect(() => {
    const player = ref.current;

    return () => {
      player?.dispose();
      ref.current = null;
    };
  }, []);

  return ref.current;
};

export default useAudioPlayer;
