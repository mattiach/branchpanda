import { useMemo } from 'preact/hooks';
import { useRepoTree } from '../contexts/repo-tree.context';
import { useAppStore } from '../store/app.store';
import { searchFilesInTree } from '../utils/tree.utils';

export type { TreeSearchResult as SearchResult } from '../utils/tree.utils';

export function useFileSearch() {
  const { state } = useAppStore();
  const { flatItems, isLoading, isReady, truncated } = useRepoTree();

  const results = useMemo(() => {
    const query = state.searchQuery.trim();
    if (!query || !isReady) return [];
    return searchFilesInTree(flatItems, query);
  }, [flatItems, state.searchQuery, isReady]);

  return {
    results,
    isIndexing: isLoading && !isReady,
    truncated,
  };
}
