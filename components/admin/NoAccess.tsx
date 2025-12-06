"use client";

import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function NoAccess({ message }: { message: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-black text-gray-200">
      {/* LOCK ICON */}
      <LockClosedIcon className="w-16 h-16 text-brand-red mb-6" />

      {/* TITLE */}
      <h1 className="text-3xl font-semibold tracking-wide mb-2">
        ACCESS DENIED
      </h1>

      {/* MESSAGE */}
      <p className="text-gray-400 mb-8 max-w-md text-lg">{message}</p>

      {/* BACK TO DASHBOARD */}
      <Link
        href="/admin"
        className="rounded-full border border-gray-700 bg-black px-6 py-2.5 text-sm font-semibold text-gray-200 hover:text-adidaya-red hover:border-adidaya-red"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}