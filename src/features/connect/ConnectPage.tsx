import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VenueStatus } from '@/api';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import { useVenueStatuses, useVenues } from '@/hooks';
import { getSelectedVenueId, setSelectedVenueId } from '@/lib/session';
import styles from './ConnectPage.module.css';

export function ConnectPage() {
  const navigate = useNavigate();
  const { data: venues, isLoading, error } = useVenues();
  const statusesQuery = useVenueStatuses();
  const [selectedId, setSelectedId] = useState<string | null>(
    getSelectedVenueId(),
  );

  function selectVenue(id: string) {
    setSelectedId(id);
    setSelectedVenueId(id);
  }

  function handleEnter() {
    if (!selectedId) return;
    navigate('/home');
  }

  const statusMap = useMemo(() => {
    const entries: Array<[string, VenueStatus]> =
      statusesQuery.data?.map((status) => [status.venue_id, status]) ?? [];
    return new Map<string, VenueStatus>(entries);
  }, [statusesQuery.data]);

  const selectedStatus = selectedId ? statusMap.get(selectedId) : undefined;
  const canEnter = Boolean(selectedId && selectedStatus?.connected);
  const selectedAgentReachable = selectedStatus?.agent_reachable;

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
      subtitle="앱 진입 시 연결 상태를 자동 조회합니다. 연결 가능한 현장을 선택해 진입하세요."
    >
      {statusesQuery.error ? (
        <StatusBanner tone="warning">
          일부 상태를 확인하지 못했습니다: {statusesQuery.error.message}
        </StatusBanner>
      ) : null}

      {statusesQuery.isFetching && !statusesQuery.isLoading ? (
        <p className={styles.refreshing}>연결 상태 새로고침 중…</p>
      ) : null}

      <div className={styles.list} role="listbox" aria-label="현장 목록">
        {venues?.map((venue) => {
          const status = statusMap.get(venue.id);
          const isConnected = status?.connected ?? false;
          const statusLabel = isConnected ? '온라인' : '오프라인';
          const statusTone = isConnected ? styles.statusOnline : styles.statusOffline;
          const checkedAt = status?.checked_at
            ? new Date(status.checked_at).toLocaleTimeString('ko-KR')
            : '-';

          return (
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
              <div className={styles.venueTopRow}>
                <span className={styles.venueName}>{venue.name}</span>
                <span className={[styles.statusBadge, statusTone].join(' ')}>
                  {statusLabel}
                </span>
              </div>
              {venue.description ? (
                <span className={styles.venueDesc}>{venue.description}</span>
              ) : null}
              <div className={styles.venueMeta}>
                <span>venue_id: {venue.id}</span>
                <span>status: {status?.status_code ?? '-'}</span>
                <span>checked_at: {checkedAt}</span>
              </div>
              {status?.message ? (
                <span className={styles.venueMessage}>{status.message}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button
          fullWidth
          disabled={!canEnter}
          onClick={handleEnter}
        >
          홈으로 진입
        </Button>
      </div>

      {selectedId && !canEnter ? (
        <StatusBanner tone="warning">
          선택한 현장이 현재 연결 불가 상태입니다. 온라인 상태 venue를 선택해 주세요.
        </StatusBanner>
      ) : null}

      {selectedId && canEnter && selectedAgentReachable === false ? (
        <StatusBanner tone="warning">
          ProPresenter 연결은 확인되었지만 에이전트 상태에 문제가 있습니다.
          {selectedStatus?.agent_message ? ` ${selectedStatus.agent_message}` : ''}
        </StatusBanner>
      ) : null}
    </Card>
  );
}
