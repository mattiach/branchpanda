interface Props {
  onPointerDown: (e: PointerEvent) => void;
  isDragging?: boolean;
  direction?: 'horizontal' | 'vertical';
  edge?: 'start' | 'end';
  className?: string;
}

export function ResizableHandle({
  onPointerDown,
  isDragging = false,
  direction = 'horizontal',
  edge = 'end',
  className = '',
}: Props) {
  const isHorizontal = direction === 'horizontal';
  const edgeClass = isHorizontal
    ? edge === 'start'
      ? 'left-0 -translate-x-1/2 cursor-col-resize'
      : 'right-0 translate-x-1/2 cursor-col-resize'
    : edge === 'start'
      ? 'top-0 -translate-y-1/2 cursor-row-resize'
      : 'bottom-0 translate-y-1/2 cursor-row-resize';

  return (
    <div
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
      aria-label="Resize panel"
      onPointerDown={onPointerDown}
      class={`absolute z-20 touch-none ${edgeClass} ${
        isHorizontal ? 'top-0 bottom-0 w-1.5' : 'left-0 right-0 h-1.5'
      } group ${className}`}
    >
      <div
        class={`absolute inset-0 transition-colors ${
          isDragging ? 'bg-primary/40' : 'bg-transparent group-hover:bg-border group-active:bg-primary/30'
        }`}
      />
    </div>
  );
}
