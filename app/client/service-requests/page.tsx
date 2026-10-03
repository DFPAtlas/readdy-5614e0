"use client";

import { useState, useEffect, useCallback } from "react";
import { phaseOneSupabase as supabase } from "@/lib/phaseOneSupabase";
import { useAuth } from "@/lib/auth";
import { useClientAuth } from "@/lib/useClientAuth";
import Link from "next/link";

interface ServiceRequest {
  id: string;
  request_type: string;
  priority: string;
  description: string;
  status: string;
  site_id: string | null;
  site_name: string | null;
  assigned_to_name: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  sla_due_at: string | null;
}

const REQUEST_TYPES: Record<string, string> = {
  additional_guarding: "Additional Guarding",
  shift_change: "Shift Change",
  event_coverage: "Event Coverage",
  access_issue: "Access Issue",
  patrol_request: "Patrol Request",
  report_request: "Report Request",
  service_complaint: "Service Complaint",
  general_enquiry: "General Enquiry",
};

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  acknowledged: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  under_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  awaiting_client: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  scheduled: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  canceled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TYPE_ICONS: Record<string, string> = {
  additional_guarding: "ri-shield-user-line",
  shift_change: "ri-calendar-event-line",
  event_coverage: "ri-calendar-check-line",
  access_issue: "ri-door-lock-line",
  patrol_request: "ri-route-line",
  report_request: "ri-file-list-3-line",
  service_complaint: "ri-error-warning-line",
  general_enquiry: "ri-question-line",
};

export default function ClientServiceRequestsPage({
  createMode = false,
}: {
  createMode?: boolean;
}) {
  const { profile, companyId } = useAuth();
  const { clientId, clientRole, loading: identityLoading } = useClientAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [sites, setSites] = useState<{ id: string; site_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(createMode);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    request_type: "general_enquiry",
    priority: "normal",
    description: "",
    site_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile || !clientId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: sitesData } = await supabase
      .from("sites")
      .select("id, site_name")
      .eq("client_id", clientId)
      .eq("company_id", companyId);
    setSites(sitesData || []);

    const { data: reqs, error: requestError } = await supabase
      .from("service_requests")
      .select("*")
      .eq("client_id", clientId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50);

    setError(requestError ? "Could not load service requests." : null);
    const enriched: ServiceRequest[] = (reqs || []).map((r: any) => ({
      id: r.id,
      request_type: r.request_type ?? "general_enquiry",
      priority: r.priority ?? "normal",
      description: r.description ?? "",
      status: r.status ?? "submitted",
      site_id: r.site_id ?? null,
      site_name:
        (sitesData || []).find((s: any) => s.id === r.site_id)?.site_name ??
        null,
      assigned_to_name: r.assigned_to_name ?? null,
      resolution: r.resolution ?? null,
      created_at: r.created_at ?? "",
      updated_at: r.updated_at ?? "",
      closed_at: r.closed_at ?? null,
      sla_due_at: r.sla_due_at ?? null,
    }));
    setRequests(enriched);
    setLoading(false);
  }, [profile, clientId, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setToast({ msg: "Please enter a description", type: "error" });
      return;
    }
    if (submitting || !clientId || clientRole === "viewer") return;
    if (!profile?.id || !companyId) {
      setToast({
        msg: "Your session has expired. Please sign in again.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    const { error, data } = await supabase
      .from("service_requests")
      .insert({
        company_id: companyId,
        client_id: clientId,
        site_id: form.site_id || null,
        requester_id: profile.id,
        request_type: form.request_type,
        priority: form.priority,
        description: form.description.trim(),
        status: "submitted",
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      setToast({ msg: "Failed to submit", type: "error" });
      return;
    }
    window.location.assign(`/client/service-requests/detail?id=${data.id}`);
    setToast({ msg: "Request submitted", type: "success" });
    setComposing(false);
    setForm({
      request_type: "general_enquiry",
      priority: "normal",
      description: "",
      site_id: "",
    });
    fetchData();
    setTimeout(() => setToast(null), 3000);
  };

  const filtered =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  if (loading || identityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !clientId)
    return (
      <div role="alert" className="text-gray-300">
        {error || "Your account is not linked to a client."}
        <button className="text-blue-400 ml-4" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeSlide { animation: fadeSlide 0.25s ease-out both; }
      `}</style>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Service Requests
          </h1>
          <p className="text-gray-400 mt-1">
            Request additional services, report issues, or make enquiries
          </p>
        </div>
        <button
          disabled={clientRole === "viewer"}
          onClick={() =>
            createMode
              ? setComposing(!composing)
              : window.location.assign("/client/service-requests/new")
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={composing ? "ri-close-line" : "ri-add-line"}></i>
          </div>
          {composing ? "Cancel" : "New Request"}
        </button>
      </div>

      {/* Compose form */}
      {composing && clientRole !== "viewer" && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">
            New Service Request
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Request Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(REQUEST_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setForm((f) => ({ ...f, request_type: key }))
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap transition-colors ${
                      form.request_type === key
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Priority
              </label>
              <div className="flex gap-1.5">
                {["low", "normal", "high", "urgent"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap capitalize ${
                      form.priority === p
                        ? PRIORITY_STYLES[p] + " ring-1 ring-white/20"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Site</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setForm((f) => ({ ...f, site_id: "" }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                    !form.site_id
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  All Sites
                </button>
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setForm((f) => ({ ...f, site_id: s.id }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                      form.site_id === s.id
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {s.site_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe what you need..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.description.length}/500
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${
            statusFilter === "all"
              ? "bg-white/10 text-white"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          All ({requests.length})
        </button>
        {Object.keys(STATUS_STYLES)
          .filter((s) => statusCounts[s])
          .map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap capitalize ${
                statusFilter === status
                  ? STATUS_STYLES[status] + " ring-1 ring-white/20"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {status.replace(/_/g, " ")} ({statusCounts[status]})
            </button>
          ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
            <i className="ri-question-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-gray-400 font-medium">No service requests found</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a new request using the button above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg flex-shrink-0 mt-0.5">
                    <i
                      className={`${TYPE_ICONS[r.request_type] || "ri-question-line"} text-gray-400 text-sm`}
                    ></i>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        className="text-sm font-semibold text-blue-400"
                        href={`/client/service-requests/detail?id=${r.id}`}
                      >
                        {REQUEST_TYPES[r.request_type] || r.request_type}
                      </Link>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[r.status] || STATUS_STYLES.submitted}`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.normal}`}
                      >
                        {r.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {r.site_name && <span>{r.site_name}</span>}
                      <span>
                        Submitted{" "}
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {r.sla_due_at && (
                        <span
                          className={
                            new Date(r.sla_due_at) < new Date()
                              ? "text-red-400"
                              : "text-gray-500"
                          }
                        >
                          Due{" "}
                          {new Date(r.sla_due_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    {r.resolution && (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-500 mb-0.5">
                          Resolution
                        </p>
                        <p className="text-sm text-gray-300">{r.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 animate-fadeSlide ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i
              className={
                toast.type === "success"
                  ? "ri-check-line"
                  : "ri-error-warning-line"
              }
            ></i>
          </div>
          <span className="text-sm font-medium">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded cursor-pointer"
          >
            <i className="ri-close-line text-xs"></i>
          </button>
        </div>
      )}
    </div>
  );
}
