"use client";

import useUserProfile from "@/hooks/useUserProfile";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import PeopleRow, { Person } from "./PeopleRow";
import { useRouter } from "next/navigation";
import NoAccess from "@/components/admin/NoAccess";

export default function AdminPeoplePage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const openPopover = (id: string) => setActivePopoverId(id);
  const closePopover = () => setActivePopoverId(null);

  /* ------------------------------------------------------
     1. FETCH PROFILES
  ------------------------------------------------------ */
  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, name, position, role, order_index, email, linkedin, instagram, image_url, is_published"
        )
        .order("order_index", { ascending: true });

      if (error) {
        console.log("SUPABASE FETCH ERROR:", error);
        toast.error("Failed to load profiles");
        setLoading(false);
        return;
      }

      const withIndex = (data || []).map((p: any, idx: number) => ({
        ...p,
        order_index: p.order_index ?? idx + 1,
        image_file: null,
        preview_url: null,
      })) as Person[];

      setPeople(withIndex);
      setLoading(false);
    };

    fetchPeople();
  }, []);

  /* ------------------------------------------------------
     2. ADD EMPTY PERSON
  ------------------------------------------------------ */
  const handleAddPerson = () => {
    const maxIndex =
      people.length > 0 ? Math.max(...people.map((p) => p.order_index || 0)) : 0;

    const newPerson: Person = {
      id: `temp-${Date.now()}`,
      order_index: maxIndex + 1,
      name: "",
      position: "",
      role: "staff",
      image_url: null,
      linkedin: null,
      instagram: null,
      email: null,
      is_published: false,
      image_file: null,
      preview_url: null,
    };

    setPeople((prev) => [...prev, newPerson]);
  };

  /* ------------------------------------------------------
     3. LOCAL FIELD CHANGE
  ------------------------------------------------------ */
  const handleChange = (id: string, changes: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  /* ------------------------------------------------------
     4. REORDER
  ------------------------------------------------------ */
  const moveRow = (index: number, direction: "up" | "down") => {
    const person = people[index];
    if (person.role === "admin") return;

    setPeople((prev) => {
      const arr = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= arr.length) return prev;
      if (arr[newIndex].role === "admin") return prev;

      const [moved] = arr.splice(index, 1);
      arr.splice(newIndex, 0, moved);

      return arr.map((p, idx) => ({ ...p, order_index: idx + 1 }));
    });
  };

  /* ------------------------------------------------------
     4.5 UPLOAD PHOTO (helper)
  ------------------------------------------------------ */
  const uploadPhoto = async (person: Person, newId: string) => {
    if (!person.image_file) return null;

    const ext = person.image_file.name.split(".").pop();
    const fileName = `${newId}-${Date.now()}.${ext}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("people")
      .upload(filePath, person.image_file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("people").getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ------------------------------------------------------
     5. SAVE
  ------------------------------------------------------ */
const handleSave = async (id: string) => {
  const person = people.find((p) => p.id === id);
  if (!person) return;

  setSavingId(id);

  try {
    /* ============================================================
       INSERT NEW PROFILE
    ============================================================ */
    if (person.id.startsWith("temp-")) {
      // ⛔ VALIDASI WAJIB
      if (!person.email) {
        toast.error("Email is required to create an account");
        setSavingId(null);
        return;
      }

      // 1) INSERT PROFILE (tanpa image dulu)
      const payload = {
        name: person.name || "",
        position: person.position || "",
        role: person.role || "staff",
        email: person.email,
        linkedin: person.linkedin || null,
        instagram: person.instagram || null,
        order_index: person.order_index,
        is_published: false,
        image_url: null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert(payload)
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("INSERT ERROR:", insertError);
        throw insertError ?? new Error("Insert failed");
      }

      const newId = inserted.id;

      /* ============================================================
         CREATE AUTH USER (AUTO ACCOUNT CREATION)
      ============================================================ */
      const createAuth = await fetch("/api/create-auth-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: person.email,
          role: person.role,
        }),
      });

      const authResult = await createAuth.json();

      if (authResult.error) {
        console.error("AUTH CREATE ERROR:", authResult.error);
        toast.error("Auth user creation failed");
      } else {
        toast.success("Auth user created");
      }

      /* ============================================================
         UPLOAD PHOTO (JIKA ADA)
      ============================================================ */
      let photoUrl = null;

      if (person.image_file) {
        photoUrl = await uploadPhoto(person, newId);

        if (photoUrl) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ image_url: photoUrl })
            .eq("id", newId);

          if (updateError) throw updateError;
        }
      }

      /* ============================================================
         UPDATE LOCAL STATE
      ============================================================ */
      handleChange(id, {
        id: newId,
        image_url: photoUrl || null,
        image_file: null,
        preview_url: null,
      });

      toast.success("Saved");
      return;
    }

    /* ============================================================
       UPDATE EXISTING PROFILE
    ============================================================ */
    let finalImageUrl = person.image_url;

    if (person.image_file) {
      const newPhotoUrl = await uploadPhoto(person, person.id);
      if (newPhotoUrl) finalImageUrl = newPhotoUrl;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: person.name,
        position: person.position,
        role: person.role,
        email: person.email,
        linkedin: person.linkedin,
        instagram: person.instagram,
        order_index: person.order_index,
        image_url: finalImageUrl,
      })
      .eq("id", person.id);

    if (updateError) throw updateError;

    handleChange(id, {
      image_url: finalImageUrl,
      image_file: null,
      preview_url: null,
    });

    toast.success("Updated");
  } catch (err) {
    console.error("SAVE ERROR:", err);
    toast.error("Save failed");
  } finally {
    setSavingId(null);
  }
};


  /* ------------------------------------------------------
     DELETE PHOTO
  ------------------------------------------------------ */
  const handleDeletePhoto = async (id: string) => {
    const person = people.find((p) => p.id === id);
    if (!person || !person.image_url) return;

    const filename = person.image_url.split("/").pop();
    if (!filename) {
      console.log("No filename found in image_url:", person.image_url);
      return;
    }

    const { error } = await supabase.storage.from("people").remove([filename]);

    if (error) {
      console.log("DELETE PHOTO ERROR:", error);
      toast.error("Failed to delete photo");
      return;
    }

    handleChange(id, {
      image_url: null,
      preview_url: null,
      image_file: null,
    });

    toast.success("Photo deleted");
  };

  /* ------------------------------------------------------
     6. PUBLISH
  ------------------------------------------------------ */
  const handlePublish = async (id: string) => {
    const person = people.find((p) => p.id === id);
    if (!person) return;

    if (id.startsWith("temp-")) {
      toast.error("Save before publishing");
      return;
    }

    if (!person.name.trim() || !person.position.trim()) {
      toast.error("Name & Position required");
      return;
    }

    setPublishingId(id);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_published: true })
        .eq("id", id);

      if (error) throw error;

      handleChange(id, { is_published: true });

      toast.success("Published");
    } catch (err) {
      console.log("PUBLISH ERROR:", err);
      toast.error("Publish failed");
    } finally {
      setPublishingId(null);
    }
  };

  /* ------------------------------------------------------
     7. DELETE
  ------------------------------------------------------ */
  const handleDelete = async (id: string) => {
    const person = people.find((p) => p.id === id);
    if (!person) return;

    const confirmDelete = confirm(`Delete "${person.name}"?`);
    if (!confirmDelete) return;

    if (!id.startsWith("temp-")) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        console.log("DELETE ERROR:", error);
        toast.error("Delete failed");
        return;
      }
    }

    setPeople((prev) => prev.filter((p) => p.id !== id));
    toast.success("Deleted");
  };

if (!profileLoading && profile?.role === "staff") {
  return (
    <NoAccess message="Only admin and supervisor can access People section." />
  );
}

  return (
    <div className="min-h-screen bg-black pb-12 pt-6 text-gray-100">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            Admin • Projects
          </p>

          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-white">
                <span className="mr-2 text-adidaya-red">*</span>
                People
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

              {/* Add Person*/}
              <button
                onClick={() => {
                  if (profile?.role !== "admin") return; // Hanya admin
                  handleAddPerson();
                }}
                disabled={profile?.role !== "admin"}
                className={`
                  rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black 
                  shadow-[0_0_30px_rgba(255,255,255,0.1)]
                  ${profile?.role === "admin"
                    ? "hover:bg-adidaya-red hover:text-white cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                  }
                `}
              >
                + Add Person
              </button>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <motion.div
          layout
          className="rounded-3xl bg-[#050505] border border-gray-800/60 overflow-hidden"
        >
          {/* HEADER */}
          <div className="grid grid-cols-[50px_96px_1.2fr_1fr_1fr_1fr_150px] gap-5 px-5 py-3 text-xs uppercase text-gray-500 border-b border-gray-800">
            <div className="flex items-center gap-1">
              <GripVertical className="h-3 w-3" />
              No
            </div>
            <div>Photo</div>
            <div>Name</div>
            <div>Position</div>
            <div>Role</div>
            <div>Contact</div>
            <div className="text-right">Actions</div>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading...</div>
          ) : people.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No members yet</div>
          ) : (
            <div className="divide-y divide-gray-900/80">
              {people.map((person, index) => (
                <PeopleRow
                  key={person.id}
                  person={person}
                  index={index}
                  onChange={handleChange}
                  onMoveUp={() => moveRow(index, "up")}
                  onMoveDown={() => moveRow(index, "down")}
                  onSave={handleSave}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  onDeletePhoto={handleDeletePhoto}
                  saving={savingId === person.id}
                  publishing={publishingId === person.id}
                  activePopoverId={activePopoverId}
                  openPopover={() => openPopover(person.id)}
                  closePopover={closePopover}
                  canEdit={profile?.role === "admin"}
                />

              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div id="people-popover-root"></div>
    </div>
  );
}
