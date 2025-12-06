"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import ProjectCard from "./ProjectCard";
import FilterBar, { type Filter } from "./sections/FilterBar";

import ProjectSectionHeader from "./sections/ProjectSectionHeader";

type Project = {
  id: string;
  slug: string;
  project_name: string;
  hero_image: string | null;
  categories: string[] | null;
  subcategories: string[] | null;
  city: string | null;
  country: string | null;
  order_index: number | null;
};

export default function ProjectsPage() {
  const params = useSearchParams();

  // GET URL PARAMS
  const urlCategory = params.get("category");
  const urlSub = params.get("sub");

  // FILTER STATE
  const [filter, setFilter] = useState<Filter>({
    category: null,
    subcategory: null,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  /* APPLY URL QUERY ONCE */
  useEffect(() => {
    if (urlCategory && urlCategory !== "all") {
      setFilter({
        category: capitalize(urlCategory),
        subcategory: null,
      });
      setActiveTab(capitalize(urlCategory));
    }

    if (urlSub && urlSub !== "all") {
      setFilter({
        category: null,
        subcategory: capitalize(urlSub),
      });
      setActiveTab("all"); // subcategory doesn't choose a tab
    }
  }, []);

  /* HELPER */
  const capitalize = (str: string) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* FETCH PROJECTS */
  useEffect(() => {
    async function fetchProjects() {
      let query = supabase
        .from("projects")
        .select(
          "id, slug, project_name, hero_image, categories, subcategories, city, country, order_index"
        )
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (filter.category) {
        query = query.contains("categories", [filter.category]);
      }

      if (filter.subcategory) {
        query = query.contains("subcategories", [filter.subcategory]);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setProjects([]);
      } else {
        setProjects((data ?? []) as Project[]);
      }
    }

    fetchProjects();
  }, [filter]);

  return (
    <div className="min-h-screen bg-black text-white px-6 lg:px-20 py-16">

      {/* TITLE */}
      <ProjectSectionHeader title="Projects" />

      {/* FULL FILTER BAR */}
      <FilterBar onFilterChange={setFilter} initialFilter={filter} />

      {/* GRID */}
      {projects.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">No projects found.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 mt-12 space-y-8">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
