"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { useMyPermissions } from "@/lib/usePermissions";
import { useTenantRecord } from "@/lib/useTenantRecord";
import {
  RecordRoute,
  RecordState,
  panel,
  button,
  input,
  date,
  label,
} from "@/components/RecordPage";
import type { PhaseOneDatabase } from "@/lib/phaseOneDatabase.types";
function Detail({ id }: { id: string }) {
  const { profile, companyId } = useAuth();
  const { can, loading: perms } = useMyPermissions(
    profile?.id || null,
    companyId,
  );
  const { record, loading, error, reload } = useTenantRecord<
    PhaseOneDatabase["public"]["Tables"]["service_requests"]["Row"]
  >("service_requests", id, companyId, undefined, can("client_portal", "view"));
  const [events, setEvents] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("submitted");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!record || !companyId) return;
    setStatus(record.status || "submitted");
    setResolution(record.resolution || "");
    supabase
      .from("service_request_events")
      .select("id,event_type,body,created_at")
      .eq("request_id", id)
      .eq("company_id", companyId)
      .order("created_at")
      .then(({ data, error }) => {
        setEvents(data || []);
        if (error) setNotice("Could not load request history.");
      });
  }, [record, companyId, id]);
  const save = async (action: "message" | "status") => {
    if (saving || !companyId || !can("client_portal", "edit")) return;
    setSaving(true);
    setNotice(null);
    try {
      const result =
        action === "message"
          ? await supabase.rpc("client_service_request_action", {
              p_request_id: id,
              p_action: "message",
              p_body: message.trim(),
            })
          : await supabase
              .from("service_requests")
              .update({
                status,
                resolution: resolution.trim() || null,
                updated_at: new Date().toISOString(),
                closed_at: [
                  "completed",
                  "closed",
                  "canceled",
                  "declined",
                ].includes(status)
                  ? new Date().toISOString()
                  : null,
              })
              .eq("company_id", companyId)
              .eq("id", id)
              .select("id")
              .single();
      if (result.error || !result.data) throw new Error();
      setMessage("");
      await reload();
      setNotice("Request updated.");
    } catch {
      setNotice("Could not save this update. Please retry.");
    } finally {
      setSaving(false);
    }
  };
  if (perms || loading)
    return <RecordState loading back="/dashboard/client-management" />;
  if (!record)
    return (
      <RecordState
        error={error}
        back="/dashboard/client-management"
        retry={reload}
      />
    );
  return (
    <div className="max-w-4xl space-y-5">
      <Link className="text-blue-400" href="/dashboard/client-management">
        Back to client management
      </Link>
      <section className={panel}>
        <h1 className="text-2xl text-white capitalize">
          {label(record.request_type)}
        </h1>
        <p className="text-gray-300 whitespace-pre-wrap">
          {record.description}
        </p>
        {can("client_portal", "edit") && (
          <>
            <label className="block text-gray-300">
              Status
              <select
                className={input}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {[
                  "submitted",
                  "acknowledged",
                  "under_review",
                  "awaiting_client",
                  "approved",
                  "declined",
                  "scheduled",
                  "completed",
                  "closed",
                  "canceled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-gray-300">
              Client-visible resolution
              <textarea
                className={input}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                maxLength={2000}
              />
            </label>
            <button
              className={button}
              onClick={() => save("status")}
              disabled={saving}
            >
              Save status / resolution
            </button>
          </>
        )}
      </section>
      <section className={panel}>
        <h2 className="text-lg text-white">Client conversation</h2>
        {events.map((e) => (
          <div
            key={e.id}
            className="text-gray-300 border-b border-gray-800 py-3"
          >
            <p className="text-xs">
              {label(e.event_type)} · {date(e.created_at)}
            </p>
            <p className="whitespace-pre-wrap">{e.body}</p>
          </div>
        ))}
        {can("client_portal", "edit") &&
          !["completed", "closed", "canceled", "declined"].includes(
            record.status || "",
          ) && (
            <>
              <label htmlFor="staff-reply" className="text-gray-300">
                Reply to client
              </label>
              <textarea
                id="staff-reply"
                className={input}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
              />
              <button
                className={button}
                disabled={saving || !message.trim()}
                onClick={() => save("message")}
              >
                Send reply
              </button>
            </>
          )}
        {notice && (
          <p role="status" className="text-gray-300">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}
export default function Page() {
  return (
    <RecordRoute back="/dashboard/client-management">
      {(id) => <Detail id={id} />}
    </RecordRoute>
  );
}
