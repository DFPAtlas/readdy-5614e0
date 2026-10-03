"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
export const panel =
  "bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-3";
export const button =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50";
export const input =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white";
export function RecordState({
  loading,
  error,
  back,
  retry,
}: {
  loading?: boolean;
  error?: string | null;
  back: string;
  retry?: () => void;
}) {
  return (
    <div className={panel}>
      <p role={error ? "alert" : "status"} className="text-gray-300">
        {loading
          ? "Loading record…"
          : error || "Record not found or you do not have access."}
      </p>
      {!loading && (
        <div className="flex gap-4">
          <Link className="text-blue-400" href={back}>
            Back to list
          </Link>
          {retry && (
            <button className="text-blue-400" onClick={retry}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
export function RecordRoute({
  children,
  back,
}: {
  children: (id: string) => React.ReactNode;
  back: string;
}) {
  return (
    <Suspense fallback={<RecordState loading back={back} />}>
      <RecordId back={back}>{children}</RecordId>
    </Suspense>
  );
}
function RecordId({
  children,
  back,
}: {
  children: (id: string) => React.ReactNode;
  back: string;
}) {
  const id = useSearchParams().get("id");
  return id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    ) ? (
    children(id)
  ) : (
    <RecordState error="A valid record ID is required." back={back} />
  );
}
export function date(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("en-GB") : "—";
}
export function label(value: string | null | undefined) {
  return (value || "—").replace(/_/g, " ");
}
