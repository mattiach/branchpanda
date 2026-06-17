import { useEffect, useRef } from 'preact/hooks';
import { Icon } from '../ui/Icon';
import { AnimatePresence, Pressable, motion, fade, motionInitial } from '../../animations';
import { useMotionTransition } from '../../animations';

interface Props {
  value: string;
  onChange: (value: string) => void;
  matchCount: number;
  matchIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const btnClass =
  'inline-flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer';

export function FileContentSearch({
  value,
  onChange,
  matchCount,
  matchIndex,
  onPrev,
  onNext,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { reduced } = useMotionTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.div
      className="hidden lg:flex items-center shrink-0 min-w-0"
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto', transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, width: 0, transition: { duration: 0.14 } }}
    >
      <div class="flex items-center gap-1 rounded-md border border-border bg-muted/60 pl-2 pr-1 py-0.5 min-h-7">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onInput={e => onChange((e.target as HTMLInputElement).value)}
          placeholder="Find in file…"
          aria-label="Find in file"
          class="w-28 xl:w-36 min-w-0 bg-transparent border-0 py-0.5 text-[11px] leading-none text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <AnimatePresence>
          {value && (
            <motion.div
              key="file-search-meta"
              className="flex items-center gap-0.5 shrink-0 border-l border-border/70 pl-1"
              variants={fade}
              initial={motionInitial(reduced, 'initial')}
              animate="animate"
              exit="exit"
            >
              <span class="text-[10px] leading-none tabular-nums text-muted-foreground min-w-8 text-center">
                {matchCount ? `${matchIndex + 1}/${matchCount}` : '0/0'}
              </span>
              <Pressable type="button" onClick={onPrev} disabled={!matchCount} className={btnClass} aria-label="Previous match">
                <Icon name="back" size={12} />
              </Pressable>
              <Pressable type="button" onClick={onNext} disabled={!matchCount} className={`${btnClass} rotate-180`} aria-label="Next match">
                <Icon name="back" size={12} />
              </Pressable>
              <Pressable type="button" onClick={() => onChange('')} className={btnClass} aria-label="Clear find">
                <Icon name="close" size={12} />
              </Pressable>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
