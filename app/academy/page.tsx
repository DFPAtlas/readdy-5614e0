'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAcademy } from '@/lib/useAcademy';
import KnowledgeCheck from './KnowledgeCheck';

export default function AcademyPage() {
  const { courses, assessments, attempts, loading, submitAttempt } = useAcademy();
  const [openAssessment, setOpenAssessment] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <section className="pt-32 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Training Academy</h1>
          <p className="text-lg text-gray-400 max-w-2xl">GuardianHub product training for administrators, operators, guards and clients.</p>
        </div>
      </section>

      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex items-start gap-3 mb-8">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-information-line"></i></div>
            <p>GuardianHub product training is not an SIA licence, a formal security qualification or an external accreditation. Completion certificates are for product training only.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((c) => {
                  const linked = assessments.find((a) => a.module_id === c.id);
                  const passed = linked ? attempts.some((a) => a.assessment_id === linked.id && a.passed) : false;
                  return (
                    <div key={c.id} className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-sm leading-snug">{c.title}</h3>
                        {c.is_mandatory && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 whitespace-nowrap">Required</span>}
                      </div>
                      {c.description && <p className="text-gray-400 text-xs leading-relaxed mt-2 line-clamp-3 flex-1">{c.description}</p>}
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                        <span>{c.category || 'General'}</span>
                        <span>{c.duration_minutes ? `${c.duration_minutes} min` : ''}</span>
                      </div>
                      {linked && (
                        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
                          <span className={`text-xs ${passed ? 'text-emerald-400' : 'text-gray-400'}`}>{passed ? 'Completed' : 'Knowledge check available'}</span>
                          <button onClick={() => setOpenAssessment(openAssessment === linked.id ? null : linked.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer whitespace-nowrap">
                            {openAssessment === linked.id ? 'Close' : 'Take check'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {courses.length === 0 && (
                <div className="text-center py-16 text-gray-400 text-sm">No courses available for your role yet.</div>
              )}

              {openAssessment && (() => {
                const a = assessments.find((x) => x.id === openAssessment);
                if (!a) return null;
                const myAttempts = attempts.filter((x) => x.assessment_id === a.id).length;
                return (
                  <div className="mt-6 max-w-2xl">
                    <KnowledgeCheck assessment={a} attempts={myAttempts} onSubmit={(score, passed, answers) => submitAttempt(a, score, passed, answers)} />
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Questions about training?</h2>
          <p className="text-gray-400 text-sm mb-6">Your administrator assigns company training and renewal requirements.</p>
          <a href="/help?category=guards-compliance" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-book-open-line"></i> View compliance guides
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}