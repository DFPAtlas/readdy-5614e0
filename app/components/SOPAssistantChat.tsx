'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSOPAssistant } from '@/lib/useSOPAssistant';

export interface Source {
  document_id: string;
  document_title: string;
  snippet: string;
}

export interface SOPAssistantChatProps {
  siteId?: string | null;
  siteName?: string | null;
  theme?: 'dark' | 'light';
  enableVoice?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What's the visitor sign-in procedure?",
  "What do I do if a fire alarm sounds?",
  "What's the escalation process for a security breach?",
];

export default function SOPAssistantChat({
  siteId,
  siteName,
  theme = 'dark',
  enableVoice = false,
  compact = false,
  onClose,
}: SOPAssistantChatProps) {
  const {
    messages,
    isLoading,
    conversationId,
    conversations,
    conversationsLoading,
    sendQuestion,
    startNewConversation,
    loadConversation,
    loadConversations,
  } = useSOPAssistant();

  const [input, setInput] = useState('');
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const isDark = theme === 'dark';

  const bgMain = isDark ? 'bg-[#0B0F1C]' : 'bg-white';
  const bgCard = isDark ? 'bg-[#111827]/80' : 'bg-gray-50';
  const bgMessageUser = isDark ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]';
  const bgMessageAI = isDark ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-300';
  const inputText = isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400';
  const sourceBadge = isDark ? 'text-violet-400 hover:text-violet-300' : 'text-[#3b82f6] hover:text-blue-700';
  const historyBg = isDark ? 'bg-[#111827]' : 'bg-white';
  const chipBg = isDark ? 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600' : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300';
  const headerBg = isDark ? 'bg-[#0B0F1C]' : 'bg-white';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (showHistory) {
      loadConversations();
    }
  }, [showHistory, loadConversations]);

  useEffect(() => {
    if (typeof window !== 'undefined' && enableVoice && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-GB';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }
  }, [enableVoice]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    sendQuestion(q, siteId || undefined);
  }, [input, isLoading, sendQuestion, siteId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSources = (id: string) => {
    setShowSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSuggestedClick = (q: string) => {
    setInput(q);
    setTimeout(() => {
      sendQuestion(q, siteId || undefined);
      setInput('');
    }, 0);
  };

  const handleNewConversation = () => {
    startNewConversation();
    setShowHistory(false);
    setShowSources({});
  };

  const handleLoadConversation = async (id: string) => {
    await loadConversation(id);
    setShowHistory(false);
  };

  const hasOnlyWelcome = messages.length === 1 && messages[0].id.startsWith('welcome-');

  return (
    <div className={`flex flex-col h-full ${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor} ${headerBg}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${isDark ? 'bg-[#3b82f6]/20' : 'bg-blue-50'}`}>
            <i className={`ri-sparkling-line ${isDark ? 'text-[#3b82f6]' : 'text-[#3b82f6]'} text-sm`}></i>
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm font-semibold ${textMain}`}>Assistant</h3>
            <p className={`text-xs ${textMuted}`}>Ask about your SOPs</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${textMuted} hover:${isDark ? 'text-white' : 'text-gray-700'} transition-colors cursor-pointer`}
            title="History"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-history-line text-sm"></i>
            </div>
          </button>
          <button
            onClick={handleNewConversation}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${textMuted} hover:${isDark ? 'text-white' : 'text-gray-700'} transition-colors cursor-pointer`}
            title="New conversation"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${textMuted} hover:${isDark ? 'text-white' : 'text-gray-700'} transition-colors cursor-pointer`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-close-line text-sm"></i>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className={`border-b ${borderColor} ${historyBg} max-h-48 overflow-y-auto`}>
          <div className="px-4 py-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>Past conversations</span>
            {conversationsLoading && (
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`ri-loader-4-line animate-spin ${textMuted} text-xs`}></i>
              </div>
            )}
          </div>
          {conversations.length === 0 ? (
            <p className={`px-4 py-3 text-xs ${textMuted}`}>No conversations yet</p>
          ) : (
            <div className="px-2 pb-2 space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${textSecondary} hover:${isDark ? 'bg-gray-800/50 text-white' : 'bg-gray-100 text-gray-900'} transition-colors cursor-pointer truncate`}
                >
                  {conv.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Site context badge */}
      {siteName && (
        <div className={`px-4 py-2 border-b ${borderColor} ${isDark ? 'bg-blue-900/20' : 'bg-blue-50/50'}`}>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={`ri-map-pin-line ${isDark ? 'text-[#3b82f6]' : 'text-[#3b82f6]'} text-xs`}></i>
            </div>
            <span className={`text-xs ${isDark ? 'text-[#3b82f6]' : 'text-[#3b82f6]'} font-medium`}>
              Answering for: {siteName}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {hasOnlyWelcome && (
          <div className="grid grid-cols-1 gap-2 mt-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedClick(q)}
                className={`text-left px-3 py-2 rounded-lg border text-xs ${chipBg} transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-6' : 'mr-6'}`}>
              <div
                className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? `${bgMessageUser} text-white`
                    : `${bgMessageAI} ${textMain}`
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'assistant' && (
                <div className="mt-1 flex items-center gap-2">
                  {msg.sources && msg.sources.length > 0 && (
                    <button
                      onClick={() => toggleSources(msg.id)}
                      className={`flex items-center gap-1 text-[11px] ${sourceBadge} transition-colors cursor-pointer whitespace-nowrap`}
                    >
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-file-list-line"></i>
                      </div>
                      <span>
                        {showSources[msg.id] ? 'Hide sources' : `Sources (${msg.sources.length})`}
                      </span>
                      <div className={`w-3 h-3 flex items-center justify-center transition-transform ${showSources[msg.id] ? 'rotate-180' : ''}`}>
                        <i className="ri-arrow-down-s-line"></i>
                      </div>
                    </button>
                  )}
                  {msg.content.toLowerCase().includes("couldn't find") ||
                  msg.content.toLowerCase().includes("don't know") ||
                  msg.content.toLowerCase().includes("not in") ? (
                    <span className={`text-[11px] ${textMuted} italic`}>I don't know</span>
                  ) : null}
                </div>
              )}

              {msg.role === 'assistant' && msg.sources && showSources[msg.id] && (
                <div className="mt-2 space-y-1.5">
                  {msg.sources.map((src) => (
                    <div
                      key={src.document_id}
                      className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50 border-gray-200'} border rounded-lg px-3 py-2`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <i className={`ri-file-text-line ${isDark ? 'text-violet-400' : 'text-[#3b82f6]'} text-xs`}></i>
                        </div>
                        <span className={`text-xs font-medium ${isDark ? 'text-violet-300' : 'text-blue-700'}`}>{src.document_title}</span>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'} leading-relaxed line-clamp-2`}>
                        {src.snippet}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mr-8">
            <div className={`${bgMessageAI} px-4 py-3 rounded-xl`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-[#3b82f6]' : 'bg-blue-400'}`} style={{ animationDelay: '0s' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-[#3b82f6]' : 'bg-blue-400'}`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-[#3b82f6]' : 'bg-blue-400'}`} style={{ animationDelay: '0.2s' }}></div>
                <span className={`text-xs ${textMuted} ml-1`}>Searching documents...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`px-4 py-3 border-t ${borderColor} ${bgMain}`}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about procedures, protocols..."
              disabled={isLoading}
              rows={1}
              className={`w-full px-3.5 py-2.5 ${inputBg} border rounded-lg text-sm ${inputText} focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/20 resize-none max-h-[100px] leading-relaxed`}
              style={{ minHeight: '40px' }}
            />
          </div>
          {enableVoice && recognitionRef.current && (
            <button
              onClick={handleVoiceToggle}
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 text-red-400'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-400 hover:text-gray-700'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${isListening ? 'ri-mic-fill' : 'ri-mic-line'} text-sm`}></i>
              </div>
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#3b82f6] text-white rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-send-plane-fill text-sm"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}