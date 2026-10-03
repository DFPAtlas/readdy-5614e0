"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { useTenantRecord } from "@/lib/useTenantRecord";
import { useShifts, type Shift, type ShiftForm } from "@/lib/useShifts";
import {
  RecordState,
  panel,
  button,
  date,
  label,
} from "@/components/RecordPage";
import ShiftModal from "./ShiftModal";
import { useRotaPublish } from "@/lib/useRotaPublish";
import ShiftHistory from "./ShiftHistory";
export default function ShiftRecordPage({
  id = "",
  mode,
}: {
  id?: string;
  mode: "view" | "edit" | "new";
}) {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { can, loading: permissionLoading } = useMyPermissions(
    profile?.id || null,
    companyId,
  );
  const allowed = can(
    "rotas",
    mode === "new" ? "create" : mode === "edit" ? "edit" : "view",
  );
  const { record, loading, error, reload } = useTenantRecord<
    Shift & {
      sites?: { site_name: string };
      guards?: { first_name: string; last_name: string };
    }
  >(
    "shifts",
    id,
    companyId,
    undefined,
    mode !== "new" && allowed,
    "*, sites(site_name), guards(first_name,last_name)",
  );
  const weekStart = useMemo(
    () =>
      startOfWeek(new Date(record?.start_time || Date.now()), {
        weekStartsOn: 1,
      }),
    [record?.start_time],
  );
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const { shifts, createShift, updateShift } = useShifts(weekStart, weekEnd);
  const {
    published,
    fetchPublished,
    isAdmin,
    loading: lockLoading,
    error: lockError,
  } = useRotaPublish();
  useEffect(() => {
    fetchPublished(weekStart);
  }, [fetchPublished, weekStart]);
  const locked = !!published && !isAdmin;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const save = async (payload: ShiftForm) => {
    if (saving || !allowed || locked || lockLoading || lockError) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result =
        mode === "new"
          ? await createShift(payload)
          : await updateShift(id, payload);
      if (result.error || !result.data)
        throw new Error(result.error?.message || "Could not save this shift.");
      router.push(`/rotas/shifts/detail?id=${result.data.id}`);
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : "Could not save the shift. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  };
  const cancel = async () => {
    if (!can("rotas", "edit") || saving || locked || lockLoading || lockError)
      return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateShift(id, { status: "cancelled" });
      if (result.error || !result.data)
        throw new Error(result.error?.message || "Could not save this shift.");
      setConfirmCancel(false);
      await reload();
    } catch {
      setSaveError("Could not cancel this shift. Please retry.");
    } finally {
      setSaving(false);
    }
  };
  if (permissionLoading || (mode !== "new" && loading))
    return <RecordState loading back="/rotas" />;
  if (!allowed)
    return (
      <RecordState
        error="You do not have permission to access this shift."
        back="/rotas"
      />
    );
  if (mode !== "new" && !record)
    return <RecordState error={error} back="/rotas" retry={reload} />;
  if (mode !== "view" && (locked || lockError))
    return (
      <RecordState
        error={
          lockError ||
          "This rota is published. Contact an admin to make changes."
        }
        back="/rotas"
      />
    );
  if (mode !== "view")
    return (
      <ShiftModal
        fullPage
        editingShift={mode === "edit" ? record : null}
        allShifts={shifts}
        saving={saving}
        saveError={saveError}
        onSave={save}
        onClose={() =>
          router.push(id ? `/rotas/shifts/detail?id=${id}` : "/rotas")
        }
      />
    );
  return (
    record && (
      <div className="max-w-5xl mx-auto space-y-5">
        <Link href="/rotas" className="text-blue-400">
          Back to rota
        </Link>
        <section className={panel}>
          <h1 className="text-2xl font-semibold text-white">
            {record.sites?.site_name || "Shift details"}
          </h1>
          <p className="text-gray-300">
            {date(record.start_time)} — {date(record.end_time)}
          </p>
          <p className="text-gray-300">
            {record.guards
              ? `${record.guards.first_name || ""} ${record.guards.last_name || ""}`
              : "Unassigned"}{" "}
            · {label(record.status)} · {label(record.shift_type)}
          </p>
          <p className="text-gray-300 whitespace-pre-wrap">
            {record.notes || "No shift notes recorded."}
          </p>
          {can("rotas", "edit") && !locked && !lockLoading && !lockError && (
            <div className="flex flex-wrap gap-3">
              <Link className={button} href={`/rotas/shifts/edit?id=${id}`}>
                Edit / reassign
              </Link>
              {record.status !== "cancelled" && (
                <button
                  className={button}
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel shift
                </button>
              )}
              <Link
                className={button}
                href={`/rotas/shifts/duplicate?id=${id}`}
              >
                Duplicate shift
              </Link>
            </div>
          )}
          {confirmCancel && (
            <div role="alert" className="text-amber-300">
              <p>Cancel this shift? It will remain in the history.</p>
              <button className={button} onClick={cancel} disabled={saving}>
                Confirm cancellation
              </button>
              <button className="ml-4" onClick={() => setConfirmCancel(false)}>
                Keep shift
              </button>
            </div>
          )}
          {saveError && (
            <p className="text-red-400" role="alert">
              {saveError}
            </p>
          )}
        </section>
        <ShiftHistory shiftId={id} />
      </div>
    )
  );
}
