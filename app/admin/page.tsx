"use client";

import useUserProfile from "@/hooks/useUserProfile";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import DashboardContent from "@/components/admin/DashboardContent";

export default function AdminDashboardPage() {
  const { profile, loading } = useUserProfile();

  // Logging
  console.log("PROFILE:", profile);
  console.log("LOADING:", loading);

  /* ============================
     1. LOADING STATE
     ============================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading session...
      </div>
    );
  }

  /* ============================
     2. NO SESSION AT ALL → NO ACCESS
     ============================ */
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        No access.
      </div>
    );
  }

  /* ============================
     3. VALID SESSION (admin, supervisor, staff)
     Semua diperbolehkan masuk dashboard.
     Detail role-based dikontrol oleh DashboardContent.
     ============================ */
  return (
    <div className="min-h-screen bg-black text-white pb-12 pt-6">
      <div className="max-w-5xl mx-auto px-4">
        <HeaderAdmin profile={profile} />
        <DashboardContent role={profile.role ?? "staff"} />
      </div>
    </div>
  );
}
