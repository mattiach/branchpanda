import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { prefGetNumber, prefSet } from '../services/cache.service';

interface UseResizableOptions {
  /** Preference key suffix (prefixed automatically via cache.service). */
  storageKey?: string;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  direction?: 'horizontal' | 'vertical';
  /** Which edge the handle sits on: start = left/top, end = right/bottom */
  edge?: 'start' | 'end';
}

function readStoredSize(
  key: string | undefined,
  fallback: number,
  minSize: number,
  maxSize: number,
): number {
  if (!key) return fallback;
  const n = prefGetNumber(key, fallback);
  return Math.min(maxSize, Math.max(minSize, n));
}

export function useResizable({
  storageKey,
  defaultSize,
  minSize,
  maxSize,
  direction = 'horizontal',
  edge = 'end',
}: UseResizableOptions) {
  const [size, setSize] = useState(() => readStoredSize(storageKey, defaultSize, minSize, maxSize));
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef(0);
  const startSize = useRef(0);
  const sizeRef = useRef(size);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const clamp = useCallback(
    (value: number) => Math.min(maxSize, Math.max(minSize, value)),
    [minSize, maxSize],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
      startSize.current = size;
    },
    [direction, size],
  );

  useEffect(() => {
    if (!isDragging) return;

    function onPointerMove(e: PointerEvent) {
      const pos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = pos - startPos.current;
      const signedDelta = edge === 'start' ? -delta : delta;
      const next = clamp(startSize.current + signedDelta);
      setSize(next);
    }

    function onPointerUp() {
      setIsDragging(false);
      if (storageKey) prefSet(storageKey, String(sizeRef.current));
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, direction, edge, clamp, storageKey]);

  const sizeStyle =
    direction === 'horizontal' ? { width: `${size}px` } : { height: `${size}px` };

  return { size, setSize, isDragging, onPointerDown, sizeStyle, clamp };
}
