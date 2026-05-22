import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import { useVenueProbe, useVenues } from '@/hooks';
import {
  getSelectedVenueId,
  setSelectedVenueId,
} from '@/lib/session';
import styles from './VenuePage.module.css';

export function VenuePage() {
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
      title="현장 선택"
      subtitle="장소 선택 → 연결 확인(probe)으로 ProPresenter(pp_port)만 검사합니다."
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
          variant="secondary"
          fullWidth
          disabled={!selectedId || probe.isFetching}
          onClick={handleProbe}
        >
          {probe.isFetching ? '확인 중…' : '연결 확인 (probe)'}
        </Button>
      </div>

      {probeEnabled && probe.data ? (
        <StatusBanner tone={probe.data.agent_reachable ? 'success' : 'warning'}>
          {probe.data.agent_reachable
            ? 'ProPresenter 연결됨 (probe)'
            : 'ProPresenter에 연결되지 않음 (probe)'}
          {probe.data.message ? ` — ${probe.data.message}` : ''}
          {' '}
          (빌드·송출은 별도 현장 에이전트 8787 필요)
        </StatusBanner>
      ) : null}

      {probeEnabled && probe.error ? (
        <StatusBanner tone="error">{probe.error.message}</StatusBanner>
      ) : null}

      <Button
        fullWidth
        disabled={!selectedId}
        onClick={() => navigate('/worship/build')}
      >
        구절 입력으로 이동
      </Button>
    </Card>
  );
}
