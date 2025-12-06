"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useUserProfile from "@/hooks/useUserProfile";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

/* =========================================================
   TYPES & HELPERS
========================================================= */
type Project = {
  id: string;
  project_name: string;
  status: string;
  slug: string;

  year_start: number | null;
  year_end: number | null;
  is_ongoing: boolean;

  city: string | null;
  country: string | null;

  categories: string[] | null;
  subcategories: string[] | null;

  team_members: { name: string; role: string }[] | null;

  hero_image: string | null;
  is_published: boolean;
  order_index: number;

  created_at: string;
  updated_at: string | null;
};

type StatusFilter = "all" | "draft" | "published";
type SortKey = "order" | "created_at" | "updated_at";

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatYearRange = (
  start: number | null,
  end: number | null,
  isOngoing: boolean
) => {
  if (!start) return "Year —";
  if (isOngoing) return `${start} – Now`;
  if (end) return `${start} – ${end}`;
  return `${start}`;
};

/* =========================================================
   ROLE PERMISSIONS
========================================================= */
const canPublish = (role: string | null | undefined) =>
  role === "admin" || role === "supervisor";

const canDelete = (role: string | null | undefined) => role === "admin";

const canEdit = (role: string | null | undefined, isPublished: boolean) => {
  // Semua role bisa edit draft
  if (!isPublished) return true;
  // Published hanya admin & supervisor
  return role === "admin" || role === "supervisor";
};

