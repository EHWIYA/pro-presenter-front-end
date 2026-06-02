import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import { useVenuePresentations, useVenues } from '@/hooks';
import { getSelectedVenueId } from '@/lib/session';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const { data: venues } = useVenues();
  const inventory = useVenuePresentations(venueId);

  const venueName =
    venues?.find((v) => v.id === venueId)?.name ?? venueId ?? '미선택';

  useEffect(() => {
    if (!venueId) {
      navigate('/', { replace: true });
    }
  }, [venueId, navigate]);

  if (!venueId) return null;

  if (inventory.isLoading) return <Spinner centered />;

  const presentations = inventory.data?.presentations ?? [];

  return (
    <Card
      title="홈"
      subtitle={`${venueName} — 라벨·슬라이드 수만 표시`}
    >
      {inventory.error ? (
        <StatusBanner tone="error">
          목록을 불러오지 못했습니다: {inventory.error.message}
        </StatusBanner>
      ) : null}

      {inventory.isFetching && !inventory.isLoading ? (
        <p className={styles.refreshing}>새로고침 중…</p>
      ) : null}

      {presentations.length === 0 && !inventory.error ? (
        <StatusBanner tone="info">보유한 프레젠테이션이 없습니다.</StatusBanner>
      ) : null}

      <ul className={styles.presList} aria-label="프레젠테이션 목록">
        {presentations.map((pres) => (
          <li key={pres.id} className={styles.presCard}>
            <div className={styles.presHeader}>
              <h3 className={styles.presLabel}>{pres.label}</h3>
              <div className={styles.presStats} aria-label="프레젠테이션 요약">
                <span className={styles.statBadge}>
                  그룹 <strong>{pres.group_count}</strong>
                </span>
                <span className={styles.statBadge}>
                  슬라이드 <strong>{pres.slide_count}</strong>
                </span>
              </div>
            </div>
            <ul className={styles.groupList} aria-label={`${pres.label} 그룹`}>
              {pres.groups.map((group, idx) => (
                <li key={`${pres.id}-g-${idx}`} className={styles.groupRow}>
                  <span className={styles.groupLabel}>{group.label}</span>
                  <span className={styles.groupSlides}>
                    {group.slide_count}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          fullWidth
          disabled={inventory.isFetching}
          onClick={() => void inventory.refetch()}
        >
          목록 새로고침
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
          PC 연결 다시 확인
        </Button>
        <Button fullWidth onClick={() => navigate('/worship/build')}>
          성경 구절 빌드
        </Button>
        <Button fullWidth onClick={() => navigate('/worship/song')}>
          찬양 악보
        </Button>
      </div>
    </Card>
  );
}
