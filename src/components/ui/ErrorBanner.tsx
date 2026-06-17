import { Icon } from './Icon';
import { Pressable } from '../../animations';

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div class="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
      <span class="flex-1 leading-relaxed">{message}</span>
      {onDismiss && (
        <Pressable
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-destructive hover:text-destructive/80 leading-none cursor-pointer"
          aria-label="Dismiss"
        >
          <Icon name="close" size={14} />
        </Pressable>
      )}
    </div>
  );
}
