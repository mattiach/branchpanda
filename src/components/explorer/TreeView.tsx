import { useTreeNavigation } from '../../hooks/useTreeNavigation';
import { useFileViewer } from '../../hooks/useFileViewer';
import { useAppStore } from '../../store/app.store';
import { useRepoTree } from '../../contexts/repo-tree.context';
import { TreeNode } from './TreeNode';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import type { TreeNodeData } from '../../types/app.types';

export function TreeView() {
  const { state } = useAppStore();
  const { openFile } = useFileViewer();
  const { tree, isLoadingRoot, toggleNode } = useTreeNavigation();
  const { truncated, isReady } = useRepoTree();

  function handleFileClick(node: TreeNodeData) {
    openFile(node.path);
  }

  if (isLoadingRoot) {
    return (
      <div class="flex flex-col items-center justify-center gap-2 py-8">
        <LoadingSpinner size="md" />
        <p class="text-[10px] text-muted-foreground">Loading repository…</p>
      </div>
    );
  }

  if (isReady && tree.length === 0) {
    return <EmptyState icon="tree" title="No files found" />;
  }

  return (
    <div class="py-1">
      {truncated && (
        <p class="px-3 py-1.5 text-[10px] text-chart-3">
          Large repo — file tree may be incomplete.
        </p>
      )}
      {tree.map(node => (
        <TreeNode
          key={node.path}
          node={node}
          onToggle={toggleNode}
          onFileClick={handleFileClick}
          selectedPath={state.selectedFile?.path}
        />
      ))}
    </div>
  );
}
