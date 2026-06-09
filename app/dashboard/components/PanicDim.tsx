'use client';

import { usePanicMode } from './PanicModeContext';

interface PanicDimProps {
  children: React.ReactNode;
  essential?: boolean;
  className?: string;
}

export default function PanicDim({ children, essential = false, className = '' }: PanicDimProps) {
  const { panicMode } = usePanicMode();

  if (!panicMode) {
    return <div className={className}>{children}</div>;
  }

  const dimClass = essential
    ? 'opacity-100 relative z-10'
    : 'opacity-[0.18] pointer-events-none transition-opacity duration-700';

  return <div className={`${className} ${dimClass}`}>{children}</div>;
}