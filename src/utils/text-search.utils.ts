export interface TextMatch {
  start: number;
  end: number;
  line: number;
}

/** ponytail: naive scan; fine for editor-sized files already in memory */
export function findTextMatches(text: string, query: string): TextMatch[] {
  const q = query.trim();
  if (!q) return [];

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const matches: TextMatch[] = [];
  let from = 0;

  while (from < lower.length) {
    const idx = lower.indexOf(needle, from);
    if (idx === -1) break;
    matches.push({
      start: idx,
      end: idx + needle.length,
      line: text.slice(0, idx).split('\n').length - 1,
    });
    from = idx + needle.length;
  }

  return matches;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightRawMatches(text: string, query: string, activeIndex: number): string {
  const q = query.trim();
  if (!q) return escapeHtml(text);

  const matches = findTextMatches(text, q);
  if (!matches.length) return escapeHtml(text);

  let html = '';
  let cursor = 0;

  matches.forEach((m, i) => {
    html += escapeHtml(text.slice(cursor, m.start));
    const cls = i === activeIndex ? 'file-search-mark file-search-mark-active' : 'file-search-mark';
    html += `<mark class="${cls}">${escapeHtml(text.slice(m.start, m.end))}</mark>`;
    cursor = m.end;
  });

  html += escapeHtml(text.slice(cursor));
  return html;
}

/** ponytail: cast — CSS Custom Highlight API types missing from some TS DOM libs */
type CssHighlightRegistry = {
  delete(name: string): void;
  set(name: string, highlight: object): void;
};

function cssHighlights(): CssHighlightRegistry | undefined {
  return (CSS as unknown as { highlights?: CssHighlightRegistry }).highlights;
}

function newHighlight(...ranges: Range[]): object {
  const Ctor = (globalThis as { Highlight?: new (...ranges: Range[]) => object }).Highlight;
  return new Ctor!(...ranges);
}

export function clearSearchHighlights(): void {
  cssHighlights()?.delete('bp-file-search');
  cssHighlights()?.delete('bp-file-search-active');
}

let highlightStylesReady = false;
function ensureHighlightStyles(): void {
  if (highlightStylesReady || typeof document === 'undefined') return;
  highlightStylesReady = true;
  const style = document.createElement('style');
  style.id = 'bp-file-search-highlights';
  style.textContent = `
    ::highlight(bp-file-search) {
      background-color: rgb(250 204 21 / 0.3);
      color: inherit;
    }
    ::highlight(bp-file-search-active) {
      background-color: rgb(250 204 21 / 0.55);
      outline: 1px solid rgb(234 179 8 / 0.7);
    }
  `;
  document.head.appendChild(style);
}

/** ponytail: CSS Highlight API — works across Prism token spans */
export function applySearchHighlights(
  root: HTMLElement,
  query: string,
  activeIndex: number,
): Range | null {
  clearSearchHighlights();
  const q = query.trim();
  const registry = cssHighlights();
  if (!q || !registry) return null;

  ensureHighlightStyles();

  const needle = q.toLowerCase();
  const inactive: Range[] = [];
  const active: Range[] = [];
  let matchIdx = 0;
  let activeRange: Range | null = null;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    const text = node.data;
    const lower = text.toLowerCase();
    let from = 0;

    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;

      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + needle.length);

      if (matchIdx === activeIndex) {
        active.push(range);
        activeRange = range;
      } else {
        inactive.push(range);
      }

      matchIdx++;
      from = idx + needle.length;
    }

    node = walker.nextNode() as Text | null;
  }

  if (inactive.length) registry.set('bp-file-search', newHighlight(...inactive));
  if (active.length) registry.set('bp-file-search-active', newHighlight(...active));

  return activeRange;
}

// ponytail: dev-only sanity check
if (import.meta.env.DEV) {
  const sample = findTextMatches('foo\nbar foo', 'foo');
  console.assert(sample.length === 2 && sample[1]!.line === 1, 'findTextMatches');
}

export function scrollRangeIntoView(range: Range, scrollRoot: HTMLElement): void {
  const rect = range.getBoundingClientRect();
  const rootRect = scrollRoot.getBoundingClientRect();
  const offset = rect.top - rootRect.top - rootRect.height / 2 + rect.height / 2;
  if (Math.abs(offset) > 8) {
    scrollRoot.scrollTop += offset;
  }
}
