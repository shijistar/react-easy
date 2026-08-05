import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import useRefFunction from './useRefFunction';
import useRefValue from './useRefValue';

export type UseMovableProps = (ContainerRefType | MovableRefType) & {
  /**
   * - **EN:** The ref of the parent viewport container of the movable element; defaults to `window`
   *   if not set.
   * - **CN:** 移动元素的父级可视区域容器的ref，如果不设置，则默认为 `window`
   *
   * @default `window`
   */
  viewPortRef?: RefObject<HTMLElement | null>;
  /**
   * - **EN:** Whether dragging is enabled.
   * - **CN:** 是否启用拖动。
   *
   * @default true
   */
  enabled?: boolean;
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
  /**
   * - **EN:** Callback function triggered when the element is moved.
   * - **CN:** 元素移动时触发的回调函数。
   */
  onMove?: (e: MovePosition) => void;
};
interface ContainerRefType {
  /**
   * - **EN:** The ref of the movable element
   * - **CN:** 可移动元素的ref
   *
   * @deprecated use `movableDomRef` instead
   */
  containerRef: RefObject<HTMLElement | null>;
}
interface MovableRefType {
  /**
   * - **EN:** The ref of the movable element
   * - **CN:** 可移动元素的ref
   */
  movableDomRef: RefObject<HTMLElement | null>;
}

/**
 * - **EN:** Hook to make an element movable by dragging, with position persistence using localStorage
 * - **CN:** 通过拖动使元素可移动的钩子，并使用 localStorage 持久化位置
 */
const useMovable = (props: UseMovableProps) => {
  const {
    enabled,
    containerRef,
    movableDomRef = containerRef,
    viewPortRef,
    ignoreSelectors,
    storageKey,
    onMove,
  } = props as UseMovableProps & ContainerRefType & MovableRefType;

  const storageKeyRef = useRefValue(storageKey);
  const [savedPosition, savePosition] = useLocalStorage<MovePosition>(storageKey ?? '');
  const savePositionRef = useRefValue(savePosition);
  const [position, setPosition] = useState<MovePosition | undefined>(savedPosition ?? undefined);
  const positionRef = useRefValue(position);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const onMoveRef = useRefValue(onMove);

  const getViewPortSize = useRefFunction(() => {
    if (viewPortRef?.current) {
      const rect = viewPortRef.current?.getBoundingClientRect();
      return {
        x: rect?.x ?? 0,
        y: rect?.y ?? 0,
        width: viewPortRef.current.clientWidth,
        height: viewPortRef.current.clientHeight,
      };
    }
    return {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });
  // Drag start (exclude interactive controls)
  const handlePointerDown = useRefFunction((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Set the selector for elements that do not trigger dragging
    if (ignoreSelectors && target.closest(ignoreSelectors.join(','))) return;

    const viewPortSize = getViewPortSize();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    draggingRef.current = true;
    console.log(e.clientX, e.clientY, viewPortSize, rect, dragOffsetRef.current, e.currentTarget);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
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
      const viewPortSize = getViewPortSize();
      const rect = movableDomRef.current?.getBoundingClientRect();
      const maxLeft = Math.max(0, viewPortSize.width - (rect?.width ?? 0));
      const maxTop = Math.max(0, viewPortSize.height - (rect?.height ?? 0));
      const clampedLeft = Math.min(Math.max(0, pos.left), maxLeft);
      const clampedTop = Math.min(Math.max(0, pos.top), maxTop);

      if (clampedLeft !== pos.left || clampedTop !== pos.top) {
        const next = { left: clampedLeft, top: clampedTop };
        setPosition(next);
        if (movableDomRef.current) {
          movableDomRef.current.style.left = next.left + 'px';
          movableDomRef.current.style.top = next.top + 'px';
        }
        if (storageKeyRef.current) {
          savePositionRef.current(next);
        }
        onMoveRef.current?.(next);
      }
    };
    const resizeObserver = new ResizeObserver(clampToViewport);
    if (viewPortRef?.current) {
      resizeObserver.observe(viewPortRef.current);
    }
    window.addEventListener('resize', clampToViewport);
    // Calibrate immediately after the first mount/position change.
    clampToViewport();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', clampToViewport);
    };
  }, [movableDomRef, viewPortRef]);

  const onPointerMove = useRefFunction((e: PointerEvent) => {
    if (!draggingRef.current) return;
    const viewPortSize = getViewPortSize();

    const newLeft = e.clientX - viewPortSize.x - dragOffsetRef.current.x;
    const newTop = e.clientY - viewPortSize.y - dragOffsetRef.current.y;
    const elWidth = (e.target as HTMLElement).offsetWidth;
    const elHeight = (e.target as HTMLElement).offsetHeight;
    const boundLeft = Math.max(0, viewPortSize.width - elWidth);
    const boundTop = Math.max(0, viewPortSize.height - elHeight);
    const clampedLeft = Math.min(Math.max(0, newLeft), boundLeft);
    const clampedTop = Math.min(Math.max(0, newTop), boundTop);
    const pos = { left: clampedLeft, top: clampedTop };
    console.log(
      { clientX: e.clientX, clientY: e.clientY },
      viewPortSize,
      { elWidth, elHeight },
      { boundLeft, boundTop },
      dragOffsetRef.current,
      { newLeft, newTop },
      pos,
      e.target,
    );

    setPosition(pos);
    if (movableDomRef.current) {
      movableDomRef.current.style.left = pos.left + 'px';
      movableDomRef.current.style.top = pos.top + 'px';
    }
    if (storageKeyRef.current) {
      savePositionRef.current(pos);
    }
    onMoveRef.current?.(pos);
  });
  // Update position during dragging; restrict within the visible area.
  useEffect(() => {
    const movableDom = movableDomRef.current;
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
      }
    };
    if (enabled) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      movableDom?.addEventListener('pointerdown', handlePointerDown as never);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      movableDom?.removeEventListener('pointerdown', handlePointerDown as never);
    };
  }, [enabled, movableDomRef]);

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
