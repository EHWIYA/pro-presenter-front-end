export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pro-presenter:theme';
const THEME_COLOR: Record<Theme, string> = {
  light: '#2e4b3e',
  dark: '#1a1a1a',
};

const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getSystemTheme(): Theme {
  if (!isBrowser()) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredTheme(): Theme | null {
  if (!isBrowser()) return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function getThemeSnapshot(): Theme {
  if (!isBrowser()) return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme): void {
  if (!isBrowser()) return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', THEME_COLOR[theme]);
}

export function setTheme(theme: Theme): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

export function toggleTheme(): void {
  setTheme(getThemeSnapshot() === 'dark' ? 'light' : 'dark');
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initTheme(): void {
  applyTheme(resolveTheme());
}
