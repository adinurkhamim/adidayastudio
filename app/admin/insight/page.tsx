"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import useUserProfile from "@/hooks/useUserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

/* ============================================================
   TYPES
============================================================ */
type Author = {
  name: string;
  role: string;
};

type Insight = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string;
  tags: string[] | null;
  authors: Author[] | null;
  reading_time?: number | null;

  hero_image_url: string | null;
  hero_caption: string | null;

  body_html: string | null;
  status: "draft" | "published";

  created_at: string;
  updated_at: string | null;
  published_at: string | null;
};

/* ============================================================
   HELPERS
============================================================ */
function formatDateLabel(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ============================================================
   ROLE PERMISSIONS
============================================================ */

const canPublish = (role: string | null | undefined) =>
  role === "admin" || role === "supervisor";

const canDelete = (role: string | null | undefined) => role === "admin";

const canEdit = (role: string | null | undefined, status: string) => {
  // Semua boleh edit draft
  if (status === "draft") return true;
  // Published hanya admin & supervisor
  return role === "admin" || role === "supervisor";
};

/* ============================================================
   MAIN PAGE
============================================================ */
export default function AdminInsightListPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* Filters */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const [sortKey, setSortKey] = useState<
    "az" | "created" | "updated" | "published_first" | "draft_first"
  >("created");

  const role = profile?.role ?? null; // "admin" | "supervisor" | "staff" | null

  /* ============================================================
     FETCH DATA
  ============================================================ */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("insight")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load insights");
        setLoading(false);
        return;
      }

      setInsights((data || []) as Insight[]);
      setLoading(false);
    }

    load();
  }, []);

  /* ============================================================
     UNIQUE CATEGORY + AUTHORS
  ============================================================ */
  const categories = useMemo(() => {
    const setC = new Set<string>();
    insights.forEach((i) => setC.add(i.category));
    return [...setC];
  }, [insights]);

  const authorsUnique = useMemo(() => {
    const setA = new Set<string>();
    insights.forEach((i) => i.authors?.forEach((a) => setA.add(a.name)));
    return [...setA];
  }, [insights]);

  /* ============================================================
     FILTER + SORT
  ============================================================ */
  const filtered = useMemo(() => {
    let r = [...insights];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((i) =>
        [
          i.title,
          i.subtitle ?? "",
          i.category,
          ...(i.tags ?? []),
          ...(i.authors?.map((a) => a.name) ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      r = r.filter((i) => i.category === categoryFilter);
    }

    // Author filter
    if (authorFilter !== "all") {
      r = r.filter((i) =>
        i.authors?.some((a) => a.name === authorFilter)
      );
    }

    // Date filters
    const now = new Date();
    r = r.filter((i) => {
      const created = new Date(i.created_at);

      if (dateFilter === "today") {
        return created.toDateString() === now.toDateString();
      }

      if (dateFilter === "week") {
        const diff = (now.getTime() - created.getTime()) / 86400000;
        return diff <= 7;
      }

      if (dateFilter === "month") {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "select-month" && selectedMonth !== "all") {
        return (
          created.getMonth() === MONTHS.indexOf(selectedMonth) &&
          (selectedYear === "all"
            ? true
            : created.getFullYear() === Number(selectedYear))
        );
      }

      if (dateFilter === "select-year" && selectedYear !== "all") {
        return created.getFullYear() === Number(selectedYear);
      }

      return true;
    });

    // Sort
    if (sortKey === "az") {
      r.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortKey === "created") {
      r.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    } else if (sortKey === "updated") {
      r.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      );
    } else if (sortKey === "published_first") {
      r.sort((a, b) => (b.status === "published" ? 1 : -1));
    } else if (sortKey === "draft_first") {
      r.sort((a, b) => (a.status === "draft" ? -1 : 1));
    }

    return r;
  }, [
    insights,
    search,
    categoryFilter,
    authorFilter,
    dateFilter,
    selectedMonth,
    selectedYear,
    sortKey,
  ]);

  /* ============================================================
     ACTIONS WITH ROLE GUARD
  ============================================================ */
  async function togglePublish(i: Insight) {
    if (!canPublish(role)) {
      toast.error("You do not have permission to publish/unpublish.");
      return;
    }

    const next = i.status === "draft" ? "published" : "draft";

    const { error } = await supabase
      .from("insight")
      .update({
        status: next,
        published_at: next === "published" ? new Date().toISOString() : null,
      })
      .eq("id", i.id);

    if (error) {
      toast.error("Failed");
      return;
    }

    setInsights((prev) =>
      prev.map((x) =>
        x.id === i.id
          ? {
              ...x,
              status: next,
              published_at:
                next === "published" ? new Date().toISOString() : null,
            }
          : x
      )
    );
  }

  async function deleteInsight(i: Insight) {
    if (!canDelete(role)) {
      toast.error("Only admin can delete insights.");
      return;
    }

    if (!confirm(`Delete "${i.title}"?`)) return;

    const { error } = await supabase
      .from("insight")
      .delete()
      .eq("id", i.id);

    if (error) {
      toast.error("Failed");
      return;
    }

    setInsights((prev) => prev.filter((x) => x.id !== i.id));
    toast.success("Deleted");
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="min-h-screen bg-black pt-8 pb-16 text-white">
      <div className="mx-auto max-w-5xl px-6">
        {/* LOADING OVERLAY UNTUK PROFILE */}
        {profileLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
            Loading…
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Admin • Insight
              </p>

              <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-semibold text-white">
                    <span className="mr-2 text-adidaya-red">*</span>
                    Insight
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {/* Back to Dashboard */}
                  <button
                    onClick={() => router.push("/admin")}
                    className="rounded-full border border-gray-700 bg-black px-6 py-2.5 text-sm font-semibold text-gray-200 hover:text-adidaya-red hover:border-adidaya-red"
                  >
                    ← Back to Dashboard
                  </button>

                  {/* New Insight – semua role boleh create */}
                  <button
                    onClick={() => router.push("/admin/insight/create")}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-adidaya-red hover:text-white"
                  >
                    + Create Insight
                  </button>
                </div>
              </div>
            </div>

            {/* FILTER PANEL */}
            <div className="space-y-6 mb-12">
              {/* SEARCH */}
              <div className="relative w-full">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search insight..."
                  className="w-full rounded-full bg-[#0d0d0d] border border-neutral-800 px-6 py-3 text-sm text-gray-200 placeholder:text-gray-500 focus:border-neutral-600 outline-none"
                />
                <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.14em] text-gray-600">
                  SEARCH
                </span>
              </div>

              {/* SORT */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  SORT
                </span>

                {[
                  { key: "az", label: "A - Z" },
                  { key: "created", label: "DATE ADDED" },
                  { key: "updated", label: "LAST MODIFIED" },
                  { key: "published_first", label: "PUBLISHED FIRST" },
                  { key: "draft_first", label: "DRAFT FIRST" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() =>
                      setSortKey(s.key as
                        | "az"
                        | "created"
                        | "updated"
                        | "published_first"
                        | "draft_first")
                    }
                    className={`px-4 py-2 rounded-full text-xs transition tracking-wide ${
                      sortKey === s.key
                        ? "bg-white text-black"
                        : "bg-[#0d0d0d] text-neutral-400 border border-neutral-800 hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* FILTER ROW */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Category */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none rounded-full bg-[#0d0d0d] border border-neutral-800 px-4 py-2.5 pr-10 text-xs uppercase tracking-[0.14em] text-gray-200 focus:border-neutral-600"
                >
                  <option value="all">ALL CATEGORIES</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Author */}
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="appearance-none rounded-full bg-[#0d0d0d] border border-neutral-800 px-4 py-2.5 pr-10 text-xs uppercase tracking-[0.14em] text-gray-200 focus:border-neutral-600"
                >
                  <option value="all">ALL AUTHORS</option>
                  {authorsUnique.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                {/* Date */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none rounded-full bg-[#0d0d0d] border border-neutral-800 px-4 py-2.5 pr-10 text-xs uppercase tracking-[0.14em] text-gray-200 focus:border-neutral-600"
                >
                  <option value="all">ALL DATES</option>
                  <option value="today">TODAY</option>
                  <option value="week">THIS WEEK</option>
                  <option value="month">THIS MONTH</option>
                  <option value="select-month">SELECT MONTH…</option>
                  <option value="select-year">SELECT YEAR…</option>
                </select>

                {/* Month Selector */}
                {dateFilter === "select-month" && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none rounded-full bg-[#0d0d0d] border border-neutral-800 px-4 py-2.5 pr-10 text-xs uppercase tracking-[0.14em] text-gray-200"
                  >
                    <option value="all">MONTH</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}

                {/* Year Selector */}
                {["select-month", "select-year"].includes(dateFilter) && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none rounded-full bg-[#0d0d0d] border border-neutral-800 px-4 py-2.5 pr-10 text-xs uppercase tracking-[0.14em] text-gray-200"
                  >
                    <option value="all">YEAR</option>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* LIST */}
            <div className="space-y-4">
              {loading ? (
                <p className="text-neutral-600 text-center py-10">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="rounded-3xl bg-[#0a0a0a] border border-neutral-800 text-center py-16">
                  <p className="text-lg font-semibold">No insights found</p>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your filters.
                  </p>
                </div>
              ) : (
                filtered.map((i) => {
                  const firstAuthor = i.authors?.[0]?.name ?? "—";
                  const dateLabel =
                    i.status === "published"
                      ? formatDateLabel(i.published_at)
                      : formatDateLabel(i.created_at);

                  const editAllowed = canEdit(role, i.status);
                  const publishAllowed = canPublish(role);
                  const deleteAllowed = canDelete(role);

                  return (
                    <motion.div
                      key={i.id}
                      layout
                      className="rounded-3xl bg-[#0b0b0b] border border-neutral-800 overflow-hidden"
                    >
                      {/* SUMMARY */}
                      <div className="flex justify-between items-center px-6 py-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="font-semibold truncate max-w-[180px]">
                            {i.title}
                          </span>

                          <span className="px-3 py-1 rounded-full text-[11px] border border-neutral-700 text-neutral-300 uppercase tracking-[0.14em]">
                            {i.category}
                          </span>

                          <span className="text-xs text-neutral-500">
                            {dateLabel}
                          </span>

                          <span className="text-xs text-neutral-500">
                            {firstAuthor}
                          </span>

                          {i.reading_time !== null &&
                            i.reading_time !== undefined && (
                              <span className="text-xs text-neutral-500">
                                {i.reading_time} min read
                              </span>
                            )}

                          <span
                            className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] ${
                              i.status === "published"
                                ? "bg-emerald-900/40 border border-emerald-700 text-emerald-300"
                                : "bg-orange-900/40 border border-orange-700 text-orange-300"
                            }`}
                          >
                            {i.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === i.id ? null : i.id
                            )
                          }
                          className="text-neutral-500 hover:text-white text-lg"
                        >
                          {expandedId === i.id ? "−" : "+"}
                        </button>
                      </div>

                      {/* EXPANDED */}
                      <AnimatePresence>
                        {expandedId === i.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="border-t border-neutral-800 bg-[#070707] px-6 py-6"
                          >
                            <div className="grid grid-cols-12 gap-8">
                              {/* HERO LEFT */}
                              <div className="col-span-12 md:col-span-4">
                                {i.hero_image_url ? (
                                  <img
                                    src={i.hero_image_url}
                                    className="w-full h-40 rounded-xl object-cover border border-neutral-800"
                                  />
                                ) : (
                                  <div className="w-full h-40 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 text-sm">
                                    No image
                                  </div>
                                )}
                              </div>

                              {/* META RIGHT */}
                              <div className="col-span-12 md:col-span-8 space-y-6">
                                {i.subtitle && (
                                  <p className="text-sm text-gray-300">
                                    {i.subtitle}
                                  </p>
                                )}

                                <div>
                                  <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                                    Authors
                                  </p>
                                  <ul className="mt-1 list-disc ml-5 text-sm text-white/80">
                                    {i.authors?.map((a, idx) => (
                                      <li key={idx}>
                                        {a.name} — {a.role}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex px-4 py-1.5 rounded-full bg-[#E53935] text-[11px] uppercase tracking-wide">
                                    {i.category}
                                  </span>

                                  {i.tags?.map((t) => (
                                    <span
                                      key={t}
                                      className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-200"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-[11px] uppercase text-neutral-500 tracking-[0.16em]">
                                      Created
                                    </p>
                                    <p className="text-sm mt-1 text-white">
                                      {formatDateLabel(i.created_at)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[11px] uppercase text-neutral-500 tracking-[0.16em]">
                                      {i.published_at
                                        ? "Published At"
                                        : "Last Modified"}
                                    </p>
                                    <p className="text-sm mt-1 text-white">
                                      {formatDateLabel(
                                        i.updated_at || i.published_at
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                  {/* Preview */}
                                  <button
                                    onClick={() => {}}
                                    className="px-5 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-sm hover:border-neutral-500"
                                  >
                                    Preview
                                  </button>

                                  {/* Edit */}
                                  <button
                                    disabled={!editAllowed}
                                    onClick={
                                      editAllowed
                                        ? () =>
                                            router.push(
                                              `/admin/insight/edit?id=${i.id}`
                                            )
                                        : undefined
                                    }
                                    className={`
                                      px-6 py-2 rounded-full text-sm font-medium transition border 
                                      ${
                                        !editAllowed
                                          ? "border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                          : "border-neutral-600 hover:bg-neutral-700 bg-neutral-900 text-white"
                                      }
                                    `}
                                  >
                                    Edit
                                  </button>

                                  {/* Publish / Unpublish */}
                                  <button
                                    disabled={!publishAllowed}
                                    onClick={
                                      publishAllowed
                                        ? () => togglePublish(i)
                                        : undefined
                                    }
                                    className={`
                                      px-5 py-2 rounded-full text-sm
                                      ${
                                        !publishAllowed
                                          ? "border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                          : i.status === "published"
                                          ? "border border-neutral-600 bg-neutral-900 text-neutral-200 hover:border-neutral-400"
                                          : "border border-emerald-700 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800"
                                      }
                                    `}
                                  >
                                    {i.status === "published"
                                      ? "Unpublish"
                                      : "Publish"}
                                  </button>

                                  {/* Delete */}
                                  <button
                                    disabled={!deleteAllowed}
                                    onClick={
                                      deleteAllowed
                                        ? () => deleteInsight(i)
                                        : undefined
                                    }
                                    className={`
                                      px-5 py-2 rounded-full text-sm
                                      ${
                                        !deleteAllowed
                                          ? "border-neutral-700 bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                          : "border border-red-700 bg-red-900/40 text-red-200 hover:bg-red-800"
                                      }
                                    `}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
