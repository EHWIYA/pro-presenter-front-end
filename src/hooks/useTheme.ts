import { useCallback, useSyncExternalStore } from 'react';
import {
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  toggleTheme,
  type Theme,
} from '@/lib/theme';

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => 'light' as Theme,
  );

  const toggle = useCallback(() => {
    toggleTheme();
  }, []);

  const selectTheme = useCallback((next: Theme) => {
    setTheme(next);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggle,
    setTheme: selectTheme,
  };
}
