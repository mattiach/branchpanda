import { cacheGet, cacheSet } from './cache.service';
import { encodeBase64Content, decodeBase64Content, isTextFile } from '../utils/file.utils';
import type { GitHubFileContent } from '../types/github.types';

const RAW_BASE = 'https://raw.githubusercontent.com';

export function getFileCacheKey(
  owner: string,
  repo: string,
  path: string,
  ref: string,
): string {
  return `file_${owner}_${repo}_${path}_${ref}`;
}

export function buildRawFileUrl(
  owner: string,
  repo: string,
  ref: string,
  path: string,
): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `${RAW_BASE}/${owner}/${repo}/${encodeURIComponent(ref)}/${encodedPath}`;
}

export function buildHtmlFileUrl(
  owner: string,
  repo: string,
  ref: string,
  path: string,
): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${owner}/${repo}/blob/${encodeURIComponent(ref)}/${encodedPath}`;
}

function buildFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  content: string,
  meta?: { sha?: string; size?: number },
): GitHubFileContent {
  const name = path.split('/').pop() ?? path;
  const rawUrl = buildRawFileUrl(owner, repo, ref, path);

  return {
    name,
    path,
    sha: meta?.sha ?? '',
    size: meta?.size ?? new TextEncoder().encode(content).length,
    url: rawUrl,
    html_url: buildHtmlFileUrl(owner, repo, ref, path),
    download_url: rawUrl,
    content: encodeBase64Content(content),
    encoding: 'base64',
    type: 'file',
  };
}

function buildBinaryPlaceholder(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  meta?: { sha?: string; size?: number },
): GitHubFileContent {
  const name = path.split('/').pop() ?? path;
  const rawUrl = buildRawFileUrl(owner, repo, ref, path);

  return {
    name,
    path,
    sha: meta?.sha ?? '',
    size: meta?.size ?? 0,
    url: rawUrl,
    html_url: buildHtmlFileUrl(owner, repo, ref, path),
    download_url: rawUrl,
    content: '',
    encoding: 'base64',
    type: 'file',
  };
}

/**
 * Load file content from raw.githubusercontent.com instead of the GitHub REST API.
 * Does not consume api.github.com rate limits. Results are cached in localStorage.
 */
export async function loadFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  meta?: { sha?: string; size?: number },
): Promise<GitHubFileContent> {
  const cacheKey = getFileCacheKey(owner, repo, path, ref);
  const cached = cacheGet<GitHubFileContent>(cacheKey);
  if (cached) return cached;

  const name = path.split('/').pop() ?? path;
  if (!isTextFile(name)) {
    const placeholder = buildBinaryPlaceholder(owner, repo, path, ref, meta);
    cacheSet(cacheKey, placeholder);
    return placeholder;
  }

  const url = buildRawFileUrl(owner, repo, ref, path);
  const res = await fetch(url);

  if (!res.ok) {
    const msg =
      res.status === 404 ? 'File not found.' :
      res.status === 403 ? 'Access denied. The file may be in a private repository.' :
      `Failed to load file (${res.status})`;
    throw new Error(msg);
  }

  const text = await res.text();
  const file = buildFileContent(owner, repo, path, ref, text, meta);
  cacheSet(cacheKey, file);
  return file;
}

/**
 * Fetch raw text for bulk operations (e.g. ZIP download) without hitting the REST API.
 */
export async function loadRawText(
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string> {
  const cacheKey = getFileCacheKey(owner, repo, path, ref);
  const cached = cacheGet<GitHubFileContent>(cacheKey);
  if (cached?.content) {
    return decodeBase64Content(cached.content);
  }

  const file = await loadFileContent(owner, repo, path, ref);
  return decodeBase64Content(file.content);
}
