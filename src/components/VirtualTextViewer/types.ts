import type { LayoutCursor } from '@chenglou/pretext';

export interface VisibleLine {
  index: number;
  text: string;
  width: number;
}

export interface CursorCheckpointCache {
  checkpoints: Map<number, LayoutCursor>;
  width: number;
}
