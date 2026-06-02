import { Card, StatusBanner } from '@/components';
import { getApiBaseUrl, getApiKey, isMockMode } from '@/api';

export function SettingsPage() {
  const mock = isMockMode();
  const apiKeySet = Boolean(getApiKey());

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
      {!mock && !apiKeySet ? (
        <StatusBanner tone="error">
          VITE_API_KEY가 설정되지 않았습니다. NAS live/.env의 API_KEY를 .env에
          추가하세요.
        </StatusBanner>
      ) : null}
      {!mock && apiKeySet ? (
        <StatusBanner tone="success">API Key 설정됨</StatusBanner>
      ) : null}
      <p>
        <strong>API Base:</strong> {baseUrl}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        환경 변수: VITE_API_BASE_URL, VITE_API_KEY, VITE_USE_MOCK (.env)
      </p>
    </Card>
  );
}
