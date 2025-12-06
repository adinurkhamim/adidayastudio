import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionShellProps {
  children: ReactNode;
  className?: string;
}

export function SectionShell({ children, className }: SectionShellProps) {
  return (
    <section
      className={cn(
        "px-4 py-12 md:py-20 border-t border-adidaya-border",
        className
      )}
    >
      <div className="mx-auto max-w-[1100px]">{children}</div>
    </section>
  );
}
