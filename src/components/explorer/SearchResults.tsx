import { useFileSearch } from '../../hooks/useFileSearch';
import { useFileViewer } from '../../hooks/useFileViewer';
import { useAppStore } from '../../store/app.store';
import { getFileIconName } from '../../utils/icons.utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { Stagger, StaggerItem, searchStaggerContainer, searchStaggerItem } from '../../animations';

/** Highlights fuzzy-matched character indices in a string. */
function HighlightMatch({ text, indices }: { text: string; indices: number[] }) {
  const set = new Set(indices);
  return (
    <span>
      {text.split('').map((ch, i) =>
        set.has(i) ? (
          <span key={i} class="text-primary font-semibold">
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

export function SearchResults() {
  const { state } = useAppStore();
  const { results, isIndexing, truncated } = useFileSearch();
  const { openFile } = useFileViewer();
  const query = state.searchQuery.trim();

  if (isIndexing) {
    return (
      <div class="flex flex-col items-center justify-center gap-2 py-6">
        <LoadingSpinner />
        <p class="text-[10px] text-muted-foreground">Loading repository…</p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No results"
        description={`No files match "${query}"`}
      />
    );
  }

  if (results.length === 0) return null;

  return (
    <Stagger
      key={query}
      className="flex flex-col py-1"
      variants={searchStaggerContainer}
    >
      {truncated && (
        <p class="px-3 py-1.5 text-[10px] text-chart-3">
          Large repo — index may be incomplete.
        </p>
      )}
      {results.map(r => (
        <StaggerItem key={r.path} variants={searchStaggerItem}>
          <button
            type="button"
            onClick={() => openFile(r.path)}
            class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-sidebar-accent/30 transition-colors group cursor-pointer"
          >
            <Icon name={getFileIconName(r.name)} size={14} class="mt-0.5" />
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-medium text-sidebar-foreground group-hover:text-foreground truncate">
                <HighlightMatch text={r.name} indices={r.indices} />
              </span>
              <span class="text-[10px] text-muted-foreground truncate">{r.path}</span>
            </div>
          </button>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
