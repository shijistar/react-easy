export type AudioSource = string | ReadableStreamDefaultReader<Uint8Array>;

export interface AudioPlayerInit {
  /**
   * - **EN:** Audio source (URL or streaming data)
   * - **CN:** 音频源（URL或流数据）
   */
  source?: AudioSource | (() => AudioSource | Promise<AudioSource>);
  /**
   * - **EN:** Initial volume level (0-1). Default is `0.5`
   * - **CN:** 初始音量级别（0-1）。默认值为`0.5`
   */
  volume?: number;
  /**
   * - **EN:** Callback when audio starts playing
   * - **CN:** 音频开始播放时的回调
   */
  onPlay?: () => void;
  /**
   * - **EN:** Callback when audio is paused
   * - **CN:** 音频暂停时的回调
   */
  onPause?: () => void;
  /**
   * - **EN:** Callback when audio is stopped
   * - **CN:** 音频停止时的回调
   */
  onStop?: () => void;

  /**
   * - **EN:** Callback when audio playback ends
   * - **CN:** 音频播放结束时的回调
   */
  onPlayEnd?: () => void;
  /**
   * - **EN:** Callback when an error occurs
   * - **CN:** 发生错误时的回调
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
}

/**
 * - **EN:** An audio player class that supports URL or streaming data input
 * - **CN:** 一个音频播放器类，支持URL或流数据输入
 */
class AudioPlayer {
  private audio: HTMLAudioElement;
  private volume: number;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private options: AudioPlayerInit | undefined;
  private onPlayEnd: () => void;

  /**
   * - **EN:** Creates an audio player instance
   * - **CN:** 创建音频播放器实例
   *
   * @param source - can be a URL string or ReadableStreamDefaultReader |
   *   可以是URL字符串或ReadableStreamDefaultReader
   */
  constructor(options?: AudioPlayerInit) {
    const { source, volume } = options || {};
    this.options = options;
    this.audio = new Audio();
    this.volume = volume != null ? Math.min(1.0, Math.max(0, volume)) : 0.5; // Default volume 50%
    this.audio.volume = this.volume;
    if (typeof source === 'function') {
      const result = source();
      if (typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
        result.then((data) => this.setAudioSource(data));
      } else {
        this.setAudioSource(result as AudioSource);
      }
    } else {
      this.setAudioSource(source);
    }
    this.onPlayEnd = () => {
      this.options?.onPlayEnd?.();
    };
    this.addEventListener('ended', this.onPlayEnd);
  }

  /**
   * - **EN:** Check if audio is currently playing
   * - **CN:** 检查音频是否正在播放
   */
  public get isPlaying() {
    return this.audioContext?.state === 'running';
  }

  /**
   * - **EN:** Play audio. If previously paused, will resume from the pause position
   * - **CN:** 播放音频 如果之前暂停过，将从暂停位置继续播放
   */
  async play(): Promise<void> {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      await this.audio.play();
      this.options?.onPlay?.();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.options?.onError?.(error);
    }
  }

  /**
   * - **EN:** Set current playback time (in seconds)
   * - **CN:** 设置当前播放时间（以秒为单位）
   *
   * @param time - time in seconds | 时间（秒）
   */
  gotoTime(time: number): void {
    // Ensure time is not less than 0
    const newTime = Math.max(0, time);

    // Ensure time is not greater than duration (if known)
    if (!isNaN(this.audio.duration)) {
      this.audio.currentTime = Math.min(newTime, this.audio.duration);
    } else {
      this.audio.currentTime = newTime;
    }
  }

  /**
   * - **EN:** Set playback position by percentage
   * - **CN:** 按百分比设置播放位置
   *
   * @param percent - percentage (0-1) | 百分比（0-1）
   */
  gotoPercent(percent: number): void {
    if (isNaN(this.audio.duration)) {
      return; // Can't set position if duration is unknown
    }

    // Clamp percent to 0-1 range
    const clampedPercent = Math.min(1, Math.max(0, percent));

    // Calculate time based on percentage
    const newTime = this.audio.duration * clampedPercent;
    this.audio.currentTime = newTime;
  }

