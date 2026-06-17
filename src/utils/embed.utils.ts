const SOURCE = 'branchpanda';

export function isEmbedded(): boolean {
  try {
    return window.parent !== window;
  } catch {
    return true;
  }
}

export function closeEmbed(): void {
  window.parent.postMessage({ source: SOURCE, type: 'close' }, '*');
}

export function setEmbedFullWidth(full: boolean): void {
  window.parent.postMessage({ source: SOURCE, type: 'fullscreen', full }, '*');
}
