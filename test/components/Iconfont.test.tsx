import { describe, expect, it } from 'vitest';
// Just verify the barrel re-exports from createIconfont
import * as IconfontExports from '../../src/components/Iconfont/index';
import { createIconfont } from '../../src/components/Iconfont/createIconfont';

describe('Iconfont barrel', () => {
  it('re-exports createIconfont', () => {
    expect(IconfontExports.createIconfont).toBe(createIconfont);
    expect(typeof createIconfont).toBe('function');
  });
});
