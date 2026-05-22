import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, SlideGrid, StatusBanner } from '@/components';
import { useBuildWorship, useTriggerSlide, useWorshipBuildCache } from '@/hooks';
import { getSelectedVenueId, getVerseText } from '@/lib/session';

export function WorshipTriggerPage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const verseText = getVerseText();
  const build = useBuildWorship(venueId);
  const trigger = useTriggerSlide(venueId);

  const [lastTriggeredIndex, setLastTriggeredIndex] = useState<number | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cached = useWorshipBuildCache(venueId, verseText);
  const slideMap = build.data?.slide_map ?? cached?.slide_map;

  function handleTrigger(index: number) {
    if (!venueId || trigger.isPending) return;

    setStatusMessage(null);
    trigger.mutate(index, {
      onSuccess: (res) => {
        if (res.ok) {
          setLastTriggeredIndex(index);
          setStatusMessage(res.message ?? `슬라이드 ${index} 송출 완료`);
        } else {
          setStatusMessage(res.message ?? '송출 실패');
        }
      },
      onError: (err) => {
        setStatusMessage(err.message);
      },
    });
  }

  if (!venueId) {
    return (
      <Card title="송출">
        <StatusBanner tone="warning">현장을 선택하세요.</StatusBanner>
        <Button fullWidth onClick={() => navigate('/')}>
          PC 연결
        </Button>
      </Card>
    );
  }

  if (!slideMap?.length) {
    return (
      <Card title="송출" subtitle="빌드된 slide_map이 없습니다.">
        <StatusBanner tone="warning">
          먼저 빌드 탭에서 구절을 빌드하세요.
          {verseText ? ' (저장된 구절 텍스트 있음)' : ''}
        </StatusBanner>
        <Button
          fullWidth
          disabled={!verseText || build.isPending}
          onClick={() => {
            if (verseText) build.mutate(verseText);
          }}
        >
          {build.isPending ? '빌드 중…' : '저장된 구절로 빌드'}
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/worship/build')}>
          빌드 탭으로
        </Button>
      </Card>
    );
  }

  return (
    <Card
      title="송출"
      subtitle="서버 응답 후에만 상태가 바뀝니다 (optimistic 없음)."
    >
      {statusMessage ? (
        <StatusBanner tone={trigger.isError ? 'error' : 'success'}>
          {statusMessage}
        </StatusBanner>
      ) : null}

      {trigger.error && !statusMessage ? (
        <StatusBanner tone="error">{trigger.error.message}</StatusBanner>
      ) : null}

      <SlideGrid
        slides={slideMap}
        onTrigger={handleTrigger}
        disabled={trigger.isPending}
        pendingIndex={trigger.isPending ? trigger.variables ?? null : null}
        activeIndex={lastTriggeredIndex}
      />
    </Card>
  );
}
