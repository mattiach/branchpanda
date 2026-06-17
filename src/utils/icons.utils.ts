import { getFileExtension } from './file.utils';

import branchPanda from '../assets/app/branchpanda-icon.svg';
import star from '../assets/app/star.svg';

const assetIcons = import.meta.glob<string>('../assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const ICON_URLS: Record<string, string> = { branchPanda, star };

for (const [path, url] of Object.entries(assetIcons)) {
  const basename = path.split('/').pop()!.replace(/\.svg$/, '');
  ICON_URLS[basename] = url;
}

const folderIconNames = new Set(
  Object.keys(ICON_URLS).filter(name => name.startsWith('folder-')),
);

/** Semantic UI names mapped to asset filenames (without .svg). */
export const UI_ICONS = {
  panda: 'panda',
  search: 'search',
  tree: 'tree',
  document: 'document',
  image: 'image',
  zip: 'zip',
  folder: 'folder-sidebar',
  folderOpen: 'folder-sidebar',
  url: 'url',
  link: 'url',
  git: 'git',
  docker: 'docker',
  readme: 'readme',
  settings: 'settings',
  database: 'database',
  console: 'console',
  lock: 'lock',
  download: 'folder-download',
  close: 'close',
  back: 'chevron-left',
} as const;

export type UiIconName = keyof typeof UI_ICONS;

const DEFAULT_ICON = 'document';
const DEFAULT_FOLDER_ICON = 'folder-sidebar';

export function resolveIconBasename(name: string): string {
  return (UI_ICONS as Record<string, string>)[name] ?? name;
}

export function getIconUrl(name: string): string {
  const mapped = resolveIconBasename(name);
  return ICON_URLS[mapped] ?? ICON_URLS[DEFAULT_ICON] ?? '';
}

/** Folder names that don't match a folder-{name} icon basename. */
const FOLDER_ALIASES: Record<string, string> = {
  node_modules: 'folder-node',
  __tests__: 'folder-test',
  __test__: 'folder-test',
  tests: 'folder-test',
  test: 'folder-test',
  spec: 'folder-test',
  specs: 'folder-test',
  doc: 'folder-docs',
  documentation: 'folder-docs',
  lib: 'folder-lib',
  libs: 'folder-lib',
  util: 'folder-utils',
  utilities: 'folder-utils',
  hooks: 'folder-hook',
  hook: 'folder-hook',
  types: 'folder-typescript',
  typings: 'folder-typescript',
  '@types': 'folder-typescript',
  build: 'folder-dist',
  out: 'folder-dist',
  static: 'folder-public',
  assets: 'folder-images',
  images: 'folder-images',
  img: 'folder-images',
  media: 'folder-images',
  styles: 'folder-css',
  style: 'folder-css',
  models: 'folder-class',
  model: 'folder-class',
  services: 'folder-api',
  service: 'folder-api',
  pages: 'folder-views',
  mocks: 'folder-mock',
  __mocks__: 'folder-mock',
  fixtures: 'folder-mock',
  e2e: 'folder-cypress',
  ci: 'folder-ci',
  workflows: 'folder-gh-workflows',
  '.github': 'folder-github',
  '.vscode': 'folder-vscode',
  '.cursor': 'folder-cursor',
  apps: 'folder-app',
};

function resolveFolderIcon(candidate: string): string | null {
  return folderIconNames.has(candidate) ? candidate : null;
}

export function getFolderIconName(folderName: string): string {
  const lower = folderName.toLowerCase();

  const alias = FOLDER_ALIASES[lower];
  if (alias && resolveFolderIcon(alias)) return alias;

  const stripped = lower.startsWith('.') ? lower.slice(1) : lower;
  const strippedAlias = FOLDER_ALIASES[stripped];
  if (strippedAlias && resolveFolderIcon(strippedAlias)) return strippedAlias;

  const direct = resolveFolderIcon(`folder-${stripped}`);
  if (direct) return direct;

  const dotted = resolveFolderIcon(`folder-${lower}`);
  if (dotted) return dotted;

  return DEFAULT_FOLDER_ICON;
}

const FILE_ICON_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  md: 'markdown',
  mdx: 'mdx',
  css: 'css',
  scss: 'sass',
  less: 'less',
  html: 'html',
  htm: 'html',
  svg: 'svg',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  ico: 'favicon',
  py: 'python',
  rs: 'rust',
  go: 'go',
  rb: 'ruby',
  java: 'java',
  sh: 'console',
  bash: 'console',
  zsh: 'console',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  env: 'settings',
  lock: 'lock',
  sql: 'database',
  graphql: 'graphql',
  gql: 'graphql',
  vue: 'vue',
  xml: 'xml',
  zip: 'zip',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  dart: 'dart',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'h',
  hpp: 'hpp',
  cs: 'csharp',
  astro: 'astro',
  svelte: 'svelte',
  woff: 'font',
  woff2: 'font',
  ttf: 'font',
  otf: 'font',
  eot: 'font',
  pdf: 'pdf',
  mp4: 'video',
  mp3: 'audio',
  wav: 'audio',
  ini: 'settings',
  cfg: 'settings',
  conf: 'settings',
  prisma: 'prisma',
  dockerfile: 'docker',
};

const FILE_NAME_ICONS: Record<string, string> = {
  dockerfile: 'docker',
  makefile: 'makefile',
  gemfile: 'ruby',
  rakefile: 'ruby',
  procfile: 'heroku',
  license: 'license',
  licence: 'license',
  '.gitignore': 'git',
  gitignore: 'git',
  '.dockerignore': 'docker',
  dockerignore: 'docker',
  '.editorconfig': 'editorconfig',
  '.prettierrc': 'prettier',
  '.eslintrc': 'eslint',
  '.eslintignore': 'eslint',
  'cargo.toml': 'rust',
  'go.mod': 'go',
  'go.sum': 'go',
  'package.json': 'nodejs',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'composer.json': 'php',
  'readme.md': 'readme',
};

export function getFileIconName(filename: string): string {
  const lower = filename.toLowerCase();

  const byName = FILE_NAME_ICONS[lower];
  if (byName && ICON_URLS[byName]) return byName;

  const ext = getFileExtension(filename);
  const mapped = FILE_ICON_MAP[ext];
  if (mapped && ICON_URLS[mapped]) return mapped;
  if (ICON_URLS[ext]) return ext;

  const stem = lower.includes('.') ? lower.slice(0, lower.lastIndexOf('.')) : lower;
  if (ICON_URLS[stem]) return stem;

  return DEFAULT_ICON;
}

// ponytail: sanity check — upgrade path: dedicated test file if mapping grows further
if (import.meta.env.DEV) {
  console.assert(getFolderIconName('src') === 'folder-src', 'folder icon: src');
  console.assert(getFolderIconName('node_modules') === 'folder-node', 'folder icon: node_modules');
  console.assert(getFileIconName('App.tsx') === 'typescript', 'file icon: tsx');
}
