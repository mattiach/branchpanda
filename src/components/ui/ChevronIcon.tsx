interface Props {
  /** Rotates the chevron: down when closed, up/right-to-down when open. */
  direction?: 'down' | 'up' | 'right';
  size?: number;
  class?: string;
}

const ROTATION = { down: 0, up: 180, right: -90 } as const;

export function ChevronIcon({ direction = 'down', size = 12, class: className = '' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={`shrink-0 transition-transform duration-150 ${className}`}
      style={{ transform: `rotate(${ROTATION[direction]}deg)` }}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
