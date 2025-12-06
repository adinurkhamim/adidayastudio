"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function InputWithOptions({
  label,
  value,
  placeholder,
  onChange,
  options = [],
  className = "",
  error,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  options?: string[];
  className?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`w-full ${className}`}>
      <label className="block mb-1 text-xs uppercase tracking-[0.2em] text-gray-500">{label}</label>

     <div
        className={`
            bg-[#111] border 
            ${open ? "border-adidaya-red bg-red-900/20" 
                    : error ? "border-adidaya-red" : "border-gray-700"}
            rounded-full px-4 py-3 cursor-pointer flex items-center transition-all duration-200
          `}
          onClick={() => setOpen(!open)}
        >

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-[#111] text-white w-full outline-none rounded-full px-2 py-2"
        />

        <FiChevronDown
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-100 w-1/2 mt-2 bg-[#111] border border-gray-700 rounded-2xl max-h-60 overflow-y-auto shadow-xl">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-4 py-3 text-white hover:bg-adidaya-red cursor-pointer rounded-xl"
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400">This field is required</p>
      )}

    </div>
  );
}
