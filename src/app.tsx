import { useEffect } from 'preact/hooks';
import { AppProvider, useAppStore } from './store/app.store';
import { useRepository } from './hooks/useRepository';
import { Header } from './components/layout/Header';
import { HomeView } from './views/HomeView';
import { ExplorerView } from './views/ExplorerView';
import { MotionProvider, Presence, motion, page, motionInitial, useMotionTransition } from './animations';

function AutoLoader() {
  const { state } = useAppStore();
  const { loadRepo } = useRepository();

  useEffect(() => {
    if (state.view !== 'home') return;
    const params = new URLSearchParams(location.search);
    const repo = params.get('repo');

    if (!repo || params.get('autoload') !== 'true') return;
    const slash = repo.indexOf('/');

    if (slash < 1 || slash === repo.length - 1) return;
    const owner = repo.slice(0, slash);
    const name = repo.slice(slash + 1);
    void loadRepo(owner, name);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function AppContent() {
  const { state } = useAppStore();
  const { reduced } = useMotionTransition();

  return (
    <div class="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <AutoLoader />
      <Header />
      <Presence mode="wait">
        {state.view === 'home' ? (
          <motion.div
            key="home"
            className="flex flex-1 min-h-0 overflow-hidden"
            variants={page}
            initial={motionInitial(reduced, 'initial')}
            animate="animate"
            exit="exit"
          >
            <HomeView />
          </motion.div>
        ) : (
          <motion.div
            key="explorer"
            className="flex flex-1 min-h-0 overflow-hidden"
            variants={page}
            initial={motionInitial(reduced, 'initial')}
            animate="animate"
            exit="exit"
          >
            <ExplorerView />
          </motion.div>
        )}
      </Presence>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <MotionProvider>
        <AppContent />
      </MotionProvider>
    </AppProvider>
  );
}
