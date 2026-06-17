import { useCallback, useState } from 'preact/hooks';
import { prefGet, prefGetBool, prefGetNumber, prefSet } from '../services/cache.service';

export function usePrefBool(
  key: string,
  fallback: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(() => prefGetBool(key, fallback));
  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      prefSet(key, String(next));
    },
    [key],
  );
  return [value, set];
}

export function usePrefString(
  key: string,
  fallback: string,
): [string, (value: string) => void] {
  const [value, setValue] = useState(() => prefGet(key) ?? fallback);
  const set = useCallback(
    (next: string) => {
      setValue(next);
      prefSet(key, next);
    },
    [key],
  );
  return [value, set];
}

export function usePrefNumber(
  key: string,
  fallback: number,
): [number, (value: number) => void] {
  const [value, setValue] = useState(() => prefGetNumber(key, fallback));
  const set = useCallback(
    (next: number) => {
      setValue(next);
      prefSet(key, String(next));
    },
    [key],
  );
  return [value, set];
}
