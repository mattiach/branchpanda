import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { loadRepositoryTree } from '../services/github-tree.service';
import { buildPathIndex } from '../utils/tree.utils';
import { useAppStore } from '../store/app.store';

import type { ComponentChildren } from 'preact';
import type { TreeNodeData } from '../types/app.types';
import type { GitHubTreeItem } from '../types/github.types';

export interface RepoTreeContextValue {
  tree: TreeNodeData[];
  setTree: (value: TreeNodeData[] | ((prev: TreeNodeData[]) => TreeNodeData[])) => void;
  flatItems: GitHubTreeItem[];
  pathIndex: Map<string, GitHubTreeItem>;
  isLoading: boolean;
  isReady: boolean;
  truncated: boolean;
  pathExists: (path: string) => boolean;
  findPath: (path: string) => GitHubTreeItem | undefined;
}

const RepoTreeContext = createContext<RepoTreeContextValue | null>(null);

export function RepoTreeProvider({ children }: { children: ComponentChildren }) {
  const { state, dispatch } = useAppStore();
  const repo = state.repo;

  const [tree, setTree] = useState<TreeNodeData[]>([]);
  const [flatItems, setFlatItems] = useState<GitHubTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const pathIndex = useMemo(() => buildPathIndex(flatItems), [flatItems]);

  useEffect(() => {
    if (!repo) {
      setTree([]);
      setFlatItems([]);
      setIsReady(false);
      setTruncated(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const { owner: { login: owner }, name: repoName, default_branch: branch } = repo;

    async function load() {
      setIsLoading(true);
      setIsReady(false);
      setTruncated(false);

      try {
        const loaded = await loadRepositoryTree(owner, repoName, branch);
        if (cancelled) return;

        setTree(loaded.roots);
        setFlatItems(loaded.flatItems);
        setTruncated(loaded.truncated);
        setIsReady(true);
      } catch (err) {
        if (cancelled) return;
        setTree([]);
        setFlatItems([]);
        dispatch({
          type: 'SET_ERROR',
          payload: err instanceof Error ? err.message : 'Failed to load repository tree.',
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [repo?.full_name, dispatch]);

  const value = useMemo<RepoTreeContextValue>(() => ({
    tree,
    setTree,
    flatItems,
    pathIndex,
    isLoading,
    isReady,
    truncated,
    pathExists: (path: string) => pathIndex.has(path),
    findPath: (path: string) => pathIndex.get(path),
  }), [tree, flatItems, pathIndex, isLoading, isReady, truncated]);

  return (
    <RepoTreeContext.Provider value={value}>
      {children}
    </RepoTreeContext.Provider>
  );
}

export function useRepoTree(): RepoTreeContextValue {
  const ctx = useContext(RepoTreeContext);
  if (!ctx) {
    throw new Error('useRepoTree must be used within a RepoTreeProvider');
  }
  return ctx;
}
