"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useUserProfile from "@/hooks/useUserProfile";
import NoAccess from "@/components/admin/NoAccess";
import { supabase } from "@/lib/supabaseClient";

type HomeHeroRecord = {
  id: number | string;
  image_url: string | null;
  updated_at?: string | null;
};

export default function AdminHomeHeroPage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  // DATA DARI DB
  const [heroRecord, setHeroRecord] = useState<HomeHeroRecord | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // STATE IMAGE & EDITOR
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [dragging, setDragging] = useState(false);

  const dragState = useRef({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const HERO_ASPECT = 16 / 10; // dipakai untuk frame (aspect-[16/10]) – keep for clarity

  /* ============================
     LOAD EXISTING HERO FROM DB
  ============================ */
  useEffect(() => {
    async function loadHero() {
      const { data, error } = await supabase
        .from("home_hero")
        .select("*")
        .eq("id", 1)
        .limit(1);

      if (error) {
        console.error("Error fetching home hero:", error.message);
      } else {
        const record = data?.[0] ?? null;
        setHeroRecord(record);

        if (record?.image_url) {
          setPreviewUrl(record.image_url);
        }
      }

      setInitialLoading(false);
    }

    loadHero();
  }, []);

  /* ============================
     HANDLE FILE
  ============================ */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setZoom(1.2);
    setPos({ x: 0, y: 0 });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ============================
     RESET IMAGE (LOCAL ONLY)
  ============================ */
  const resetLocalImage = () => {
    setFile(null);
    setPreviewUrl(heroRecord?.image_url ?? null);
    setZoom(1.2);
    setPos({ x: 0, y: 0 });
  };

  /* ============================
     FIT IMAGE INSIDE FRAME
  ============================ */
  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const frame = containerRef.current;
      if (!frame) return;

      const frameW = frame.clientWidth;
      const frameH = frame.clientHeight;
      const imgW = img.width;
      const imgH = img.height;

      const frameAspect = frameW / frameH;
      const imgAspect = imgW / imgH;

      let renderW: number;
      let renderH: number;

      if (imgAspect > frameAspect) {
        renderH = frameH * zoom;
        renderW = renderH * imgAspect;
      } else {
        renderW = frameW * zoom;
        renderH = renderW / imgAspect;
      }

      setImgDims({ width: renderW, height: renderH });
      setPos({
        x: (frameW - renderW) / 2,
        y: (frameH - renderH) / 2,
      });
    };
    img.src = previewUrl;
  }, [previewUrl, zoom]);

  /* ============================
     DRAG TO PAN
  ============================ */
  const startDrag = (e: any) => {
    e.preventDefault();
    setDragging(true);

    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const pageY = "touches" in e ? e.touches[0].pageY : e.pageY;

    dragState.current = {
      startX: pageX,
      startY: pageY,
      initX: pos.x,
      initY: pos.y,
    };
  };

  const onDrag = (e: any) => {
    if (!dragging || !containerRef.current) return;

    const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const pageY = "touches" in e ? e.touches[0].pageY : e.pageY;

    const dx = pageX - dragState.current.startX;
    const dy = pageY - dragState.current.startY;

    const frame = containerRef.current;

    const newX = dragState.current.initX + dx;
    const newY = dragState.current.initY + dy;

    const minX = frame.clientWidth - imgDims.width;
    const minY = frame.clientHeight - imgDims.height;

    setPos({
      x: Math.max(Math.min(newX, 0), minX),
      y: Math.max(Math.min(newY, 0), minY),
    });
  };

  const endDrag = () => {
    setDragging(false);
  };

  /* ============================
     SAVE CROP → STORAGE + DB
  ============================ */
  const saveHero = async () => {
    if (!imgRef.current || !containerRef.current || !file) return;

    setSaving(true);

    try {
      const img = imgRef.current;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = 1600; // 16:10
      canvas.height = 1000;

      const scaleX = img.naturalWidth / imgDims.width;
      const scaleY = img.naturalHeight / imgDims.height;

      const cropX = -pos.x * scaleX;
      const cropY = -pos.y * scaleY;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        canvas.width * scaleX,
        canvas.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) {
        alert("Failed to generate image blob.");
        return;
      }

      const croppedFile = new File([blob], `hero-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // 1️⃣ Upload ke storage
      const storagePath = `hero/${croppedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(storagePath, croppedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        alert("Upload failed");
        return;
      }

      // 2️⃣ Ambil public URL
      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // 3️⃣ UPDATE tabel home_hero (selalu id = 1)
      const { data: updated, error: dbError } = await supabase
        .from("home_hero")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select()
        .limit(1);

      if (dbError) {
        console.error("DB update failed:", dbError);
        alert("DB update failed");
        return;
      }

      const record = updated?.[0] ?? null;
      setHeroRecord(record);
      setPreviewUrl(publicUrl);
      setFile(null);
      setZoom(1.2);
      setPos({ x: 0, y: 0 });

      alert("Hero image saved successfully!");
    } finally {
      setSaving(false);
    }
  };

  /* ============================
     DELETE HERO (STORAGE + DB)
  ============================ */
  const deleteHero = async () => {
    if (!heroRecord?.image_url) return;

    const confirmDelete = window.confirm(
      "Delete current hero image from website?"
    );
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const url = heroRecord.image_url;

      // Public URL looks like:
      // https://xxxxx.supabase.co/storage/v1/object/public/project-images/hero/filename.jpg
      const path = url.split("/object/public/project-images/")[1];

      if (!path) {
        console.error("Failed to parse storage path:", url);
      } else {
        // DELETE FROM STORAGE
        const { error: removeError } = await supabase.storage
          .from("project-images")
          .remove([path]);

        if (removeError) {
          console.error("Storage delete error:", removeError);
        }
      }

      // DELETE FROM DATABASE (SET NULL)
      const { data: updated, error: dbError } = await supabase
        .from("home_hero")
        .update({
          image_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select()
        .limit(1);

      if (dbError) {
        console.error("DB update failed:", dbError);
        alert("Failed to update DB.");
        return;
      }

      const record = updated?.[0] ?? null;
      setHeroRecord(record);
      setPreviewUrl(null);
      setFile(null);
      setZoom(1.2);
      setPos({ x: 0, y: 0 });

      alert("Hero image deleted.");
    } finally {
      setDeleting(false);
    }
  };

  /* ============================
     ROLE GUARD
  ============================ */
  if (!loading && profile?.role === "staff") {
    return (
      <NoAccess message="Only admin or supervisor can manage Home Hero content." />
    );
  }

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  /* ============================
     UI (TIDAK DIUBAH)
  ============================ */

  return (
    <div className="min-h-screen bg-black pb-12 pt-6 text-gray-100">
      <div className="mx-auto w-full max-w-5xl px-4">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-semibold text-white">
            <span className="mr-2 text-adidaya-red">*</span>
            Edit Hero Image
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag to position · Zoom to adjust · 16:10 Hero Frame
          </p>
        </div>

        <motion.div
          layout
          className="rounded-3xl bg-[#0b0b0b] border border-gray-800/60 px-6 py-6"
        >
          {/* UPLOAD */}
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
            Upload New Hero Image
          </p>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-gray-300 file:mr-4 
                file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 
                file:text-sm file:font-semibold file:text-black 
                hover:file:bg-gray-200 cursor-pointer"
            />

            {/* FILE INDICATOR (LOCAL SELECTED FILE) */}
            {file && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-gray-300 line-clamp-1">
                  {file.name}
                </span>
                <button
                  onClick={resetLocalImage}
                  className="rounded-full border border-red-700 bg-red-950/50 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-900"
                >
                  Remove local file
                </button>
              </div>
            )}

            {/* HERO EDITOR FRAME */}
            {previewUrl && (
              <div
                ref={containerRef}
                className="relative mt-5 w-full aspect-[16/10] rounded-2xl border border-gray-800 overflow-hidden bg-black select-none"
              >
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Hero Preview"
                  className="absolute top-0 left-0 cursor-grab active:cursor-grabbing"
                  style={{
                    width: imgDims.width,
                    height: imgDims.height,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    transition: dragging ? "none" : "transform 0.15s ease-out",
                  }}
                  onMouseDown={startDrag}
                  onMouseMove={onDrag}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  onTouchStart={startDrag}
                  onTouchMove={onDrag}
                  onTouchEnd={endDrag}
                />
              </div>
            )}

            {/* ZOOM */}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                  Zoom
                </p>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={saveHero}
              disabled={!file || saving}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow hover:bg-adidaya-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Hero Image"}
            </button>

            {heroRecord?.image_url && (
              <button
                onClick={deleteHero}
                disabled={deleting}
                className="rounded-full border border-red-700 bg-red-950/50 px-6 py-2.5 text-sm font-medium text-red-300 hover:bg-red-900 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Current Hero"}
              </button>
            )}

            <button
              onClick={() => router.push("/admin")}
              className="rounded-full border border-gray-700 bg-black/60 px-6 py-2.5 text-sm font-medium text-gray-200 hover:text-adidaya-red hover:border-adidaya-red"
            >
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
