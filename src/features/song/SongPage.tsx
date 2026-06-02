import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import {
  useBuildSong,
  useSongAnalyze,
  useTriggerSlide,
  useVenueProbe,
} from '@/hooks';
import type { SongBuildMode, SongSection } from '@/api';
import { getSelectedVenueId } from '@/lib/session';
import { SongBuildResult } from './SongBuildResult';
import { SongSectionsEditor } from './SongSectionsEditor';
import { SongUploadPage, type SongUploadPayload } from './SongUploadPage';

type SongStep = 'upload' | 'edit' | 'build';

export function SongPage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const analyze = useSongAnalyze();
  const build = useBuildSong();
  const trigger = useTriggerSlide(venueId);

  const [step, setStep] = useState<SongStep>('upload');
  const [songTitle, setSongTitle] = useState('');
  const [sections, setSections] = useState<SongSection[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [buildMode, setBuildMode] = useState<SongBuildMode>('append');
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const agentReady = probe.data?.agent_reachable === true;
  const probeChecked = probe.isSuccess || probe.isError;
  const actionsDisabled =
    !agentReady ||
    build.isPending ||
    analyze.isPolling ||
    analyze.start.isPending;

  useEffect(() => {
    if (analyze.job?.status === 'finished' && analyze.job.parsed) {
      setSongTitle(analyze.job.parsed.song_title);
      setSections(analyze.job.parsed.sections);
      setWarnings(analyze.job.parsed.warnings ?? []);
      setStep('edit');
    }
  }, [analyze.job]);

  function handleAnalyze(payload: SongUploadPayload) {
    if (analyze.isPolling || analyze.start.isPending) return;
    setSongTitle(payload.songTitle);
    setSections([]);
    setWarnings([]);
    build.reset();
    setStep('upload');
    analyze.start.mutate(payload);
  }

  function handleBuild() {
    if (!venueId || build.isPending || !agentReady) return;
    build.mutate({
      venueId,
      songTitle,
      buildMode,
      sections,
    });
  }

  function handleTrigger(index: number) {
    if (!venueId || trigger.isPending || !agentReady) return;
    setPendingIndex(index);
    setStatusMessage(null);
    trigger.mutate(index, {
      onSuccess: (res) => {
        setPendingIndex(null);
        if (res.ok) {
          setActiveIndex(index);
          setStatusMessage(res.message ?? `슬라이드 ${index} 송출 완료`);
        } else {
          setStatusMessage(res.message ?? '송출 실패');
        }
      },
      onError: (err) => {
        setPendingIndex(null);
        setStatusMessage(err.message);
      },
    });
  }

  function handleResetAnalyze() {
    analyze.reset();
    build.reset();
    setStep('upload');
    setSections([]);
    setWarnings([]);
    setStatusMessage(null);
    setActiveIndex(null);
    setPendingIndex(null);
  }

  if (!venueId) {
    return (
      <Card title="찬양 악보">
        <StatusBanner tone="warning">먼저 연결 탭에서 PC를 연결하세요.</StatusBanner>
        <Button fullWidth onClick={() => navigate('/')}>
          PC 연결
        </Button>
      </Card>
    );
  }

  const subtitle =
    step === 'upload'
      ? '곡 제목과 가사·악보를 입력한 뒤 AI 분석을 시작하세요.'
      : step === 'edit'
        ? 'AI 결과를 검수·편집한 뒤 빌드하세요.'
        : 'PP 빌드 후 슬라이드를 탭해 송출하세요.';

  return (
    <Card title="찬양 악보" subtitle={subtitle}>
      {probeChecked && !agentReady ? (
        <StatusBanner tone="warning">
          ProPresenter에 연결되지 않았습니다. 빌드·송출이 비활성화됩니다.
          {probe.data?.message ? ` ${probe.data.message}` : ''}
        </StatusBanner>
      ) : null}

      {analyze.job?.status === 'error' ? (
        <StatusBanner tone="error">
          분석 실패
          {analyze.job.errorCode ? ` (${analyze.job.errorCode})` : ''}:{' '}
          {analyze.job.error ?? '알 수 없는 오류'}
        </StatusBanner>
      ) : null}

      {analyze.jobError && analyze.job?.status !== 'error' ? (
        <StatusBanner tone="error">{analyze.jobError.message}</StatusBanner>
      ) : null}

      {analyze.isPolling ? (
        <>
          <StatusBanner tone="info">
            AI 분석 중… ({analyze.job?.status ?? 'queued'}) — 10~120초 걸릴 수
            있습니다.
          </StatusBanner>
          <Spinner centered />
          <Button variant="secondary" fullWidth onClick={handleResetAnalyze}>
            분석 취소
          </Button>
        </>
      ) : null}

      {!analyze.isPolling && step === 'upload' ? (
        <SongUploadPage
          disabled={analyze.start.isPending}
          onSubmit={handleAnalyze}
        />
      ) : null}

      {!analyze.isPolling && step === 'edit' ? (
        <SongSectionsEditor
          sections={sections}
          warnings={warnings}
          disabled={actionsDisabled}
          onChange={setSections}
          onConfirm={() => setStep('build')}
          onBack={handleResetAnalyze}
        />
      ) : null}

      {!analyze.isPolling && step === 'build' ? (
        <SongBuildResult
          buildMode={buildMode}
          onBuildModeChange={setBuildMode}
          buildResult={build.data}
          buildPending={build.isPending}
          buildError={build.error}
          triggerPending={trigger.isPending}
          triggerDisabled={!agentReady || !build.data?.ok}
          pendingIndex={pendingIndex}
          activeIndex={activeIndex}
          statusMessage={statusMessage}
          onBuild={handleBuild}
          onTrigger={handleTrigger}
          onBack={() => setStep('edit')}
        />
      ) : null}
    </Card>
  );
}
