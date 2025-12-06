"use client";

import { useState } from "react";
import { PublicTabs } from "@/components/ui/PublicTabs";

import ProfileSection from "./sections/ProfileSection";
import PillarsSection from "./sections/PillarsSection";
import ProcessSection from "./sections/ProcessSection";
import PeopleSection from "./sections/PeopleSection";

export default function StudioPage() {
  const [tab, setTab] = useState("profile");
  const [open, setOpen] = useState(true);

  const tabs = [
    { label: "Profile", value: "profile" },
    { label: "Pillars", value: "pillars" },
    { label: "Process", value: "process" },
    { label: "People", value: "people" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 pt-16 pb-24">

      {/* TITLE */}
      <h1 className="text-center text-5xl font-bold mb-12 tracking-tight">
        <span className="text-adidaya-red">*</span> Studio
      </h1>

      {/* TABS */}
      <PublicTabs
        tabs={tabs}
        active={tab}
        onChange={(v) => {
          setTab(v);
          setOpen(true);
        }}
      />

      {/* DROPDOWN HEADER */}
      <div
        className="flex items-center justify-between cursor-pointer mb-10"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-adidaya-red text-3xl">*</span>
          {tabs.find((t) => t.value === tab)?.label}
        </h2>
        <span className="text-white text-xl">{open ? "▾" : "▸"}</span>
      </div>

      {/* CONTENT */}
      {open && (
        <div className="animate-opacity">
          {tab === "profile" && <ProfileSection />}
          {tab === "pillars" && <PillarsSection />}
          {tab === "process" && <ProcessSection />}
          {tab === "people" && <PeopleSection />}
        </div>
      )}

    </div>
  );
}
