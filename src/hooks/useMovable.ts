import { type RefObject, useEffect, useRef, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import useRefFunction from './useRefFunction';
import useRefValue from './useRefValue';

export interface UseMovableProps {
  /**
   * - **EN:** Whether dragging is enabled, default is `true`
   * - **CN:** 是否启用拖动，默认`true`
   */
  enabled?: boolean;
  /**
   * - **EN:** The ref of the container element
   * - **CN:** 容器元素的ref
   */
  containerRef: RefObject<HTMLElement>;
  /**
   * - **EN:** Selectors of elements that should not trigger dragging, e.g., interactive controls
   * - **CN:** 不应触发拖动的元素的选择器，例如交互控件
   */
  ignoreSelectors?: string[];
  /**
   * - **EN:** Key for storing position in localStorage; if not provided, position won't be saved
   * - **CN:** 用于在 localStorage 中存储位置的键；如果未提供，则不会保存位置
   */
  storageKey?: string;
}

/**
 * - **EN:** Hook to make an element movable by dragging, with position persistence using localStorage
 * - **CN:** 通过拖动使元素可移动的钩子，并使用 localStorage 持久化位置
 */
const useMovable = (props: UseMovableProps) => {
  const { enabled, containerRef, ignoreSelectors, storageKey } = props;

  const storageKeyRef = useRefValue(storageKey);
  const [savedPosition, savePosition] = useLocalStorage<MovePosition>(storageKey ?? '');
  const savePositionRef = useRefValue(savePosition);
  const [position, setPosition] = useState<MovePosition | undefined>(savedPosition ?? undefined);
  const positionRef = useRefValue(position);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef({ w: 0, h: 0 });

  // Drag start (exclude interactive controls)
  const handlePointerDown = useRefFunction((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Set the selector for elements that do not trigger dragging
    if (ignoreSelectors && target.closest(ignoreSelectors.join(','))) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };
    const currentLeft = position?.left ?? rect.left;
    const currentTop = position?.top ?? rect.top;

    dragOffsetRef.current = { x: e.clientX - currentLeft, y: e.clientY - currentTop };
    draggingRef.current = true;
    try {
      containerRef.current.setPointerCapture?.(e.pointerId);
    } catch {
      // do nothing
    }
    e.preventDefault();
  });

  // Automatically adjust the position during window resize to prevent it from exceeding the visible area.
  useEffect(() => {
    const clampToViewport = () => {
      const pos = positionRef.current;
      if (!pos) return;

      // Refresh the container size before each convergence to ensure accurate boundaries.
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        sizeRef.current = { w: rect.width, h: rect.height };
      }

      const maxLeft = Math.max(0, window.innerWidth - sizeRef.current.w);
      const maxTop = Math.max(0, window.innerHeight - sizeRef.current.h);
      const clampedLeft = Math.min(Math.max(0, pos.left), maxLeft);
      const clampedTop = Math.min(Math.max(0, pos.top), maxTop);

      if (clampedLeft !== pos.left || clampedTop !== pos.top) {
        const next = { left: clampedLeft, top: clampedTop };
        setPosition(next);
        if (storageKeyRef.current) {
          savePositionRef.current(next);
        }
      }
    };

    window.addEventListener('resize', clampToViewport);
    // Calibrate immediately after the first mount/position change.
    clampToViewport();

    return () => {
      window.removeEventListener('resize', clampToViewport);
    };
  }, [containerRef]);

  // Update position during dragging; restrict within the visible area.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const newLeft = e.clientX - dragOffsetRef.current.x;
      const newTop = e.clientY - dragOffsetRef.current.y;
      const maxLeft = Math.max(0, window.innerWidth - sizeRef.current.w);
      const maxTop = Math.max(0, window.innerHeight - sizeRef.current.h);
      const clampedLeft = Math.min(Math.max(0, newLeft), maxLeft);
      const clampedTop = Math.min(Math.max(0, newTop), maxTop);
      const pos = { left: clampedLeft, top: clampedTop };
      setPosition(pos);
      if (storageKeyRef.current) {
        savePositionRef.current(pos);
      }
    };
    const onUp = () => {
      if (draggingRef.current) draggingRef.current = false;
    };
    if (enabled) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [enabled]);

  return {
    onPointerDown: handlePointerDown,
    position,
  };
};

export interface MovePosition {
  left: number;
  top: number;
}

export default useMovable;
