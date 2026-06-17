import { fuzzySearch } from './fuzzy.utils';
import type { TreeNodeData } from '../types/app.types';
import type { GitHubTreeItem } from '../types/github.types';

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export interface TreeSearchResult {
  path: string;
  name: string;
  type: 'blob' | 'tree';
  score: number;
  indices: number[];
}

/** Sort children: directories first, then alphabetical. */
export function sortTreeNodes(nodes: TreeNodeData[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (Array.isArray(node.children)) sortTreeNodes(node.children);
  }
}

/**
 * Convert a flat GitHub tree listing into a hierarchical structure.
 * Processes paths in sorted order so parent directories exist before children.
 */
export function buildTreeFromFlat(items: GitHubTreeItem[]): TreeNodeData[] {
  const roots: TreeNodeData[] = [];
  const nodeMap = new Map<string, TreeNodeData>();

  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sorted) {
    const segments = item.path.split('/');
    const name = segments[segments.length - 1] ?? item.path;
    const isDir = item.type === 'tree';

    const node: TreeNodeData = {
      name,
      path: item.path,
      type: isDir ? 'dir' : 'file',
      sha: item.sha,
      size: item.size,
      isExpanded: false,
      isLoading: false,
      children: isDir ? [] : undefined,
    };

    nodeMap.set(item.path, node);

    if (segments.length === 1) {
      roots.push(node);
      continue;
    }

    const parentPath = segments.slice(0, -1).join('/');
    const parent = nodeMap.get(parentPath);

    if (parent?.children) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortTreeNodes(roots);
  return roots;
}

export function resetTreeUiState(nodes: TreeNodeData[]): TreeNodeData[] {
  return nodes.map(node => ({
    ...node,
    isExpanded: false,
    isLoading: false,
    children: Array.isArray(node.children)
      ? resetTreeUiState(node.children)
      : node.children,
  }));
}

export function updateNode(
  nodes: TreeNodeData[],
  path: string,
  fn: (n: TreeNodeData) => TreeNodeData,
): TreeNodeData[] {
  return nodes.map(node => {
    if (node.path === path) return fn(node);
    if (Array.isArray(node.children)) {
      return { ...node, children: updateNode(node.children, path, fn) };
    }
    return node;
  });
}

export function findNodeByPath(
  nodes: TreeNodeData[],
  path: string,
): TreeNodeData | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (Array.isArray(node.children)) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function buildPathIndex(
  items: GitHubTreeItem[],
): Map<string, GitHubTreeItem> {
  return new Map(items.map(item => [item.path, item]));
}

export function pathExistsInTree(
  index: Map<string, GitHubTreeItem>,
  path: string,
): boolean {
  return index.has(path);
}

export function getBreadcrumbSegments(filePath: string): BreadcrumbSegment[] {
  if (!filePath) return [];

  const segments: BreadcrumbSegment[] = [];
  let current = '';

  for (const part of filePath.split('/')) {
    current = current ? `${current}/${part}` : part;
    segments.push({ name: part, path: current });
  }

  return segments;
}

export function searchFilesInTree(
  items: GitHubTreeItem[],
  query: string,
  limit = 50,
): TreeSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const files = items.filter(item => item.type === 'blob');
  const matches = fuzzySearch(files, trimmed, item => {
    const parts = item.path.split('/');
    return parts[parts.length - 1] ?? '';
  });

  return matches.slice(0, limit).map(m => ({
    path: m.item.path,
    name: m.item.path.split('/').pop() ?? m.item.path,
    type: m.item.type,
    score: m.score,
    indices: m.indices,
  }));
}
