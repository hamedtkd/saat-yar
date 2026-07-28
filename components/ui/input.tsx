import * as React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-[#dce8e5] bg-[#fbfdfc] px-3 py-2 text-sm text-[#15323a] outline-none transition-shadow placeholder:text-[#8aa09f] focus-visible:border-[#67b69d] focus-visible:ring-4 focus-visible:ring-[#dff4eb] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
