'use client';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: string;
  isEmpty?: boolean;
  columns?: number;
}

export default function ResponsiveTableWrapper({
  children,
  emptyMessage = 'No data found',
  emptyIcon = 'ri-inbox-line',
  isEmpty = false,
}: ResponsiveTableWrapperProps) {
  if (isEmpty) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-4">
          <i className={`${emptyIcon} text-gray-500 text-2xl`}></i>
        </div>
        <p className="text-gray-400 font-medium">{emptyMessage}</p>
        <p className="text-sm text-gray-500 mt-1">No records to display at this time</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto -mx-0">
        <div className="inline-block min-w-full align-middle">
          {children}
        </div>
      </div>
      <style>{`
        .responsive-table-wrapper::-webkit-scrollbar { height: 5px; }
        .responsive-table-wrapper::-webkit-scrollbar-track { background: transparent; }
        .responsive-table-wrapper::-webkit-scrollbar-thumb { background: #2e3652; border-radius: 9999px; }
      `}</style>
    </div>
  );
}