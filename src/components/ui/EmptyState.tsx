import { Icon } from './Icon';
import type { UiIconName } from '../../utils/icons.utils';
import { FadeUp } from '../../animations';

interface Props {
  icon?: UiIconName;
  title: string;
  description?: string;
  /** Fill parent height and center vertically (e.g. binary preview pane). */
  fill?: boolean;
}

export function EmptyState({ icon = 'folder', title, description, fill = false }: Props) {
  const content = (
    <>
      <Icon name={icon} size={40} class="opacity-60" />
      <p class="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p class="max-w-xs text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}
    </>
  );

  if (fill) {
    return (
      <div class="flex flex-col items-center justify-center gap-3 h-full w-full px-4 text-center select-none">
        {content}
      </div>
    );
  }

  return (
    <FadeUp className="flex flex-col items-center justify-center gap-3 py-8 sm:py-12 px-4 text-center select-none">
      {content}
    </FadeUp>
  );
}
