import {
  ensurePrismLanguage,
  getPrism,
  resolvePrismLanguage,
  shouldHighlight,
} from '../utils/syntax.utils';

const highlightCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 32;

function cacheKey(code: string, lang: string): string {
  return `${lang}:${code.length}:${code.slice(0, 64)}:${code.slice(-64)}`;
}

function trimCache() {
  if (highlightCache.size <= MAX_CACHE_ENTRIES) return;
  const first = highlightCache.keys().next().value;
  if (first) highlightCache.delete(first);
}

export async function highlightCode(
  code: string,
  filename: string,
): Promise<{ html: string; language: string; highlighted: boolean }> {
  const language = resolvePrismLanguage(filename);

  if (!shouldHighlight(code)) {
    return { html: escapeHtml(code), language, highlighted: false };
  }

  const key = cacheKey(code, language);
  const cached = highlightCache.get(key);
  if (cached) return { html: cached, language, highlighted: true };

  const Prism = await getPrism();
  const prismLang = await ensurePrismLanguage(language);
  const grammar = Prism.languages[prismLang] ?? Prism.languages.plaintext;
  const html = Prism.highlight(code, grammar, prismLang);

  highlightCache.set(key, html);
  trimCache();

  return { html, language: prismLang, highlighted: true };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
