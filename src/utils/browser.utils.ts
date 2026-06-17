export type BrowserType = 'chrome' | 'firefox' | 'unknown';

export function detectBrowser(): BrowserType {
  const g = globalThis as Record<string, unknown>;

  const firefoxBrowser = g['browser'] as { runtime?: { id?: string } } | undefined;
  if (firefoxBrowser?.runtime?.id) return 'firefox';

  const chromeBrowser = g['chrome'] as { runtime?: { id?: string } } | undefined;
  if (chromeBrowser?.runtime?.id) return 'chrome';

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('chrome') || ua.includes('chromium')) return 'chrome';

  return 'unknown';
}

export function isExtensionContext(): boolean {
  const g = globalThis as Record<string, unknown>;
  const b = g['browser'] as { runtime?: { id?: string } } | undefined;
  const c = g['chrome'] as { runtime?: { id?: string } } | undefined;
  return !!(b?.runtime?.id || c?.runtime?.id);
}
