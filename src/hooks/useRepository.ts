import { useState } from 'preact/hooks';
import { fetchRepo } from '../services/github.service';
import { cacheGet, cacheSet } from '../services/cache.service';
import { useAppStore } from '../store/app.store';

import type { GitHubRepo } from '../types/github.types';

export function useRepository() {
  const { dispatch } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  async function loadRepo(owner: string, repo: string): Promise<void> {
    const ck = `repo_${owner}_${repo}`;
    const cached = cacheGet<GitHubRepo>(ck);

    if (cached) {
      dispatch({ type: 'SET_REPO', payload: cached });
      return;
    }

    setIsLoading(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = await fetchRepo(owner, repo);
      cacheSet(ck, data);
      dispatch({ type: 'SET_REPO', payload: data });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load repository.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return { loadRepo, isLoading };
}
