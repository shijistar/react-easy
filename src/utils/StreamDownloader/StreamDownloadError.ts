import type { StreamDownloadErrorCode } from './types';

/**
 * - **EN:** Structured error type used by `StreamDownloader`.
 * - **CN:** `StreamDownloader` 使用的结构化错误类型。
 */
export class StreamDownloadError extends Error {
  /**
   * - **EN:** Stable machine-readable error code.
   * - **CN:** 稳定的机器可读错误码。
   */
  code: StreamDownloadErrorCode;

  /**
   * - **EN:** Optional root cause preserved for debugging.
   * - **CN:** 为调试保留的可选根因对象。
   */
  cause?: unknown;

  /**
   * - **EN:** Create a structured stream-download error.
   * - **CN:** 创建结构化的流式下载错误。
   *
   * @param code - machine-readable error code | 机器可读错误码
   * @param message - human-readable error message | 面向人的错误消息
   * @param options - optional extension fields such as the original cause | 可选扩展字段，例如原始 cause
   */
  constructor(code: StreamDownloadErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'StreamDownloadError';
    this.code = code;
    this.cause = options?.cause;
  }
}
