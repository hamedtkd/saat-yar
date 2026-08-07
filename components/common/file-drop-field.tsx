"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";

type FileDropFieldProps = {
  accept?: string;
  title: string;
  description: string;
  onFile: (file?: File) => void;
};

export function FileDropField({ accept, title, description, onFile }: FileDropFieldProps) {
  return (
    <label
      className={cn(
        "relative grid min-h-[125px] cursor-pointer place-items-center content-center gap-1 rounded-xl border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--surface-2)] px-4 text-center text-[var(--accent-strong)] transition-colors",
        "hover:bg-[var(--accent-soft)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)] [&>svg]:size-6",
      )}
    >
      <Upload aria-hidden="true" />
      <strong>{title}</strong>
      <span className="text-[9px] text-[var(--text-muted)]">{description}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onFile(event.target.files?.[0])}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        aria-label={title}
      />
    </label>
  );
}
