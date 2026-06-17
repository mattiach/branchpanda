import { getIconUrl } from '../../utils/icons.utils';

interface Props {
  name: string;
  class?: string;
  size?: number;
  alt?: string;
}

export function Icon({ name, class: className = '', size = 16, alt = '' }: Props) {
  return (
    <img
      src={getIconUrl(name)}
      alt={alt}
      width={size}
      height={size}
      class={`inline-block shrink-0 object-contain ${className}`}
      draggable={false}
    />
  );
}
