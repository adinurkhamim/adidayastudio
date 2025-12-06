"use client";

import { Suspense } from "react";
import CreateCareerForm from "./CreateCareerForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <CreateCareerForm />
    </Suspense>
  );
}
