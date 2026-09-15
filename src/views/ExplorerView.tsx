import { useEffect, useRef, useState } from 'preact/hooks';
import { useAppStore } from '../store/app.store';
import { PREF } from '../services/cache.service';
import { usePrefBool } from '../hooks/usePref';
import { isEmbedded, setEmbedFullWidth } from '../utils/embed.utils';
import { RepoTreeProvider, useRepoTree } from '../contexts/repo-tree.context';
import { useFileViewer } from '../hooks/useFileViewer';
import { findReadmePath } from '../utils/tree.utils';
import { Sidebar } from '../components/layout/Sidebar';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { CodeSidebar } from '../components/layout/CodeSidebar';
import { DirectoryView } from '../components/explorer/DirectoryView';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { AnimatePresence, SlideFromRight, motion, fadeUp, motionInitial, useMotionTransition } from '../animations';

function ReadmeAutoOpen() {
  const { state } = useAppStore();
  const { flatItems, isReady } = useRepoTree();
  const { openFile } = useFileViewer();
  const attemptedRef = useRef('');

  useEffect(() => {
    if (!state.repo || !isReady) return;

    const key = `${state.repo.full_name}@${state.currentBranch}`;
    if (attemptedRef.current === key) return;
    if (state.selectedFile || state.currentPath || state.searchQuery.trim()) return;

    const readmePath = findReadmePath(flatItems);
    attemptedRef.current = key;

    if (readmePath) {
      void openFile(readmePath);
    }
  }, [
    state.repo,
    state.currentBranch,
    state.selectedFile,
    state.currentPath,
    state.searchQuery,
    isReady,
    flatItems,
    openFile,
  ]);

  return null;
}

export function ExplorerView() {
  const { state, dispatch } = useAppStore();
  const [treeOpen, setTreeOpen] = useState(false);
  const [fullWidthPref, setCodeFullWidth] = usePrefBool(PREF.CODE_FULL_WIDTH, false);
  const embedded = isEmbedded();
  // Full width only resizes the host sidebar on GitHub; ignore a stored pref elsewhere.
  const codeFullWidth = embedded && fullWidthPref;
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );
  const hasFile = Boolean(state.selectedFile);
  const { reduced } = useMotionTransition();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (state.selectedFile) setTreeOpen(false);
  }, [state.selectedFile?.path]);

  useEffect(() => {
    if (!embedded) return;
    setEmbedFullWidth(codeFullWidth);
  }, [embedded, codeFullWidth]);

  function openTree() {
    setTreeOpen(true);
  }

  const showTreeToggle = codeFullWidth || (!isDesktop && !treeOpen);

  return (
    <RepoTreeProvider>
      <ReadmeAutoOpen />
      <main class="flex flex-1 min-h-0 h-full overflow-hidden bg-background">
        {!codeFullWidth && (
          <Sidebar mobileOpen={treeOpen} onMobileClose={() => setTreeOpen(false)} />
        )}

        {codeFullWidth && (
          <Sidebar
            overlayOpen={treeOpen}
            onOverlayClose={() => setTreeOpen(false)}
          />
        )}

        <div class="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          <Breadcrumbs onOpenTree={openTree} showTreeToggle={showTreeToggle} />

          <AnimatePresence>
            {state.error && (
              <motion.div
                key="explorer-error"
                className="px-3 sm:px-4 pt-3 shrink-0"
                variants={fadeUp}
                initial={motionInitial(reduced, 'initial')}
                animate="animate"
                exit="exit"
              >
                <ErrorBanner
                  message={state.error}
                  onDismiss={() => dispatch({ type: 'SET_ERROR', payload: null })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div class="relative z-0 flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
            <AnimatePresence mode="wait">
              {!hasFile ? (
                <motion.div
                  key="directory"
                  className="flex flex-col flex-1 min-w-0 overflow-hidden"
                  variants={fadeUp}
                  initial={motionInitial(reduced, 'initial')}
                  animate="animate"
                  exit="exit"
                >
                  <DirectoryView />
                </motion.div>
              ) : (
                <SlideFromRight
                  key="code-panel"
                  className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden"
                >
                  <CodeSidebar
                    fullWidth={codeFullWidth}
                    onFullWidthChange={embedded ? setCodeFullWidth : undefined}
                    onMobileClose={() => dispatch({ type: 'SET_SELECTED_FILE', payload: null })}
                  />
                </SlideFromRight>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </RepoTreeProvider>
  );
}
