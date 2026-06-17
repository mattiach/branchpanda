import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useAppStore } from '../../store/app.store';
import { useResizable } from '../../hooks/useResizable';
import { usePrefBool, usePrefString } from '../../hooks/usePref';
import { ResizableHandle } from '../ui/ResizableHandle';
import { decodeBase64Content, isTextFile, formatFileSize } from '../../utils/file.utils';
import { findTextMatches, highlightRawMatches } from '../../utils/text-search.utils';
import { FileContentSearch } from '../file/FileContentSearch';
import { PREF } from '../../services/cache.service';
import { FileToolbar } from '../file/FileToolbar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { CodeDisplay } from '../file/CodeDisplay';
import { Icon } from '../ui/Icon';
import { AnimatePresence, Pressable, motion, fade, motionInitial } from '../../animations';
import { useMotionTransition } from '../../animations';

type ViewMode = 'preview' | 'raw';

const MIN_CODE_WIDTH = 280;
const DEFAULT_CODE_WIDTH = 520;

interface Props {
  fullWidth?: boolean;
  onFullWidthChange?: (full: boolean) => void;
  onMobileClose?: () => void;
}

function FullWidthIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      {expanded ? (
        <path d="M5 2H2v3M11 2h3v3M5 14H2v-3M11 14h3v-3" />
      ) : (
        <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
      )}
    </svg>
  );
}

export function CodeSidebar({ fullWidth = false, onFullWidthChange, onMobileClose }: Props) {
  const { state } = useAppStore();
  const [mode, setModePref] = usePrefString(PREF.CODE_VIEW_MODE, 'preview');
  const viewMode: ViewMode = mode === 'raw' ? 'raw' : 'preview';
  const [wrapLines, setWrapLines] = usePrefBool(PREF.CODE_WRAP, true);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );
  const { reduced } = useMotionTransition();
  const [fileSearch, setFileSearch] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const maxCodeWidth = typeof window !== 'undefined' ? Math.floor(window.innerWidth * 0.95) : 1200;

  const { isDragging, onPointerDown, size } = useResizable({
    storageKey: PREF.CODE_SIDEBAR_WIDTH,
    defaultSize: DEFAULT_CODE_WIDTH,
    minSize: MIN_CODE_WIDTH,
    maxSize: maxCodeWidth,
    direction: 'horizontal',
    edge: 'start',
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  function setViewMode(next: ViewMode) {
    setModePref(next);
  }

  function toggleWrap() {
    setWrapLines(!wrapLines);
  }

  function toggleFullWidth() {
    onFullWidthChange?.(!fullWidth);
  }

  const file = state.selectedFile;
  const isText = file ? isTextFile(file.name) : false;
  const decoded = file && isText ? decodeBase64Content(file.content) : null;
  const isLoading = state.isLoadingFile;
  const textMatches = useMemo(
    () => (decoded && fileSearch.trim() ? findTextMatches(decoded, fileSearch) : []),
    [decoded, fileSearch],
  );
  const activeMatch = textMatches[matchIndex] ?? null;

  useEffect(() => {
    setFileSearch('');
    setMatchIndex(0);
  }, [file?.path]);

  useEffect(() => {
    setMatchIndex(0);
  }, [fileSearch]);

  useEffect(() => {
    if (!activeMatch || !contentRef.current || viewMode !== 'raw') return;
    const mark = contentRef.current.querySelector('.file-search-mark-active');
    mark?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeMatch?.start, activeMatch?.line, viewMode, matchIndex, fileSearch]);

  function stepMatch(delta: number) {
    if (!textMatches.length) return;
    setMatchIndex(i => (i + delta + textMatches.length) % textMatches.length);
  }

  if (!file) return null;

  const toolbar = (
    <div class="flex flex-wrap items-center gap-2 border-b border-border bg-card/80 px-3 sm:px-4 py-2 shrink-0 min-w-0 w-full">
      <div class="flex gap-1 rounded-lg border border-border bg-muted p-0.5">
        {(['preview', 'raw'] as ViewMode[]).map(m => {
          const active = viewMode === m;
          return (
            <Pressable
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`flex items-center gap-1 rounded px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon
                name={m === 'preview' ? 'document' : 'console'}
                size={12}
                class={active ? 'brightness-0 invert' : ''}
              />
              <span class="hidden sm:inline">{m === 'preview' ? 'Preview' : 'Raw'}</span>
            </Pressable>
          );
        })}
      </div>

      <Pressable
        type="button"
        onClick={toggleWrap}
        title={wrapLines ? 'Disable line wrap' : 'Wrap long lines'}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${!wrapLines
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
      >
        <span class="inline">No wrap</span>
      </Pressable>

      <Pressable
        type="button"
        onClick={toggleFullWidth}
        title={fullWidth ? 'Exit full width' : 'Full width'}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${fullWidth
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
      >
        <FullWidthIcon expanded={fullWidth} />
        <span class="hidden sm:inline">{fullWidth ? 'Exit full' : 'Full width'}</span>
      </Pressable>

      {isText && !isLoading && (
        <FileContentSearch
          value={fileSearch}
          onChange={setFileSearch}
          matchCount={textMatches.length}
          matchIndex={matchIndex}
          onPrev={() => stepMatch(-1)}
          onNext={() => stepMatch(1)}
        />
      )}

      <span class="flex-1 min-w-2" />

      <span class="text-[10px] text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
      <FileToolbar file={file} />
    </div>
  );

  const content = (
    <div ref={contentRef} class="scroll-area flex-1 bg-background min-h-0 w-full select-text">
      {isLoading ? (
        <div class="flex flex-1 items-center justify-center min-h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!isText ? (
            <motion.div
              key="binary"
              className="h-full min-h-full flex items-center justify-center"
              variants={fade}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
            >
              <EmptyState
                icon="image"
                title="Binary file"
                description="This file type cannot be previewed."
                fill
              />
            </motion.div>
          ) : viewMode === 'raw' ? (
            <motion.pre
              key="raw"
              className={`p-4 text-xs font-mono text-foreground leading-relaxed select-text ${wrapLines
                ? 'whitespace-pre-wrap wrap-break-word overflow-x-hidden'
                : 'whitespace-pre overflow-x-auto'
                }`}
              variants={fade}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
              dangerouslySetInnerHTML={{
                __html: highlightRawMatches(decoded ?? '', fileSearch, matchIndex),
              }}
            />
          ) : (
            <motion.div
              key="preview"
              className="h-full select-text"
              variants={fade}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
            >
              <CodeDisplay
                code={decoded ?? ''}
                filename={file.name}
                wrap={wrapLines}
                searchQuery={fileSearch}
                activeMatchIndex={matchIndex}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  if (!isDesktop) {
    return (
      <div class="flex flex-col flex-1 min-w-0 min-h-0 bg-background border-t border-border lg:border-t-0">
        {onMobileClose && (
          <Pressable
            type="button"
            onClick={onMobileClose}
            className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border-b border-border lg:hidden cursor-pointer"
          >
            <Icon name="back" size={14} />
            Close preview
          </Pressable>
        )}
        {toolbar}
        {content}
      </div>
    );
  }

  const panelMinWidth = fullWidth ? undefined : { minWidth: `${size}px` };

  return (
    <aside
      style={panelMinWidth}
      class="relative hidden lg:flex flex-col flex-1 min-w-0 w-full border-l border-border bg-background overflow-hidden min-h-0"
    >
      {!fullWidth && (
        <ResizableHandle
          onPointerDown={onPointerDown}
          isDragging={isDragging}
          direction="horizontal"
          edge="start"
        />
      )}
      {toolbar}
      {content}
    </aside>
  );
}
