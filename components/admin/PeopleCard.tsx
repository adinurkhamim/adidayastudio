"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PeopleCard() {
  const router = useRouter();

  return (
    <motion.div
      layout
      className="rounded-3xl bg-[#0b0b0b] border border-gray-800/60 px-6 py-5 flex flex-col justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Studio • People
        </p>
        <h2 className="mt-2 text-lg font-semibold text-gray-100">
          Studio Team & People
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Update the names and roles shown in the <span className="italic">Studio / People</span> section.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/admin/people")}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-adidaya-red hover:text-white"
        >
          Edit People
        </button>
        <button
          onClick={() => window.open("/studio", "_blank")}
          className="rounded-full border border-gray-700 bg-black/60 px-5 py-2 text-xs font-medium text-gray-200 hover:text-adidaya-red hover:border-adidaya-red"
        >
          Preview Studio
        </button>
      </div>
    </motion.div>
  );
}
