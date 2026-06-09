'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ImproveAction =
  | 'improve_wording'
  | 'add_health_safety'
  | 'add_escalation'
  | 'complete_sections'
  | 'general_review';

const ACTION_LABELS: Record<ImproveAction, string> = {
  improve_wording: 'Improve Wording',
  add_health_safety: 'Add Health & Safety',
  add_escalation: 'Add Escalation Steps',
  complete_sections: 'Complete Missing Sections',
  general_review: 'General AI Review',
};

export function getImproveActionLabel(action: ImproveAction): string {
  return ACTION_LABELS[action] || action;
}

export interface ImprovementItem {
  section: string;
  original: string;
  improved: string;
}

export interface AIImproveResult {
  improvements?: ImprovementItem[];
  improved_content_json?: Record<string, any>;
  summary?: string;
  ppe?: string;
  health_safety_notes?: string;
  risks_controls?: { risk: string; control: string }[];
  escalation_procedure?: string;
  emergency_contacts?: { name: string; role: string; phone: string }[];
  purpose?: string;
  scope?: string;
  roles?: { role: string; responsibility: string }[];
  equipment?: string[];
  procedure_steps?: { step: number; instruction: string; expectedOutcome?: string }[];
  guard_acknowledgement_statement?: string;
  reporting_requirements?: string;
}

export function useAIImproveSOP() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIImproveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<ImproveAction | null>(null);

  const improve = useCallback(async (
    sopId: string,
    action: ImproveAction,
    contentJson: Record<string, any>
  ): Promise<AIImproveResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentAction(action);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const resp = await fetch(`${baseUrl}/functions/v1/ai-improve-sop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sop_id: sopId, action, content_json: contentJson }),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => null);
        throw new Error(errBody?.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to improve SOP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setCurrentAction(null);
  }, []);

  return { improve, loading, result, error, currentAction, clear };
}