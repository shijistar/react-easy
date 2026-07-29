import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudioPlayer from '../../src/utils/AudioPlayer';

type MockAudio = ReturnType<typeof createMockAudio>;

let mockAudio: MockAudio;

beforeEach(() => {
  mockAudio = createMockAudio();
  class MockAudioConstructor {
    constructor() {
      return mockAudio as unknown as HTMLAudioElement;
    }
  }
  vi.stubGlobal('Audio', MockAudioConstructor);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AudioPlayer', () => {

  it('handles synchronous source factories and exposes playback getters', () => {
    const player = new AudioPlayer({ source: () => 'sync.mp3' });

    expect(mockAudio.src).toBe('sync.mp3');
    expect(player.duration).toBe(mockAudio.duration);
    expect(player.isPlaying).toBe(false);

    mockAudio.paused = false;
    mockAudio.ended = false;
    expect(player.isPlaying).toBe(true);

    mockAudio.ended = true;
    expect(player.isPlaying).toBe(false);
  });
  it('initializes from async source functions, clamps volume, and forwards ended events', async () => {
    const onPlayEnd = vi.fn();
    const source = vi.fn(async () => 'https://example.com/audio.mp3');

    const player = new AudioPlayer({
      source,
      volume: 2,
      crossOrigin: 'anonymous',
      onPlayEnd,
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(source).toHaveBeenCalledTimes(1);
    expect(mockAudio.src).toBe('https://example.com/audio.mp3');
    expect(mockAudio.crossOrigin).toBe('anonymous');
    expect(player.volume).toBe(1);
    expect(mockAudio.volume).toBe(1);

    mockAudio.dispatch('ended');
    expect(onPlayEnd).toHaveBeenCalledTimes(1);
  });

  it('plays, resumes suspended audio contexts, pauses, stops, and updates volume', async () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();
    const { MockAudioContext, instances, gainNode, sourceNode } = createAudioContextHarness('suspended');
    vi.stubGlobal('AudioContext', MockAudioContext);

    const player = new AudioPlayer({ source: 'demo.mp3', volume: 0.4, onPlay, onPause, onStop });
    mockAudio.duration = 15;
    mockAudio.currentTime = 3;

    await player.play();
    expect(instances).toHaveLength(1);
    expect(instances[0].resume).toHaveBeenCalledTimes(1);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(sourceNode.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(instances[0].destination);
    expect(gainNode.gain.value).toBe(0.4);

    player.seekForward(20);
    expect(player.currentTime).toBe(15);
    player.seekBackward(5);
    expect(player.currentTime).toBe(10);
    player.seek(-2);
    expect(player.currentTime).toBe(0);

    mockAudio.duration = Number.NaN;
    mockAudio.currentTime = 1;
    player.seekForward(-1);
    expect(player.currentTime).toBe(1);
    player.seekForward(2);
    expect(player.currentTime).toBe(3);
    player.seekBackward(-1);
    expect(player.currentTime).toBe(3);
    player.seek(4);
    expect(player.currentTime).toBe(4);

    player.setVolume(0.8);
    expect(player.volume).toBe(0.8);
    expect(gainNode.gain.value).toBe(0.8);
    player.volumeUp(0.5);
    expect(player.volume).toBe(1);
    player.volumeDown(0.3);
    expect(player.volume).toBe(0.7);

    player.pause();
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(onPause).toHaveBeenCalledTimes(1);

    mockAudio.currentTime = 12;
    player.stop();
    expect(mockAudio.currentTime).toBe(0);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('handles play failures and dispose close failures', async () => {
    const onError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { MockAudioContext, instances } = createAudioContextHarness('running', () => {
      throw new Error('close failed');
    });
    vi.stubGlobal('AudioContext', MockAudioContext);
    mockAudio.play.mockRejectedValueOnce(new Error('play failed'));

    const player = new AudioPlayer({ source: 'demo.mp3', onError });
    await player.play();

    expect(onError).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Error playing audio:', expect.any(Error));

    await player.play();
    player.dispose();

    expect(instances[0].close).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('Error closing AudioContext:', expect.any(Error));
    expect(mockAudio.removeEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
  });

  it('handles string, blob, array buffer, and Uint8Array sources', async () => {
    const player = new AudioPlayer();
    player.setVolume(0.25);
    expect(mockAudio.volume).toBe(0.25);

    const stringResult = await player.setAudioSource('plain.mp3');
    stringResult.stopLoading();
    expect(mockAudio.src).toBe('plain.mp3');

    const blob = new Blob([Uint8Array.from([1, 2, 3])], { type: 'audio/mpeg' });
    await player.setAudioSource(blob);
    expect(mockAudio.src).toBe('blob:mock-url');

    await player.setAudioSource(Uint8Array.from([4, 5, 6]));
    expect(mockAudio.src).toBe('blob:mock-url');
    mockAudio.onloadeddata?.(new Event('loadeddata'));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    await player.setAudioSource(Uint8Array.from([7, 8]).buffer);
    expect(mockAudio.src).toBe('blob:mock-url');
  });

  it('falls back to one-time buffering when MediaSource is unavailable or mime is unsupported', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const player = new AudioPlayer();

    vi.stubGlobal('MediaSource', undefined);
    await (player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }).initMediaSourceForReader(
      createReaderFromChunks(['a']),
      'audio/mpeg',
    );
    expect(mockAudio.src).toBe('blob:mock-url');
    expect(warnSpy).toHaveBeenCalledWith('MediaSource is not supported, falling back to one-time buffering.');

    const { MockMediaSource } = createMediaSourceHarness();
    vi.stubGlobal('MediaSource', MockMediaSource);
    MockMediaSource.isTypeSupported.mockReturnValue(false);
    await (player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }).initMediaSourceForReader(
      createReaderFromChunks(['b']),
      'audio/ogg',
    );
    expect(warnSpy).toHaveBeenCalledWith('MIME type is not supported, falling back to one-time buffering.');
  });

  it('initializes MediaSource readers, auto-plays paused audio, appends chunks, and finalizes streams', async () => {
    vi.useFakeTimers();
    const { MockMediaSource, mediaSource, sourceBuffer } = createMediaSourceHarness();
    vi.stubGlobal('MediaSource', MockMediaSource);

    const player = new AudioPlayer();
    const playSpy = vi.spyOn(player, 'play').mockResolvedValue(undefined);
    const reader = createReaderFromChunks(['hi']);

    await (player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }).initMediaSourceForReader(
      reader,
      'audio/mpeg',
    );

    mediaSource.dispatchEvent(new Event('sourceopen'));
    await vi.runAllTimersAsync();

    expect(mockAudio.src).toBe('blob:mock-url');
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(sourceBuffer.appendBuffer).toHaveBeenCalledTimes(1);

    sourceBuffer.dispatch('updateend');
    expect(mediaSource.endOfStream).toHaveBeenCalled();
  });

  it('reports reader and appendBuffer errors', async () => {
    vi.useFakeTimers();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onError = vi.fn();
    const { MockMediaSource, mediaSource, sourceBuffer } = createMediaSourceHarness();
    vi.stubGlobal('MediaSource', MockMediaSource);

    const player = new AudioPlayer({ onError });
    mockAudio.paused = false;
    sourceBuffer.appendBuffer.mockImplementationOnce(() => {
      throw new Error('append failed');
    });

    await (player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }).initMediaSourceForReader(
      createReaderFromChunks(['z']),
      'audio/mpeg',
    );
    mediaSource.dispatchEvent(new Event('sourceopen'));
    await vi.runAllTimersAsync();

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleError).toHaveBeenCalledWith('Error appending buffer:', expect.any(Error));

    const failingReader = {
      read: vi.fn(async () => {
        throw new Error('read failed');
      }),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>;
    vi.spyOn(player, 'play').mockResolvedValue(undefined);

    await (player as unknown as { readLoop: (reader: ReadableStreamDefaultReader<Uint8Array>) => Promise<void> }).readLoop(failingReader);
    expect(consoleError).toHaveBeenCalledWith('Error reading stream:', expect.any(Error));
  });

  it('exposes stopLoading handles for reader-backed sources and handles empty sources', async () => {
    const player = new AudioPlayer();
    const reader = createReaderFromChunks(['x']);
    const initSpy = vi
      .spyOn(player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }, 'initMediaSourceForReader')
      .mockResolvedValue(undefined);

    const emptyResult = await (player as unknown as { handleStreamSource: (source?: unknown) => Promise<{ stopLoading: () => void }> }).handleStreamSource(undefined);
    emptyResult.stopLoading();
    expect(mockAudio.src).toBe('');

    const result = await player.setAudioSource(reader);
    result.stopLoading();

    expect(initSpy).toHaveBeenCalledWith(reader, 'audio/mpeg');
    expect((player as unknown as { stopLoadingSource: boolean }).stopLoadingSource).toBe(true);
  });

  it('surfaces handleStreamSource and fallbackReaderToBlob failures', async () => {
    const onError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const player = new AudioPlayer({ onError });

    vi.mocked(URL.createObjectURL).mockImplementationOnce(() => {
      throw new Error('blob url failed');
    });
    await expect(player.setAudioSource(new Blob([Uint8Array.from([1])]))).rejects.toThrow('blob url failed');
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleError).toHaveBeenCalledWith('Error processing audio stream:', expect.any(Error));

    const failingReader = {
      read: vi.fn(async () => {
        throw new Error('blob read failed');
      }),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>;

    await expect(
      (player as unknown as { fallbackReaderToBlob: (reader: ReadableStreamDefaultReader<Uint8Array>) => Promise<void> }).fallbackReaderToBlob(
        failingReader,
      ),
    ).rejects.toThrow('blob read failed');
  });

  it('warns when endOfStream throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const player = new AudioPlayer();

    (player as unknown as { mediaSource: { readyState: string; endOfStream: () => void } | null }).mediaSource = {
      readyState: 'open',
      endOfStream: () => {
        throw new Error('end failed');
      },
    };
    (player as unknown as { sourceBuffer: { updating: boolean } | null }).sourceBuffer = { updating: false };
    (player as unknown as { streamEnded: boolean; chunkQueue: Uint8Array[] }).streamEnded = true;
    (player as unknown as { streamEnded: boolean; chunkQueue: Uint8Array[] }).chunkQueue = [];

    (player as unknown as { finalizeMediaSourceIfPossible: () => void }).finalizeMediaSourceIfPossible();
    expect(warnSpy).toHaveBeenCalledWith('endOfStream error:', expect.any(Error));
  });

  it('handles cleared mediaSource state and zero-byte reader chunks', async () => {
    vi.useFakeTimers();
    const { MockMediaSource, mediaSource } = createMediaSourceHarness();
    vi.stubGlobal('MediaSource', MockMediaSource);
    const player = new AudioPlayer();

    await (player as unknown as { initMediaSourceForReader: (reader: ReadableStreamDefaultReader<Uint8Array>, mime: string) => Promise<void> }).initMediaSourceForReader(
      createReaderFromChunks([]),
      'audio/mpeg',
    );
    (player as unknown as { mediaSource: MediaSource | null }).mediaSource = null;
    mediaSource.dispatchEvent(new Event('sourceopen'));

    mockAudio.paused = false;
    (player as unknown as { sourceBuffer: { appendBuffer: (chunk: BufferSource) => void } | null }).sourceBuffer = {
      appendBuffer: vi.fn(),
    } as unknown as { appendBuffer: (chunk: BufferSource) => void };
    const readLoopPromise = (player as unknown as { readLoop: (reader: ReadableStreamDefaultReader<Uint8Array>) => Promise<void> }).readLoop({
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new Uint8Array(0) })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>);
    await vi.runAllTimersAsync();
    await readLoopPromise;

    expect(
      ((player as unknown as { sourceBuffer: { appendBuffer: ReturnType<typeof vi.fn> } | null }).sourceBuffer?.appendBuffer as ReturnType<typeof vi.fn>).mock
        .calls.length,
    ).toBe(0);

    (player as unknown as { sourceBuffer: null; appending: boolean; chunkQueue: Uint8Array[] }).sourceBuffer = null;
    (player as unknown as { sourceBuffer: null; appending: boolean; chunkQueue: Uint8Array[] }).appending = true;
    (player as unknown as { sourceBuffer: null; appending: boolean; chunkQueue: Uint8Array[] }).chunkQueue = [];
    expect(() => (player as unknown as { tryAppendNext: () => void }).tryAppendNext()).not.toThrow();
  });
});

