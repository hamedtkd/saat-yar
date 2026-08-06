"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useUnsavedNavigation } from "./unsaved-navigation-provider";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    onNavigate?: () => void;
  };

export function GuardedLink({ href, onClick, onNavigate, ...props }: Props) {
  const router = useRouter();
  const { requestNavigation } = useUnsavedNavigation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    requestNavigation(() => {
      onNavigate?.();
      router.push(typeof href === "string" ? href : href.pathname?.toString() || "/");
    });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
