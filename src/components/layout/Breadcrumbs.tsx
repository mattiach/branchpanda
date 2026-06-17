import { useAppStore } from '../../store/app.store';
import { useRepoTree } from '../../contexts/repo-tree.context';
import { getBreadcrumbSegments } from '../../utils/tree.utils';
import { HamburgerIcon } from '../ui/HamburgerIcon';
import { Pressable } from '../../animations';

interface Props {
  onOpenTree?: () => void;
  showTreeToggle?: boolean;
}

export function Breadcrumbs({ onOpenTree, showTreeToggle = false }: Props) {
  const { state } = useAppStore();
  const { pathExists } = useRepoTree();

  if (!state.repo) return null;

  const filePath = state.selectedFile?.path ?? state.currentPath;
  const segments = getBreadcrumbSegments(filePath).filter(
    seg => pathExists(seg.path) || seg.path === filePath,
  );

  return (
    <nav
      class="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs border-b border-border bg-card min-h-9 overflow-x-auto shrink-0"
      aria-label="Breadcrumb"
    >
      {showTreeToggle && onOpenTree && (
        <Pressable
          type="button"
          onClick={onOpenTree}
          className="shrink-0 mr-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          aria-label="Open file tree"
        >
          <HamburgerIcon size={16} />
        </Pressable>
      )}

      <span class="shrink-0 text-muted-foreground font-medium">{state.repo.name}</span>

      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
        <span key={seg.path} class="flex items-center gap-0.5 shrink-0 min-w-0">
          <span class="text-muted-foreground/40 px-0.5 select-none">/</span>
          <span
            class={`truncate max-w-24 sm:max-w-40 ${
              isLast
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            }`}
            title={seg.path}
          >
            {seg.name}
          </span>
        </span>
        );
      })}
    </nav>
  );
}
