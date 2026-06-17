interface Props {
  size?: number;
  class?: string;
}

export function HamburgerIcon({ size = 16, class: className = '' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      class={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="currentColor" d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
    </svg>
  );
}