  /**
   * - **EN:** Pause audio playback. When played again, will continue from current position
   * - **CN:** 暂停音频播放 再次播放时将从当前位置继续
   */
  pause(): void {
    this.audio.pause();
    this.options?.onPause?.();
  }

  /**
   * - **EN:** Stop audio playback. Progress will reset to the beginning
   * - **CN:** 停止音频播放 进度会重置到开始位置
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.options?.onStop?.();
  }

  /**
   * - **EN:** Update audio source
   * - **CN:** 更新音频源
   *
   * @param source - can be a URL `string` or `ReadableStreamDefaultReader` |
   *   可以是URL字符串或`ReadableStreamDefaultReader`
   */
  async setAudioSource(source?: AudioSource) {
    this.audio.pause();
    this.audio.src = '';

    if (typeof source === 'string') {
      this.audio.src = source;
    } else {
      await this.handleStreamSource(source);
    }
  }

  /**
   * - **EN:** Increase volume (by 10% each time)
   * - **CN:** 增加音量（每次增加10%）
   *
   * @param percent - increase percentage (default 10%) | 增加百分比（默认10%）
   */
  volumeUp(percent = 0.1): void {
    this.volume = Math.min(1.0, this.volume + percent);
    this.updateVolume();
  }

  /**
   * - **EN:** Decrease volume (by 10% each time)
   * - **CN:** 降低音量（每次降低10%）
   *
   * @param percent - decrease percentage (default 10%) | 降低百分比（默认10%）
   */
  volumeDown(percent = 0.1): void {
    this.volume = Math.max(0, this.volume - percent);
    this.updateVolume();
  }

  /**
   * - **EN:** Set volume to a specific value (0-1)
   * - **CN:** 将音量设置为特定值（0-1）
   *
   * @param value - new volume value (0-1) | 新的音量值（0-1）
   */
  setVolume(value: number): void {
    this.volume = Math.min(1.0, Math.max(0, value));
    this.updateVolume();
  }

  /**
   * - **EN:** Get current volume value (0-1)
   * - **CN:** 获取当前音量值(0-1)
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * - **EN:** Get current playback time (seconds)
   * - **CN:** 获取当前播放时间(秒)
   */
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  /**
   * - **EN:** Get total audio duration (seconds)
   * - **CN:** 获取音频总时长(秒)
   */
  getDuration(): number {
    return this.audio.duration;
  }

  /**
   * - **EN:** Add audio event listener
   * - **CN:** 添加音频事件监听器
   */
  addEventListener: HTMLAudioElement['addEventListener'] = (
    event: string,
    listener: EventListenerOrEventListenerObject
  ): void => {
    this.audio.addEventListener(event, listener);
  };

  /**
   * - **EN:** Remove audio event listener
   * - **CN:** 移除音频事件监听器
   */
  removeEventListener: HTMLAudioElement['removeEventListener'] = (
    event: string,
    listener: EventListenerOrEventListenerObject
  ): void => {
    this.audio.removeEventListener(event, listener);
  };

  /**
   * - **EN:** Release resources
   * - **CN:** 释放资源
   */
  dispose(): void {
    this.audio.pause();
    this.audio.src = '';
    this.removeEventListener('ended', this.onPlayEnd);

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }

    this.sourceNode = null;
    this.gainNode = null;
  }

  /** Process streaming data source */
  private async handleStreamSource(reader?: ReadableStreamDefaultReader<Uint8Array>) {
    if (!reader) return;
    try {
      // Create a new ReadableStream to read data from the reader
      const stream = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
            } else {
              controller.enqueue(value);
            }
          } catch (err) {
            controller.error(err);
          }
        },
      });

      // Convert stream to Blob and create URL
      const response = new Response(stream);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      this.audio.src = url;

      // Release Blob URL after audio loads
      this.audio.onload = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error processing audio stream:', error);
    }
  }

  /** Initialize Web Audio API for better volume control */
  private initAudioContext() {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
    this.gainNode = this.audioContext.createGain();

    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.gainNode.gain.value = this.volume;
  }

  /** Update audio playback volume */
  private updateVolume(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    } else {
      this.audio.volume = this.volume;
    }
  }
}

export default AudioPlayer;
