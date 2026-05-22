import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import { useVenueProbe, useVenues } from '@/hooks';
import { getSelectedVenueId, setSelectedVenueId } from '@/lib/session';
import styles from './ConnectPage.module.css';

export function ConnectPage() {
  const navigate = useNavigate();
  const { data: venues, isLoading, error } = useVenues();
  const [selectedId, setSelectedId] = useState<string | null>(
    getSelectedVenueId(),
  );
  const [probeEnabled, setProbeEnabled] = useState(false);

  const probe = useVenueProbe(selectedId, probeEnabled);

  function selectVenue(id: string) {
    setSelectedId(id);
    setSelectedVenueId(id);
    setProbeEnabled(false);
  }

  function handleProbe() {
    if (!selectedId) return;
    setProbeEnabled(true);
    void probe.refetch();
  }

  useEffect(() => {
    if (
      probeEnabled &&
      selectedId &&
      probe.data?.agent_reachable &&
      !probe.isFetching
    ) {
      navigate('/home', { replace: true });
    }
  }, [
    probeEnabled,
    selectedId,
    probe.data?.agent_reachable,
    probe.isFetching,
    navigate,
  ]);

  if (isLoading) return <Spinner centered />;
  if (error) {
    return (
      <StatusBanner tone="error">
        현장 목록을 불러오지 못했습니다: {error.message}
      </StatusBanner>
    );
  }

  return (
    <Card
      title="PC 연결"
      subtitle="장소를 선택한 뒤 연결을 확인하세요. 성공 시 홈으로 이동합니다."
    >
      <div className={styles.list} role="listbox" aria-label="현장 목록">
        {venues?.map((venue) => (
          <button
            key={venue.id}
            type="button"
            role="option"
            aria-selected={selectedId === venue.id}
            className={[
              styles.venueItem,
              selectedId === venue.id ? styles.venueItemSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => selectVenue(venue.id)}
          >
            <span className={styles.venueName}>{venue.name}</span>
            {venue.description ? (
              <span className={styles.venueDesc}>{venue.description}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          fullWidth
          disabled={!selectedId || probe.isFetching}
          onClick={handleProbe}
        >
          {probe.isFetching ? '확인 중…' : 'PC 연결 확인'}
        </Button>
      </div>

      {probeEnabled && probe.data && !probe.data.agent_reachable ? (
        <StatusBanner tone="warning">
          ProPresenter에 연결되지 않았습니다.
          {probe.data.message ? ` ${probe.data.message}` : ''}
          <br />
          현장 PC에서 ProPresenter 실행·pp_port·Tailscale을 확인하세요.
        </StatusBanner>
      ) : null}

      {probeEnabled && probe.error ? (
        <StatusBanner tone="error">{probe.error.message}</StatusBanner>
      ) : null}

      {probeEnabled && probe.data?.agent_reachable ? (
        <StatusBanner tone="success">연결됨 — 홈으로 이동 중…</StatusBanner>
      ) : null}
    </Card>
  );
}
