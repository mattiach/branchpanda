import { getFileExtension } from './file.utils';

/** Maps file extensions / icon names to Prism language identifiers. */
const EXT_TO_PRISM: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  py: 'python',
  pyw: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  dart: 'dart',
  html: 'markup',
  htm: 'markup',
  xml: 'markup',
  svg: 'markup',
  xaml: 'markup',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  styl: 'stylus',
  md: 'markdown',
  mdx: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  fish: 'bash',
  ps1: 'powershell',
  sql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  vue: 'markup',
  svelte: 'markup',
  astro: 'markup',
  dockerfile: 'docker',
  docker: 'docker',
  makefile: 'makefile',
  lua: 'lua',
  r: 'r',
  perl: 'perl',
  pl: 'perl',
  scala: 'scala',
  clj: 'clojure',
  cljs: 'clojure',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hs: 'haskell',
  ml: 'ocaml',
  fs: 'fsharp',
  fsx: 'fsharp',
  vb: 'vbnet',
  pas: 'pascal',
  asm: 'nasm',
  zig: 'zig',
  nim: 'nim',
  v: 'verilog',
  sv: 'verilog',
  tf: 'hcl',
  hcl: 'hcl',
  proto: 'protobuf',
  diff: 'diff',
  patch: 'diff',
  ini: 'ini',
  cfg: 'ini',
  conf: 'ini',
  env: 'bash',
  gitignore: 'ignore',
  gitattributes: 'git',
  sol: 'solidity',
  wasm: 'wasm',
  wat: 'wasm',
  tex: 'latex',
  bib: 'latex',
  rst: 'rest',
  adoc: 'asciidoc',
  groovy: 'groovy',
  gradle: 'gradle',
  cmake: 'cmake',
  bat: 'batch',
  cmd: 'batch',
  coffee: 'coffeescript',
  cr: 'crystal',
  d: 'd',
  elm: 'elm',
  f90: 'fortran',
  f95: 'fortran',
  jl: 'julia',
  lisp: 'lisp',
  cl: 'lisp',
  matlab: 'matlab',
  m: 'matlab',
  objc: 'objectivec',
  mm: 'objectivec',
  pgsql: 'sql',
  plsql: 'sql',
  properties: 'properties',
  rego: 'rego',
  tfvars: 'hcl',
  twig: 'twig',
  uri: 'uri',
  url: 'uri',
  vhdl: 'vhdl',
  vim: 'vim',
  wgsl: 'wgsl',
  wiki: 'wiki',
  xquery: 'xquery',
};

const loadedLangs = new Set<string>(['plain', 'plaintext']);

/** Parent languages that must load before a Prism component registers. */
const LANG_DEPS: Record<string, string[]> = {
  javascript: ['clike'],
  typescript: ['javascript'],
  jsx: ['javascript', 'markup'],
  tsx: ['jsx', 'typescript'],
  c: ['clike'],
  cpp: ['c'],
  objectivec: ['c'],
  csharp: ['clike'],
  java: ['clike'],
  kotlin: ['clike'],
  scala: ['java'],
  go: ['clike'],
  dart: ['clike'],
  fsharp: ['clike'],
  groovy: ['clike'],
  gradle: ['clike'],
  scss: ['css'],
  sass: ['css'],
  less: ['css'],
  stylus: ['css'],
  markdown: ['markup'],
};

