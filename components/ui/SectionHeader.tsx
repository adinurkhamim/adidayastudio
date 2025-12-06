import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 mb-10",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="text-label text-adidaya-text-muted uppercase tracking-wider">
          {eyebrow}
        </p>
      )}

      <h2 className="text-h2 font-semibold">{title}</h2>

      {subtitle && (
        <p className="text-body-sm text-adidaya-text-muted max-w-[720px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
