"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useGuardAuth } from "@/lib/useGuardAuth";
import { useTenantRecord } from "@/lib/useTenantRecord";
import type { GuardShift } from "@/lib/useGuardPortal";
import {
  RecordState,
  panel,
  button,
  input,
  date,
  label,
} from "@/components/RecordPage";
import HomeTab from "../components/HomeTab";
import GuardTopBar from "../components/GuardTopBar";
import GuardBottomNav from "../components/GuardBottomNav";
export default function GuardShiftDetail({ id }: { id: string }) {
  const g = useGuardAuth();
  const { record, loading, error, reload } = useTenantRecord<GuardShift>(
    "shifts",
    id,
    g.companyId,
    { column: "guard_id", id: g.guardId },
    !g.loading,
    "id,site_id,guard_id,start_time,end_time,status,notes,site:sites(id,site_name,address,latitude,longitude,assignment_instructions,site_contact_phone,client_contact_name,client_contact_email,client_name,check_call_interval)",
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [handover, setHandover] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const loadAck = useCallback(async () => {
    if (!g.companyId || !g.guardId) return;
    const result = await supabase
      .from("shift_acknowledgements")
      .select("id")
      .eq("company_id", g.companyId)
      .eq("guard_id", g.guardId)
      .eq("shift_id", id)
      .maybeSingle();
    if (result.error)
      setNotice("Could not load acknowledgement status. Refresh to retry.");
    else setAcknowledged(!!result.data);
  }, [g.companyId, g.guardId, id]);
  useEffect(() => {
    if (record) loadAck();
  }, [record, loadAck]);
  const acknowledge = async () => {
    if (saving || !g.companyId || !g.guardId) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await supabase
        .from("shift_acknowledgements")
        .insert({ company_id: g.companyId, guard_id: g.guardId, shift_id: id })
        .select("id")
        .single();
      if (result.error && result.error.code !== "23505") throw result.error;
      setAcknowledged(true);
      setNotice("Shift instructions acknowledged.");
    } catch {
      setNotice("Could not save acknowledgement. Please retry.");
    } finally {
      setSaving(false);
    }
  };
  const saveHandover = async () => {
    if (saving || !handover.trim() || !record || !g.companyId || !g.guardId)
      return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await supabase
        .from("occurrence_books")
        .insert({
          company_id: g.companyId,
          guard_id: g.guardId,
          site_id: record.site_id,
          shift_id: id,
          entry_type: "General",
          title: "Shift handover",
          entry: handover.trim(),
          client_visible: false,
        })
        .select("id")
        .single();
      if (result.error || !result.data) throw new Error();
      setHandover("");
      setNotice("Handover saved to the occurrence book.");
    } catch {
      setNotice("Could not save your handover. Please retry.");
    } finally {
      setSaving(false);
    }
  };
  if (g.loading || loading) return <RecordState loading back="/guard/shifts" />;
  if (!record)
    return <RecordState error={error} back="/guard/shifts" retry={reload} />;
  const active =
    (!g.activeAttendance || g.activeAttendance.shift_id === id) &&
    record.status !== "cancelled" &&
    (g.todayShift?.id === id || g.activeAttendance?.shift_id === id);
  const ownAttendance =
    g.activeAttendance?.shift_id === id ? g.activeAttendance : null;
  return (
    <div className="min-h-screen bg-black text-white">
      <GuardTopBar siteName={record.site?.site_name || "Shift details"} />
      <main className="max-w-lg mx-auto pt-16 pb-24 px-4 space-y-5">
        <Link href="/guard/shifts" className="text-blue-400">
          Back to shifts
        </Link>
        <section className={panel}>
          <h1 className="text-xl font-semibold">
            {record.site?.site_name || "Assigned shift"}
          </h1>
          <p>
            {date(record.start_time)} — {date(record.end_time)}
          </p>
          <p className="text-gray-400 capitalize">{label(record.status)}</p>
          <p>{record.site?.address || "No address recorded."}</p>
          {record.site?.site_contact_phone && (
            <a
              className="text-blue-400 block"
              href={`tel:${record.site.site_contact_phone}`}
            >
              Call site: {record.site.site_contact_phone}
            </a>
          )}
          {record.site?.client_contact_name && (
            <p>Contact: {record.site.client_contact_name}</p>
          )}
        </section>
        <section className={panel}>
          <h2 className="font-semibold">Instructions and duties</h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {record.site?.assignment_instructions ||
              "No site instructions recorded. Contact your manager before starting."}
          </p>
          <p className="text-gray-300 whitespace-pre-wrap">
            {record.notes || "No additional shift notes."}
          </p>
          <button
            className={button}
            onClick={acknowledge}
            disabled={saving || acknowledged || record.status === "cancelled"}
          >
            {acknowledged ? "Acknowledged" : "Acknowledge instructions"}
          </button>
        </section>
        {active && (
          <HomeTab
            todayShift={record}
            nextShift={null}
            activeAttendance={ownAttendance}
            guardId={g.guardId}
            companyId={g.companyId}
            guardName={g.guardName}
            assignedSites={g.assignedSites}
            onRefetch={() => {
              g.refetch();
              reload();
            }}
          />
        )}
        {record.status !== "cancelled" && (
          <section className={panel}>
            <label htmlFor="handover" className="font-semibold block">
              Shift handover
            </label>
            <textarea
              id="handover"
              className={input}
              maxLength={2000}
              value={handover}
              onChange={(e) => setHandover(e.target.value)}
              placeholder="Outstanding issues and notes for the next officer"
            />
            <button
              className={button}
              onClick={saveHandover}
              disabled={saving || !handover.trim()}
            >
              Save handover
            </button>
          </section>
        )}
        {notice && (
          <p className="text-gray-300" role="status">
            {notice}
          </p>
        )}
      </main>
      <GuardBottomNav />
    </div>
  );
}
