export function decodeBase64Content(content: string): string {
  try {
    return atob(content.replace(/\n/g, ''));
  } catch {
    return content;
  }
}

export function encodeBase64Content(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts[parts.length - 1]?.toLowerCase() ?? '') : '';
}

export function isTextFile(filename: string): boolean {
  const textExtensions = new Set([
    'txt', 'md', 'mdx', 'ts', 'tsx', 'js', 'jsx', 'json', 'yaml', 'yml',
    'html', 'htm', 'css', 'scss', 'less', 'xml', 'svg', 'toml', 'ini',
    'env', 'sh', 'bash', 'zsh', 'py', 'rb', 'go', 'rs', 'java', 'c',
    'cpp', 'h', 'hpp', 'cs', 'php', 'swift', 'kt', 'dart', 'vue', 'astro',
    'graphql', 'gql', 'sql', 'lock', 'prettierrc', 'eslintrc', 'babelrc',
    'editorconfig', 'gitattributes',
  ]);
  const ext = getFileExtension(filename);
  if (textExtensions.has(ext)) return true;
  const noExtFiles = ['dockerfile', 'makefile', 'rakefile', 'gemfile', 'procfile', 'gitignore'];
  return noExtFiles.includes(filename.toLowerCase());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string): void {
  downloadBlob(new Blob([content], { type: 'text/plain' }), filename);
}

export function getLanguage(filename: string): string {
  const ext = getFileExtension(filename);
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', swift: 'swift',
    kt: 'kotlin', dart: 'dart', html: 'html', css: 'css', scss: 'scss',
    json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown', mdx: 'markdown',
    xml: 'xml', svg: 'xml', sh: 'bash', bash: 'bash', sql: 'sql',
    graphql: 'graphql', gql: 'graphql', vue: 'vue', toml: 'toml',
  };
  return map[ext] ?? 'text';
}

