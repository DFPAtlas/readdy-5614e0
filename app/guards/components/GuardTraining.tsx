"use client";
import { useCallback, useEffect, useState } from "react";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { date, RecordState } from "@/components/RecordPage";
export default function GuardTraining({ guardId }: { guardId: string }) {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const result = await supabase
      .from("training_completions")
      .select("id, completed_at, passed, expires_at, training_modules(title)")
      .eq("company_id", companyId)
      .eq("guard_id", guardId);
    if (result.error) setError("Could not load training records.");
    else setRows(result.data || []);
    setLoading(false);
  }, [companyId, guardId]);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <>
      <h2 className="text-lg font-semibold text-white">
        Training and renewals
      </h2>
      {loading || error ? (
        <RecordState
          loading={loading}
          error={error}
          back="/guards"
          retry={load}
        />
      ) : rows.length ? (
        <ul className="divide-y divide-gray-800">
          {rows.map((row) => (
            <li key={row.id} className="py-3 text-gray-300">
              <strong>
                {row.training_modules?.title || "Training module"}
              </strong>
              <p>
                {row.passed
                  ? "Passed"
                  : row.completed_at
                    ? "Not passed"
                    : "In progress"}{" "}
                · Completed {date(row.completed_at)} · Renewal{" "}
                {date(row.expires_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No training records recorded.</p>
      )}
    </>
  );
}
