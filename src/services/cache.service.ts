export const PREFIX = 'branchpanda_';

export interface CacheConfig {
  ttlMs: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttlMs: 5 * 60 * 1000,
};

let cacheConfig: CacheConfig = { ...DEFAULT_CACHE_CONFIG };

export function getCacheConfig(): Readonly<CacheConfig> {
  return cacheConfig;
}

export function setCacheConfig(config: Partial<CacheConfig>): void {
  cacheConfig = { ...cacheConfig, ...config };
}

export function resetCacheConfig(): void {
  cacheConfig = { ...DEFAULT_CACHE_CONFIG };
}

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function key(k: string): string {
  return `${PREFIX}${k}`;
}

export function cacheGet<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(key(k));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > cacheConfig.ttlMs) {
      localStorage.removeItem(key(k));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(k: string, data: T): void {
  try {
    localStorage.setItem(key(k), JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry<T>));
  } catch (error) {
    console.error("cacheSet:", error);
  }
}

export function cacheDelete(k: string): void {
  localStorage.removeItem(key(k));
}

export function cacheClear(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}

export function saveNavState(fullName: string, path: string): void {
  try {
    localStorage.setItem(`${PREFIX}nav_${fullName}`, path);
  } catch (error) {
    console.error(error)
  }
}

export function loadNavState(fullName: string): string {
  return localStorage.getItem(`${PREFIX}nav_${fullName}`) ?? '';
}

/** User preference keys (stored without TTL, prefixed with PREFIX). */
export const PREF = {
  TREE_SIDEBAR_WIDTH: 'tree_sidebar_width',
  CODE_SIDEBAR_WIDTH: 'code_sidebar_width',
  CODE_VIEW_MODE: 'code_view_mode',
  CODE_FULL_WIDTH: 'code_full_width',
  CODE_WRAP: 'code_wrap',
} as const;

/** ponytail: one-time migration from pre-PREF hyphenated keys */
const LEGACY_PREF_KEYS: Record<string, string> = {
  [PREF.TREE_SIDEBAR_WIDTH]: 'branchpanda-tree-sidebar-width',
  [PREF.CODE_SIDEBAR_WIDTH]: 'branchpanda-code-sidebar-width',
  [PREF.CODE_WRAP]: 'branchpanda-code-wrap',
};

function prefKey(k: string): string {
  return `${PREFIX}${k}`;
}

function readLegacyPref(k: string): string | null {
  const legacy = LEGACY_PREF_KEYS[k];
  if (!legacy) return null;
  try {
    return localStorage.getItem(legacy);
  } catch {
    return null;
  }
}

export function prefGet(k: string): string | null {
  try {
    const current = localStorage.getItem(prefKey(k));
    if (current !== null) return current;

    const legacy = readLegacyPref(k);
    if (legacy !== null) {
      prefSet(k, legacy);
      localStorage.removeItem(LEGACY_PREF_KEYS[k]);
      return legacy;
    }

    return null;
  } catch {
    return null;
  }
}

export function prefSet(k: string, value: string): void {
  try {
    localStorage.setItem(prefKey(k), value);
  } catch (error) {
    console.error('prefSet:', error);
  }
}

export function prefGetNumber(k: string, fallback: number): number {
  const raw = prefGet(k);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function prefGetBool(k: string, fallback: boolean): boolean {
  const raw = prefGet(k);
  if (raw === null) return fallback;
  return raw === 'true';
}
