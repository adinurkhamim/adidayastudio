"use client";

import { Suspense } from "react";
import EditCareerForm from "./EditCareerForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <EditCareerForm />
    </Suspense>
  );
}
