/** Shared motion design tokens — keep durations short and easing soft. */
export const DURATION = {
  instant: 0,
  fast: 0.14,
  base: 0.22,
  slow: 0.32,
} as const;

/** Modern ease-out — snappy without bounce. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Standard ease-in-out for overlays. */
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const STAGGER = {
  fast: 0.035,
  base: 0.05,
} as const;

export const SPRING = {
  snappy: { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 },
  gentle: { type: 'spring' as const, stiffness: 280, damping: 28, mass: 0.9 },
};

export const OFFSET = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;
