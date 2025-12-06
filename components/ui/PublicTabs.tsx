"use client";

import { cn } from "@/lib/cn";

interface Tab {
  label: string;
  value: string;
  href?: string;
}

interface PublicTabsProps {
  tabs: Tab[];
  active: string;
  onChange?: (value: string) => void;
}

export function PublicTabs({ tabs, active, onChange }: PublicTabsProps) {
  return (
    <div className="flex justify-center mb-16">
      <div className="flex gap-2 rounded-full px-2 py-2 border border-adidaya-red bg-black/40 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
        
        {tabs.map((t) => {
          const isActive = active === t.value;

          return (
            <button
              key={t.value}
              onClick={() => onChange?.(t.value)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-regular transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-adidaya-red text-white font-extrabold"
                  : "bg-gray-200 text-gray-700 hover:bg-adidaya-red hover:text-black"
              )}
            >
              {t.label}
            </button>
          );
        })}

      </div>
    </div>
  );
}
