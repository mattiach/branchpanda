import { useCallback } from 'preact/hooks';
import { loadFileContent } from '../services/file-content.service';
import { useAppStore } from '../store/app.store';
import { useRepoTree } from '../contexts/repo-tree.context';

export function useFileViewer() {
  const { state, dispatch } = useAppStore();
  const { findPath, isReady } = useRepoTree();

  const openFile = useCallback(async (path: string) => {
    if (!state.repo) return;

    let meta: { sha?: string; size?: number } | undefined;

    if (isReady) {
      const entry = findPath(path);
      if (!entry || entry.type !== 'blob') {
        dispatch({ type: 'SET_ERROR', payload: 'File not found in repository.' });
        return;
      }
      meta = { sha: entry.sha, size: entry.size };
    }

    const { owner: { login: owner }, name: repoName, default_branch: ref } = state.repo;

    dispatch({ type: 'SET_LOADING_FILE', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const file = await loadFileContent(owner, repoName, path, ref, meta);
      dispatch({ type: 'SET_SELECTED_FILE', payload: file });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load file.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING_FILE', payload: false });
    }
  }, [state.repo, dispatch, findPath, isReady]);

  const closeFile = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: null });
  }, [dispatch]);

  return { openFile, closeFile };
}
