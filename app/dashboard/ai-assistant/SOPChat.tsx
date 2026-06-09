import { useState, useRef, useEffect } from 'react';
import { useSOPAssistant } from '@/lib/useSOPAssistant';

interface SOPChatProps {
  documentId?: string;
  siteId?: string;
}

export default function SOPChat({ documentId, siteId }: SOPChatProps) {
  const { messages, isLoading, sendQuestion, clearChat } = useSOPAssistant();
  const [input, setInput] = useState('');
  const [showSources, setShowSources] = useState<Record<string, boolean>>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    sendQuestion(q, documentId, siteId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'What are the key safety procedures?',
    'How do I handle a security breach?',
    'What is the patrol schedule?',
    'Emergency contact procedures',
  ];

  const toggleSources = (id: string) => {
    setShowSources(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#111827]/80 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-[#0B0F1C]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600/20">
            <i className="ri-book-open-line text-violet-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">SOP Assistant</h3>
            <p className="text-xs text-gray-500">Ask about your procedures</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line"></i>
          <span>Clear</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  inputRef.current?.focus();
                }}
                className="text-left px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
              <div
                className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleSources(msg.id)}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-violet-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-file-list-line"></i>
                    <span>
                      {showSources[msg.id] ? 'Hide sources' : `Sources (${msg.sources.length})`}
                    </span>
                    <i className={`ri-arrow-down-s-line transition-transform ${showSources[msg.id] ? 'rotate-180' : ''}`}></i>
                  </button>
                  {showSources[msg.id] && (
                    <div className="mt-2 space-y-2">
                      {msg.sources.map((src) => (
                        <div
                          key={src.document_id}
                          className="bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center space-x-1.5 mb-1">
                            <div className="w-3.5 h-3.5 flex items-center justify-center">
                              <i className="ri-file-text-line text-violet-400 text-xs"></i>
                            </div>
                            <span className="text-xs font-medium text-violet-300">{src.document_title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{src.snippet}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mr-8">
            <div className="bg-gray-800/80 border border-gray-700/50 px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-xs text-gray-500 ml-2">Searching documents...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 py-3 border-t border-gray-800 bg-[#0B0F1C]">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about SOPs, protocols, procedures..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-send-plane-fill text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}