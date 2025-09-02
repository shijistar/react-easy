import { useRef } from 'react';
import AudioPlayer, { type AudioPlayerInit } from '../utils/AudioPlayer';

/**
 * - **EN:** A hook that provides an instance of the AudioPlayer class for managing audio playback.
 * - **CN:** 一个提供AudioPlayer类实例的钩子，用于管理音频播放。
 */
const useAudioPlayer = (props?: AudioPlayerInit): AudioPlayer => {
  const ref = useRef<AudioPlayer>(new AudioPlayer(props));
  return ref.current;
};

export default useAudioPlayer;
