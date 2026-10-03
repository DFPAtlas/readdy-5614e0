"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { phaseOneSupabase as supabase } from "./phaseOneSupabase";
// Tables used here have verified live schemas. Keep tenant/owner filters on every read.
export function useTenantRecord<T>(
  table: "guards" | "shifts" | "service_requests" | "client_invoices",
  id: string,
  companyId: string | null,
  owner?: { column: "client_id" | "guard_id"; id: string | null },
  enabled = true,
  columns = "*",
) {
  const latestRequest = useRef(0);
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ownerColumn = owner?.column;
  const ownerId = owner?.id;
  const load = useCallback(async () => {
    const request = ++latestRequest.current;
    setRecord(null);
    setError(null);
    if (!enabled || !companyId || (ownerColumn && !ownerId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let query = supabase
        .from(table)
        .select(columns)
        .eq("company_id", companyId)
        .eq("id", id);
      if (ownerColumn) query = query.filter(ownerColumn, "eq", ownerId!);
      const result = await query.maybeSingle();
      if (result.error) throw result.error;
      if (request !== latestRequest.current) return;
      setRecord(result.data as unknown as T | null);
    } catch {
      if (request === latestRequest.current)
        setError("Could not load this record. Please retry.");
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [table, id, companyId, ownerColumn, ownerId, enabled, columns]);
  useEffect(() => {
    load();
    return () => {
      latestRequest.current++;
    };
  }, [load]);
  return { record, loading, error, reload: load };
}
