import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { HIGHLIGHT_MAX_BYTES, HIGHLIGHT_MAX_LINES } from '../../utils/syntax.utils';
import { applySearchHighlights, clearSearchHighlights, scrollRangeIntoView } from '../../utils/text-search.utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Props {
  code: string;
  filename: string;
  wrap?: boolean;
  searchQuery?: string;
  activeMatchIndex?: number;
}

export function CodeDisplay({
  code,
  filename,
  wrap = true,
  searchQuery = '',
  activeMatchIndex = 0,
}: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(true);
  const [language, setLanguage] = useState('plain');
  const codeRef = useRef<HTMLElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);
  const activeMatchLine = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    const lower = code.toLowerCase();
    const needle = q.toLowerCase();
    let from = 0;
    let idx = 0;
    while (from < lower.length) {
      const at = lower.indexOf(needle, from);
      if (at === -1) break;
      if (idx === activeMatchIndex) return code.slice(0, at).split('\n').length - 1;
      idx++;
      from = at + needle.length;
    }
    return null;
  }, [code, searchQuery, activeMatchIndex]);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);

    void import('../../services/syntax-highlight.service')
      .then(({ highlightCode }) => highlightCode(code, filename))
      .then(result => {
        if (cancelled) return;
        setHtml(result.html);
        setHighlighted(result.highlighted);
        setLanguage(result.language);
      });

    return () => {
      cancelled = true;
    };
  }, [code, filename]);

  useEffect(() => {
    const el = codeRef.current;
    if (!el || !html) return;

    const activeRange = applySearchHighlights(el, searchQuery, activeMatchIndex);
    if (activeRange) {
      const scrollRoot = el.closest('.scroll-area') as HTMLElement | null;
      if (scrollRoot) scrollRangeIntoView(activeRange, scrollRoot);
    }

    return () => clearSearchHighlights();
  }, [html, searchQuery, activeMatchIndex]);

  const preClass = wrap
    ? 'p-4 m-0 text-foreground code-highlight whitespace-pre-wrap break-words overflow-x-hidden'
    : 'overflow-x-auto p-4 m-0 text-foreground code-highlight whitespace-pre';

  return (
    <div class="flex min-h-full w-full text-xs font-mono leading-5 select-text">
      {!wrap && (
        <div
          class="select-none text-right text-muted-foreground pr-3 border-r border-border shrink-0 sticky left-0 bg-background"
          aria-hidden="true"
        >
          {lines.map((_, i) => (
            <div
              key={i}
              data-line={i}
              class={`px-2 py-px leading-5 tabular-nums transition-colors duration-200 ${
                activeMatchLine === i
                  ? 'bg-amber-400/20 text-amber-200 font-medium'
                  : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      <div class="flex-1 min-w-0 relative">
        {!html ? (
          <div class="flex items-center gap-2 p-4 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span>Highlighting…</span>
          </div>
        ) : (
          <>
            {!highlighted && (
              <p class="px-4 py-2 text-[10px] text-muted-foreground border-b border-border bg-muted/30">
                Large file — syntax highlighting skipped (limit: {HIGHLIGHT_MAX_LINES.toLocaleString()} lines /{' '}
                {Math.round(HIGHLIGHT_MAX_BYTES / 1024)} KB).
              </p>
            )}
            <pre class={preClass} data-language={language}>
              <code
                ref={codeRef}
                class={`language-${language} select-text`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
