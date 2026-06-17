import { useReducedMotion } from 'motion/react';
import { DURATION } from './tokens';

export function useMotionTransition(duration: number = DURATION.base) {
  const reduced = useReducedMotion() ?? false;

  return {
    reduced,
    duration: reduced ? DURATION.instant : duration,
    transition: { duration: reduced ? DURATION.instant : duration },
    disabled: reduced,
  };
}

/** Skip motion initial state when user prefers reduced motion. */
export function motionInitial<T>(reduced: boolean, value: T): T | false {
  return reduced ? false : value;
}
