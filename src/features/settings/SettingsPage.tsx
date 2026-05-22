import { Card, StatusBanner } from '@/components';
import { getApiBaseUrl, isMockMode } from '@/api';

export function SettingsPage() {
  const mock = isMockMode();
  let baseUrl = '(not set)';
  try {
    baseUrl = mock ? '(mock — no requests)' : getApiBaseUrl();
  } catch {
    baseUrl = '(not set)';
  }

  return (
    <Card title="설정" subtitle="개발·운영 환경 확인">
      <StatusBanner tone={mock ? 'warning' : 'info'}>
        모드: {mock ? 'Mock (VITE_USE_MOCK=true)' : 'Live API'}
      </StatusBanner>
      <p>
        <strong>API Base:</strong> {baseUrl}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        환경 변수: VITE_API_BASE_URL, VITE_API_KEY, VITE_USE_MOCK
      </p>
    </Card>
  );
}
