import { getFileIconName, getFolderIconName } from '../../utils/icons.utils';
import { Icon } from '../ui/Icon';
import type { TreeNodeData } from '../../types/app.types';
import { Collapse } from '../../animations';

interface Props {
  node: TreeNodeData;
  onToggle: (node: TreeNodeData) => void;
  onFileClick: (node: TreeNodeData) => void;
  selectedPath?: string;
  level?: number;
}

const rowClass = (selected: boolean, file = false) =>
  `flex w-full items-center gap-1.5 py-0.75 pr-3 text-left text-xs transition-colors cursor-pointer ${
    selected
      ? file
        ? 'bg-primary/20 text-primary'
        : 'bg-sidebar-accent text-sidebar-accent-foreground'
      : file
        ? 'text-muted-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
  }`;

export function TreeNode({ node, onToggle, onFileClick, selectedPath, level = 0 }: Props) {
  const isSelected = selectedPath === node.path;
  const indent = level * 12 + 8;

  if (node.type === 'dir') {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(node)}
          style={{ paddingLeft: `${indent}px` }}
          class={rowClass(isSelected)}
          title={node.path}
        >
          <span class="shrink-0 w-3 text-[9px] text-muted-foreground text-center">
            {node.isExpanded ? '▾' : '▸'}
          </span>
          <Icon name={getFolderIconName(node.name)} size={14} />
          <span class="truncate leading-relaxed">{node.name}</span>
        </button>

        <Collapse open={node.isExpanded && Array.isArray(node.children)}>
          {node.children!.length === 0 ? (
            <div
              style={{ paddingLeft: `${indent + 20}px` }}
              class="py-1 text-xs text-muted-foreground italic"
            >
              empty
            </div>
          ) : (
            node.children!.map(child => (
              <TreeNode
                key={child.path}
                node={child}
                onToggle={onToggle}
                onFileClick={onFileClick}
                selectedPath={selectedPath}
                level={level + 1}
              />
            ))
          )}
        </Collapse>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onFileClick(node)}
      style={{ paddingLeft: `${indent + 16}px` }}
      class={rowClass(isSelected, true)}
      title={node.path}
    >
      <Icon name={getFileIconName(node.name)} size={14} />
      <span class="truncate leading-relaxed">{node.name}</span>
    </button>
  );
}
