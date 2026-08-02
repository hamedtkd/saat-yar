"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "border border-[#0b3a49] bg-[#0b3a49] text-white hover:bg-[#062d39]",
        outline: "border border-[#dce8e5] bg-white text-[#15323a] hover:border-[#9fc9bd] hover:bg-[#f8fbfa]",
        secondary: "border border-transparent bg-[#e5f6ef] text-[#16805a] hover:bg-[#d8f0e6]",
        ghost: "border border-transparent bg-transparent text-[#16805a] hover:bg-[#edf8f4]",
        destructive: "border border-[#f1cfcc] bg-[#fff8f7] text-[#b74742] hover:bg-[#fff0ee]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        icon: "size-11 p-0",
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
