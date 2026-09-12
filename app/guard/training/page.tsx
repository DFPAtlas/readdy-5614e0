'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useGuardTraining } from '@/lib/useTrainingModules';
import GuardBottomNav from '@/app/guard/components/GuardBottomNav';
import GuardTopBar from '@/app/guard/components/GuardTopBar';

export default function GuardTrainingPage() {
  const { modules, completions, loading, refetch } = useGuardTraining();
  const { profile, companyId } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
  const [startingModule, setStartingModule] = useState<string | null>(null);

  type CompletionState = Record<string, { started: boolean; completed: boolean; score: number | null }>;
  const [localProgress, setLocalProgress] = useState<CompletionState>({});

  const completedIds = new Set(completions.filter((c) => c.completed_at).map((c) => c.module_id));
  const allAssignedIds = new Set(completions.map((c) => c.module_id));

  const assignedModules = modules.filter((m) => allAssignedIds.has(m.id) && !completedIds.has(m.id));
  const completedModules = modules.filter((m) => completedIds.has(m.id));

  async function startModule(moduleId: string) {
    setStartingModule(moduleId);
    const existing = completions.find((c) => c.module_id === moduleId);
    if (!existing) {
      await supabase.from('training_completions').insert({
        module_id: moduleId,
        guard_id: profile?.id,
        company_id: companyId,
        started_at: new Date().toISOString(),
        attempts: 1,
      });
    } else if (!existing.started_at) {
      await supabase.from('training_completions').update({ started_at: new Date().toISOString(), attempts: (existing.attempts || 0) + 1 }).eq('id', existing.id);
    }
    setLocalProgress((prev) => ({ ...prev, [moduleId]: { started: true, completed: false, score: null } }));
    setStartingModule(null);
    refetch();
  }

  async function completeModule(moduleId: string, passed: boolean, score: number) {
    const existing = completions.find((c) => c.module_id === moduleId);
    if (existing) {
      await supabase.from('training_completions').update({
        completed_at: new Date().toISOString(),
        score,
        passed,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', existing.id);
    }
    setLocalProgress((prev) => ({ ...prev, [moduleId]: { started: true, completed: true, score } }));
    refetch();
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <GuardTopBar />
      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">My Training</h1>
          <p className="text-xs text-gray-500 mt-1">Complete assigned modules and maintain your certifications.</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === 'assigned' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'}`}
          >
            To Complete ({assignedModules.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}
          >
            Completed ({completedModules.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'assigned' ? (
          assignedModules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center"><i className="ri-check-double-line text-2xl text-emerald-400"></i></div>
              </div>
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No pending training modules.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedModules.map((mod) => {
                const progress = localProgress[mod.id];
                const comp = completions.find((c) => c.module_id === mod.id);
                const isStarted = progress?.started || !!comp?.started_at;
                return (
                  <div key={mod.id} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{mod.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{mod.category}</span>
                          {mod.duration_minutes && <span className="text-[10px] text-gray-500">{mod.duration_minutes} min</span>}
                          {mod.is_mandatory && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Mandatory</span>}
                        </div>
                      </div>
                      {progress?.completed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-fill"></i></div>
                          {progress.score}%
                        </div>
                      ) : isStarted ? (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                        </div>
                      ) : null}
                    </div>
                    {!progress?.completed && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        {isStarted ? (
                          <button
                            onClick={() => completeModule(mod.id, true, 90 + Math.floor(Math.random() * 11))}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                          >
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line"></i></div>
                            Mark Complete
                          </button>
                        ) : (
                          <button
                            onClick={() => startModule(mod.id)}
                            disabled={startingModule === mod.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                          >
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-play-fill"></i></div>
                            Start Training
                          </button>
                        )}
                        {mod.content_url && (
                          <a href={mod.content_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs cursor-pointer whitespace-nowrap">
                            View Content
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          completedModules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-500/10 border border-gray-500/20 flex items-center justify-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center"><i className="ri-award-line text-2xl text-gray-400"></i></div>
              </div>
              <p className="text-white font-medium">No completions yet</p>
              <p className="text-xs text-gray-500 mt-1">Complete your assigned modules to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedModules.map((mod) => {
                const comp = completions.find((c) => c.module_id === mod.id);
                const isExpired = comp?.passed && comp.expires_at && new Date(comp.expires_at) < new Date();
                return (
                  <div key={mod.id} className={`bg-[#0f172a]/70 border rounded-xl p-4 ${isExpired ? 'border-red-500/20' : 'border-white/10'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{mod.category}</span>
                          {comp?.score !== null && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              comp?.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              Score: {comp?.score}%
                            </span>
                          )}
                          {isExpired && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Expired</span>}
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comp?.passed ? (isExpired ? 'bg-red-500/10' : 'bg-emerald-500/10') : 'bg-red-500/10'}`}>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={`${comp?.passed ? (isExpired ? 'ri-error-warning-line text-red-400' : 'ri-check-fill text-emerald-400') : 'ri-close-fill text-red-400'}`}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
      <GuardBottomNav />
    </div>
  );
}