import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { ConnectPage } from '@/features/connect/ConnectPage';
import { HomePage } from '@/features/home/HomePage';
import { WorshipBuildPage } from '@/features/worship/WorshipBuildPage';
import { WorshipTriggerPage } from '@/features/worship/WorshipTriggerPage';
import { SongPage } from '@/features/song/SongPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { CONNECT_PATH, TAB_PATHS } from '@/lib/tabRoutes';

/** 하단 탭 루트 — TabNavLink(replace)로 전환, 스택 미적재 */
const tabRoutes = [
  { path: TAB_PATHS.home.slice(1), element: <HomePage /> },
  { path: TAB_PATHS.build.slice(1), element: <WorshipBuildPage /> },
  { path: TAB_PATHS.song.slice(1), element: <SongPage /> },
  { path: TAB_PATHS.trigger.slice(1), element: <WorshipTriggerPage /> },
  { path: TAB_PATHS.settings.slice(1), element: <SettingsPage /> },
] as const;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ConnectPage /> },
      { path: 'venue', element: <Navigate to={CONNECT_PATH} replace /> },
      ...tabRoutes,
      { path: '*', element: <Navigate to={TAB_PATHS.home} replace /> },
    ],
  },
]);
