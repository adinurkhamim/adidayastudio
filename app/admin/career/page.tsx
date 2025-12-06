"use client";

import useUserProfile from "@/hooks/useUserProfile";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { divisionsMap } from "@/data/divisionsMap";
import { jobTypes } from "@/data/jobType";
import { useRouter } from "next/navigation";
import NoAccess from "@/components/admin/NoAccess";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminCareerList() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const router = useRouter();

    async function togglePublish(id: number, status: boolean) {
      const { error } = await supabase
        .from("jobs")
        .update({
          published: status,
          status: status ? "published" : "draft"
        })
        .eq("id", id);

      if (!error) router.refresh();
    }



  const formatSkills = (s: any) => {
    if (!s) return "-";

    // kalau formatnya ["AutoCAD","SketchUp"]
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const arr = JSON.parse(s); // jadi array beneran
        return arr.join(", ");
      } catch {
        return s;
      }
    }

    return s;
  };

  const [publishTarget, setPublishTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getDescriptionList = (desc: any): string[] => {
  if (!desc) return [];

  // kalau sudah array (seperti public career) → langsung pakai
  if (Array.isArray(desc)) {
    return desc;
  }

  // kalau masih string → split jadi array
  // prioritas: split pakai ENTER, kalau tidak ada newline ya tetap 1 item
  return String(desc)
    .split("\n")         // pisah per baris
    .map(line => line.trim())
    .filter(Boolean);
};

  
  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, search, divisionFilter, typeFilter, sortBy]);

  /** FETCH DATA */
  async function fetchJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setJobs(data);
  }
  /**PUBLISH JOB */
  async function handlePublish(job: any) {
  const clean = job.status?.replace(/['"]/g, "").toLowerCase();
  const newStatus = clean === "published" ? "draft" : "published";

  const { error } = await supabase
    .from("jobs")
    .update({
      status: newStatus,
      published: newStatus === "published",
    })
    .eq("id", job.id);

  if (error) console.log("ERROR UPDATE:", error);

  setPublishTarget(null);
  fetchJobs();
}







  /**DELETE JOB */
  async function handleDelete(job: any) {
    await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    setDeleteTarget(null);
    fetchJobs();
  }



  /** STATUS TOGGLE */
async function toggleStatus(job: any) {
  const clean = job.status?.replace(/['"]/g, "").toLowerCase();

  const newStatus = clean === "published" ? "draft" : "published";

  await supabase
    .from("jobs")
    .update({
      status: newStatus,
      published: newStatus === "published",
    })
    .eq("id", job.id);

  fetchJobs();
}




  /** INPUT WITH OPTIONS */
function InputWithOptions({
  label,
  options,
  value,
  onChange,
  placeholder,
  rounded,
}: any) {
  return (
    <div className="w-64">
      {label && (
        <label className="block mb-2 text-sm text-gray-400">{label}</label>
      )}
      {/* ...lanjut */}
    </div>
  );
}



  /** FILTERING + SEARCH + SORT */
  function applyFilters() {
    let list = [...jobs];

    // SEARCH
    if (search.trim() !== "") {
      list = list.filter((i) =>
        i.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // FILTER DIVISION
    if (divisionFilter !== "all") {
      list = list.filter((i) => i.division === divisionFilter);
    }

    // FILTER TYPE
    if (typeFilter !== "all") {
      list = list.filter((i) => i.type === typeFilter);
    }

    // SORT BY DEADLINE
    if (sortBy === "newest") {
      list = list.sort(
        (a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      );
    } else {
      list = list.sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    }

    setFiltered(list);
  }

  /** ACCORDION */
  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };


  /** STATUS BADGE */
  function StatusBadge({ status }: any) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs ${
          status === "published"
            ? "bg-green-900 text-green-300"
            : "bg-yellow-900 text-yellow-300"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  }


  // === STATE UNTUK PUBLISH / UNPUBLISH ===
const isPublishing =
  publishTarget && typeof (publishTarget as any).status === "string"
    ? (publishTarget as any).status === "published"
    : false;


if (!profileLoading && profile?.role === "staff") {
  return (
    <NoAccess message="Only admin and supervisor can access Career section." />
  );
}
  return (
    <div className="min-h-screen bg-black pb-20 pt-10">
      <div className="mx-auto w-full max-w-5xl px-4 space-y-10">
      {/* HEADER */}
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            Admin • Career
          </p>

          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
                 <h1 className="mb-2 text-3xl font-semibold text-white">
                <span className="mr-2 text-adidaya-red">*</span>
                Network • Career
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

              {/* New Project */}
              <button
                onClick={() => router.push("/admin/career/create")}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-adidaya-red hover:text-white"
              >
                + Create Career
              </button>
            </div>
          </div>

        </div>

      {/* SEARCH + FILTERS */}
{/* SEARCH + FILTERS */}
<div className="flex flex-nowrap items-center gap-4
              overflow-x-auto overflow-y-hidden
              scrollbar-none
              pb-2">

  {/* SEARCH */}
  <div className="w-72">
    <input
      placeholder="Search title..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="px-5 py-3 w-full rounded-full bg-[#111] border border-gray-700 text-gray-200
                 placeholder-gray-500 focus:border-adidaya-red outline-none transition-all duration-200"
    />
  </div>

  {/* DIVISION FILTER */}
  <div className="relative w-64">
    <select
      value={divisionFilter}
      onChange={(e) => setDivisionFilter(e.target.value)}
      className="w-full px-5 py-3 pr-10 rounded-full bg-[#111] border border-gray-700 text-gray-200
                 appearance-none focus:border-adidaya-red outline-none transition-all duration-200"
    >
      <option value="all">All Divisions</option>
      {/* Ambil dari divisionsMap */}
      {Object.values(divisionsMap).map((div: string) => (
        <option key={div} value={div}>
          {div}
        </option>
      ))}
    </select>

    {/* icon panah */}
    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  </div>

  {/* TYPE FILTER */}
  <div className="relative w-64">
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="w-full px-5 py-3 pr-10 rounded-full bg-[#111] border border-gray-700 text-gray-200
                 appearance-none focus:border-adidaya-red outline-none transition-all duration-200"
    >
      <option value="all">All Types</option>
      {jobTypes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>

    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  </div>

  {/* SORT BY DEADLINE */}
  <div className="relative w-64">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="w-full px-5 py-3 pr-10 rounded-full bg-[#111] border border-gray-700 text-gray-200
                 appearance-none focus:border-adidaya-red outline-none transition-all duration-200"
    >
      <option value="newest">Newest Deadline</option>
      <option value="oldest">Oldest Deadline</option>
    </select>

    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  </div>
</div>


      {/* LIST */}
      <div className="space-y-6">
        {filtered.map((job) => {
          const isOpen = openId === job.id;

          return (
            <div key={job.id} className="border-b border-gray-800 py-2">
              {/* ============== HEADER (klik = toggle) ============== */}
              <div
                className="w-full flex items-center justify-between group py-4"
                onClick={() =>
                  setOpenId(isOpen ? null : job.id)
                }
              >
                {/* LEFT TITLE */}
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">*</span>

                  <span
                    className={`
                      text-lg sm:text-xl font-semibold transition-colors duration-200
                      group-hover:text-adidaya-red
                    `}
                  >
                    {job.title}
                  </span>

                  {/* STATUS BADGE (admin only) */}
                  <StatusBadge status={job.status} />
                </div>

                  {/* BUTTONS saat accordion terbuka */}
                  {isOpen && (
                    <div className="flex items-center gap-3 ml-auto mr-6">
                      {/* Edit */}
                      {job.status === "published" ? (
                        <span
                          className="px-4 py-2 rounded-full bg-[#1b1b1b] border border-gray-800 text-gray-600 cursor-not-allowed"
                        >
                          Edit
                        </span>
                      ) : (
                        <Link
                          href={`/admin/career/edit?id=${job.id}`}
                          className="px-4 py-2 rounded-full bg-[#1b1b1b] border border-gray-700 text-gray-300 hover:text-white hover:border-adidaya-red transition"
                        >
                          Edit
                        </Link>
                      )}


                      {/* Publish */}
                      {job.status === "draft" && (
                        <button
                          onClick={() => setPublishTarget(job)}
                          className="px-4 py-2 rounded-full bg-[#1b1b1b] border border-gray-700 text-gray-300 hover:text-white hover:border-green-600 transition"
                        >
                          Publish
                        </button>
                      )}

                      {/* Unpublish */}
                      {job.status === "published" && (
                        <button
                          onClick={() => setPublishTarget(job)}
                          className="px-4 py-2 rounded-full bg-[#1b1b1b] border border-gray-700 text-gray-300 hover:text-white hover:border-yellow-600 transition"
                        >
                          Unpublish
                        </button>
                      )}

                      {/* Delete */}
                        <button
                          onClick={() => {
                            if (profile?.role !== "admin") return; 
                            setDeleteTarget(job);
                          }}
                          className={
                            profile?.role !== "admin"
                              ? "px-4 py-2 rounded-full bg-[#330000] border border-red-800 text-red-400 opacity-40 cursor-not-allowed"
                              : "px-4 py-2 rounded-full bg-[#330000] border border-red-800 text-red-400 hover:text-white hover:border-red-600 transition"
                          }
                        >
                          Delete
                        </button>
                    </div>
                  )}


                {/* RIGHT SIDE (spill + icon) */}
                <div className="flex items-center gap-6">
                  {/* SPILL SUMMARY – only when closed */}
                  {!isOpen && (
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 leading-none">
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.division}</span>
                      <span>•</span>
                      <span>{(job.experience || "").toString().split("\n")[0]}</span>
                      <span>•</span>
                      <span>{job.deadline}</span>
                    </div>
                  )}

                  {/* ICON */}
                  <span className="text-2xl text-gray-400 group-hover:text-adidaya-red transition-colors leading-none flex items-center translate-y-[-3px] ml-3">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
              </div>

              {/* ============== DROPDOWN ============== */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out
                  ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
                `}
              >
                <div className="overflow-hidden">
                  {/* GRID INFO (Type, Division, etc) */}
                  <div className="mt-6 grid gap-8 md:grid-cols-4 text-sm leading-relaxed">
                    <Info label="TYPE" value={job.type} />
                    <Info label="DIVISION" value={job.division} />
                    <Info label="EDUCATION" value={job.education} />
                    <Info label="DEADLINE" value={job.deadline} />
                    <Info label="EXPERIENCE" value={job.experience} />
                    <Info label="SKILL" value={formatSkills(job.skills)} />
                  </div>

                  {/* DESCRIPTION – versi admin pakai HTML string */}
                  <div className="mt-6 text-sm leading-relaxed">
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">Description</p>
                         <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {getDescriptionList(job.description).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                    </div>

                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* PUBLISH MODAL */}
      {publishTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-md rounded-2xl p-6 border border-gray-700">

            <p className="text-lg text-white mb-4">
              {isPublishing ? "Unpublish this career?" : "Publish this career?"}
            </p>

            <p className="text-gray-400 mb-6">
              {isPublishing
                ? "After unpublishing, this career will be hidden from the Network page."
                : "After publishing, the career will appear on the Network page."}
            </p>


            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPublishTarget(null)}
                className="px-4 py-2 bg-[#222] rounded-full text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePublish(publishTarget)}
                className="px-4 py-2 bg-adidaya-red rounded-full text-white"
              >
                {isPublishing ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-md rounded-2xl p-6 border border-gray-700">

            <p className="text-lg text-white mb-6">
              Delete this career?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-[#222] rounded-full text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 bg-red-600 rounded-full text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

/** SMALL INFO COMPONENT */

type InfoProps = {
  label: string;
  value: any;
};

const Info = ({ label, value }: InfoProps) => (
  <div className="space-y-1">
    <p className="text-[10px] tracking-widest text-gray-500 uppercase">
      {label}
    </p>

    <p className="text-base font-medium text-white leading-snug">
      {value || "-"}
    </p>
  </div>
);
