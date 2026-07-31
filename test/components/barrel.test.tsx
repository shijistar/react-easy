import { describe, expect, it, vi } from 'vitest';
// Now import the barrel
import * as Components from '../../src/components/index';

// Mock all component modules to avoid circular deps and Phase B/C complexity
vi.mock('../../src/components/Animation/Pulse', () => ({ default: () => null, PulseAnimation: () => null }));
vi.mock('../../src/components/BreakLines', () => ({ default: () => null }));
vi.mock('../../src/components/ColumnSetting', () => ({ default: () => null }));
vi.mock('../../src/components/ConfigProvider/index', () => ({ default: () => null, ConfigContext: {} }));
vi.mock('../../src/components/ConfigProvider/context', () => ({ default: {}, defaultContextValue: {} }));
vi.mock('../../src/components/ConfirmAction/index', () => ({
  default: () => null,
  withDefaultConfirmActionProps: () => () => null,
}));
vi.mock('../../src/components/ConfirmAction/withConfirmAction', () => ({
  default: () => () => null,
  withConfirmActionInternal: () => () => null,
}));
vi.mock('../../src/components/ContextMenu', () => ({ default: () => null }));
vi.mock('../../src/components/DeleteConfirmAction/index', () => ({
  default: Object.assign(() => null, { Button: () => null, Switch: () => null, Link: () => null }),
}));
vi.mock('../../src/components/DeleteConfirmAction/withDeleteConfirmAction', () => ({ default: () => () => null }));
vi.mock('../../src/components/EditableText', () => ({ default: () => null }));
vi.mock('../../src/components/EllipsisTypography/EllipsisParagraph', () => ({
  default: () => null,
  EllipsisParagraphProps: {},
}));
vi.mock('../../src/components/EllipsisTypography/EllipsisText', () => ({ default: () => null, EllipsisTextProps: {} }));
vi.mock('../../src/components/EllipsisTypography/EllipsisTitle', () => ({
  default: () => null,
  EllipsisTitleProps: {},
}));
vi.mock('../../src/components/EllipsisTypography/EllipsisLink', () => ({ default: () => null, EllipsisLinkProps: {} }));
vi.mock('../../src/components/EllipsisTypography/withEllipsisTypography', () => ({ default: () => null }));
vi.mock('../../src/components/FloatDrawer', () => ({ default: () => null }));
vi.mock('../../src/components/FormItemControl', () => ({ default: () => null }));
vi.mock('../../src/components/Iconfont/index', () => ({ createIconfont: () => () => null }));
vi.mock('../../src/components/Loading', () => ({ default: () => null }));
vi.mock('../../src/components/ModalAction/index', () => ({
  default: () => null,
  withDefaultModalActionProps: () => () => null,
  withModalAction: () => null,
}));
vi.mock('../../src/components/OverflowTags', () => ({ default: () => null }));
vi.mock('../../src/components/VirtualTextViewer', () => ({ default: () => null }));

describe('components barrel', () => {
  it('re-exports PulseAnimation', () => {
    expect(Components.PulseAnimation).toBeDefined();
  });

  it('re-exports BreakLines', () => {
    expect(Components.BreakLines).toBeDefined();
  });

  it('re-exports ConfigProvider', () => {
    expect(Components.ConfigProvider).toBeDefined();
  });

  it('re-exports ContextMenu', () => {
    expect(Components.ContextMenu).toBeDefined();
  });

  it('re-exports FormItemControl', () => {
    expect(Components.FormItemControl).toBeDefined();
  });

  it('re-exports Loading', () => {
    expect(Components.Loading).toBeDefined();
  });

  it('re-exports EllipsisParagraph', () => {
    expect(Components.EllipsisParagraph).toBeDefined();
  });

  it('re-exports EllipsisText', () => {
    expect(Components.EllipsisText).toBeDefined();
  });

  it('re-exports EllipsisTitle', () => {
    expect(Components.EllipsisTitle).toBeDefined();
  });

  it('re-exports EllipsisLink', () => {
    expect(Components.EllipsisLink).toBeDefined();
  });

  it('re-exports DeleteConfirmAction', () => {
    expect(Components.DeleteConfirmAction).toBeDefined();
  });

  it('re-exports withDeleteConfirmAction', () => {
    expect(Components.withDeleteConfirmAction).toBeDefined();
  });

  it('re-exports ReactEasyContext', () => {
    expect(Components.ReactEasyContext).toBeDefined();
  });
});
