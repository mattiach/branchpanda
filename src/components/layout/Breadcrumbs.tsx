import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { useAppStore } from '../../store/app.store';
import { useRepoTree } from '../../contexts/repo-tree.context';
import { useTreeNavigation } from '../../hooks/useTreeNavigation';
import { cacheGet, cacheSet, saveRepoBranch } from '../../services/cache.service';
import { fetchBranches } from '../../services/github.service';
import { getBreadcrumbSegments } from '../../utils/tree.utils';
import { HamburgerIcon } from '../ui/HamburgerIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Icon } from '../ui/Icon';
import { Pressable } from '../../animations';

interface Props {
  onOpenTree?: () => void;
  showTreeToggle?: boolean;
}

interface MenuRect {
  top: number;
  left: number;
  width: number;
}

export function Breadcrumbs({ onOpenTree, showTreeToggle = false }: Props) {
  const { state, dispatch } = useAppStore();
  const { pathExists, isLoading: isTreeLoading } = useRepoTree();
  const { navigateToPath } = useTreeNavigation();
  const [branchOpen, setBranchOpen] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!branchOpen || !branchRef.current) {
      setMenuRect(null);
      return;
    }

    function updatePosition() {
      if (!branchRef.current) return;
      const rect = branchRef.current.getBoundingClientRect();
      setMenuRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [branchOpen]);

  useEffect(() => {
    if (!branchOpen) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (branchRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setBranchOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setBranchOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [branchOpen]);

  useEffect(() => {
    if (!branchOpen || !state.repo) return;

    const { owner: { login: owner }, name: repoName } = state.repo;
    const cacheKey = `branches_${owner}_${repoName}`;
    const cached = cacheGet<string[]>(cacheKey);
    if (cached) {
      setBranches(cached);
      return;
    }

    let cancelled = false;
    setBranchesLoading(true);

    void fetchBranches(owner, repoName)
      .then(names => {
        if (cancelled) return;
        cacheSet(cacheKey, names);
        setBranches(names);
      })
      .catch(() => {
        if (!cancelled) setBranches([state.currentBranch]);
      })
      .finally(() => {
        if (!cancelled) setBranchesLoading(false);
      });

    return () => { cancelled = true; };
  }, [branchOpen, state.repo?.full_name, state.currentBranch]);

  if (!state.repo) return null;

  const filePath = state.selectedFile?.path ?? state.currentPath;
  const segments = getBreadcrumbSegments(filePath).filter(
    seg => pathExists(seg.path) || seg.path === filePath,
  );

  function selectBranch(branch: string) {
    if (branch === state.currentBranch) {
      setBranchOpen(false);
      return;
    }
    saveRepoBranch(state.repo!.full_name, branch);
    dispatch({ type: 'SET_BRANCH', payload: branch });
    setBranchOpen(false);
  }

  const branchList = branches.length
    ? [...new Set([state.currentBranch, ...branches])]
    : [state.currentBranch];

  const branchMenu = branchOpen && menuRect
    ? createPortal(
      <div
        ref={menuRef}
        role="listbox"
        aria-label="Branches"
        style={{
          position: 'fixed',
          top: `${menuRect.top}px`,
          left: `${menuRect.left}px`,
          minWidth: `${menuRect.width}px`,
          zIndex: 10000,
        }}
        class="max-w-56 max-h-52 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-xl"
      >
        {branchesLoading ? (
          <div class="flex items-center justify-center gap-2 px-3 py-2">
            <LoadingSpinner size="sm" />
            <span class="text-[10px] text-muted-foreground">Loading…</span>
          </div>
        ) : (
          branchList.map(branch => {
            const active = branch === state.currentBranch;
            return (
              <Pressable
                key={branch}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectBranch(branch)}
                className={`block w-full px-3 py-1.5 text-left text-xs truncate transition-colors cursor-pointer ${active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-foreground hover:bg-accent'
                  }`}
                title={branch}
              >
                {branch}
              </Pressable>
            );
          })
        )}
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <nav
        class="relative z-30 flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs border-b border-border bg-card min-h-9 shrink-0 overflow-visible"
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

        <div class="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
          <span class="shrink-0 text-muted-foreground font-medium">{state.repo.name}</span>

          <div ref={branchRef} class="relative shrink-0">
            <Pressable
              type="button"
              onClick={() => setBranchOpen(open => !open)}
              disabled={isTreeLoading}
              title="Switch branch"
              aria-expanded={branchOpen}
              aria-haspopup="listbox"
              className="flex items-center gap-1 rounded-md border border-border bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground hover:border-ring/50 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-w-32 sm:max-w-48"
            >
              <Icon name="git" size={12} class="shrink-0" />
              <span class="truncate">{state.currentBranch}</span>
              <span class="text-[9px] text-muted-foreground/70 shrink-0">{branchOpen ? '▴' : '▾'}</span>
            </Pressable>
          </div>

          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const isClickable = !isLast;
            const segmentClass = `truncate max-w-24 sm:max-w-40 ${isLast
              ? 'text-foreground font-medium'
              : 'text-muted-foreground'
              }`;

            return (
              <span key={seg.path} class="flex items-center gap-0.5 shrink-0 min-w-0">
                <span class="text-muted-foreground/40 px-0.5 select-none">/</span>
                {isClickable ? (
                  <Pressable
                    type="button"
                    onClick={() => navigateToPath(seg.path)}
                    className={`${segmentClass} hover:text-foreground transition-colors cursor-pointer`}
                    title={seg.path}
                  >
                    {seg.name}
                  </Pressable>
                ) : (
                  <span class={segmentClass} title={seg.path}>
                    {seg.name}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </nav>
      {branchMenu}
    </>
  );
}
