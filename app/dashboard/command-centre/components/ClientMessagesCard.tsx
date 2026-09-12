'use client';

import Link from 'next/link';
import type { UnreadClientMessage } from '@/lib/useCommandCentreExtended';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  messages: UnreadClientMessage[];
}

export default function ClientMessagesCard({ messages }: Props) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-message-2-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Client Messages</h3>
        {messages.length > 0 && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">{messages.length} unread</span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">No unread client messages</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {messages.slice(0, 8).map(m => (
            <Link key={m.id} href={`/dashboard/clients`} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${m.is_from_client ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{m.subject}</p>
                <p className="text-[10px] text-gray-500">{m.from_client_name} · {m.site_name}</p>
              </div>
              <span className="text-[10px] text-gray-600 shrink-0">{timeAgo(m.created_at)}</span>
            </Link>
          ))}
          {messages.length > 8 && (
            <p className="text-[10px] text-gray-600 text-center pt-1">+{messages.length - 8} more messages</p>
          )}
        </div>
      )}
    </div>
  );
}