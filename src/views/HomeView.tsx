import { RepoInput } from '../components/home/RepoInput';
import { getSuggestedRepoFromPage } from '../utils/repo-url.utils';

export function HomeView() {
  const suggestedRepo = getSuggestedRepoFromPage();

  return (
    <main class="flex flex-1 items-center justify-center bg-background overflow-auto py-6 sm:py-8 px-2">
      <RepoInput suggestedRepo={suggestedRepo} />
    </main>
  );
}
