export default function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}