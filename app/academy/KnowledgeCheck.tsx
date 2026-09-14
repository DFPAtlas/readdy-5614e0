'use client';

import { useState } from 'react';
import type { Assessment, Question } from '@/lib/useAcademy';

export default function KnowledgeCheck({ assessment, attempts, onSubmit }: { assessment: Assessment; attempts: number; onSubmit: (score: number, passed: boolean, answers: any) => Promise<unknown> }) {
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
    return { score, passed: score >= assessu×O=âÚ$z{-®éÜj×ÛT^•Xš˜NU›Z“›ŒTSšÜXMÚÙTRÊÒÔMRÐNRL]šÍUMRKÖÚÔ[’™•ÝUÕ
Õ˜^‘ÝÛšÏOH‹ˆ›XÙ[œÙHŽˆ“RU‹ˆ›Ü[Û˜[ŽˆYKˆ™\[™[˜ÚY\ÈŽˆÂˆ˜˜\ÙMX\œ˜^XY™™\ˆŽˆ—ŒKŒŒˆ‚ˆBˆKˆ››ÙWÛ[Ù[\ËÝšXÝÜžK]™[™ÜˆŽˆÂˆ™\œÚ[ÛˆŽˆŒÍËŒËˆ‹ˆœ™\ÛÛ™YŽˆšÎ‹ËÜ™YÚ\ÝžK›œZœË›Ü™ËÝšXÝÜžK]™[™Ü‹ËKÝšXÝÜžK]™[™Ü‹LÍËŒË‹Þˆ‹ˆš[YÜš]HŽˆœÚMLL‹TØ”–\
ÍSR’Ð^RMÝÒÓLÙZ]™ZÚYØÌ‘ÌœÍÜØ–Ž]ÒYÒP–QÕÍ‘Ò›[ÜU˜™^›Ù–Í‘ÝM›ÑÞ“ÝÔOOH‹ˆ›XÙ[œÙHŽˆ“RUS‘TÐÈ‹ˆ™\[™[˜ÚY\ÈŽˆÂˆ\\ËÙËX\œ˜^HŽˆ—ŒËŒŒÈ‹ˆ\\ËÙËYX\ÙHŽˆ—ŒËŒŒ‹ˆ\\ËÙËZ[\œÛ]HŽˆ—ŒËŒŒH‹ˆ\\ËÙË\ØØ[HŽˆ—ŒŒˆ‹ˆ\\ËÙË\Ú\HŽˆ—ŒËŒKŒ‹ˆ\\ËÙË][YHŽˆ—ŒËŒŒ‹ˆ\\ËÙË][Y\ˆŽˆ—ŒËŒŒ‹ˆ™ËX\œ˜^HŽˆ—ŒËŒKˆ‹ˆ™ËYX\ÙHŽˆ—ŒËŒŒH‹ˆ™ËZ[\œÛ]HŽˆ—ŒËŒŒH‹ˆ™Ë\ØØ[HŽˆ—ŒŒˆ‹ˆ™Ë\Ú\HŽˆ—ŒËŒKŒ‹ˆ™Ë][YHŽˆ—ŒËŒŒ‹ˆ™Ë][Y\ˆŽˆ—ŒËŒŒH‚ˆBˆKˆ››ÙWÛ[Ù[\ËÝÚXÚŽˆÂˆ™\œÚ[ÛˆŽˆŒ‹ŒŒˆ‹ˆœ™\ÛÛ™YŽˆšÎ‹ËÜ™YÚ\ÝžK›œZœË›Ü™ËÝÚXÚËKÝÚXÚL‹ŒŒ‹Þˆ‹ˆš[YÜš]HŽˆœÚMLL‹P“LÕUÌÔ›ÌÞ\LÖMJØ]ÜÖ\ÑÐ–UÚÚÜS]˜–Ü“Q
ÞZÜšÌÝQQ’˜VVÚ‘UÍ[ÙØ\Ó“QRÓ“ZšXOOH‹ˆ™]ˆŽˆYKˆ›XÙ[œÙHŽˆ’TÐÈ‹ˆ™\[™[˜ÚY\ÈŽˆÂˆš\Ù^HŽˆ—Œ‹ŒŒ‚ˆKˆ˜š[ˆŽˆÂˆ››ÙK]ÚXÚŽˆ˜š[‹Û›ÙK]ÚXÚ‚ˆKˆ™[™Ú[™\ÈŽˆÂˆ››ÙHŽˆH‚ˆBˆBˆBŸB