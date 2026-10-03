"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, startOfWeek } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { useTenantRecord } from "@/lib/useTenantRecord";
import { useShifts, type Shift, type ShiftForm } from "@/lib/useShifts";
import { RecordRoute, RecordState } from "@/components/RecordPage";
import ShiftModal from "../../components/ShiftModal";
function Duplicate({ id }: { id: string }) {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { can, loading: perms } = useMyPermissions(
    profile?.id || null,
    companyId,
  );
  const { record, loading, error, reload } = useTenantRecord<Shift>(
    "shifts",
    id,
    companyId,
    undefined,
    can("rotas", "create"),
  );
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const { shifts, createShift } = useShifts(start, addDays(start, 7));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const save = async (payload: ShiftForm) => {
    if (saving || !can("rotas", "create")) return;
    setSaving(true);
    try {
      const result = await createShift({ ...payload, status: "scheduled" });
      if (result.error || !result.data)
        throw new Error(
          result.error?.message || "Could not duplicate this shift.",
        );
      router.push(`/rotas/shifts/detail?id=${result.data.id}`);
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : "Could not duplicate the shift. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (perms || loading) return <RecordState loading back="/rotas" />;
  if (!can("rotas", "create") || !record)
    return (
      <RecordState
        error={error || "Shift not found or access denied."}
        back="/rotas"
        retry={reload}
      />
    );
  return (
    <div>
      <h1 className="text-xl text-white mb-4">
        Duplicate shift — choose the date and guard
      </h1>
      <ShiftModal
        fullPage
        editingShift={{
          ...record,
          id: "",
          guard_id: null,
          status: "scheduled",
        }}
        allShifts={shifts}
        saving={saving}
        saveError={saveError}
        onSave={save}
        onClose={() => router.push(`/rotas/shifts/detail?id=${id}`)}
      />
    </div>
  );
}
export default function Page() {
  return (
    <RecordRoute back="/rotas">{(id) => <Duplicate id={id} />}</RecordRoute>
  );
}
