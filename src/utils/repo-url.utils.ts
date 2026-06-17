const GITHUB_REPO_RE = /github\.com\/([^/\s?#]+)\/([^/\s?#]+)/;

export function parseGitHubRepo(raw: string): { owner: string; repo: string } | null {
  const s = raw.trim();
  const urlMatch = s.match(GITHUB_REPO_RE);
  if (urlMatch) return { owner: urlMatch[1]!, repo: urlMatch[2]!.replace(/\.git$/, '') };
  const slashMatch = s.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slashMatch) return { owner: slashMatch[1]!, repo: slashMatch[2]! };
  return null;
}

/** owner/repo from query param, referrer, or current URL — no fetch. */
export function getSuggestedRepoFromPage(): string | null {
  const fromQuery = new URLSearchParams(location.search).get('repo');
  if (fromQuery) {
    const parsed = parseGitHubRepo(fromQuery);
    if (parsed) return `${parsed.owner}/${parsed.repo}`;
  }

  if (document.referrer) {
    const parsed = parseGitHubRepo(document.referrer);
    if (parsed) return `${parsed.owner}/${parsed.repo}`;
  }

  const parsed = parseGitHubRepo(location.href);
  if (parsed) return `${parsed.owner}/${parsed.repo}`;

  return null;
}

if (import.meta.env.DEV) {
  const p = parseGitHubRepo('https://github.com/nexu-io/open-design');
  console.assert(p?.owner === 'nexu-io' && p?.repo === 'open-design', 'parseGitHubRepo url');
  console.assert(parseGitHubRepo('nexu-io/open-design')?.repo === 'open-design', 'parseGitHubRepo slash');
}
