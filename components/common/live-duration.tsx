"use client";

import { useEffect, useState } from "react";
import { fa, faDigits } from "@/lib/format";

export function LiveDuration({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return <>{`${fa.format(Math.floor(seconds / 3600))}:${faDigits(String(Math.floor(seconds / 60) % 60).padStart(2, "0"))}:${faDigits(String(seconds % 60).padStart(2, "0"))}`}</>;
}
