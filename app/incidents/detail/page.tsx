"use client";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { RecordRoute, RecordState } from "@/components/RecordPage";
import IncidentDetailClient from "../[id]/IncidentDetailClient";
export default function Page() {
  const { profile, companyId } = useAuth();
  const { can, loading } = useMyPermissions(profile?.id || null, companyId);
  if (loading) return <RecordState loading back="/incidents" />;
  if (!can("incidents", "view"))
    return (
      <RecordState
        error="You do not have permission to view incidents."
        back="/incidents"
      />
    );
  return (
    <RecordRoute back="/incidents">
      {(id) => <IncidentDetailClient incidentId={id} />}
    </RecordRoute>
  );
}
