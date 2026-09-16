"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--control-radius)] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "border border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:brightness-110",
        outline: "border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
        secondary: "border border-transparent bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:brightness-95",
        ghost: "border border-transparent bg-transparent text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]",
        destructive: "border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95",
      },
      size: {
        default: "min-h-[var(--control-height)] px-4 py-2",
        sm: "min-h-[var(--control-height-sm)] px-3 text-xs",
        icon: "h-[var(--control-height)] w-[var(--control-height)] p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
