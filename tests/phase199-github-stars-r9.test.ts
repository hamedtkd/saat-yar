import assert from "node:assert/strict";
import test from "node:test";
import {
  GITHUB_STAR_CACHE_TTL_MS,
  isGitHubStarCacheFresh,
  parseGitHubStarCache,
  parseGitHubStarCount,
  serializeGitHubStarCache,
} from "../lib/github-stars.ts";

test("Phase 199 R9 accepts only a safe GitHub stargazer count", () => {
  assert.equal(parseGitHubStarCount({ stargazers_count: 62 }), 62);
  assert.equal(parseGitHubStarCount({ stargazers_count: -1 }), null);
  assert.equal(parseGitHubStarCount({ stargazers_count: "62" }), null);
  assert.equal(parseGitHubStarCount(null), null);
});

test("Phase 199 R9 keeps a bounded cached star count for offline fallback", () => {
  const fetchedAt = 10_000;
  const cache = parseGitHubStarCache(serializeGitHubStarCache(62, fetchedAt));
  assert.deepEqual(cache, { count: 62, fetchedAt });
  assert.equal(isGitHubStarCacheFresh(cache, fetchedAt + GITHUB_STAR_CACHE_TTL_MS - 1), true);
  assert.equal(isGitHubStarCacheFresh(cache, fetchedAt + GITHUB_STAR_CACHE_TTL_MS), false);
  assert.equal(parseGitHubStarCache('{"count":"62","fetchedAt":10000}'), null);
});
