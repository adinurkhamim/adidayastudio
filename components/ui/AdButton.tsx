"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";


type Variant = "primary" | "secondary" | "ghost";

interface AdButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function AdButton({
  variant = "primary",
  children,
  className,
  ...props
}: AdButtonProps) {
  const base =
    "inline-flex items-center font-semibold rounded-pill px-6 py-2.5 text-sm transition-all";

  const variants: Record<Variant, string> = {
    primary:
      "bg-adidaya-accent text-white shadow-adidaya-glow hover:bg-adidaya-accent-soft",
    secondary: "bg-white text-black hover:bg-neutral-200",
    ghost:
      "bg-transparent border border-adidaya-border text-adidaya-text hover:bg-adidaya-bg-alt",
  };

  return (
    <button
      {...props}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}
