import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, SlideGrid, Spinner, StatusBanner } from '@/components';
import {
  useBuildWorship,
  useRequireVenue,
  useTabReselect,
  useVenueProbe,
  useVenueStatuses,
  useWorshipBuildCache,
} from '@/hooks';
import { getVerseText, setVerseText } from '@/lib/session';
import { TAB_PATHS, navigateToTab } from '@/lib/tabRoutes';
import styles from './WorshipBuildPage.module.css';

export function WorshipBuildPage() {
  const navigate = useNavigate();
  const venueId = useRequireVenue();
  const [text, setText] = useState(getVerseText);
  const statuses = useVenueStatuses();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const build = useBuildWorship(venueId);
  const cached = useWorshipBuildCache(venueId, text);

  const slideMap = build.data?.slide_map ?? cached?.slide_map;
  const venueStatus = venueId
    ? statuses.data?.find((status) => status.venue_id === venueId)
    : undefined;
  const connected = venueStatus?.connected === true;
  const connectedChecked = statuses.isSuccess || statuses.isError;
  const agentReady = probe.data?.agent_reachable === true;
  const agentChecked = probe.isSuccess || probe.isError;
  const canBuild = connected && agentReady;

  const handleBuildReselect = useCallback(() => {
    setText(getVerseText());
    build.reset();
  }, [build]);

  useTabReselect(TAB_PATHS.build, handleBuildReselect);

  function handleBuild() {
    if (!venueId || build.isPending || !canBuild) return;
    if (!text.trim()) return;
    setVerseText(text);
    build.mutate(text);
  }

  if (!venueId) return null;

  return (
    <Card
      title="구절 입력"
      subtitle="첫 비어 있지 않은 줄을 성경 참조로 빌드합니다. 송출 시 slide_map의 index를 사용하세요."
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
      <p className={styles.hint}>
        빌드는 ProPresenter 연결 + 현장 에이전트(8787) 정상일 때만 가능합니다.
      </p>

      {connectedChecked && !connected ? (
        <StatusBanner tone="warning">
          ProPresenter 연결이 끊겨 있어 빌드가 비활성화됩니다.
          {venueStatus?.message ? ` ${venueStatus.message}` : ''}
        </StatusBanner>
      ) : null}

      {connected && agentChecked && !agentReady ? (
        <StatusBanner tone="warning">
          에이전트 상태 문제로 빌드가 비활성화됩니다.
          {probe.data?.agent_message ?? probe.data?.message
            ? ` ${probe.data?.agent_message ?? probe.data?.message}`
            : ''}
        </StatusBanner>
      ) : null}

      <Button fullWidth disabled={build.isPending || !text.trim() || !canBuild} onClick={handleBuild}>
        {build.isPending ? '빌드 중…' : '빌드'}
      </Button>

      {build.isPending ? <Spinner centered /> : null}

      {build.error ? (
        <StatusBanner tone="error">{build.error.message}</StatusBanner>
      ) : null}

      {slideMap && slideMap.length > 0 ? (
        <>
          <StatusBanner tone="success">
            {(build.data?.reference ?? cached?.reference)
              ? `${build.data?.reference ?? cached?.reference} · `
              : ''}
            {build.data?.slide_count ?? cached?.slide_count ?? slideMap.length}개 슬라이드
            준비됨 — 송출 탭에서 trigger 하세요.
          </StatusBanner>
          <SlideGrid
            slides={slideMap}
            onTrigger={() => navigateToTab(navigate, TAB_PATHS.trigger)}
            disabled
          />
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigateToTab(navigate, TAB_PATHS.trigger)}
          >
            송출 탭으로
          </Button>
        </>
      ) : null}
    </Card>
  );
}
