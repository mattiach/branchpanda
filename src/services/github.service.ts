import type { GitHubRepo, GitHubTree, GitHubDirectoryItem, GitHubFileContent, GitHubBranch } from '../types/github.types';

const BASE_URL = 'https://api.github.com';

function headers(): HeadersInit {
  return { Accept: 'application/vnd.github.v3+json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg =
      res.status === 404 ? 'Repository or path not found.' :
        res.status === 403 ? 'GitHub API rate limit exceeded. Try again later.' :
          res.status === 401 ? 'Unauthorized. Please provide a GitHub token.' :
            `GitHub API error (${res.status})`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, { headers: headers() });
  return handleResponse<GitHubRepo>(res);
}

export async function fetchDirectory(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<GitHubDirectoryItem[]> {
  const q = ref ? `?ref=${ref}` : '';
  const p = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents${p}${q}`, { headers: headers() });
  return handleResponse<GitHubDirectoryItem[]>(res);
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<GitHubFileContent> {
  const q = ref ? `?ref=${ref}` : '';
  const p = path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents/${p}${q}`, { headers: headers() });
  return handleResponse<GitHubFileContent>(res);
}

export async function fetchBranch(
  owner: string,
  repo: string,
  branch: string,
): Promise<GitHubBranch> {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/branches/${branch}`, { headers: headers() });
  return handleResponse<GitHubBranch>(res);
}

export async function fetchFullTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<GitHubTree> {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: headers() },
  );
  return handleResponse<GitHubTree>(res);
}
