import { useEffect, useState } from 'preact/hooks';
import { useAppStore } from '../../store/app.store';
import { useResizable } from '../../hooks/useResizable';
import { ResizableHandle } from '../ui/ResizableHandle';
import { PREF } from '../../services/cache.service';
import { SearchBar } from '../explorer/SearchBar';
import { SearchResults } from '../explorer/SearchResults';
import { TreeView } from '../explorer/TreeView';
import { AnimatePresence, Backdrop, SlideFromLeft } from '../../animations';

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 256;

interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  /** Fixed drawer over the preview when full-width mode hides the docked sidebar. */
  overlayOpen?: boolean;
  onOverlayClose?: () => void;
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
  overlayOpen = false,
  onOverlayClose,
}: Props) {
  const { state } = useAppStore();
  const isSearching = state.searchQuery.trim().length > 0;
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );

  const { isDragging, onPointerDown, sizeStyle } = useResizable({
    storageKey: PREF.TREE_SIDEBAR_WIDTH,
    defaultSize: DEFAULT_WIDTH,
    minSize: MIN_WIDTH,
    maxSize: MAX_WIDTH,
    direction: 'horizontal',
    edge: 'end',
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const panel = (
    <>
      <SearchBar />
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        {isSearching ? <SearchResults /> : <TreeView />}
      </div>
    </>
  );

  if (!isDesktop) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <Backdrop
              key="sidebar-backdrop"
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <SlideFromLeft
              key="sidebar-drawer"
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-[85vw] max-w-64 border-r border-sidebar-border bg-sidebar overflow-hidden md:hidden select-none"
            >
              {panel}
            </SlideFromLeft>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <aside
        style={sizeStyle}
        class="relative hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar overflow-hidden select-none"
      >
        {panel}
        <ResizableHandle
          onPointerDown={onPointerDown}
          isDragging={isDragging}
          direction="horizontal"
          edge="end"
        />
      </aside>

      <AnimatePresence>
        {overlayOpen && (
          <>
            <Backdrop
              key="sidebar-overlay-backdrop"
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm hidden md:block"
              onClick={onOverlayClose}
            />
            <SlideFromLeft
              key="sidebar-overlay"
              className="fixed inset-y-0 left-0 z-50 hidden md:flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden select-none shadow-xl"
            >
              <div class="relative flex flex-col h-full" style={sizeStyle}>
                {panel}
                <ResizableHandle
                  onPointerDown={onPointerDown}
                  isDragging={isDragging}
                  direction="horizontal"
                  edge="end"
                />
              </div>
            </SlideFromLeft>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
