import { describe, expect, it } from 'vitest';
import { StreamDownloadError } from '../../../src/utils/StreamDownloader';

describe('StreamDownloadError', () => {
  it('preserves code, message, cause, and Error inheritance', () => {
    const cause = new Error('root cause');
    const error = new StreamDownloadError('WRITE_FAILED', 'write failed', { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StreamDownloadError);
    expect(error.name).toBe('StreamDownloadError');
    expect(error.code).toBe('WRITE_FAILED');
    expect(error.message).toBe('write failed');
    expect(error.cause).toBe(cause);
  });
});
