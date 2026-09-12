'use client';

import { useState } from 'react';
import type { Assessment, Question } from '@/lib/useAcademy';

export default function KnowledgeCheck({ assessment, attempts, onSubmit }: { assessment: Assessment; attempts: number; onSubmit: (score: number, passed: boolean, answers: any) => Promise<void> }) {
  const questions: Question[] = assessment.questions || [];
  const [answers, setAnswers] = useState<any[]>(questions.map(() => null));
  const [submitted, setSubmitted] = useState<null | { score: number; passed: boolean }>(null);
  const [busy, setBusy] = useState(false);

  const setAnswer = (idx: number, value: any) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  const grade = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const a = answers[i];
      if (q.type === 'multi') {
        const arr = (a || []) as number[];
        const expected = (q.answer as number[]).slice().sort().join(',');
        if (arr.slice().sort().join(',') === expected) correct++;
      } else {
        if (a === q.answer) correct++;
      }
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { score, passed: score >= assessment.pass_mark };
  };

  const submit = async () => {
    const result = grade();
    setBusy(true);
    await onSubmit(result.score, result.passed, answers);
    setBusy(false);
    setSubmitted(result);
  };

  const maxedOut = attempts >= assessment.max_attempts;

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">{assessment.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pass mark {assessment.pass_mark}% · {attempts} of {assessment.max_attempts} attempts</p>
        </div>
        {assessment.is_high_risk && (
          <span className="px-2 py-1 rounded text-[11px] font-medium bg-red-500/15 text-red-400">High risk · scenario based</span>
        )}
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div key={idx} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
            <p className="text-sm text-white mb-2">{idx + 1}. {q.question}</p>
            {q.type === 'boolean' ? (
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <button key={String(v)} onClick={() => setAnswer(idx, v)} disabled={submitted != null} className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer whitespace-nowrap ${answers[idx] === v ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'}`}>
                    {v ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            ) : q.type === 'multi' ? (
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => {
                  const selected = (answers[idx] || []).includes(oi);
                  return (
                    <label key={oi} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={selected} disabled={submitted != null} onChange={() => {
                        const cur = answers[idx] || [];
                        setAnswer(idx, cur.includes(oi) ? cur.filter((x: number) => x !== oi) : [...cur, oi]);
                      }} className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
                      {opt}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="radio" name={`q-${idx}`} checked={answers[idx] === oi} disabled={submitted != null} onChange={() => setAnswer(idx, oi)} className="w-4 h-4 rounded-full border-white/20 bg-white/5 text-blue-500" />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {submitted != null && q.explanation && (
              <p className="mt-2 text-xs text-blue-300">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {submitted == null && (
        <div className="mt-5 flex items-center gap-3">
          <button onClick={submit} disabled={busy || maxedOut} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">
            {busy ? 'Submitting...' : 'Submit'}
          </button>
          {maxedOut && <p className="text-xs text-amber-400">Maximum attempts reached.</p>}
        </div>
      )}

      {submitted != null && (
        <div className={`mt-5 p-4 rounded-lg ${submitted.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          <p className="text-sm font-medium">Score {submitted.score}% — {submitted.passed ? 'Passed' : 'Not passed'}</p>
          <p className="text-xs mt-1 opacity-80">Your attempt has been recorded.</p>
        </div>
      )}
    </div>
  );
}