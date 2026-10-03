"use client";
import { RecordRoute } from "@/components/RecordPage";
import ShiftRecordPage from "../../components/ShiftRecordPage";
export default function Page() {
  return (
    <RecordRoute back="/rotas">
      {(id) => <ShiftRecordPage id={id} mode="view" />}
    </RecordRoute>
  );
}
