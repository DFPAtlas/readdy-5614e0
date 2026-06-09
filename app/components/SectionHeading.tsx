'use client';

import { useInView } from '../hooks/useInView';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}