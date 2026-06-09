'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const providers = [
  { key: 'openai', label: 'OpenAI', icon: 'ri-openai-line', models: 'GPT-4o, GPT-4, GPT-3.5', color: 'text-emerald-400', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
  { key: 'anthropic', label: 'Anthropic', icon: 'ri-claude-line', models: 'Claude 3.5 Sonnet, Claude 3 Opus', color: 'text-orange-400', bg: 'bg-orange-600/10', border: 'border-orange-600/20' },
  { key: 'google', label: 'Google AI', icon: 'ri-google-line', models: 'Gemini 1.5 Pro, Gemini Flash', color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
  { key: 'deepseek', label: 'DeepSeek', icon: 'ri-code-s-slash-line', models: 'DeepSeek-V3, DeepSeek-R1', color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/20' },
  { key: 'groq', label: 'Groq', icon: 'ri-flashlight-line', models: 'Llama 3.1, Mixtral, Gemma', color: 'text-amber-400', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
];

export default function ClientAIProviders({ companyId }: { companyId: string }) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('company_ai_providers')
        .select('provider')
        .eq('company_id', companyId)
        .eq('enabled', true);
      setEnabled(new Set((data || []).map((d: any) => d.provider)));
      setLoading(false);
    };
    fetchProviders();
  }, [companyId]);

  const toggleProvider = async (providerKey: string) => {
    setSaving(providerKey);
    setMessage(null);
    const isEnabled = enabled.has(providerKey);
    try {
      if (isEnabled) {
        const { error } = await supabase
          .from('company_ai_providers')
          .update({ enabled: false })
          .eq('company_id', companyId)
          .eq('provider', providerKey);
        if (error) throw error;
        setEnabled((prev) => {
          const next = new Set(prev);
          next.delete(providerKey);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('company_ai_providers')
          .upsert(
            { company_id: companyId, provider: providerKey, enabled: true },
            { onConflict: 'company_id,provider' }
          );
        if (error) throw error;
        setEnabled((prev) => {
          const next = new Set(prev);
          next.add(providerKey);
          return next;
        });
      }
      setMessage({ type: 'success', text: `${providers.find(p => p.key === providerKey)?.label} ${isEnabled ? 'disabled' : 'enabled'}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <div className="text-sm text-gray-500">Loading AI providers...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">AI Provider Access</h3>
          <p className="text-xs text-gray-500 mt-0.5">Toggle which AI providers this client is allowed to use.</p>
        </div>
        <div className="text-[10px] text-gray-500">
          {enabled.size}/{providers.length} enabled
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 px-3 py-2 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-600/20'
              : 'bg-red-500/10 text-red-400 border border-red-600/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {providers.map((p) => {
          const isEnabled = enabled.has(p.key);
          const isSaving = saving === p.key;

          return (
            <div
              key={p.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isEnabled ? `${p.border} ${p.bg}` : 'border-gray-800 bg-gray-800/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isEnabled ? p.bg : 'bg-gray-800/40'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center ${isEnabled ? p.color : 'text-gray-600'}`}>
                    <i className={p.icon} />
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-gray-400'}`}>{p.label}</div>
                  <div className="text-xs text-gray-500">{p.models}</div>
                </div>
              </div>

              <button
                onClick={() => toggleProvider(p.key)}
                disabled={isSaving}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                  isEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                {isSaving ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      isEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}