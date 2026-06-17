import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion,
} from 'motion/react';

import { useMotionTransition, motionInitial } from './hooks';
import { DURATION, SPRING } from './tokens';
import {
  backdrop,
  collapse,
  fade,
  fadeUp,
  slideFromLeft,
  slideFromRight,
  staggerContainer,
} from './variants';

import type { ComponentChildren, JSX } from 'preact';
import type { Variants, MotionStyle } from 'motion/react';

export function MotionProvider({ children }: { children: ComponentChildren }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

interface PresenceProps {
  children: ComponentChildren;
  mode?: 'sync' | 'wait' | 'popLayout';
}

interface BoxProps {
  children?: ComponentChildren;
  className?: string;
  delay?: number;
  variants?: Variants;
}

interface BackdropProps {
  className?: string;
  onClick?: () => void;
}

export function Presence({ children, mode = 'sync' }: PresenceProps) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

export function Fade({ children, className, variants = fade, delay = 0 }: BoxProps) {
  const { reduced, duration } = useMotionTransition();
  return (
    <motion.div
      initial={motionInitial(reduced, 'initial')}
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration, delay: reduced ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp(props: BoxProps) {
  return <Fade variants={fadeUp} {...props} />;
}

export function SlideFromRight({ children, className }: BoxProps) {
  const { reduced, duration } = useMotionTransition(DURATION.slow);
  return (
    <motion.div
      initial={motionInitial(reduced, 'initial')}
      animate="animate"
      exit="exit"
      variants={slideFromRight}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideFromLeft({ children, className }: BoxProps) {
  const { reduced, duration } = useMotionTransition(DURATION.slow);
  return (
    <motion.div
      initial={motionInitial(reduced, 'initial')}
      animate="animate"
      exit="exit"
      variants={slideFromLeft}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Backdrop({ className, onClick }: BackdropProps) {
  const { reduced, duration } = useMotionTransition();
  return (
    <motion.div
      initial={motionInitial(reduced, 'initial')}
      animate="animate"
      exit="exit"
      variants={backdrop}
      transition={{ duration }}
      className={className}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

interface CollapseProps {
  open: boolean;
  children: ComponentChildren;
  className?: string;
}

export function Collapse({ open, children, className }: CollapseProps) {
  const { reduced, duration } = useMotionTransition();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={motionInitial(reduced, 'initial')}
          animate="animate"
          exit="exit"
          variants={collapse}
          transition={{ duration }}
          className={`overflow-hidden ${className ?? ''}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface StaggerProps {
  children: ComponentChildren;
  className?: string;
  variants?: Variants;
}

export function Stagger({ children, className, variants = staggerContainer }: StaggerProps) {
  const { reduced } = useMotionTransition();
  return (
    <motion.div
      initial={motionInitial(reduced, 'initial')}
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends BoxProps {
  variants?: Variants;
}

export function StaggerItem({ children, className, variants = fadeUp }: StaggerItemProps) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

type PressableProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  as?: 'button' | 'a';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** default: scale tap/hover · subtle: light tap only · none: CSS-only feedback */
  motion?: 'default' | 'subtle' | 'none';
};

export function Pressable({
  children,
  className,
  as = 'button',
  disabled,
  type = 'button',
  href,
  onClick,
  title,
  'aria-label': ariaLabel,
  style,
  motion: motionLevel = 'default',
}: PressableProps) {
  const { reduced } = useMotionTransition(DURATION.fast);
  const tap =
    reduced || disabled || motionLevel === 'none'
      ? undefined
      : motionLevel === 'subtle'
        ? { scale: 0.995 }
        : { scale: 0.98 };
  const hover =
    reduced || disabled || motionLevel !== 'default' ? undefined : { scale: 1.01 };
  const motionStyle = style as MotionStyle | undefined;

  if (as === 'a') {
    return (
      <motion.a
        whileTap={tap}
        whileHover={hover}
        transition={SPRING.snappy}
        className={className}
        href={href}
        onClick={onClick as never}
        title={title}
        aria-label={ariaLabel}
        style={motionStyle}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      whileTap={tap}
      whileHover={hover}
      transition={SPRING.snappy}
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={motionStyle}
    >
      {children}
    </motion.button>
  );
}

export { motion, AnimatePresence };
