'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  content_type: string | null;
  duration_minutes: number | null;
  is_mandatory: boolean | null;
  mandatory_for_roles: string[] | null;
  active: boolean | null;
}

export interface Assessment {
  id: string;
  module_id: string | null;
  title: string;
  pass_mark: number;
  max_attempts: number;
  is_high_risk: boolean;
  questions: Question[] | null;
}

export type QuestionType = 'single' | 'multi' | 'boolean';

export interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: number | number[] | boolean;
  explanation?: string;
}

export interface Attempt {
  id: string;
  assessment_id: string;
  attempt_number: number;
  score: number | null;
  passed: boolean | null;
  submitted_at: string | null;
}

export function useAcademy() {
  const { profile, companyId } = useAuth();
  const role = profile?.role ?? null;
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [courseRes, assessRes] = await Promise.all([
      supabase.from('training_modules').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('training_assessments').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    ]);

    let courseData: Course[] = (courseRes.data || []);
    if (role) {
      courseData = courseData.filter((c) => {
        if (!c.mandatory_for_roles || c.mandatory_for_roles.length === 0) return true;
        return c.mandatory_for_roles.includes(role);
      });
    }
    setCourses(courseData);

    let assessData: Assessment[] = (assessRes.data || []).map((a: any) => ({
      ...a,
      questions: a.questions || null,
    }));
    setAssessments(assessData);

    if (profile?.id) {
      const { data: attemptData } = await supabase.from('training_attempts').select('id,assessment_id,attempt_number,score,passed,submitted_at').eq('user_id', profile.id).order('attempt_number', { ascending: true });
      setAttempts((attemptData || []) as Attempt[]);
    }
    setLoading(false);
  }, [role, profile?.id]);

  useEffect(() => { load(); }, [load]);

  const submitAttempt = useCallback(async (assessment: Assessment, score: number, passed: boolean, answers: any) => {
    const existing = attempts.filter((a) => a.assessment_id === assessment.id);
    const nextNumber = (existing.length > 0 ? Math.max(...existing.map((a) => a.attempt_number)) : 0) + 1;
    const { data, error } = await supabase.from('training_attempts').insert({
      assessment_id: assessment.id,
      user_id: profile?.id || null,
      company_id: companyId,
      attempt_number: nextNumber,
      score,
      passed,
      answers,
      submitted_at: new Date().toISOString(),
    }).select().maybeSingle();
    if (!error) await load();
    return { data, error };
  }, [attempts, profile?.id, companyId, load]);

  return { courses, assessments, attempts, loading, refresh: load, submitAttempt };
}