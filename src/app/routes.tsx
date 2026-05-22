import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { ConnectPage } from '@/features/connect/ConnectPage';
import { HomePage } from '@/features/home/HomePage';
import { WorshipBuildPage } from '@/features/worship/WorshipBuildPage';
import { WorshipTriggerPage } from '@/features/worship/WorshipTriggerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ConnectPage /> },
      { path: 'venue', element: <Navigate to="/" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'worship/build', element: <WorshipBuildPage /> },
      { path: 'worship/trigger', element: <WorshipTriggerPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