const LANG_IMPORTS: Record<string, () => Promise<unknown>> = {
  clike: () => import('prismjs/components/prism-clike'),
  typescript: () => import('prismjs/components/prism-typescript'),
  tsx: () => import('prismjs/components/prism-tsx'),
  javascript: () => import('prismjs/components/prism-javascript'),
  jsx: () => import('prismjs/components/prism-jsx'),
  json: () => import('prismjs/components/prism-json'),
  python: () => import('prismjs/components/prism-python'),
  ruby: () => import('prismjs/components/prism-ruby'),
  go: () => import('prismjs/components/prism-go'),
  rust: () => import('prismjs/components/prism-rust'),
  java: () => import('prismjs/components/prism-java'),
  c: () => import('prismjs/components/prism-c'),
  cpp: () => import('prismjs/components/prism-cpp'),
  csharp: () => import('prismjs/components/prism-csharp'),
  php: () => import('prismjs/components/prism-php'),
  swift: () => import('prismjs/components/prism-swift'),
  kotlin: () => import('prismjs/components/prism-kotlin'),
  dart: () => import('prismjs/components/prism-dart'),
  markup: () => import('prismjs/components/prism-markup'),
  css: () => import('prismjs/components/prism-css'),
  scss: () => import('prismjs/components/prism-scss'),
  sass: () => import('prismjs/components/prism-sass'),
  less: () => import('prismjs/components/prism-less'),
  stylus: () => import('prismjs/components/prism-stylus'),
  markdown: () => import('prismjs/components/prism-markdown'),
  yaml: () => import('prismjs/components/prism-yaml'),
  toml: () => import('prismjs/components/prism-toml'),
  bash: () => import('prismjs/components/prism-bash'),
  powershell: () => import('prismjs/components/prism-powershell'),
  sql: () => import('prismjs/components/prism-sql'),
  graphql: () => import('prismjs/components/prism-graphql'),
  docker: () => import('prismjs/components/prism-docker'),
  makefile: () => import('prismjs/components/prism-makefile'),
  lua: () => import('prismjs/components/prism-lua'),
  r: () => import('prismjs/components/prism-r'),
  perl: () => import('prismjs/components/prism-perl'),
  scala: () => import('prismjs/components/prism-scala'),
  clojure: () => import('prismjs/components/prism-clojure'),
  elixir: () => import('prismjs/components/prism-elixir'),
  erlang: () => import('prismjs/components/prism-erlang'),
  haskell: () => import('prismjs/components/prism-haskell'),
  ocaml: () => import('prismjs/components/prism-ocaml'),
  fsharp: () => import('prismjs/components/prism-fsharp'),
  vbnet: () => import('prismjs/components/prism-vbnet'),
  pascal: () => import('prismjs/components/prism-pascal'),
  nasm: () => import('prismjs/components/prism-nasm'),
  zig: () => import('prismjs/components/prism-zig'),
  nim: () => import('prismjs/components/prism-nim'),
  verilog: () => import('prismjs/components/prism-verilog'),
  hcl: () => import('prismjs/components/prism-hcl'),
  protobuf: () => import('prismjs/components/prism-protobuf'),
  diff: () => import('prismjs/components/prism-diff'),
  ini: () => import('prismjs/components/prism-ini'),
  ignore: () => import('prismjs/components/prism-ignore'),
  git: () => import('prismjs/components/prism-git'),
  solidity: () => import('prismjs/components/prism-solidity'),
  wasm: () => import('prismjs/components/prism-wasm'),
  latex: () => import('prismjs/components/prism-latex'),
  rest: () => import('prismjs/components/prism-rest'),
  asciidoc: () => import('prismjs/components/prism-asciidoc'),
  groovy: () => import('prismjs/components/prism-groovy'),
  gradle: () => import('prismjs/components/prism-gradle'),
  cmake: () => import('prismjs/components/prism-cmake'),
  batch: () => import('prismjs/components/prism-batch'),
  coffeescript: () => import('prismjs/components/prism-coffeescript'),
  crystal: () => import('prismjs/components/prism-crystal'),
  d: () => import('prismjs/components/prism-d'),
  elm: () => import('prismjs/components/prism-elm'),
  fortran: () => import('prismjs/components/prism-fortran'),
  julia: () => import('prismjs/components/prism-julia'),
  lisp: () => import('prismjs/components/prism-lisp'),
  matlab: () => import('prismjs/components/prism-matlab'),
  objectivec: () => import('prismjs/components/prism-objectivec'),
  properties: () => import('prismjs/components/prism-properties'),
  rego: () => import('prismjs/components/prism-rego'),
  twig: () => import('prismjs/components/prism-twig'),
  uri: () => import('prismjs/components/prism-uri'),
  vhdl: () => import('prismjs/components/prism-vhdl'),
  vim: () => import('prismjs/components/prism-vim'),
  wgsl: () => import('prismjs/components/prism-wgsl'),
  wiki: () => import('prismjs/components/prism-wiki'),
  xquery: () => import('prismjs/components/prism-xquery'),
};

export const HIGHLIGHT_MAX_BYTES = 120_000;
export const HIGHLIGHT_MAX_LINES = 2_500;

export function resolvePrismLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile') return 'docker';
  if (lower === 'makefile') return 'makefile';
  if (lower === '.gitignore' || lower === 'gitignore') return 'ignore';

  const ext = getFileExtension(filename);
  if (EXT_TO_PRISM[ext]) return EXT_TO_PRISM[ext]!;
  if (LANG_IMPORTS[ext]) return ext;
  return 'plain';
}

export async function ensurePrismLanguage(lang: string): Promise<string> {
  if (lang === 'plain' || lang === 'plaintext' || lang === 'text') return 'plain';
  if (loadedLangs.has(lang)) return lang;

  const loader = LANG_IMPORTS[lang];
  if (!loader) return 'plain';

  try {
    for (const dep of LANG_DEPS[lang] ?? []) {
      await ensurePrismLanguage(dep);
    }
    await loader();
    loadedLangs.add(lang);
    return lang;
  } catch {
    return 'plain';
  }
}

export function shouldHighlight(code: string): boolean {
  if (code.length > HIGHLIGHT_MAX_BYTES) return false;
  const lineCount = code.split('\n').length;
  return lineCount <= HIGHLIGHT_MAX_LINES;
}

type PrismDefault = typeof import('prismjs').default;

let prismPromise: Promise<PrismDefault> | null = null;

/** Lazy-load Prism core so language chunks stay split from the entry bundle. */
export function getPrism(): Promise<PrismDefault> {
  prismPromise ??= import('prismjs').then(m => m.default);
  return prismPromise;
}
