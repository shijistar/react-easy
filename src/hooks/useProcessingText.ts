import { useEffect, useRef, useState } from 'react';

export interface UseProcessingTextProps {
  /**
   * - **EN:** Whether the animation is enabled, default is `true`
   * - **CN:** 是否启用，默认`true`
   */
  enabled?: boolean;
  /**
   * - **EN:** Prefix text (e.g., "Processing"), default is `""`
   * - **CN:** 前缀文本（例如 "处理中"），默认`""`
   */
  prefixText?: string;
  /**
   * - **EN:** Dot text (e.g., "."), default is `"."`
   * - **CN:** 点文本（例如 "."），默认`"."`
   */
  dotText?: string;
  /**
   * - **EN:** Animation interval (milliseconds), default is `300`
   * - **CN:** 动画间隔（毫秒），默认`300`
   */
  interval?: number;
  /**
   * - **EN:** Maximum number of dots, default is `3`
   * - **CN:** 最大点数，默认`3`
   */
  maxDots?: number;
}
/**
 * - **EN:** Hook to create a processing text animation (e.g., "Processing.", "Processing..",
 *   "Processing...")
 * - **CN:** 创建处理文本动画的钩子（例如 "处理中."、"处理中.."、"处理中..."）
 *
 * @param props Configuration options
 *
 * @returns Animated processing text
 */
function useProcessingText(props?: UseProcessingTextProps) {
  const { enabled = true, prefixText = '', dotText = '.', interval = 300, maxDots = 3 } = props || {};
  const [dots, setDots] = useState(0);
  const timerRef = useRef(0);

  useEffect(() => {
    if (enabled) {
      timerRef.current = window.setInterval(() => {
        setDots((prev) => (prev + 1) % (maxDots + 1));
      }, interval);
    } else {
      setDots(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval, maxDots]);

  const text = prefixText + dotText.repeat(dots);
  return text;
}

export default useProcessingText;
