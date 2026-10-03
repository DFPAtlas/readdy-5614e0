"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { useTenantRecord } from "@/lib/useTenantRecord";
import { useGuards, type Guard, type GuardForm } from "@/lib/useGuards";
import { useEntitlements } from "@/lib/useEntitlements";
import { isTitanOrUnlimited } from "@/lib/featureMap";
import { RecordState, panel } from "@/components/RecordPage";
import GuardModal from "./GuardModal";
import GuardProfileDrawer from "./GuardProfileDrawer";
import GuardTraining from "./GuardTraining";
export default function GuardRecordPage({
  id = "",
  mode,
}: {
  id?: string;
  mode: "view" | "edit" | "new";
}) {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { can, loading: permissionsLoading } = useMyPermissions(
    profile?.id || null,
    companyId,
  );
  const allowed = can(
    "staff",
    mode === "new" ? "create" : mode === "edit" ? "edit" : "view",
  );
  const { record, loading, error, reload } = useTenantRecord<Guard>(
    "guards",
    id,
    companyId,
    undefined,
    mode !== "new" && allowed,
  );
  const { guards, loading: guardsLoading, addGuard, updateGuard } = useGuards();
  const { entitlements, loading: entitlementLoading } = useEntitlements();
  const back = mode === "edit" ? `/guards/detail?id=${id}` : "/guards";
  if (
    permissionsLoading ||
    (mode !== "new" && loading) ||
    (mode === "new" && (guardsLoading || entitlementLoading))
  )
    return <RecordState loading back="/guards" />;
  if (!allowed)
    return (
      <RecordState
        error="You do not have permission to access this page."
        back="/guards"
      />
    );
  if (mode !== "new" && !record)
    return <RecordState error={error} back="/guards" retry={reload} />;
  const save = async (payload: GuardForm) => {
    if (!allowed || !companyId)
      return { success: false, message: "Permission denied." };
    if (mode === "new") {
      const max = entitlements?.maxGuards ?? 0;
      if (
        !isTitanOrUnlimited(max) &&
        guards.filter((g) => g.status === "active").length >= max
      )
        return {
          success: false,
          message:
            "Your guard limit has been reached. Upgrade your plan to add another guard.",
        };
    }
    try {
      const result =
        mode === "new"
          ? await addGuard(payload)
          : await updateGuard(id, payload);
      if (result.error || !result.data)
        return {
          success: false,
          message:
            "The guard could not be saved. Please check your access and retry.",
        };
      router.push(`/guards/detail?id=${result.data.id}`);
      return { success: true };
    } catch {
      return {
        success: false,
        message: "The guard could not be saved. Please retry.",
      };
    }
  };
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">
        {mode === "view"
          ? "Guard profile"
          : mode === "edit"
            ? "Edit guard"
            : "New guard"}
      </h1>
      {mode === "view" ? (
        <>
          <GuardProfileDrawer
            fullPage
            guard={record}
            onClose={() => router.push("/guards")}
            onEdit={() => router.push(`/guards/edit?id=${id}`)}
            canEdit={can("staff", "edit")}
            canViewIncidents={can("incidents", "view")}
          />
          <section className={panel}>
            <GuardTraining guardId={id} />
          </section>
        </>
      ) : (
        <GuardModal
          fullPage
          editingGuard={mode === "edit" ? record : null}
          onSave={save}
          onClose={() => router.push(back)}
        />
      )}
    </div>
  );
}
