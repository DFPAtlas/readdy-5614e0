"use client";
import { RecordRoute } from "@/components/RecordPage";
import GuardRecordPage from "../components/GuardRecordPage";
export default function Page() {
  return (
    <RecordRoute back="/guards">
      {(id) => <GuardRecordPage id={id} mode="view" />}
    </RecordRoute>
  );
}
