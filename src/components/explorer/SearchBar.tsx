import { useAppStore } from '../../store/app.store';
import { Icon } from '../ui/Icon';
import { AnimatePresence, Pressable, motion, scaleIn, motionInitial } from '../../animations';
import { useMotionTransition } from '../../animations';

export function SearchBar() {
  const { state, dispatch } = useAppStore();
  const { reduced } = useMotionTransition();

  return (
    <div class="relative px-3 py-2.5 border-b border-sidebar-border shrink-0">
      <div class="relative">
        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
          <Icon name="search" size={14} />
        </span>
        <input
          type="text"
          value={state.searchQuery}
          onInput={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: (e.target as HTMLInputElement).value })}
          placeholder="Search files…"
          class="w-full rounded-lg border border-border bg-muted/80 pl-7 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/20 transition"
        />
        <AnimatePresence>
          {state.searchQuery && (
            <motion.div
              key="clear"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              variants={scaleIn}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
            >
              <Pressable
                type="button"
                onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                className="text-muted-foreground hover:text-foreground leading-none cursor-pointer"
                aria-label="Clear search"
              >
                <Icon name="close" size={14} />
              </Pressable>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
