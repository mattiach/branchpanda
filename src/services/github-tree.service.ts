import { cacheGet, cacheSet } from './cache.service';
import {
  buildTreeFromFlat,
  resetTreeUiState,
} from '../utils/tree.utils';

import type { GitHubTree, GitHubTreeItem } from '../types/github.types';
import type { TreeNodeData } from '../types/app.types';

const BASE_URL = 'https://api.github.com';

export interface LoadedRepoTree {
  roots: TreeNodeData[];
  flatItems: GitHubTreeItem[];
  truncated: boolean;
  branch: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg =
      res.status === 404 ? 'Repository or branch not found.' :
        res.status === 403 ? 'GitHub API rate limit exceeded. Try again later.' :
          res.status === 401 ? 'Unauthorized. Please provide a GitHub token.' :
            `GitHub API error (${res.status})`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch the full recursive tree for a branch in a single API request.
 * GitHub accepts a branch name as the tree SHA parameter.
 */
export async function fetchRecursiveTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<GitHubTree> {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: { Accept: 'application/vnd.github.v3+json' } },
  );
  return handleResponse<GitHubTree>(res);
}

export function getTreeCacheKey(
  owner: string,
  repo: string,
  branch: string,
): string {
  return `repo_tree_${owner}_${repo}_${branch}`;
}

function parseTreeResponse(
  treeData: GitHubTree,
  branch: string,
): LoadedRepoTree {
  return {
    roots: buildTreeFromFlat(treeData.tree),
    flatItems: treeData.tree,
    truncated: treeData.truncated,
    branch,
  };
}

/**
 * Load a repository tree, reusing the local cache when available.
 * Stores the parsed hierarchical tree immediately after a network fetch.
 */
export async function loadRepositoryTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<LoadedRepoTree> {
  const cacheKey = getTreeCacheKey(owner, repo, branch);
  const cached = cacheGet<LoadedRepoTree>(cacheKey);

  if (cached) {
    return {
      ...cached,
      roots: resetTreeUiState(cached.roots),
    };
  }

  const treeData = await fetchRecursiveTree(owner, repo, branch);
  const loaded = parseTreeResponse(treeData, branch);

  cacheSet(cacheKey, {
    roots: resetTreeUiState(loaded.roots),
    flatItems: loaded.flatItems,
    truncated: loaded.truncated,
    branch: loaded.branch,
  });

  return loaded;
}
