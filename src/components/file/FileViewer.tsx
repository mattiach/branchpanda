import { useAppStore } from '../../store/app.store';
import { decodeBase64Content, isTextFile, formatFileSize } from '../../utils/file.utils';
import { FileToolbar } from './FileToolbar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { CodeDisplay } from './CodeDisplay';
import { Icon } from '../ui/Icon';
import { useState } from 'preact/hooks';

type ViewMode = 'preview' | 'raw';

/** @deprecated Use CodeSidebar — kept for backward compatibility */
export function FileViewer() {
  const { state } = useAppStore();
  const [mode, setMode] = useState<ViewMode>('preview');

  if (state.isLoadingFile) {
    return (
      <div class="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!state.selectedFile) {
    return (
      <div class="flex flex-1 items-center justify-center">
        <EmptyState
          icon="document"
          title="No file selected"
          description="Click a file in the tree to preview it here."
        />
      </div>
    );
  }

  const file = state.selectedFile;
  const isText = isTextFile(file.name);
  const decoded = isText ? decodeBase64Content(file.content) : null;

  return (
    <div class="flex flex-col flex-1 min-h-0">
      <div class="flex flex-wrap items-center gap-2 border-b border-border bg-card/80 px-3 sm:px-4 py-2 shrink-0">
        <div class="flex gap-1 rounded-lg border border-border bg-muted p-0.5">
          {(['preview', 'raw'] as ViewMode[]).map(m => {
            const active = mode === m;
            return (
            <button
              key={m}
              onClick={() => setMode(m)}
              class={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                name={m === 'preview' ? 'document' : 'console'}
                size={12}
                class={active ? 'brightness-0 invert' : ''}
              />
              {m === 'preview' ? 'Preview' : 'Raw'}
            </button>
            );
          })}
        </div>

        <span class="flex-1" />

        <span class="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
        <FileToolbar file={file} />
      </div>

      <div class="flex-1 overflow-auto bg-background">
        {!isText ? (
          <EmptyState
            icon="image"
            title="Binary file"
            description="This file type cannot be previewed."
          />
        ) : mode === 'raw' ? (
          <pre class="p-4 text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap break-all">
            {decoded}
          </pre>
        ) : (
          <CodeDisplay code={decoded ?? ''} filename={file.name} />
        )}
      </div>
    </div>
  );
}