function createMockAudio() {
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  const audio = {
    paused: true,
    ended: false,
    currentTime: 0,
    duration: Number.NaN,
    volume: 0,
    src: '',
    crossOrigin: null as string | null,
    onloadeddata: undefined as undefined | ((event: Event) => void),
    play: vi.fn(async () => {
      audio.paused = false;
    }),
    pause: vi.fn(() => {
      audio.paused = true;
    }),
    addEventListener: vi.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      const bucket = listeners.get(event) ?? new Set<EventListenerOrEventListenerObject>();
      bucket.add(listener);
      listeners.set(event, bucket);
    }),
    removeEventListener: vi.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      listeners.get(event)?.delete(listener);
    }),
    dispatch(event: string) {
      listeners.get(event)?.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(new Event(event));
        } else {
          listener.handleEvent(new Event(event));
        }
      });
    },
  };

  return audio;
}

function createAudioContextHarness(state: 'running' | 'suspended', closeImpl?: () => void) {
  const gainNode = {
    gain: { value: 0 },
    connect: vi.fn(),
  };
  const sourceNode = {
    connect: vi.fn(),
  };
  const instances: Array<{
    state: 'running' | 'suspended';
    destination: object;
    resume: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    createMediaElementSource: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
  }> = [];

  class MockAudioContext {
    state = state;
    destination = {};
    resume = vi.fn(async () => {
      this.state = 'running';
    });
    close = vi.fn(() => closeImpl?.());
    createMediaElementSource = vi.fn(() => sourceNode);
    createGain = vi.fn(() => gainNode);

    constructor() {
      instances.push(this);
    }
  }

  return { MockAudioContext, instances, gainNode, sourceNode };
}

