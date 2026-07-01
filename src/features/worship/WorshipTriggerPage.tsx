import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, SlideGrid, StatusBanner } from '@/components';
import {
  useBuildWorship,
  useRequireVenue,
  useTabReselect,
  useTriggerSlide,
  useVenueProbe,
  useVenueStatuses,
  useWorshipBuildCache,
} from '@/hooks';
import { extractBibleReference } from '@/lib/bibleReference';
import { getPresentationFilename, getVerseText } from '@/lib/session';
import { TAB_PATHS, navigateToTab } from '@/lib/tabRoutes';

export function WorshipTriggerPage() {
  const navigate = useNavigate();
  const venueId = useRequireVenue();
  const verseText = getVerseText();
  const reference = extractBibleReference(verseText);
  const presentationFilename = getPresentationFilename();
  const statuses = useVenueStatuses();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const build = useBuildWorship(venueId);
  const trigger = useTriggerSlide(venueId);

  const [lastTriggeredIndex, setLastTriggeredIndex] = useState<number | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cached = useWorshipBuildCache(venueId, reference, presentationFilename);
  const slideMap = build.data?.slide_map ?? cached?.slide_map;
  const venueStatus = venueId
    ? statuses.data?.find((status) => status.venue_id === venueId)
    : undefined;
  const connected = venueStatus?.connected === true;
  const connectedChecked = statuses.isSuccess || statuses.isError;
  const agentReady = probe.data?.agent_reachable === true;
  const agentChecked = probe.isSuccess || probe.isError;
  const canOperate = connected && agentReady;

  const handleTriggerReselect = useCallback(() => {
    setLastTriggeredIndex(null);
    setStatusMessage(null);
  }, []);

  useTabReselect(TAB_PATHS.trigger, handleTriggerReselect);

  function handleTrigger(index: number) {
    if (!venueId || trigger.isPending || !canOperate) return;

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

  if (!venueId) return null;

  if (!slideMap?.length) {
    return (
      <Card title="송출" subtitle="빌드된 slide_map이 없습니다.">
        <StatusBanner tone="warning">
          먼저 빌드 탭에서 구절을 빌드하세요.
          {reference ? ` (저장된 참조: ${reference})` : ''}
        </StatusBanner>
        <Button
          fullWidth
          disabled={!reference || build.isPending || !canOperate}
          onClick={() => {
            if (reference) {
              build.mutate({ reference, presentationFilename });
            }
          }}
        >
          {build.isPending ? '빌드 중…' : '저장된 구절로 빌드'}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigateToTab(navigate, TAB_PATHS.build)}
        >
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

      {connectedChecked && !connected ? (
        <StatusBanner tone="warning">
          ProPresenter 연결이 끊겨 있어 송출이 비활성화됩니다.
          {venueStatus?.message ? ` ${venueStatus.message}` : ''}
        </StatusBanner>
      ) : null}

      {connected && agentChecked && !agentReady ? (
        <StatusBanner tone="warning">
          에이전트 상태 문제로 송출이 비활성화됩니다.
          {probe.data?.agent_message ?? probe.data?.message
            ? ` ${probe.data?.agent_message ?? probe.data?.message}`
            : ''}
        </StatusBanner>
      ) : null}

      {trigger.error && !statusMessage ? (
        <StatusBanner tone="error">{trigger.error.message}</StatusBanner>
      ) : null}

      <SlideGrid
        slides={slideMap}
        onTrigger={handleTrigger}
        disabled={trigger.isPending || !canOperate}
        pendingIndex={trigger.isPending ? trigger.variables ?? null : null}
        activeIndex={lastTriggeredIndex}
      />
    </Card>
  );
}
