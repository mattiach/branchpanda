import type { GitHubRepo, GitHubFileContent } from './github.types';

export type AppView = 'home' | 'explorer';

export interface TreeNodeData {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
  downloadUrl?: string | null;
  isExpanded: boolean;
  isLoading: boolean;
  /** undefined = file; array = directory children (fully loaded from tree cache) */
  children?: TreeNodeData[];
}

export interface AppState {
  view: AppView;
  repo: GitHubRepo | null;
  currentPath: string;
  selectedFile: GitHubFileContent | null;
  isLoadingFile: boolean;
  error: string | null;
  searchQuery: string;
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_REPO'; payload: GitHubRepo }
  | { type: 'SET_CURRENT_PATH'; payload: string }
  | { type: 'SET_SELECTED_FILE'; payload: GitHubFileContent | null }
  | { type: 'SET_LOADING_FILE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET' };

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
}