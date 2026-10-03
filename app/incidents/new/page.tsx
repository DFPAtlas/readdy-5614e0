"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { useIncidents, type IncidentForm } from "@/lib/useIncidents";
import { RecordState } from "@/components/RecordPage";
import IncidentModal from "../components/IncidentModal";
export default function Page() {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { can, loading } = useMyPermissions(profile?.id || null, companyId);
  const { addIncident } = useIncidents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (payload: IncidentForm) => {
    if (saving || !can("incidents", "create")) return;
    setSaving(true);
    setError(null);
    try {
      const result = await addIncident(payload);
      if (result.error || !result.data) throw new Error();
      router.push(`/incidents/detail?id=${result.data.id}`);
    } catch {
      setError(
        "Could not save the incident. Your changes are still here; please retry.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <RecordState loading back="/incidents" />;
  if (!can("incidents", "create"))
    return (
      <RecordState
        error="You do not have permission to create incidents."
        back="/incidents"
      />
    );
  return (
    <IncidentModal
      fullPage
      saving={saving}
      saveError={error}
      onSave={save}
      onClose={() => router.push("/incidents")}
    />
  );
}
