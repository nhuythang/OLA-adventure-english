"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

// Chunky pill button with a tactile "0 Npx 0" bottom edge that compresses on
// press (translate-y). Press feedback is instant via :active; touch-action is
// globally set so there's no tap delay. Reduced motion drops the transition.
export function Button({ variant = "primary", className, children, ...rest }: Props) {
  const base =
    "inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[22px] px-7 " +
    "font-display text-lg font-semibold transition-transform duration-100 " +
    "active:translate-y-[2px] motion-reduce:transition-none disabled:opacity-50";
  const variants: Record<Variant, string> = {
    primary:
      "bg-coral-dark text-white shadow-[0_5px_0_#A33A24] active:shadow-[0_3px_0_#A33A24]",
    secondary:
      "bg-card text-ink border-2 border-border-soft shadow-[0_4px_0_#E7DFD2] active:shadow-[0_2px_0_#E7DFD2]",
  };
  return (
    <button type="button" className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
