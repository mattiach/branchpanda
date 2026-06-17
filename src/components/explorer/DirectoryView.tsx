import { useAppStore } from '../../store/app.store';
import { EmptyState } from '../ui/EmptyState';

export function DirectoryView() {
  const { state } = useAppStore();

  if (!state.repo) return null;

  return (
    <div class="flex flex-col flex-1 items-center justify-center gap-4 p-4 sm:p-6 overflow-auto">
      <EmptyState
        icon="folder"
        title="Select a file to preview"
        description="Use the tree on the left to navigate the repository structure."
      />
    </div>
  );
}
