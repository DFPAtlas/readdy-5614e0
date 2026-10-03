"use client";
import { useEffect, useState } from "react";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { panel, date, label } from "@/components/RecordPage";
export default function ShiftHistory({ shiftId }: { shiftId: string }) {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!companyId) return;
    supabase
      .from("shift_history")
      .select("id,event_type,created_at,changes")
      .eq("company_id", companyId)
      .eq("shift_id", shiftId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setRows(data || []);
        setError(!!error);
      });
  }, [companyId, shiftId]);
  return (
    <section className={panel}>
      <h2 className="text-lg font-semibold text-white">Shift history</h2>
      {error ? (
        <p role="alert" className="text-red-400">
          Could not load shift history. Refresh to retry.
        </p>
      ) : rows.length ? (
        <ul className="divide-y divide-gray-800">
          {rows.map((row) => (
            <li key={row.id} className="text-gray-300 py-3">
              {label(row.event_type)} · {date(row.created_at)}
              <p className="text-xs text-gray-400">
                {Object.keys(row.changes || {})
                  .map(label)
                  .join(", ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No history recorded yet.</p>
      )}
    </section>
  );
}
