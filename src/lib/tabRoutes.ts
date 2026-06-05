import type { NavigateFunction } from 'react-router-dom';
import { connectOverlay } from '@/lib/connectOverlay';

/** PC 연결 게이트 — 하단 탭 없음 */
export const CONNECT_PATH = '/' as const;

/** 하단 탭 루트 — 전환 시 replace로 스택 미적재 */
export const TAB_PATHS = {
  build: '/worship/build',
  song: '/worship/song',
  home: '/home',
  trigger: '/worship/trigger',
  settings: '/settings',
} as const;

export type TabPath = (typeof TAB_PATHS)[keyof typeof TAB_PATHS];

export type TabReselectState = {
  tabReselect: number;
};

const TAB_PATH_SET = new Set<string>(Object.values(TAB_PATHS));

export function isTabPath(pathname: string): pathname is TabPath {
  return TAB_PATH_SET.has(pathname);
}

/** 탭 화면 → PC 연결 (replace, 오버레이 해제) */
export function navigateToConnect(navigate: NavigateFunction) {
  connectOverlay.hide();
  navigate(CONNECT_PATH, { replace: true });
}

/** PC 연결 완료 → 홈 진입 (replace, 연결 화면 스택 미적재) */
export function navigateFromConnect(navigate: NavigateFunction) {
  navigate(TAB_PATHS.home, { replace: true });
}

/** 탭 루트로 이동 — 기본 replace */
export function navigateToTab(
  navigate: NavigateFunction,
  path: TabPath,
  options?: { replace?: boolean },
) {
  navigate(path, { replace: options?.replace ?? true });
}

/** 활성 탭 재클릭 — 탭 루트 리셋 신호 */
export function reselectTab(navigate: NavigateFunction, path: TabPath) {
  navigate(path, {
    replace: true,
    state: { tabReselect: Date.now() } satisfies TabReselectState,
  });
}
