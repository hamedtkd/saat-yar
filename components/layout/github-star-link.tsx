"use client";

import { Star } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useGitHubStarCount } from "@/hooks/use-github-star-count";
import { GITHUB_REPOSITORY_URL } from "@/lib/github-stars";

function GitHubMark({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.22c-3.22.7-3.9-1.36-3.9-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.78 1.07.78 2.16v3.21c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

export function GitHubStarLink({ online }: { online: boolean }) {
  const { number, t } = useLocaleUi();
  const count = useGitHubStarCount(online);

  return (
    <a
      href={GITHUB_REPOSITORY_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-2.5 font-black text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--dashboard-border))] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
      aria-label={t("footer.githubStar")}
      title={t("footer.githubStar")}
    >
      <GitHubMark />
      <Star className="size-3 fill-current" aria-hidden="true" />
      {count !== null && <span className="min-w-[1.5ch] tabular-nums">{number(count)}</span>}
    </a>
  );
}
