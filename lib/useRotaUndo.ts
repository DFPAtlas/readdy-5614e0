import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type UndoAction =
  | { kind: 'delete_shift'; id: string }
  | { kind: 'insert_shift'; data: Record<string, any> }
  | { kind: 'update_shift'; id: string; oldData: Record<string, any> };

interface HistoryEntry {
  label: string;
  actions: UndoAction[];
}

async function executeAction(action: UndoAction) {
  if (action.kind === 'delete_shift') {
    await supabase.from('shifts').delete().eq('id', action.id);
  } else if (action.kind === 'insert_shift') {
    await supabase.from('shifts').insert(action.data);
  } else if (action.kind === 'update_shift') {
    await supabase.from('shifts').update(action.oldData).eq('id', action.id);
  }
}

export function useRotaUndo(onAfterUndo: () => void) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const push = useCallback((label: string, actions: UndoAction[]) => {
    if (actions.length === 0) return;
    setHistory((prev) => [...prev.slice(-19), { label, actions }]);
  }, []);

  const undo = useCallback(async () => {
    if (history.length === 0) return;
    const entry = history[history.length - 1];
    for (const action of entry.actions) {
      await executeAction(action);
    }
    setHistory((prev) => prev.slice(0, -1));
    onAfterUndo();
  }, [history, onAfterUndo]);

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  const lastLabel = history.length > 0 ? history[history.length - 1].label : null;

  return {
    push,
    undo,
    clear,
    canUndo: history.length > 0,
    undoCount: history.length,
    lastLabel,
  };
}