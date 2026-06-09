'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';

interface CopilotMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  data?: CopilotResponse | null;
  timestamp: Date;
}

interface CopilotResponseItem {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'critical';
  link?: string;
}

interface CopilotActionLink {
  label: string;
  href: string;
  icon: string;
}

interface CopilotResponse {
  title: string;
  summary: string;
  items: CopilotResponseItem[];
  actionLinks: CopilotActionLink[];
}

interface CopilotApiResponse {
  type: string;
  query: string;
  response: CopilotResponse;
  aiText: string | null;
  generatedAt: string;
}

const STATUS_STYLES = {
  ok: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-400' },
  critical: { dot: 'bg-red-500', text: 'text-red-400' },
};

const SUGGESTED_PROMPTS = [
  { label: 'Sites needing attention', icon: 'ri-building-line', query: 'Which sites need attention?' },
  { label: 'Late guards today', icon: 'ri-time-line', query: 'Who is late today?' },
  { label: 'Missed patrols', icon: 'ri-route-line', query: 'Show missed patrols' },
  { label: 'Shift handover', icon: 'ri-exchange-line', query: 'Generate shift handover' },
  { label: 'Open incidents', icon: 'ri-alarm-warning-line', query: 'Summarise open incidents' },
  { label: 'Expiring documents', icon: 'ri-file-shield-line', query: 'What documents are expiring?' },
  { label: 'Client issues', icon: 'ri-briefcase-line', query: 'Which client has the most issues?' },
  { label: 'Client summary', icon: 'ri-file-list-3-line', query: 'Create a client update summary' },
];

export default function AITooledOperationsCopilot() {
  const { user, companyId } = useAuth();
  const { can, myRoles } = useMyPermissions(user?.id || null, companyId);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: 'I am the AI Operations Copilot. Ask me anything about your live operations.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = myRoles.some(r => r.name === 'Account Owner' || r.name === 'Superuser');
  const userRole = isSuperAdmin ? 'super_admin' : user?.role || 'user';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    if (!companyId && !isSuperAdmin) return;

    const userMessage: CopilotMessage = {
      id: `u-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/operations-copilot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            query,
            companyId: companyId || null,
            userRole,
            userId: user?.id || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Copilot request failed');
      }

      const data: CopilotApiResponse = await response.json();

      const aiMessage: CopilotMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.aiText || data.response.summary || 'Here is what I found:',
        data: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: CopilotMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: 'Sorry, I could not retrieve that data. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [companyId, user?.id, userRole, isSuperAdmin]);

  const handleSend = () => {
    sendQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`mb-4 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isExpanded ? 'w-[540px] h-[640px]' : 'w-[380px] h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#0f172a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-sparkling-fill text-violet-400"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Operations Copilot</h3>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Live data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleExpand}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                title={isExpanded ? 'Shrink' : 'Expand'}
              >
                <i className={`${isExpanded ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'} text-sm`}></i>
              </button>
              <button
                onClick={toggleOpen}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] ${msg.type === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1e293b] text-gray-200 border border-gray-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.data && (
                    <div className="mt-2 w-full bg-[#1e293b] border border-gray-700 rounded-lg overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <i className="ri-sparkling-line text-violet-400 text-xs"></i>
                          <span className="text-xs font-semibold text-white">{msg.data.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">{msg.data.summary}</p>
                      </div>
                      <div className="divide-y divide-gray-700/50">
                        {msg.data.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[item.status].dot}`}></span>
                              <span className="text-xs text-gray-300 truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-medium ${STATUS_STYLES[item.status].text}`}>{item.value}</span>
                              {item.link && (
                                <Link
                                  href={item.link}
                                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
                                >
                                  <i className="ri-arrow-right-line text-xs"></i>
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {msg.data.actionLinks.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-700/50 flex flex-wrap gap-2">
                          {msg.data.actionLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.href}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-gray-300 hover:text-white transition-colors border border-gray-700 whitespace-nowrap cursor-pointer"
                            >
                              <div className="w-3 h-3 flex items-center justify-center">
                                <i className={`${link.icon} text-[10px]`}></i>
                              </div>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-600 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1e293b] border border-gray-700 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-sparkling-line text-violet-400 animate-pulse text-sm"></i>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(prompt.query)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-gray-600 text-[11px] text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`${prompt.icon} text-[10px]`}></i>
                    </div>
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-gray-700 bg-[#0f172a]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about operations..."
                className="flex-1 bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0f172a] border border-gray-700 shadow-lg hover:border-violet-500/40 transition-all cursor-pointer group"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className={`${isOpen ? 'ri-close-line' : 'ri-sparkling-line'} text-violet-400 text-sm group-hover:scale-110 transition-transform`}></i>
        </div>
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {isOpen ? 'Close' : 'AI Copilot'}
        </span>
        {!isOpen && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        )}
      </button>
    </div>
  );
}