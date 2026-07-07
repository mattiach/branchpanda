import { useCallback } from 'preact/hooks';
import { useRepoTree } from '../contexts/repo-tree.context';
import { useAppStore } from '../store/app.store';
import { useFileViewer } from './useFileViewer';
import { expandPathInTree, findFirstFileInDirectory, updateNode } from '../utils/tree.utils';

import type { TreeNodeData } from '../types/app.types';

export function useTreeNavigation() {
  const { dispatch } = useAppStore();
  const { tree, setTree, isLoading, flatItems } = useRepoTree();
  const { openFile } = useFileViewer();

  const toggleNode = useCallback((node: TreeNodeData) => {
    if (node.type !== 'dir') return;

    setTree(prev =>
      updateNode(prev, node.path, n => ({
        ...n,
        isExpanded: !n.isExpanded,
      })),
    );
  }, [setTree]);

  const navigateToPath = useCallback((path: string) => {
    setTree(prev => expandPathInTree(prev, path));

    const firstFile = findFirstFileInDirectory(flatItems, path);
    if (firstFile) {
      void openFile(firstFile);
      return;
    }

    dispatch({ type: 'SET_CURRENT_PATH', payload: path });
  }, [dispatch, setTree, flatItems, openFile]);

  return {
    tree,
    isLoadingRoot: isLoading,
    toggleNode,
    navigateToPath,
  };
}
