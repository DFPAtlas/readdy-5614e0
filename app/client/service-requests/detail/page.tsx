"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { useClientAuth } from "@/lib/useClientAuth";
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
import type { PhaseOneDatabase as Database } from "@/lib/phaseOneDatabase.types";
type Request = Database["public"]["Tables"]["service_requests"]["Row"];
function Detail({ id }: { id: string }) {
  const { companyId, currentUser } = useAuth();
  const { clientId, clientRole, loading: identityLoading } = useClientAuth();
  const { record, loading, error, reload } = useTenantRecord<Request>(
    "service_requests",
    id,
    companyId,
    { column: "client_id", id: clientId },
    true,
    "id, company_id, client_id, site_id, requester_id, request_type, priority, description, status, resolution, sla_due_at, created_at, updated_at, closed_at, attachment_paths",
  );
  const [events, setEvents] = useState<any[]>([]);
  const [eventError, setEventError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const loadEvents = useCallback(async () => {
    if (!companyId || !clientId) return;
    const result = await supabase
      .from("service_request_events")
      .select("id,event_type,body,attachment_path,attachment_name,created_at")
      .eq("company_id", companyId)
      .eq("request_id", id)
      .order("created_at");
    setEventError(result.error ? "Could not load request history." : null);
    setEvents(result.data || []);
  }, [companyId, clientId, id]);
  useEffect(() => {
    if (record) loadEvents();
  }, [record, loadEvents]);
  const act = async (action: "message" | "close" | "reopen") => {
    if (saving || !record || !companyId || !clientId || clientRole === "viewer")
      return;
    setSaving(true);
    setNotice(null);
    let path: string | null = null;
    try {
      if (action === "message" && !message.trim() && !file) throw new Error();
      if (file && action === "message") {
        if (
          file.size > 10 * 1024 * 1024 ||
          !["application/pdf", "image/jpeg", "image/png"].includes(file.type)
        )
          throw new Error("Use a PDF, JPG or PNG up to 10 MB.");
        path = `${companyId}/${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const upload = await supabase.storage
          .from("service-request-attachments")
          .upload(path, file, { upsert: false });
        if (upload.error) throw new Error("Could not upload your attachment.");
      }
      const result = await supabase.rpc("client_service_request_action", {
        p_request_id: id,
        p_action: action,
        p_body: message.trim() || null,
        p_attachment_path: path,
        p_attachment_name: path ? file?.name : null,
      });
      if (result.error)
        throw new Error("Could not save this request update. Please retry.");
      setMessage("");
      setFile(null);
      setNotice("Request updated.");
      await reload();
      await loadEvents();
    } catch (e) {
      if (path)
        await supabase.storage
          .from("service-request-attachments")
          .remove([path]);
      setNotice(
        e instanceof Error ? e.message : "Could not update the request.",
      );
    } finally {
      setSaving(false);
    }
  };
  const download = async (path: string) => {
    const result = await supabase.storage
      .from("service-request-attachments")
      .createSignedUrl(path, 60);
    if (result.error || !result.data) {
      setNotice("Could not open this attachment. Please retry.");
      return;
    }
    window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
  };
  if (identityLoading || loading)
    return <RecordState loading back="/client/service-requests" />;
  if (!record)
    return (
      <RecordState
        error={error}
        back="/client/service-requests"
        retry={reload}
      />
    );
  const closed = ["closed", "completed", "canceled", "declined"].includes(
    record.status || "",
  );
  return (
    <div className="max-w-4xl space-y-5">
      <Link className="text-blue-400" href="/client/service-requests">
        Back to requests
      </Link>
      <section className={panel}>
        <h1 className="text-2xl font-semibold text-white capitalize">
          {label(record.request_type)}
        </h1>
        <p className="text-gray-300 capitalize">
          {label(record.status)} · {label(record.priority)} priority
        </p>
        <p className="text-gray-300 whitespace-pre-wrap">
          {record.description}
        </p>
        <p className="text-gray-400">
          Submitted {date(record.created_at)} · Updated{" "}
          {date(record.updated_at)} · Due {date(record.sla_due_at)}
        </p>
        {record.resolution && (
          <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
            <h2 className="text-white">Resolution</h2>
            <p className="whitespace-pre-wrap">{record.resolution}</p>
          </div>
        )}
        {clientRole !== "viewer" && (
          <button
            className={button}
            disabled={saving}
            onClick={() => act(closed ? "reopen" : "close")}
          >
            {closed ? "Reopen request" : "Close request"}
          </button>
        )}
      </section>
      <section className={panel}>
        <h2 className="text-lg text-white">Communication and status history</h2>
        {eventError ? (
          <RecordState
            error={eventError}
            back="/client/service-requests"
            retry={loadEvents}
          />
        ) : events.length ? (
          <ul className="divide-y divide-gray-800">
            {events.map((e) => (
              <li key={e.id} className="py-3 text-gray-300">
                <p className="text-xs text-gray-400">
                  {label(e.event_type)} · {date(e.created_at)}
                </p>
                <p className="whitespace-pre-wrap">{e.body}</p>
                {e.attachment_path && (
                  <button
                    className="text-blue-400"
                    onClick={() => download(e.attachment_path)}
                  >
                    {e.attachment_name || "Open attachment"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No conversation entries yet.</p>
        )}
        {clientRole !== "viewer" && !closed && (
          <>
            <label className="text-gray-300 block" htmlFor="request-message">
              Add a message
            </label>
            <textarea
              id="request-message"
              className={input}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <label className="block text-gray-400 text-sm">
              Attachment (PDF, JPG or PNG, up to 10 MB)
              <input
                className="block mt-2"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={saving}
              />
            </label>
            <button
              className={button}
              disabled={saving || (!message.trim() && !file)}
              onClick={() => act("message")}
            >
              {saving ? "Sending…" : "Send message"}
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
    <RecordRoute back="/client/service-requests">
      {(id) => <Detail id={id} />}
    </RecordRoute>
  );
}
