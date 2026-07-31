import { describe, expect, it, vi } from 'vitest';
import { StreamTimeSlicerClass } from '../../src/utils/stream';

describe('StreamTimeSlicerClass', () => {
  it('emits merged channels when the time threshold is reached', () => {
    let currentTs = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTs);
    const onSlice = vi.fn();
    const slicer = new StreamTimeSlicerClass({
      sliceMode: 'time',
      value: 100,
      onSlice,
    });

    slicer.push([new Float32Array([1]), new Float32Array([4])]);
    expect(onSlice).not.toHaveBeenCalled();
    expect(slicer.duration()).toBe(0);

    currentTs = 120;
    slicer.push([new Float32Array([2, 3]), new Float32Array([5])]);

    expect(onSlice).toHaveBeenCalledTimes(1);
    const [channels, duration] = onSlice.mock.calls[0] as [Float32Array[], number];
    expect(Array.from(channels[0])).toEqual([1, 2, 3]);
    expect(Array.from(channels[1])).toEqual([4, 5]);
    expect(duration).toBe(120);
    expect(slicer.duration()).toBe(0);
  });

  it('supports size mode, flush, and reset', () => {
    let currentTs = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTs);
    const onSlice = vi.fn();
    const slicer = new StreamTimeSlicerClass({
      sliceMode: 'size',
      value: 2,
      onSlice,
    });

    expect((slicer as unknown as { shouldEmit: (currentTs: number) => boolean }).shouldEmit(0)).toBe(false);

    slicer.push([new Float32Array([1])]);
    expect(onSlice).not.toHaveBeenCalled();

    currentTs = 10;
    slicer.push([new Float32Array([2])]);
    expect(onSlice).toHaveBeenCalledTimes(1);

    currentTs = 20;
    slicer.push([new Float32Array([3, 4])]);
    expect(slicer.duration()).toBe(0);

    currentTs = 40;
    slicer.push([new Float32Array([5])]);
    expect(slicer.duration()).toBe(0);

    currentTs = 55;
    slicer.push([new Float32Array([6])]);
    expect(slicer.duration()).toBe(0);

    currentTs = 70;
    slicer.push([new Float32Array([7])]);
    expect(onSlice).toHaveBeenCalledTimes(3);

    currentTs = 80;
    slicer.push([new Float32Array([8])]);
    expect(slicer.duration()).toBe(0);

    currentTs = 90;
    slicer.flush();
    expect(onSlice).toHaveBeenCalledTimes(4);

    currentTs = 100;
    slicer.push([new Float32Array([9])]);
    expect(slicer.duration()).toBe(0);

    slicer.reset();
    expect(slicer.duration()).toBe(0);

    slicer.flush();
    expect(onSlice).toHaveBeenCalledTimes(4);
  });

  it('ignores empty pushes and emits immediately when value is not positive', () => {
    let currentTs = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTs);
    const onSlice = vi.fn();
    const slicer = new StreamTimeSlicerClass({
      sliceMode: 'time',
      value: 0,
      onSlice,
    });

    slicer.push([]);
    expect(onSlice).not.toHaveBeenCalled();

    currentTs = 5;
    slicer.push([new Float32Array([1, 2])]);
    expect(onSlice).toHaveBeenCalledTimes(1);
    expect(slicer.duration()).toBe(0);

    slicer.flush();
    expect(onSlice).toHaveBeenCalledTimes(1);
  });

  it('clears an empty internal cache without emitting when flush is forced', () => {
    let currentTs = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => currentTs);
    const onSlice = vi.fn();
    const slicer = new StreamTimeSlicerClass({
      sliceMode: 'time',
      value: 10,
      onSlice,
    });

    (slicer as unknown as { startTs: number | null; channelChunks: Float32Array[][] }).startTs = 0;
    (slicer as unknown as { startTs: number | null; channelChunks: Float32Array[][] }).channelChunks = [[]];
    currentTs = 20;

    slicer.flush();

    expect(onSlice).not.toHaveBeenCalled();
    expect(slicer.duration()).toBe(0);
  });

  it('falls back to Date.now when performance is unavailable', () => {
    const originalPerformance = globalThis.performance;
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234);
    vi.stubGlobal('performance', undefined);

    const slicer = new StreamTimeSlicerClass({
      sliceMode: 'time',
      value: 1,
      onSlice: vi.fn(),
    });

    expect((slicer as unknown as { now: () => number }).now()).toBe(1234);

    vi.stubGlobal('performance', originalPerformance);
    dateNowSpy.mockRestore();
  });
});
