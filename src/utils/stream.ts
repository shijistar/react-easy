/**
 * - **EN:** A stream time slicer for splitting audio streams into fixed time segments
 * - **CN:** 一个数据流时间切片器，用于将音频流分成固定时间段
 */
export class StreamTimeSlicerClass implements StreamTimeSlicer {
  timeSlice: number;
  private readonly onSlice: (channels: Float32Array[], sliceDurationMs: number) => void;
  private channelChunks: Float32Array[][] = [];
  private startTs: number | null = null;

  constructor(options: StreamTimeSlicerOptions) {
    this.timeSlice = options.timeSlice;
    this.onSlice = options.onSlice;
  }

  private now() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private shouldEmit(currentTs: number) {
    if (this.startTs == null) return false;
    if (this.timeSlice <= 0) return true;
    return currentTs - this.startTs >= this.timeSlice;
  }

  private emit(force = false) {
    if (this.startTs == null) return;
    const currentTs = this.now();
    if (!force && !this.shouldEmit(currentTs)) return;

    // reset start time
    if (this.channelChunks.length === 0 || this.channelChunks.every((arr) => arr.length === 0)) {
      this.startTs = null;
      for (let i = 0; i < this.channelChunks.length; i++) this.channelChunks[i] = [];
      return;
    }

    // Merge each channel
    const merged: Float32Array[] = this.channelChunks.map((chArr) => {
      const total = chArr.reduce((s, a) => s + a.length, 0);
      const out = new Float32Array(total);
      let offset = 0;
      for (const seg of chArr) {
        out.set(seg, offset);
        offset += seg.length;
      }
      return out;
    });

    const sliceDur = this.startTs != null ? currentTs - this.startTs : 0;
    this.onSlice(merged, sliceDur);

    // Reset start time
    for (let i = 0; i < this.channelChunks.length; i++) this.channelChunks[i] = [];
    this.startTs = null;
  }

  push(channels: Float32Array[]) {
    if (!channels || channels.length === 0) return;
    if (this.startTs == null) this.startTs = this.now();

    while (this.channelChunks.length < channels.length) {
      this.channelChunks.push([]);
    }
    channels.forEach((ch, i) => {
      this.channelChunks[i].push(ch);
    });

    this.emit(false);
    if (this.timeSlice <= 0) this.emit(true); // immediate output mode
  }

  flush() {
    this.emit(true);
  }

  reset() {
    for (let i = 0; i < this.channelChunks.length; i++) this.channelChunks[i] = [];
    this.startTs = null;
  }

  duration() {
    return this.startTs == null ? 0 : this.now() - this.startTs;
  }
}
export interface StreamTimeSlicerOptions {
  /**
   * - **EN:** Duration of each slice (ms)
   * - **CN:** 分片时长(ms)
   */
  timeSlice: number;
  /**
   * - **EN:** Callback when a slice is reached
   * - **CN:** 达到分片时回调
   *
   * @param channels - Multi-channel data, each channel is a Float32Array | 多通道数据，每个通道是一个
   *   Float32Array
   * @param sliceDuration - Duration of the slice (ms) | 分片时长(ms)
   */
  onSlice: (channels: Float32Array[], sliceDuration: number) => void;
}

/**
 * - **EN:** stream time slicer
 * - **CN:** 数据流时间切片器
 */
export interface StreamTimeSlicer {
  /**
   * - **EN:** Duration of each slice (ms)
   * - **CN:** 每个分片的时长（毫秒）
   */
  timeSlice: number;
  /**
   * - **EN:** Push a frame (multi-channel data obtained from the same callback)
   * - **CN:** 推入一帧（同一次回调得到的多通道）
   *
   * @param channels - Multi-channel data, each channel is a Float32Array | 多通道数据，每个通道是一个
   *   Float32Array
   */
  push: (channels: Float32Array[]) => void;
  /**
   * - **EN:** Force output the current accumulation (output even if not enough timeSlice)
   * - **CN:** 强制输出当前累积（不足 timeSlice 也输出）
   */
  flush: () => void;
  /**
   * - **EN:** Clear the cache (do not output)
   * - **CN:** 清空缓存（不输出）
   */
  reset: () => void;
  /**
   * - **EN:** Get the accumulated duration from start to current (ms)
   * - **CN:** 获取从开始到当前已累计的时长(ms)
   */
  duration: () => number;
}
