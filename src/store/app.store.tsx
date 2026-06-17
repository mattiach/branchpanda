import { createContext } from 'preact';
import { useReducer, useContext } from 'preact/hooks';

import type { ComponentChildren } from 'preact';
import type { AppState, AppAction, AppContextValue } from '../types/app.types';

export const initialState: AppState = {
  view: 'home',
  repo: null,
  currentPath: '',
  selectedFile: null,
  isLoadingFile: false,
  error: null,
  searchQuery: '',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };

    case 'SET_REPO':
      return {
        ...state,
        repo: action.payload,
        view: 'explorer',
        currentPath: '',
        selectedFile: null,
        searchQuery: '',
        error: null,
      };

    case 'SET_CURRENT_PATH':
      return { ...state, currentPath: action.payload, selectedFile: null };

    case 'SET_SELECTED_FILE':
      return {
        ...state,
        selectedFile: action.payload,
        currentPath: action.payload?.path ?? state.currentPath,
      };

    case 'SET_LOADING_FILE':
      return { ...state, isLoadingFile: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => { },
});

export function AppProvider({ children }: { children: ComponentChildren }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextValue {
  return useContext(AppContext);
}
