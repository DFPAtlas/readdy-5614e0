'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

interface SwipeableItemProps {
  children: ReactNode;
  actions: { label: string; icon: string; color: string; onClick: () => void }[];
}

export default function SwipeableItem({ children, actions }: SwipeableItemProps) {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionWidth = actions.length * 72;
  const threshold = actionWidth * 0.4;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    if (diff < 0) {
      setOffset(Math.max(diff, -actionWidth));
    }
  }, [actionWidth]);

  const handleTouchEnd = useCallback(() => {
    const diff = currentX.current - startX.current;
    if (diff < -threshold) {
      setOffset(-actionWidth);
      setIsOpen(true);
    } else {
      setOffset(0);
      setIsOpen(false);
    }
  }, [threshold, actionWidth]);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <div
        className="flex transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ width: actionWidth }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => { action.onClick(); setOffset(0); setIsOpen(false); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${action.color} cursor-pointer active:opacity-80 transition-opacity`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={action.icon}></i>
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setOffset(0); setIsOpen(false); }}
        />
      )}
    </div>
  );
}