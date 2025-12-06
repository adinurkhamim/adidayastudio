"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Person } from "./PeopleRow";

type Props = {
  person: Person;
  onChange: (id: string, changes: Partial<Person>) => void;
  onClose: () => void;
};

export default function ContactPopover({
  person,
  onChange,
  onClose,
}: Props) {
  if (typeof window === "undefined") return null;

  const root = document.getElementById("people-popover-root");
  if (!root) return null;

  const handleField =
    (field: "linkedin" | "instagram" | "email") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(person.id, { [field]: e.target.value } as Partial<Person>);
    };

  const clearAll = () => {
    onChange(person.id, {
      linkedin: null,
      instagram: null,
      email: null,
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* MODAL CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[380px] rounded-3xl border border-gray-800 bg-[#050505] p-6 shadow-[0_0_50px_rgba(0,0,0,0.65)]"
        >
          {/* HEADER */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                Contact Info
              </p>
              <p className="text-xs text-gray-400">{person.name || "Unnamed Person"}</p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-black/70 text-gray-300 hover:bg-black hover:text-adidaya-red hover:border-adidaya-red"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* FIELDS */}
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                LinkedIn URL
              </p>
              <input
                value={person.linkedin || ""}
                onChange={handleField("linkedin")}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-full border border-gray-800 bg-[#050505] px-3 py-2
                           text-sm text-gray-100 placeholder:text-gray-600 outline-none
                           focus:border-adidaya-red"
              />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                Instagram
              </p>
              <input
                value={person.instagram || ""}
                onChange={handleField("instagram")}
                placeholder="@username or profile URL"
                className="w-full rounded-full border border-gray-800 bg-[#050505] px-3 py-2
                           text-sm text-gray-100 placeholder:text-gray-600 outline-none
                           focus:border-adidaya-red"
              />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                Email
              </p>
              <input
                value={person.email || ""}
                onChange={handleField("email")}
                placeholder="name@studio.com"
                className="w-full rounded-full border border-gray-800 bg-[#050505] px-3 py-2
                           text-sm text-gray-100 placeholder:text-gray-600 outline-none
                           focus:border-adidaya-red"
              />
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="mt-6 flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="rounded-full border border-gray-700 bg-[#080808]
                         px-4 py-1.5 text-gray-300 hover:bg-black hover:border-adidaya-red hover:text-adidaya-red"
            >
              Clear All
            </button>

            <button
              onClick={onClose}
              className="rounded-full border border-gray-700 bg-black
                         px-4 py-1.5 text-gray-200 hover:bg-adidaya-red"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    root
  );
}