function createMediaSourceHarness() {
  const listeners = new Map<string, () => void>();
  const sourceBufferListeners = new Map<string, () => void>();
  const sourceBuffer = {
    updating: false,
    appendBuffer: vi.fn(),
    addEventListener: vi.fn((event: string, listener: () => void) => {
      sourceBufferListeners.set(event, listener);
    }),
    dispatch(event: string) {
      sourceBufferListeners.get(event)?.();
    },
  };
  const mediaSource = {
    readyState: 'open',
    addSourceBuffer: vi.fn(() => sourceBuffer),
    addEventListener: vi.fn((event: string, listener: () => void) => {
      listeners.set(event, listener);
    }),
    dispatchEvent: vi.fn((event: Event) => {
      listeners.get(event.type)?.();
      return true;
    }),
    endOfStream: vi.fn(),
  };

  class MockMediaSource {
    static isTypeSupported = vi.fn(() => true);
    readyState = mediaSource.readyState;
    addSourceBuffer = mediaSource.addSourceBuffer;
    addEventListener = mediaSource.addEventListener;
    dispatchEvent = mediaSource.dispatchEvent;
    endOfStream = mediaSource.endOfStream;
  }

  return { MockMediaSource, mediaSource, sourceBuffer };
}

function createReaderFromChunks(chunks: string[]) {
  const encoder = new TextEncoder();
  const queue = chunks.map((chunk) => encoder.encode(chunk));
  return {
    read: vi.fn(async () => {
      const value = queue.shift();
      if (!value) {
        return { done: true, value: undefined };
      }
      return { done: false, value };
    }),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>;
}
