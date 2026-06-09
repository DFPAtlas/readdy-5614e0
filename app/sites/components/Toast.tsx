import { useEffect } from 'react';

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
      {message}
    </div>
  );
}