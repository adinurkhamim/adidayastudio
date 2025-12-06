"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  Linkedin,
  Instagram,
  Mail,
} from "lucide-react";
import ContactPopover from "./ContactPopover";

export type Person = {
  id: string;
  order_index: number;
  name: string;
  position: string;
  role: "admin" | "supervisor" | "staff";
  image_url: string | null;
  linkedin: string | null;
  instagram: string | null;
  email: string | null;
  is_published: boolean;

  image_file?: File | null;
  preview_url?: string | null;
};

type Props = {
  person: Person;
  index: number;

  onChange: (id: string, changes: Partial<Person>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;

  onSave: (id: string) => Promise<void>;
  onPublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeletePhoto: (id: string) => void;

  saving: boolean;
  publishing: boolean;

  activePopoverId: string | null;
  openPopover: () => void;
  closePopover: () => void;

  canEdit: boolean; // ⬅️ ADD THIS
};

export default function PeopleRow(props: Props) {
  const {
    person,
    index,
    onChange,
    onMoveUp,
    onMoveDown,
    onSave,
    onPublish,
    onDelete,
    onDeletePhoto,
    saving,
    publishing,
    activePopoverId,
    openPopover,
    closePopover,
    canEdit, // ⬅️ important
  } = props;

  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const hasContact = person.linkedin || person.instagram || person.email;

  /* CLOSE DROPDOWN */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveLabel = person.id.startsWith("temp-")
    ? "Save"
    : person.is_published
    ? "Save Changes"
    : "Save";

  const canPublish = !person.id.startsWith("temp-") && !publishing && canEdit;

  /* =========================================== */
  /* RENDER                                      */
  /* =========================================== */

  return (
    <div
      className="
        grid grid-cols-[50px_96px_1.2fr_1fr_1fr_1fr_150px]
        gap-5 px-5 py-4 items-center text-sm
      "
    >
      {/* ======================= */}
      {/* NUMBER + MOVE BUTTONS */}
      {/* ======================= */}
      <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
        <span>{index + 1}</span>

        <button
          onClick={canEdit ? onMoveUp : undefined}
          disabled={!canEdit}
          className="rounded-full bg-[#111] p-1 text-gray-500 hover:text-adidaya-red hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowUp className="h-3 w-3" />
        </button>

        <button
          onClick={canEdit ? onMoveDown : undefined}
          disabled={!canEdit}
          className="rounded-full bg-[#111] p-1 text-gray-500 hover:text-adidaya-red hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>

      {/* ======================= */}
      {/* PHOTO + UPLOAD */}
      {/* ======================= */}
      <div className="flex flex-col items-center">
        {person.preview_url || person.image_url ? (
          <img
            src={person.preview_url || person.image_url || ""}
            className="h-16 w-16 rounded-xl object-cover border border-gray-700"
            alt="Preview"
          />
        ) : (
          <div className="h-16 w-16 flex items-center justify-center rounded-xl border border-gray-700 text-[10px] text-gray-500">
            No Photo
          </div>
        )}

        {/* Upload */}
        <label
          className={`
            mt-2 text-[11px] rounded-md border border-gray-700 px-3 py-1
            ${!canEdit ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-gray-800"}
          `}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            disabled={!canEdit}
            className="hidden"
            onChange={(e) => {
              if (!canEdit) return;
              const file = e.target.files?.[0];
              if (!file) return;
              onChange(person.id, {
                image_file: file,
                preview_url: URL.createObjectURL(file),
              });
            }}
          />
        </label>

        {/* Delete photo */}
        {person.image_url && (
          <button
            disabled={!canEdit}
            onClick={() => canEdit && onDeletePhoto(person.id)}
            className={`
              mt-1 text-[11px]
              ${canEdit ? "text-red-400 hover:text-red-500" : "text-red-400/40 cursor-not-allowed"}
            `}
          >
            Delete
          </button>
        )}
      </div>

      {/* ======================= */}
      {/* NAME */}
      {/* ======================= */}
      <input
        value={person.name}
        readOnly={!canEdit}
        onChange={(e) => canEdit && onChange(person.id, { name: e.target.value })}
        placeholder="Full name"
        className={`
          w-full rounded-xl border border-gray-800 bg-[#050505] px-4 py-2 text-sm
          text-gray-100 placeholder:text-gray-600 focus:border-adidaya-red outline-none
          ${!canEdit && "opacity-40 cursor-not-allowed"}
        `}
      />

      {/* ======================= */}
      {/* POSITION */}
      {/* ======================= */}
      <input
        value={person.position}
        readOnly={!canEdit}
        onChange={(e) =>
          canEdit && onChange(person.id, { position: e.target.value })
        }
        placeholder="Position"
        className={`
          w-full rounded-xl border border-gray-800 bg-[#050505] px-4 py-2 text-sm
          text-gray-100 placeholder:text-gray-600 focus:border-adidaya-red outline-none
          ${!canEdit && "opacity-40 cursor-not-allowed"}
        `}
      />

      {/* ======================= */}
      {/* ROLE DROPDOWN */}
      {/* ======================= */}
      <div className="relative" ref={roleRef}>
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => canEdit && setRoleOpen(!roleOpen)}
          className={`
            w-full rounded-xl border border-gray-800 bg-[#050505]
            px-4 py-2 text-sm text-gray-100 flex justify-between items-center
            ${canEdit ? "hover:border-adidaya-red" : "opacity-40 cursor-not-allowed"}
          `}
        >
          <span className="capitalize">{person.role}</span>
          <span className="text-gray-500 text-xs">▼</span>
        </button>

        {roleOpen && canEdit && (
          <div
            className="
              absolute z-50 mt-1 w-full rounded-xl border border-gray-800 
              bg-[#0a0a0a] shadow-xl
            "
          >
            {["admin", "supervisor", "staff"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  onChange(person.id, { role: r as any });
                  setRoleOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================= */}
      {/* CONTACT BUTTON */}
      {/* ======================= */}
      <div>
        <button
          disabled={!canEdit}
          onClick={() => canEdit && openPopover()}
          className={`
            flex items-center gap-2 rounded-xl border border-gray-800 bg-[#050505] px-4 py-2 text-xs
            ${canEdit ? "hover:bg-black text-gray-300" : "opacity-40 cursor-not-allowed text-gray-500"}
          `}
        >
          <span className="text-[11px] uppercase tracking-wide">
            Contact
          </span>

          <div className="flex items-center gap-1">
            {person.linkedin && <Linkedin className="h-3.5 w-3.5" />}
            {person.instagram && <Instagram className="h-3.5 w-3.5" />}
            {person.email && <Mail className="h-3.5 w-3.5" />}
            {!hasContact && <span className="text-[11px] text-gray-500">Empty</span>}
          </div>
        </button>
      </div>

      {/* ======================= */}
      {/* ACTIONS */}
      {/* ======================= */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          disabled={!canEdit || saving}
          onClick={() => canEdit && onSave(person.id)}
          className={`
            rounded-full bg-white px-3 py-1.5 font-semibold text-black
            hover:bg-adidaya-red hover:text-white
            ${!canEdit ? "opacity-40 cursor-not-allowed" : ""}
          `}
        >
          {saving ? "Saving..." : saveLabel}
        </button>

        {!person.is_published && (
          <button
            disabled={!canPublish}
            onClick={() => canPublish && onPublish(person.id)}
            className={`
              rounded-full border border-adidaya-red/70 bg-adidaya-red/5 
              px-3 py-1.5 font-medium text-[11px] uppercase tracking-wide
              text-adidaya-red hover:bg-adidaya-red hover:text-white 
              ${!canPublish ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        )}

        <button
          disabled={!canEdit}
          onClick={() => canEdit && onDelete(person.id)}
          className={`
            rounded-full border border-red-800/70 bg-red-950/70 p-1.5
            ${canEdit ? "text-red-200 hover:bg-red-900" : "opacity-40 cursor-not-allowed text-red-400"}
          `}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* CONTACT POPUP */}
      {activePopoverId === person.id && canEdit && (
        <ContactPopover person={person} onChange={onChange} onClose={closePopover} />
      )}
    </div>
  );
}
