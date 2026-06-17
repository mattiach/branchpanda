import { useState, useEffect } from 'preact/hooks';
import { useAppStore } from '../../store/app.store';
import { copyToClipboard } from '../../utils/file.utils';
import { closeEmbed, isEmbedded, setEmbedFullWidth } from '../../utils/embed.utils';
import { PREF } from '../../services/cache.service';
import { usePrefBool } from '../../hooks/usePref';
import { Icon } from '../ui/Icon';
import { AnimatePresence, Pressable, motion, fade, motionInitial } from '../../animations';
import { useMotionTransition } from '../../animations';

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

export function Header() {
  const { state, dispatch } = useAppStore();
  const [copiedClone, setCopiedClone] = useState(false);
  const [embedFullWidth, setEmbedFullWidthState] = usePrefBool(PREF.CODE_FULL_WIDTH, false);
  const embedded = isEmbedded();
  const { reduced } = useMotionTransition();

  useEffect(() => {
    if (!embedded || state.view !== 'home') return;
    setEmbedFullWidth(embedFullWidth);
  }, [embedded, state.view, embedFullWidth]);

  const [repoOwner, repoName] = state.repo?.full_name.split('/') ?? [];

  async function copyCloneCommand() {
    if (!state.repo) return;
    const cmd = `git clone ${state.repo.html_url}.git`;
    await copyToClipboard(cmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 1500);
  }

  const actionBtnClass =
    'shrink-0 flex items-center gap-1 rounded-md border border-border bg-muted px-2 sm:px-2.5 py-1 text-xs text-muted-foreground hover:border-ring/50 hover:text-foreground transition-colors cursor-pointer';

  function handleClose() {
    if (embedded) closeEmbed();
    else dispatch({ type: 'RESET' });
  }

  return (
    <header class="flex items-center gap-2 sm:gap-3 border-b border-border bg-background px-3 sm:px-4 py-2 shrink-0 select-none min-w-0">
      <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        <div class="flex items-center gap-2 shrink-0">
          <Icon name="branchPanda" size={22} class="shrink-0" />
          <span class="text-sm font-semibold text-foreground tracking-tight">BranchPanda</span>
        </div>

        <AnimatePresence>
          {state.repo && (
            <motion.div
              key={state.repo.full_name}
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden"
              variants={fade}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
            >
              <span class="hidden sm:block w-px h-5 bg-border shrink-0" aria-hidden="true" />

              <a
                href={state.repo.html_url}
                target="_blank"
                rel="noreferrer"
                class="flex items-center gap-0.5 min-w-0 truncate text-sm hover:opacity-80 transition-opacity cursor-pointer"
                title={state.repo.full_name}
              >
                <span class="text-muted-foreground truncate">{repoOwner}</span>
                <span class="text-muted-foreground/50 shrink-0">/</span>
                <span class="font-medium text-foreground truncate">{repoName}</span>
              </a>

              <div class="hidden md:flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                {state.repo.language && (
                  <span class="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground leading-none">
                    {state.repo.language}
                  </span>
                )}
                <span class="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground leading-none">
                  <Icon name="star" size={12} class="shrink-0" />
                  <span>{state.repo.stargazers_count.toLocaleString()}</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state.repo && state.view === 'explorer' && (
        <Pressable
          type="button"
          onClick={() => void copyCloneCommand()}
          title="Copy git clone command"
          className={actionBtnClass}
        >
          <Icon name="git" size={14} />
          <span class="hidden sm:inline">{copiedClone ? 'Copied!' : 'Clone'}</span>
        </Pressable>
      )}

      {state.view === 'explorer' && (
        <>
          <Pressable
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className={actionBtnClass}
          >
            <Icon name="back" size={14} />
            <span class="hidden sm:inline">Back</span>
          </Pressable>
          <Pressable
            type="button"
            onClick={handleClose}
            title={embedded ? 'Close BranchPanda' : 'Close explorer'}
            aria-label={embedded ? 'Close BranchPanda' : 'Close explorer'}
            className={`${actionBtnClass} px-2`}
          >
            <Icon name="close" size={14} />
          </Pressable>
        </>
      )}

      {embedded && state.view === 'home' && (
        <>
          <Pressable
            type="button"
            onClick={() => setEmbedFullWidthState(!embedFullWidth)}
            title={embedFullWidth ? 'Exit full width' : 'Full width'}
            className={actionBtnClass}
          >
            <FullWidthIcon expanded={embedFullWidth} />
            <span class="hidden sm:inline">{embedFullWidth ? 'Exit full' : 'Full width'}</span>
          </Pressable>
          <Pressable
            type="button"
            onClick={closeEmbed}
            title="Close BranchPanda"
            aria-label="Close BranchPanda"
            className={`${actionBtnClass} px-2`}
          >
            <Icon name="close" size={14} />
          </Pressable>
        </>
      )}
    </header>
  );
}
