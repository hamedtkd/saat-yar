export const GITHUB_REPOSITORY_URL = "https://github.com/hamedtkd/saat-yar";
export const GITHUB_REPOSITORY_API_URL = "https://api.github.com/repos/hamedtkd/saat-yar";
export const GITHUB_STAR_CACHE_KEY = "saatyar-github-star-count-v1";
export const GITHUB_STAR_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export type GitHubStarCache = {
  count: number;
  fetchedAt: number;
};

export function parseGitHubStarCount(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const count = (payload as { stargazers_count?: unknown }).stargazers_count;
  return typeof count === "number" && Number.isInteger(count) && count >= 0 ? count : null;
}

export function parseGitHubStarCache(raw: string | null): GitHubStarCache | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GitHubStarCache>;
    if (
      typeof parsed.count !== "number" ||
      !Number.isInteger(parsed.count) ||
      parsed.count < 0 ||
      typeof parsed.fetchedAt !== "number" ||
      !Number.isFinite(parsed.fetchedAt) ||
      parsed.fetchedAt <= 0
    ) return null;
    return { count: parsed.count, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

export function isGitHubStarCacheFresh(cache: GitHubStarCache | null, now = Date.now()) {
  return Boolean(cache && now - cache.fetchedAt >= 0 && now - cache.fetchedAt < GITHUB_STAR_CACHE_TTL_MS);
}

export function serializeGitHubStarCache(count: number, fetchedAt = Date.now()) {
  return JSON.stringify({ count, fetchedAt } satisfies GitHubStarCache);
}
