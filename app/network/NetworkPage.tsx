// components/network/NetworkPage.tsx
"use client";

import { useState } from "react";
import ContactSection from "./ContactSection";
import CareerSection from "./CareerSection";

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<"contact" | "career">("contact");

  return (
    <main className="min-h-screen bg-adidaya-black text-white flex flex-col items-center pt-16 pb-24">
      {/* Title */}
      <h1 className="text-center text-5xl font-bold mb-12 tracking-tight">
        <span className="text-adidaya-red">*</span> Network
      </h1>

      {/* Tabs */}
      <div className="border border-adidaya-red rounded-full p-2 flex gap-3 mb-16 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-6 py-2 rounded-full text-sm font-regular transition-all duration-200
            ${
              activeTab === "contact"
                ? "bg-adidaya-red text-white font-extrabold"
                : "bg-gray-200 text-gray-700 hover:bg-adidaya-red hover:text-black"
            }
          `}
        >
          Contact
        </button>

        <button
          onClick={() => setActiveTab("career")}
          className={`px-6 py-2 rounded-full text-sm font-regular transition-all duration-200
            ${
              activeTab === "career"
                ? "bg-adidaya-red text-white font-extrabold"
                : "bg-gray-200 text-gray-700 hover:bg-adidaya-red hover:text-black"
            }
          `}
        >
          Career
        </button>
      </div>

      {/* Content */}
      <section className="w-full max-w-5xl px-4">
        {activeTab === "contact" ? <ContactSection /> : <CareerSection />}
      </section>
    </main>
  );
}
