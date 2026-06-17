import { useCallback } from 'preact/hooks';
import { useRepoTree } from '../contexts/repo-tree.context';
import { updateNode } from '../utils/tree.utils';

import type { TreeNodeData } from '../types/app.types';

export function useTreeNavigation() {
  const { tree, setTree, isLoading } = useRepoTree();

  const toggleNode = useCallback((node: TreeNodeData) => {
    if (node.type !== 'dir') return;

    setTree(prev =>
      updateNode(prev, node.path, n => ({
        ...n,
        isExpanded: !n.isExpanded,
      })),
    );
  }, [setTree]);

  return {
    tree,
    isLoadingRoot: isLoading,
    toggleNode,
  };
}
