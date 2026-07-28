import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import StreamDownloader, {
  type StreamDownloaderInit,
  type StreamDownloadRequest,
  type StreamDownloadSnapshot,
  type StreamDownloadSuccessResult,
} from '../utils/StreamDownloader';

/**
 * - **EN:** Hook options for `useStreamDownloader`.
 * - **CN:** `useStreamDownloader` 的可选参数。
 */
export interface UseStreamDownloaderOptions extends StreamDownloaderInit {
  /**
   * - **EN:** Whether to automatically dispose the downloader on component unmount. Default is
   *   `true`.
   * - **CN:** 组件卸载时是否自动释放 downloader。默认值为 `true`。
   */
  autoDispose?: boolean;
}

/**
 * - **EN:** React-friendly return value exposed by `useStreamDownloader`.
 * - **CN:** `useStreamDownloader` 对 React 场景暴露的返回结构。
 */
export interface UseStreamDownloaderResult {
  /**
   * - **EN:** Stable downloader class instance.
   * - **CN:** 稳定的 downloader 类实例。
   */
  downloader: StreamDownloader;
  /**
   * - **EN:** Reactive snapshot.
   * - **CN:** 响应式快照。
   */
  snapshot: Readonly<StreamDownloadSnapshot>;
  /**
   * - **EN:** Whether the current downloader is running.
   * - **CN:** 当前是否存在活动下载任务。
   */
  isRunning: boolean;
  /**
   * - **EN:** Start a download task.
   * - **CN:** 启动下载任务。
   */
  start: (request?: StreamDownloadRequest) => Promise<StreamDownloadSuccessResult>;
  /**
   * - **EN:** Cancel the active task.
   * - **CN:** 取消当前活动任务。
   */
  cancel: () => void;
  /**
   * - **EN:** Reset the terminal snapshot back to idle.
   * - **CN:** 将终态快照重置回 idle。
   */
  reset: () => void;
}

/**
 * - **EN:** React wrapper around `StreamDownloader` that exposes a stable downloader instance, a
 *   reactive snapshot, and bound action helpers.
 * - **CN:** `StreamDownloader` 的 React 包装层，对外提供稳定的 downloader 实例、响应式 快照以及已经绑定好的 action 方法。
 */
const useStreamDownloader = (options?: UseStreamDownloaderOptions): UseStreamDownloaderResult => {
  const ref = useRef<StreamDownloader | null>(null);

  if (!ref.current) {
    ref.current = new StreamDownloader(options);
  }

  const downloader = ref.current;
  const snapshot = useSyncExternalStore(
    downloader.subscribe.bind(downloader),
    downloader.getSnapshot.bind(downloader),
    downloader.getSnapshot.bind(downloader),
  );

  const autoDisposeRef = useRef(options?.autoDispose);
  autoDisposeRef.current = options?.autoDispose;

  useEffect(() => {
    return () => {
      if (autoDisposeRef.current !== false) {
        downloader.dispose();
      }
      ref.current = null;
    };
  }, [downloader]);

  return useMemo(
    () => ({
      downloader,
      snapshot,
      isRunning: downloader.isRunning,
      start: downloader.start.bind(downloader),
      cancel: downloader.cancel.bind(downloader),
      reset: downloader.reset.bind(downloader),
    }),
    [downloader, snapshot],
  );
};

export default useStreamDownloader;
