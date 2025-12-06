"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminProjectForm from "../create/AdminProjectForm";

export default function EditProjectPage() {
  const params = useSearchParams();
  const projectId = params.get("id");

  const [initialProject, setInitialProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (!error && data) setInitialProject(data);

      setLoading(false);
    }

    load();
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="text-white p-10">
        No project ID provided.
      </div>
    );
  }

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  if (!initialProject) {
    return <div className="text-white p-10">Failed to load project.</div>;
  }

  return (
    <AdminProjectForm
      mode="edit"
      projectId={projectId}
      initialProject={initialProject}
    />
  );
}