/* =========================================================
   SORTABLE PROJECT ITEM
========================================================= */
function SortableProjectItem({
  project,
  expanded,
  onExpand,
  onPreview,
  onTogglePublish,
  onEdit,
  onDelete,
  role,
}: {
  project: Project;
  expanded: boolean;
  onExpand: () => void;
  onPreview: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  role: string | null | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusBadgeClass = project.is_published
    ? "bg-emerald-900/40 border border-emerald-700 text-emerald-300"
    : "bg-gray-900/60 border border-gray-700 text-gray-300";

  const locationLabel =
    project.city && project.country
      ? `${project.city}, ${project.country}`
      : "Location —";

  const yearLabel = formatYearRange(
    project.year_start,
    project.year_end,
    project.is_ongoing
  );

  const mainCategory =
    project.categories && project.categories.length > 0
      ? project.categories[0]
      : null;

  const editAllowed = canEdit(role, project.is_published);
  const publishAllowed = canPublish(role);
  const deleteAllowed = canDelete(role);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="rounded-3xl bg-[#0b0b0b] border border-neutral-800 overflow-hidden"
    >
      {/* COLLAPSED HEADER ROW */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab opacity-40 hover:opacity-80"
          >
            ⋮⋮
          </button>

          {/* Order index */}
          <span className="text-xs text-neutral-500 w-8">
            #{project.order_index}
          </span>

          {/* Name */}
          <span className="font-semibold text-white truncate max-w-[180px]">
            {project.project_name}
          </span>

          {/* Status */}
          <span
            className={`ml-3 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] ${statusBadgeClass}`}
          >
            {project.is_published ? "Published" : "Draft"}
          </span>

          {/* Location */}
          <span className="ml-4 text-xs text-neutral-500 truncate max-w-[180px]">
            {locationLabel}
          </span>

          {/* Year */}
          <span className="ml-4 text-xs text-neutral-500">{yearLabel}</span>

          {/* Category */}
          {mainCategory ? (
            <span className="ml-4 px-3 py-1 rounded-full text-[11px] border border-neutral-700 text-neutral-300">
              {mainCategory}
            </span>
          ) : (
            <span className="ml-4 text-xs text-neutral-600">Category —</span>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={onExpand}
          className="text-neutral-500 hover:text-white text-lg font-semibold"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {/* EXPANDED CONTENT */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="border-t border-neutral-800 bg-[#070707] px-6 py-6 grid grid-cols-12 gap-8">
              {/* LEFT: Thumbnail */}
              <div className="col-span-12 md:col-span-4">
                {project.hero_image ? (
                  <img
                    src={project.hero_image}
                    className="w-full h-48 rounded-xl object-cover border border-neutral-800"
                  />
                ) : (
                  <div className="w-full h-48 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 text-sm">
                    No image
                  </div>
                )}
              </div>

              {/* RIGHT: Meta info */}
              <div className="col-span-12 md:col-span-8 space-y-4">
                {/* Status */}
                <div>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                    Project Status
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {formatStatusLabel(project.status)}
                  </p>
                </div>

                {/* Year + Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                      Year
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {yearLabel.replace("Year ", "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {project.city && project.country
                        ? `${project.city}, ${project.country}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Category / Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                      Category
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {project.categories?.length
                        ? project.categories.join(", ")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                      Subcategory
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {project.subcategories?.length
                        ? project.subcategories.join(", ")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <p className="text-[11px] text-neutral-500 uppercase tracking-[0.16em]">
                    Team Members
                  </p>
                  {project.team_members?.length ? (
                    <ul className="mt-1 list-disc ml-5 text-sm text-white/90">
                      {project.team_members.map((m, i) => (
                        <li key={`${m.name}-${i}`}>
                          {m.name} — {m.role}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-white/80">—</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {/* Preview: semua role boleh */}
                  <button
                    type="button"
                    onClick={onPreview}
                    className="px-5 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-sm hover:border-neutral-500"
                  >
                    Preview
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={editAllowed ? onEdit : undefined}
                    disabled={!editAllowed}
                    className={`px-5 py-2 rounded-full border text-sm ${
                      !editAllowed
                        ? "border-neutral-800 bg-neutral-900 text-neutral-500 opacity-40 cursor-not-allowed"
                        : "border-neutral-700 bg-neutral-900 text-white hover:border-neutral-500"
                    }`}
                  >
                    Edit
                  </button>

                  {/* Publish / Unpublish */}
                  <button
                    type="button"
                    onClick={publishAllowed ? onTogglePublish : undefined}
                    disabled={!publishAllowed}
                    className={`px-5 py-2 rounded-full text-sm ${
                      !publishAllowed
                        ? "border-neutral-800 bg-neutral-900 text-neutral-500 opacity-40 cursor-not-allowed"
                        : project.is_published
                        ? "border border-neutral-600 bg-neutral-900 text-neutral-200 hover:border-neutral-400"
                        : "border border-emerald-700 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800"
                    }`}
                  >
                    {project.is_published ? "Unpublish" : "Publish"}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={deleteAllowed ? onDelete : undefined}
                    disabled={!deleteAllowed}
                    className={`px-5 py-2 rounded-full border text-sm ${
                      !deleteAllowed
                        ? "border-neutral-800 bg-neutral-900 text-neutral-500 opacity-40 cursor-not-allowed"
                        : "border border-red-700 bg-red-900/40 text-red-200 hover:bg-red-800"
                    }`}
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
}

/* =========================================================
   MAIN PAGE
========================================================= */
export default function AdminProjectListPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("order");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  /* ------------------ Fetch projects ------------------ */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load projects");
        setLoading(false);
        return;
      }

      const withOrder = (data || []).map((p: any, idx: number) => ({
        ...p,
        order_index: p.order_index ?? idx + 1,
      }));

      setProjects(withOrder as Project[]);

      const uniq = Array.from(
        new Set(
          withOrder
            .flatMap((p: any) => p.categories || [])
            .filter(Boolean)
        )
      ) as string[];

      setCategories(uniq);
      setLoading(false);
    };

    fetchData();
  }, []);

  /* ------------------ Filtering + Sorting ------------------ */
  const filteredProjects = useMemo(() => {
    let r = [...projects];

    // status
    if (statusFilter !== "all") {
      const isPub = statusFilter === "published";
      r = r.filter((p) => p.is_published === isPub);
    }

    // category
    if (categoryFilter !== "all") {
      r = r.filter((p) => p.categories?.includes(categoryFilter));
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.project_name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    // sort
    if (sortKey === "created_at") {
      r.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    } else if (sortKey === "updated_at") {
      r.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      );
    } else {
      // order_index
      r.sort((a, b) => a.order_index - b.order_index);
    }

    return r;
  }, [projects, statusFilter, categoryFilter, search, sortKey]);

  /* ------------------ DND Reorder ------------------ */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // DnD cuma make sense saat sortKey = "order"
    if (sortKey !== "order") {
      toast.error("Reordering only available when sorted by Order.");
      return;
    }

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);

    const reordered = arrayMove(projects, oldIndex, newIndex).map(
      (p, i) => ({ ...p, order_index: i + 1 })
    );

    setProjects(reordered);

    const updates = reordered.map((p) =>
      supabase
        .from("projects")
        .update({ order_index: p.order_index })
        .eq("id", p.id)
    );

    await Promise.all(updates);
    toast.success("Order updated");
  };

  /* ------------------ Publish Toggle (role-guarded) ------------------ */
  const togglePublish = async (project: Project) => {
    if (!canPublish(profile?.role)) {
      toast.error("You do not have permission to publish/unpublish.");
      return;
    }

    const next = !project.is_published;

    const { error } = await supabase
      .from("projects")
      .update({ is_published: next })
      .eq("id", project.id);

    if (error) {
      toast.error("Failed to update publish status");
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, is_published: next } : p
      )
    );
  };

  /* ------------------ Delete (admin only) ------------------ */
  const deleteProject = async (project: Project) => {
    if (!canDelete(profile?.role)) {
      toast.error("Only admin can delete projects.");
      return;
    }

    if (!confirm(`Delete "${project.project_name}"?`)) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast.error("Failed to delete project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    toast.success("Project deleted");
  };

  /* ------------------ Loading guard for profile ------------------ */
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300">
        Loading...
      </div>
    );
  }

  /* ------------------ Render ------------------ */
  return (
    <div className="min-h-screen bg-black pb-12 pt-6 text-gray-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            Admin • Projects
          </p>

          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-white">
                <span className="mr-2 text-adidaya-red">*</span>
                Projects
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

              {/* New Project (semua role boleh create) */}
              <button
                onClick={() => router.push("/admin/project/create")}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-adidaya-red hover:text-white"
              >
                + Create Project
              </button>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status pills */}
            <div className="inline-flex items-center gap-1 rounded-full bg-[#0d0d0d] px-1 py-1 border border-neutral-800">
              {(["all", "draft", "published"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] ${
                    statusFilter === s
                      ? "bg-white text-black"
                      : "text-neutral-400"
                  }`}
                >
                  {s === "all" ? "All" : s === "draft" ? "Draft" : "Published"}
                </button>
              ))}
            </div>

            {/* Sort pills */}
            <div className="inline-flex items-center gap-1 rounded-full bg-[#0d0d0d] px-2 py-1 border border-neutral-800">
              <span className="text-[11px] text-neutral-500 uppercase tracking-[0.14em] mr-1">
                Sort
              </span>
              {(["order", "created_at", "updated_at"] as SortKey[]).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortKey(key)}
                    className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] ${
                      sortKey === key
                        ? "bg-white text-black"
                        : "text-neutral-400"
                    }`}
                  >
                    {key === "order"
                      ? "Order"
                      : key === "created_at"
                      ? "Date Added"
                      : "Last Modified"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Category select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-full bg-[#0d0d0d] border border-gray-800 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-gray-300 focus:border-gray-600 transition"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project..."
                className="w-full rounded-full bg-[#0d0d0d] border border-gray-800 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600 outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-[11px] tracking-[0.14em]">
                SEARCH
              </span>
            </div>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="mt-10 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-gray-800 bg-[#0a0a0a] px-10 py-14 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-100">
              No projects yet
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Start by creating your first project.
            </p>
            <button
              onClick={() => router.push("/admin/projects/create")}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow hover:bg-adidaya-red hover:text-white"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredProjects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    expanded={expandedId === project.id}
                    onExpand={() =>
                      setExpandedId((prev) =>
                        prev === project.id ? null : project.id
                      )
                    }
                    onPreview={() => setPreviewProject(project)}
                    onTogglePublish={() => togglePublish(project)}
                    onEdit={() =>
                      router.push(`/admin/projects/edit?id=${project.id}`)
                    }
                    onDelete={() => deleteProject(project)}
                    role={profile?.role}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* PREVIEW MODAL */}
        <AnimatePresence>
          {previewProject && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative h-[80vh] w-[90vw] max-w-5xl rounded-3xl border border-gray-800 bg-[#050505] overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
              >
                <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.16em]">
                      Preview · Public Page
                    </p>
                    <h2 className="text-sm font-semibold text-gray-100">
                      {previewProject.project_name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setPreviewProject(null)}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-700 bg-black/70 text-gray-300 hover:bg-black"
                  >
                    ×
                  </button>
                </div>

                <iframe
                  src={`/projects/${previewProject.slug}`}
                  className="h-full w-full bg-black"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
