import { motion } from '../../animations';
import { useMotionTransition } from '../../animations';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = { sm: 'h-3.5 w-3.5 border-2', md: 'h-5 w-5 border-2', lg: 'h-8 w-8 border-[3px]' };

export function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const { reduced } = useMotionTransition();

  return (
    <motion.div
      className={`rounded-full border-muted-foreground/30 border-t-primary ${sizeClass[size]} ${className}`}
      role="status"
      aria-label="Loading"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 0.75, repeat: Infinity, ease: 'linear' }}
    />
  );
}
