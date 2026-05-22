import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { VenuePage } from '@/features/venue/VenuePage';
import { WorshipBuildPage } from '@/features/worship/WorshipBuildPage';
import { WorshipTriggerPage } from '@/features/worship/WorshipTriggerPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/venue" replace /> },
      { path: 'venue', element: <VenuePage /> },
      { path: 'worship/build', element: <WorshipBuildPage /> },
      { path: 'worship/trigger', element: <WorshipTriggerPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
