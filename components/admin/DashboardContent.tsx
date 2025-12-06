"use client";

import HomeHeroCard from "./HomeHeroCard";
import PeopleCard from "./PeopleCard";
import StatsProjects from "./StatsProjects";
import StatsInsights from "./StatsInsights";
import StatsCareers from "./StatsCareers";

export default function DashboardContent({ role }: { role: string }) {
  return (
    <div className="space-y-10">

      {/* ============================== */}
      {/* ROW 1 — 2 columns */}
      {/* ============================== */}
      {(role === "admin" || role === "supervisor") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomeHeroCard />
          <PeopleCard />
        </div>
      )}

      {/* ============================== */}
      {/* ROW 2 — 3 columns */}
      {/* ============================== */}
      <div
        className={`
          grid gap-6
          ${role === "admin" || role === "supervisor"
            ? "grid-cols-1 md:grid-cols-3"
            : role === "staff"
            ? "grid-cols-1 md:grid-cols-2"
            : ""
          }
        `}
      >
        {/* PROJECT (semua role) */}
        <StatsProjects />

        {/* INSIGHT (semua role) */}
        <StatsInsights />

        {/* CAREER (admin & supervisor only) */}
        {(role === "admin" || role === "supervisor") && <StatsCareers />}
      </div>

    </div>
  );
}
