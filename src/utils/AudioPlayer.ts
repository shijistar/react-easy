export type AudioSource = string | ReadableStreamDefaultReader<Uint8Array> | ArrayBuffer | Uint8Array | Blob;

export interface AudioPlayerInit {
  /**
   * - **EN:** Audio source (URL or streaming data)
   * - **CN:** 音频源（URL或流数据）
   */
  source?: AudioSource | (() => AudioSource | Promise<AudioSource>);
  /**
   * - **EN:** MIME type of the audio (e.g., 'audio/mpeg', 'audio/wav'). Optional.
   * - **CN:** 音频的MIME类型（例如，'audio/mpeg'，'audio/wav'）。可选。
   */
  mimeType?: string;
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
  private _volume: number;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private options: AudioPlayerInit | undefined;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private chunkQueue: Uint8Array[] = [];
  private appending = false;
  private streamEnded = false;
  private stopLoadingSource = false;
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
    this._volume = volume != null ? Math.min(1.0, Math.max(0, volume)) : 0.5; // Default volume 50%
    this.audio.volume = this._volume;
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
    return !this.audio.paused && !this.audio.ended;
  }
  /**
   * - **EN:** Get current playback time (seconds)
   * - **CN:** 获取当前播放时间(秒)
   */
  get currentTime(): number {
    return this.audio.currentTime;
  }
  /**
   * - **EN:** Get total audio duration (seconds)
   * - **CN:** 获取音频总时长(秒)
   */
  get duration(): number {
    return this.audio.duration;
  }
  /**
   * - **EN:** Get current volume value (0-1)
   * - **CN:** 获取当前音量值(0-1)
   */
  get volume(): number {
    return this._volume;
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
   * - **EN:** Seek forward by a certain number of seconds
   * - **CN:** 向前跳转一定秒数
   *
   * @param seconds - number of seconds to seek forward | 要向前跳转的秒数
   */
  seekForward(seconds: number) {
    if (seconds < 0) {
      return;
    }
    if (!isNaN(this.audio.duration)) {
      this.audio.currentTime = Math.min(this.audio.currentTime + seconds, this.audio.duration);
    } else {
      this.audio.currentTime += seconds;
    }
  }
  /**
   * - **EN:** Seek backward by a certain number of seconds
   * - **CN:** 向后跳转一定秒数
   *
   * @param seconds - number of seconds to seek backward | 要向后跳转的秒数
   */
  seekBackward(seconds: number) {
    if (seconds < 0) {
      return;
    }
    this.audio.currentTime = Math.max(this.audio.currentTime - seconds, 0);
  }
  /**
   * - **EN:** Set current playback time (in seconds)
   * - **CN:** 设置当前播放时间（以秒为单位）
   *
   * @param time - time in seconds | 时间（秒）
   */
  seek(time: number) {
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
  async setAudioSource(source?: AudioSource): Promise<{ stopLoading: () => void }> {
    this.audio.pause();
    this.audio.src = '';
    this.disposeMediaSourceInternal();

    if (typeof source === 'string') {
      this.audio.src = source;
      return {
        stopLoading: () => {
          // empty function
        },
      };
    } else {
      return await this.handleStreamSource(source);
    }
  }

  /**
   * - **EN:** Increase volume (by 10% each time)
   * - **CN:** 增加音量（每次增加10%）
   *
   * @param percent - increase percentage (default 10%) | 增加百分比（默认10%）
   */
  volumeUp(percent = 0.1): void {
    this._volume = Math.min(1.0, this._volume + percent);
    this.updateVolume();
  }

  /**
   * - **EN:** Decrease volume (by 10% each time)
   * - **CN:** 降低音量（每次降低10%）
   *
   * @param percent - decrease percentage (default 10%) | 降低百分比（默认10%）
   */
  volumeDown(percent = 0.1): void {
    this._volume = Math.max(0, this._volume - percent);
    this.updateVolume();
  }

  /**
   * - **EN:** Set volume to a specific value (0-1)
   * - **CN:** 将音量设置为特定值（0-1）
   *
   * @param value - new volume value (0-1) | 新的音量值（0-1）
   */
  setVolume(value: number): void {
    this._volume = Math.min(1.0, Math.max(0, value));
    this.updateVolume();
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
  private disposeMediaSourceInternal() {
    this.mediaSource = null;
    this.sourceBuffer = null;
    this.chunkQueue = [];
    this.appending = false;
    this.streamEnded = false;
  }

  /** Process streaming data source /ArrayBuffer/Uint8Array/Blob */
  private async handleStreamSource(
    source: Exclude<AudioSource, string> | undefined
  ): Promise<{ stopLoading: () => void }> {
    const result = {
      stopLoading: () => {
        // empty function
      },
    };
    if (!source) return result;
    try {
      if (source instanceof Blob) {
        const url = URL.createObjectURL(source);
        this.audio.src = url;
        return result;
      } else if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
        const blob = source instanceof Uint8Array ? new Blob([source]) : new Blob([new Uint8Array(source)]);
        const url = URL.createObjectURL(blob);
        this.audio.src = url;
        this.audio.onloadeddata = () => URL.revokeObjectURL(url);
        return result;
      } else {
        // Create a new ReadableStream to read data from the reader
        const mime = this.options?.mimeType || 'audio/mpeg';
        result.stopLoading = () => {
          this.stopLoadingSource = true;
        };
        await this.initMediaSourceForReader(source, mime);
        return result;
      }
    } catch (error) {
      console.error('Error processing audio stream:', error);
      this.options?.onError?.(error);
      throw error;
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

    this.gainNode.gain.value = this._volume;
  }

  /** Update audio playback volume */
  private updateVolume(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = this._volume;
    } else {
      this.audio.volume = this._volume;
    }
  }

  /** Initialize MediaSource and push reader chunks into SourceBuffer */
  private async initMediaSourceForReader(reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) {
    if (typeof MediaSource === 'undefined') {
      console.warn('MediaSource is not supported, falling back to one-time buffering.');
      await this.fallbackReaderToBlob(reader);
      return;
    }
    if (typeof MediaSource !== 'undefined' && !MediaSource.isTypeSupported(mime)) {
      console.warn('MIME type is not supported, falling back to one-time buffering.');
      await this.fallbackReaderToBlob(reader);
      return;
    }

    this.mediaSource = new MediaSource();
    const objectURL = URL.createObjectURL(this.mediaSource);
    this.audio.src = objectURL;
    this.stopLoadingSource = false;

    this.mediaSource.addEventListener('sourceopen', () => {
      if (!this.mediaSource) return;
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mime);

      this.sourceBuffer.addEventListener('updateend', () => {
        this.appending = false;
        this.tryAppendNext();
        this.finalizeMediaSourceIfPossible();
      });

      // Start reading loop
      this.readLoop(reader);
    });
  }

  /** Loop to read data from the reader */
  private async readLoop(reader: ReadableStreamDefaultReader<Uint8Array>) {
    try {
      // Auto play (optional)
      if (this.audio.paused) {
        void this.play();
      }
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done || this.stopLoadingSource) {
          this.streamEnded = true;
          break;
        }
        if (value && value.byteLength) {
          this.chunkQueue.push(value);
          this.tryAppendNext();
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      // Try to finalize after the loop exits (including 0 chunk case)
      this.finalizeMediaSourceIfPossible();
    } catch (e) {
      console.error('Error reading stream:', e);
      this.options?.onError?.(e);
    }
  }

  /** Try to append the next chunk from the queue to the SourceBuffer */
  private tryAppendNext() {
    if (!this.sourceBuffer || this.appending) return;
    if (!this.chunkQueue.length) return;

    const chunk = this.chunkQueue.shift()!;
    this.appending = true;
    try {
      this.sourceBuffer.appendBuffer(chunk);
    } catch (e) {
      console.error('Error appending buffer:', e);
      this.appending = false;
      this.options?.onError?.(e);
      this.finalizeMediaSourceIfPossible();
    }
  }

  /** Finalize MediaSource if possible (stream ended, no pending chunks, and not updating) */
  private finalizeMediaSourceIfPossible(receivedAnyChunk = true) {
    if (
      this.mediaSource &&
      this.mediaSource.readyState === 'open' &&
      this.streamEnded &&
      !this.sourceBuffer?.updating &&
      this.chunkQueue.length === 0
    ) {
      try {
        this.mediaSource.endOfStream();
      } catch (e) {
        console.warn('endOfStream error:', e);
      }
    }
  }

  /** Fallback to one-time Blob synthesis when streaming is not supported */
  private async fallbackReaderToBlob(reader: ReadableStreamDefaultReader<Uint8Array>) {
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
    this.audio.onloadeddata = () => URL.revokeObjectURL(url);
  }
}

export default AudioPlayer;
