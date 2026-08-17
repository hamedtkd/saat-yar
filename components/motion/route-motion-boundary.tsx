"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { normalizePathname } from "@/lib/navigation";

export function RouteMotionBoundary({ pathname, children }: { pathname: string; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const routeKey = normalizePathname(pathname);

  return (
    <div
      data-route-motion
      data-route-motion-path={routeKey}
      data-route-motion-reduced={reducedMotion ? "true" : "false"}
      className="min-w-0"
    >
      <motion.div
        key={routeKey}
        className="min-w-0"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
