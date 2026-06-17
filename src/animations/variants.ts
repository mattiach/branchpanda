import type { Variants } from 'motion/react';
import { DURATION, EASE_OUT, OFFSET, STAGGER } from './tokens';

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: OFFSET.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, y: -OFFSET.sm / 2, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -OFFSET.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, y: -OFFSET.sm, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const slideFromRight: Variants = {
  initial: { opacity: 0, x: OFFSET.md },
  animate: { opacity: 1, x: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
  exit: { opacity: 0, x: OFFSET.sm, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const slideFromLeft: Variants = {
  initial: { opacity: 0, x: -OFFSET.lg },
  animate: { opacity: 1, x: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
  exit: { opacity: 0, x: -OFFSET.md, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const backdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.base } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const page: Variants = {
  initial: { opacity: 0, y: OFFSET.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
  exit: { opacity: 0, y: -OFFSET.sm, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: STAGGER.base, delayChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: STAGGER.fast, staggerDirection: -1 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: OFFSET.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, y: -OFFSET.sm / 2, transition: { duration: DURATION.fast } },
};

/** Lighter stagger for search results — opacity + tiny shift only. */
export const searchStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.022, delayChildren: 0.01 },
  },
};

export const searchStaggerItem: Variants = {
  initial: { opacity: 0, y: 3 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const collapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
};
