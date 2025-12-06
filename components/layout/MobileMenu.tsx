"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
}

export default function MobileMenu({ open, onClose, navItems }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transform transition-all duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* DRAWER */}
      <div className="absolute right-0 top-0 h-full w-[75%] max-w-[320px] bg-adidaya-bg border-l border-adidaya-border p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <p className="text-h3 font-semibold">Menu</p>

          <button onClick={onClose} className="p-2 text-adidaya-text">
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-body text-adidaya-text-muted hover:text-adidaya-text transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
