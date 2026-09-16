"use client";

import type { ReactNode } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";

type FileDropFieldProps = {
  accept?: string;
  title: string;
  description: string;
  onFile: (file?: File) => void | Promise<void>;
};

type FilePickerButtonProps = {
  accept?: string;
  title: string;
  children?: ReactNode;
  onFile: (file?: File) => void | Promise<void>;
  className?: string;
};

function NativeFileInput({ accept, title, onFile }: Pick<FileDropFieldProps, "accept" | "title" | "onFile">) {
  return (
    <input
      type="file"
      accept={accept}
      onChange={(event) => {
        const input = event.currentTarget;
        void onFile(input.files?.[0]);
        input.value = "";
      }}
      className="absolute inset-0 size-full cursor-pointer opacity-0"
      aria-label={title}
    />
  );
}

export function FileDropField({ accept, title, description, onFile }: FileDropFieldProps) {
  return (
    <label
      className={cn(
        "relative grid min-h-[125px] cursor-pointer place-items-center content-center gap-1 rounded-[var(--card-radius)] border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--surface-2)] px-4 text-center text-[var(--accent-strong)] transition-colors",
        "hover:bg-[var(--accent-soft)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)] [&>svg]:size-6",
      )}
    >
      <Upload aria-hidden="true" />
      <strong>{title}</strong>
      <span className="text-[9px] text-[var(--text-muted)]">{description}</span>
      <NativeFileInput accept={accept} title={title} onFile={onFile} />
    </label>
  );
}

export function FilePickerButton({ accept, title, children, onFile, className }: FilePickerButtonProps) {
  return (
    <label
      className={cn(
        "relative inline-flex min-h-[var(--control-height-sm)] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[var(--control-radius)] border border-transparent px-3 text-xs font-semibold text-[var(--accent-strong)] transition-colors hover:bg-[var(--accent-soft)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]",
        className,
      )}
    >
      <Upload aria-hidden="true" className="size-4" />
      {children ?? title}
      <NativeFileInput accept={accept} title={title} onFile={onFile} />
    </label>
  );
}
