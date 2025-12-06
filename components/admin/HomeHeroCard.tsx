"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomeHeroCard() {
  const router = useRouter();

  return (
    <motion.div
      layout
      className="rounded-3xl bg-[#0b0b0b] border border-gray-800/60 px-6 py-5 flex flex-col justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Home
        </p>
        <h2 className="mt-2 text-lg font-semibold text-gray-100">
          Hero Image
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Set the main hero and featured image on homepage.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/admin/home-hero")}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-adidaya-red hover:text-white"
        >
          Edit Hero Image
        </button>
        <button
          onClick={() => window.open("/", "_blank")}
          className="rounded-full border border-gray-700 bg-black/60 px-5 py-2 text-xs font-medium text-gray-200 hover:text-adidaya-red hover:border-adidaya-red"
        >
          Preview Home
        </button>
      </div>
    </motion.div>
  );
}
