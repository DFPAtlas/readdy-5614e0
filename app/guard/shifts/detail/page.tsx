"use client";
import { RecordRoute } from "@/components/RecordPage";
import GuardShiftDetail from "../GuardShiftDetail";
export default function Page() {
  return (
    <RecordRoute back="/guard/shifts">
      {(id) => <GuardShiftDetail id={id} />}
    </RecordRoute>
  );
}
