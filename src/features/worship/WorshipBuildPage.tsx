import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, SlideGrid, Spinner, StatusBanner } from '@/components';
import { useBuildWorship, useWorshipBuildCache } from '@/hooks';
import { getSelectedVenueId, getVerseText, setVerseText } from '@/lib/session';
import styles from './WorshipBuildPage.module.css';

export function WorshipBuildPage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const [text, setText] = useState(getVerseText);
  const build = useBuildWorship(venueId);
  const cached = useWorshipBuildCache(venueId, text);

  const slideMap = build.data?.slide_map ?? cached?.slide_map;

  function handleBuild() {
    if (!venueId || build.isPending) return;
    setVerseText(text);
    build.mutate(text);
  }

  if (!venueId) {
    return (
      <Card title="구절 빌드">
        <StatusBanner tone="warning">먼저 현장 탭에서 장소를 선택하세요.</StatusBanner>
        <Button fullWidth onClick={() => navigate('/venue')}>
          현장 선택
        </Button>
      </Card>
    );
  }

  return (
    <Card
      title="구절 입력"
      subtitle="한 줄에 한 슬라이드. 빌드 후 slide_map index가 trigger index와 같습니다."
    >
      <label className="sr-only" htmlFor="verse-text">
        성경 구절 텍스트
      </label>
      <textarea
        id="verse-text"
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="요한복음 3:16&#10;하나님이 세상을 이처럼 사랑하사…"
        disabled={build.isPending}
      />
      <p className={styles.hint}>빌드는 한 번에 하나만 실행됩니다 (중복 요청 방지).</p>

      <Button fullWidth disabled={build.isPending} onClick={handleBuild}>
        {build.isPending ? '빌드 중…' : '빌드'}
      </Button>

      {build.isPending ? <Spinner centered /> : null}

      {build.error ? (
        <StatusBanner tone="error">{build.error.message}</StatusBanner>
      ) : null}

      {slideMap && slideMap.length > 0 ? (
        <>
          <StatusBanner tone="success">
            {slideMap.length}개 슬라이드 준비됨 — 송출 탭에서 trigger 하세요.
          </StatusBanner>
          <SlideGrid
            slides={slideMap}
            onTrigger={() => navigate('/worship/trigger')}
            disabled
          />
          <Button variant="secondary" fullWidth onClick={() => navigate('/worship/trigger')}>
            송출 탭으로
          </Button>
        </>
      ) : null}
    </Card>
  );
}
