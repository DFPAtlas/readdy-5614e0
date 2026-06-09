'use client';

import { useState, useEffect } from 'react';
import { useAPIKeysConfig, type APIProvider } from '@/lib/useAPIKeysConfig';

interface ProviderDef {
  id: APIProvider;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
  accent: string;
  accentText: string;
}

const PROVIDERS: ProviderDef[] = [
  { id: 'openai', name: 'OpenAI', icon: 'ri-openai-line', description: 'GPT-4o, GPT-4, GPT-3.5', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx', accent: 'bg-emerald-500/10', accentText: 'text-emerald-400' },
  { id: 'anthropic', name: 'Anthropic', icon: 'ri-sparkling-line', description: 'Claude 3.5 Sonnet, Claude 3 Opus', placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx', accent: 'bg-orange-500/10', accentText: 'text-orange-400' },
  { id: 'google', name: 'Google AI', icon: 'ri-google-line', description: 'Gemini 1.5 Pro, Gemini Flash', placeholder: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx', accent: 'bg-blue-500/10', accentText: 'text-blue-400' },
  { id: 'deepseek', name: 'DeepSeek', icon: 'ri-compass-3-line', description: 'DeepSeek-V3, DeepSeek-R1', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx', accent: 'bg-indigo-500/10', accentText: 'text-indigo-400' },
  { id: 'groq', name: 'Groq', icon: 'ri-flashlight-line', description: 'Llama 3.1, Mixtral, Gemma', placeholder: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxx', accent: 'bg-pink-500/10', accentText: 'text-pink-400' },
];

export default function APIKeyManager() {
  const { statuses, loadingProvider, savingProvider, testKey, saveKey } = useAPIKeysConfig();
  const [keys, setKeys] = useState<Record<APIProvider, string>>({
    openai: '', anthropic: '', google: '', deepseek: '', groq: '',
  });
  const [visible, setVisible] = useState<Record<APIProvider, boolean>>({
    openai: false, anthropic: false, google: false, deepseek: false, groq: false,
  });
  const [message, setMessage] = useState<{ provider: APIProvider; type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    PROVIDERS.forEach(p => testKey(p.id));
  }, [testKey]);

  const handleSave = async (provider: APIProvider) => {
    setMessage(null);
    const key = keys[provider].trim();
    if (!key) {
      setMessage({ provider, type: 'error', text: 'Please enter an API key' });
      return;
    }
    const data = await saveKey(provider, key);
    if (data.saved) {
      setMessage({ provider, type: 'success', text: data.verified ? 'Key saved and verified.' : 'Key saved but verification failed — check your quota or key.' });
      setKeys(prev => ({ ...prev, [provider]: '' }));
    } else {
      setMessage({ provider, type: 'error', text: data.error || 'Failed to save key.' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
          <i className="ri-key-2-line text-white text-lg"></i>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">AI Provider API Keys</h3>
          <p className="text-xs text-gray-500">Manage keys for all supported AI providers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROVIDERS.map((provider) => {
          const status = statuses[provider.id];
          const isLoading = loadingProvider === provider.id;
          const isSaving = savingProvider === provider.id;

          return (
            <div key={provider.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${provider.accent} rounded-lg flex items-center justify-center`}>
                    <i className={`${provider.icon} ${provider.accentText} text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{provider.name}</h4>
                    <p className="text-xs text-gray-500">{provider.description}</p>
                  </div>
                </div>
                {isLoading ? (
                  <i className="ri-loader-4-line animate-spin text-gray-500"></i>
                ) : status?.configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-md font-medium">
                    <i className="ri-checkbox-circle-line"></i>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700/40 text-gray-400 text-xs rounded-md font-medium">
                    <i className="ri-close-circle-line"></i>
                    Not set
                  </span>
                )}
              </div>

              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visible[provider.id] ? 'text' : 'password'}
                      value={keys[provider.id]}
                      onChange={(e) => setKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={provider.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors pr-10"
                    />
                    <button
                      onClick={() => setVisible(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                      type="button"
                    >
                      <i className={visible[provider.id] ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(provider.id)}
                    disabled={isSaving || !keys[provider.id].trim()}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1.5">
                        <i className="ri-loader-4-line animate-spin"></i>
                        Saving...
                      </span>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Stored securely in Supabase Edge Function secrets</p>
                  <button
                    onClick={() => testKey(provider.id)}
                    disabled={isLoading}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer underline underline-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Testing...' : 'Test connection'}
                  </button>
                </div>
              </div>

              {message?.provider === provider.id && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                  message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
                  </div>
                  {message.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}