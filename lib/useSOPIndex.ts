import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSOPIndexReturn {
  isIndexing: boolean;
  progress: number;
  error: string | null;
  indexDocument: (documentId: string) => Promise<boolean>;
}

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/ai-index-sop-document';

export function useSOPIndex(): UseSOPIndexReturn {
  const [isIndexing, setIsIndexing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const indexDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setIsIndexing(true);
    setProgress(10);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      setProgress(40);

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: documentId }),
      });

      const data = await res.json();
      setProgress(80);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to index document');
      }

      setProgress(100);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to index document');
      return false;
    } finally {
      setTimeout(() => {
        setIsIndexing(false);
        setProgress(0);
      }, 800);
    }
  }, []);

  return { isIndexing, progress, error, indexDocument };
}