import { useState } from 'preact/hooks';
import { useRepository } from '../../hooks/useRepository';
import { useAppStore } from '../../store/app.store';
import { getRecentRepos } from '../../services/cache.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Icon } from '../ui/Icon';
import {
  AnimatePresence,
  Pressable,
  Stagger,
  StaggerItem,
  motion,
  fadeUp,
  motionInitial,
  staggerContainer,
  useMotionTransition,
} from '../../animations';
import { parseGitHubRepo } from '../../utils/repo-url.utils';

const EXAMPLES = ['facebook/react', 'microsoft/vscode', 'mattiach/branchpanda'];

interface Props {
  suggestedRepo?: string | null;
}

export function RepoInput({ suggestedRepo }: Props) {
  const { state, dispatch } = useAppStore();
  const { loadRepo, isLoading } = useRepository();
  const [input, setInput] = useState(() => suggestedRepo ?? '');
  const [recentRepos] = useState(() => getRecentRepos());
  const { reduced } = useMotionTransition();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    const parsed = parseGitHubRepo(input);
    if (!parsed) {
      dispatch({ type: 'SET_ERROR', payload: 'Enter a valid repository: owner/repo or a GitHub URL.' });
      return;
    }
    await loadRepo(parsed.owner, parsed.repo);
  }

  return (
    <Stagger className="flex flex-col items-center gap-6 w-full max-w-md px-4 overflow-x-hidden" variants={staggerContainer}>
      <StaggerItem className="text-center select-none">
        <motion.div
          initial={motionInitial(reduced, { opacity: 0, scale: 0.92 })}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon name="branchPanda" size={64} class="mb-4 drop-shadow-lg mx-auto" />
        </motion.div>
        <h1 class="text-xl sm:text-2xl font-bold text-foreground tracking-tight">BranchPanda</h1>
        <p class="text-sm text-muted-foreground mt-1.5">Explore any public GitHub repository</p>
      </StaggerItem>

      <StaggerItem className="w-full">
        <form onSubmit={handleSubmit} class="flex flex-col gap-3 w-full">
          <input
            type="text"
            value={input}
            onInput={e => setInput((e.target as HTMLInputElement).value)}
            placeholder="owner/repo or paste a GitHub URL"
            disabled={isLoading}
            class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition disabled:opacity-50"
          />
          <Pressable
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {isLoading ? 'Loading…' : 'Explore Repository'}
          </Pressable>
        </form>
      </StaggerItem>

      {recentRepos.length > 0 && (
        <StaggerItem className="flex flex-col items-center gap-2 w-full min-w-0 overflow-hidden">
          <span class="text-xs text-muted-foreground select-none">Recent</span>

          <div class="flex flex-col gap-1.5 w-full min-w-0 max-h-40 overflow-y-auto overflow-x-hidden">
            {recentRepos.map(entry => (
              <Pressable
                key={entry.full_name}
                type="button"
                motion="none"
                onClick={() => void loadRepo(entry.owner, entry.name)}
                disabled={isLoading}
                className="flex items-center gap-2 w-full min-w-0 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground hover:border-ring/50 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="truncate min-w-0 flex-1 text-left">
                  <span class="text-muted-foreground">{entry.owner}</span>
                  <span class="text-muted-foreground/50">/</span>
                  <span class="font-medium text-foreground">{entry.name}</span>
                </span>
                {entry.language && (
                  <span class="shrink-0 max-w-24 truncate rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] leading-none">
                    {entry.language}
                  </span>
                )}
              </Pressable>
            ))}
          </div>
        </StaggerItem>
      )}

      <StaggerItem className="flex flex-col items-center gap-2 w-full">
        <span class="text-xs text-muted-foreground select-none">Try an example</span>
        <div class="flex gap-2 flex-wrap justify-center">
          {EXAMPLES.map((ex, index) => (
            <Pressable
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className={`rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-ring/50 hover:text-primary transition-colors cursor-pointer ${index !== EXAMPLES.length - 1 ? 'hidden sm:inline-flex' : ''
                }`}
            >
              {ex}
            </Pressable>
          ))}
        </div>
      </StaggerItem>

      <AnimatePresence>
        {state.error && (
          <motion.div
            key="repo-error"
            className="w-full"
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
    </Stagger>
  );
}
