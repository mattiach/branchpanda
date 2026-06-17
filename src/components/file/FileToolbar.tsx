import { useState } from 'preact/hooks';
import { copyToClipboard, decodeBase64Content, downloadText, isTextFile } from '../../utils/file.utils';
import { Pressable } from '../../animations';
import { Icon } from '../ui/Icon';
import type { GitHubFileContent } from '../../types/github.types';

interface Props {
  file: GitHubFileContent;
}

export function FileToolbar({ file }: Props) {
  const [copied, setCopied] = useState<'path' | 'url' | null>(null);

  async function copy(what: 'path' | 'url') {
    const text = what === 'path' ? file.path : file.html_url;
    await copyToClipboard(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  }

  function download() {
    if (isTextFile(file.name)) {
      downloadText(decodeBase64Content(file.content), file.name);
    } else if (file.download_url) {
      const a = document.createElement('a');
      a.href = file.download_url;
      a.download = file.name;
      a.target = '_blank';
      a.click();
    }
  }

  const btnClass =
    'flex items-center gap-1 rounded px-1.5 sm:px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer';

  return (
    <div class="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end">
      <Pressable type="button" onClick={() => copy('path')} title="Copy file path" className={btnClass}>
        {copied === 'path' ? (
          'Copied'
        ) : (
          <>
            <Icon name="document" size={12} />
            <span class="hidden sm:inline">Path</span>
          </>
        )}
      </Pressable>
      <Pressable type="button" onClick={() => copy('url')} title="Copy file URL" className={btnClass}>
        {copied === 'url' ? (
          'Copied'
        ) : (
          <>
            <Icon name="link" size={12} />
            <span class="hidden sm:inline">URL</span>
          </>
        )}
      </Pressable>
      <Pressable type="button" onClick={download} title="Download file" className={btnClass}>
        <Icon name="download" size={12} />
        <span class="hidden sm:inline">Download</span>
      </Pressable>
    </div>
  );
}
