import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface PublicSectionHeaderProps {
  title: string;
  icon?: ReactNode; // default red star
  className?: string;
}

export function PublicSectionHeader({
  title,
  icon,
  className,
}: PublicSectionHeaderProps) {
  return (
    <div className={cn("w-full flex flex-col items-center gap-6", className)}>
      {/* Title */}
        <h1 className="text-center text-5xl font-bold mb-12 tracking-tight">
                <span className="text-adidaya-red">*</span> Studio
            </h1>
    </div>
  );
}
