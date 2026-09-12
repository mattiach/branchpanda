import { getFileIconName, getFolderIconName } from '../../utils/icons.utils';
import { Icon } from '../ui/Icon';
import { ChevronIcon } from '../ui/ChevronIcon';
import type { TreeNodeData } from '../../types/app.types';
import { Collapse } from '../../animations';

interface Props {
  node: TreeNodeData;
  onToggle: (node: TreeNodeData) => void;
  onFileClick: (node: TreeNodeData) => void;
  selectedPath?: string;
  highlightPath?: string;
  level?: number;
}

const SELECTED_MARKER = 'shadow-[inset_2px_0_0_var(--primary)]';

const rowClass = (selected: boolean, file = false) =>
  `flex w-full items-center gap-1.5 py-1.5 pr-3 text-left text-xs transition-colors cursor-pointer ${
    selected
      ? file
        ? `bg-primary/15 text-primary font-medium ${SELECTED_MARKER}`
        : `bg-sidebar-accent text-sidebar-accent-foreground ${SELECTED_MARKER}`
      : file
        ? 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
        : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
  }`;

export function TreeNode({ node, onToggle, onFileClick, selectedPath, highlightPath, level = 0 }: Props) {
  const isSelected = selectedPath === node.path;
  const isHighlighted =
    !selectedPath &&
    node.type === 'dir' &&
    highlightPath === node.path;
  const indent = level * 12 + 8;

  if (node.type === 'dir') {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(node)}
          style={{ paddingLeft: `${indent}px` }}
          class={rowClass(isSelected || isHighlighted)}
          title={node.path}
        >
          <span class="shrink-0 w-3 flex items-center justify-center text-muted-foreground">
            <ChevronIcon direction={node.isExpanded ? 'down' : 'right'} size={11} />
          </span>
          <Icon name={getFolderIconName(node.name)} size={14} />
          <span class="truncate leading-none">{node.name}</span>
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
                highlightPath={highlightPath}
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
      <span class="truncate leading-none">{node.name}</span>
    </button>
  );
}
