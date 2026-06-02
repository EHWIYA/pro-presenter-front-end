import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import type { SongAnalyzeRequest, SongBuildMode, SongSection } from '@/api';
import { fetchSong } from '@/api';
import {
  useBuildSong,
  useSongAnalyze,
  useTriggerSlide,
  useUpdateSongSections,
  useVenueProbe,
  useVenueStatuses,
} from '@/hooks';
import { getSelectedVenueId } from '@/lib/session';
import { SongBuildResult } from './SongBuildResult';
import { SongCandidatesList } from './SongCandidatesList';
import { SongLibraryPanel } from './SongLibraryPanel';
import { SongSectionsEditor } from './SongSectionsEditor';
import { SongUploadPage, type SongUploadPayload } from './SongUploadPage';
import styles from './SongPage.module.css';

type MainTab = 'library' | 'upload';
type SongStep = 'input' | 'candidates' | 'edit' | 'build';

export function SongPage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const statuses = useVenueStatuses();
  const analyze = useSongAnalyze();
  const build = useBuildSong();
  const trigger = useTriggerSlide(venueId);
  const saveSections = useUpdateSongSections();

  const [mainTab, setMainTab] = useState<MainTab>('upload');
  const [step, setStep] = useState<SongStep>('input');
  const [songId, setSongId] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [sections, setSections] = useState<SongSection[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fromLibrary, setFromLibrary] = useState(false);
  const [buildMode, setBuildMode] = useState<SongBuildMode>('append');
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastUploadPayload, setLastUploadPayload] =
    useState<SongUploadPayload | null>(null);
  const [reanalyzeConfirmOpen, setReanalyzeConfirmOpen] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false);

  const venueStatus = venueId
    ? statuses.data?.find((status) => status.venue_id === venueId)
    : undefined;
  const connected = venueStatus?.connected === true;
  const connectedChecked = statuses.isSuccess || statuses.isError;
  const agentReady = probe.data?.agent_reachable === true;
  const agentChecked = probe.isSuccess || probe.isError;
  const operationalReady = connected && agentReady;
  const actionsDisabled =
    !operationalReady ||
    build.isPending ||
    analyze.isPolling ||
    analyze.start.isPending ||
    loadingSong;

  const loadSongDetail = useCallback(async (id: string) => {
    setLoadingSong(true);
    setSaveMessage(null);
    try {
      const detail = await fetchSong(id);
      setSongId(detail.songId);
      setSongTitle(detail.title);
      setSections(detail.sections);
      setWarnings([]);
      setFromLibrary(true);
      setStep('edit');
      build.reset();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : '곡을 불러오지 못했습니다.',
      );
    } finally {
      setLoadingSong(false);
    }
  }, [build]);

  useEffect(() => {
    if (analyze.libraryHit) {
      setSongId(analyze.libraryHit.songId);
      setSongTitle(analyze.libraryHit.title);
      setSections(analyze.libraryHit.sections);
      setWarnings([]);
      setFromLibrary(true);
      setStep('edit');
    }
  }, [analyze.libraryHit]);

  useEffect(() => {
    if (analyze.candidates) {
      setStep('candidates');
    }
  }, [analyze.candidates]);

  useEffect(() => {
    if (analyze.job?.status === 'finished' && analyze.job.parsed) {
      setSongTitle(analyze.job.parsed.song_title);
      setSections(analyze.job.parsed.sections);
      setWarnings(analyze.job.parsed.warnings ?? []);
      if (analyze.job.songId) {
        setSongId(analyze.job.songId);
      }
      setFromLibrary(Boolean(analyze.job.songId));
      setStep('edit');
    }
  }, [analyze.job]);

  function handleAnalyze(payload: SongUploadPayload) {
    if (analyze.isPolling || analyze.start.isPending) return;
    setLastUploadPayload(payload);
    setSongTitle(payload.songTitle);
    setSections([]);
    setWarnings([]);
    setSongId(null);
    setFromLibrary(false);
    setSaveMessage(null);
    build.reset();
    setStep('input');
    setStatusMessage(null);

    const body: SongAnalyzeRequest = {
      ...payload,
      saveToLibrary: true,
      librarySongId: songId,
    };
    analyze.start.mutate(body);
  }

  function handleForceReanalyze() {
    if (!lastUploadPayload) return;
    setReanalyzeConfirmOpen(false);
    analyze.reset();
    analyze.start.mutate({
      ...lastUploadPayload,
      forceReanalyze: true,
      saveToLibrary: true,
      librarySongId: songId,
    });
  }

  function handleSaveSections() {
    if (!songId || saveSections.isPending) return;
    setSaveMessage(null);
    saveSections.mutate(
      { songId, sections },
      {
        onSuccess: () => setSaveMessage('라이브러리에 저장했습니다.'),
        onError: (err) => setSaveMessage(err.message),
      },
    );
  }

  function handleBuild() {
    if (!venueId || build.isPending || !operationalReady) return;
    if (buildMode === 'replace') {
      const ok = window.confirm(
        'worship-2 프레젠테이션 전체를 교체합니다. 계속할까요?',
      );
      if (!ok) return;
    }

    if (songId) {
      build.mutate({ venueId, songId, buildMode });
      return;
    }

    build.mutate({
      venueId,
      songTitle,
      buildMode,
      sections,
    });
  }

  function handleTrigger(index: number) {
    if (!venueId || trigger.isPending || !operationalReady) return;
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

  function handleResetFlow() {
    analyze.reset();
    build.reset();
    setStep('input');
    setSongId(null);
    setSections([]);
    setWarnings([]);
    setFromLibrary(false);
    setSaveMessage(null);
    setStatusMessage(null);
    setActiveIndex(null);
    setPendingIndex(null);
    setLastUploadPayload(null);
  }

  if (!venueId) {
    return (
      <Card title="찬양">
        <StatusBanner tone="warning">먼저 연결 탭에서 PC를 연결하세요.</StatusBanner>
        <Button fullWidth onClick={() => navigate('/')}>
          PC 연결
        </Button>
      </Card>
    );
  }

  const subtitle =
    step === 'input' && mainTab === 'library'
      ? '저장된 곡을 검색·선택하세요.'
      : step === 'input'
        ? '곡 제목과 가사·악보를 입력한 뒤 분석하세요.'
        : step === 'candidates'
          ? '라이브러리 후보 중 곡을 선택하세요.'
          : step === 'edit'
            ? '구간을 검수·편집한 뒤 빌드하세요.'
            : 'PP 빌드 후 슬라이드를 탭해 송출하세요.';

  const showMainTabs = step === 'input' && !analyze.isPolling;

  return (
    <Card title="찬양" subtitle={subtitle}>
      {connectedChecked && !connected ? (
        <StatusBanner tone="warning">
          ProPresenter 연결이 끊겨 있습니다. 빌드·송출이 비활성화됩니다.
          {venueStatus?.message ? ` ${venueStatus.message}` : ''}
        </StatusBanner>
      ) : null}

      {connected && agentChecked && !agentReady ? (
        <StatusBanner tone="warning">
          에이전트 상태 문제로 빌드·송출이 비활성화됩니다.
          {probe.data?.agent_message ?? probe.data?.message
            ? ` ${probe.data?.agent_message ?? probe.data?.message}`
            : ''}
        </StatusBanner>
      ) : null}

      {showMainTabs ? (
        <div className={styles.mainTabs} role="tablist" aria-label="찬양 모드">
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === 'library'}
            className={[
              styles.mainTab,
              mainTab === 'library' ? styles.mainTabActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setMainTab('library')}
          >
            곡 라이브러리
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === 'upload'}
            className={[
              styles.mainTab,
              mainTab === 'upload' ? styles.mainTabActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setMainTab('upload')}
          >
            신규·악보
          </button>
        </div>
      ) : null}

      {analyze.job?.status === 'error' ? (
        <StatusBanner tone="error">
          분석 실패
          {analyze.job.errorCode ? ` (${analyze.job.errorCode})` : ''}:{' '}
          {analyze.job.error ?? '알 수 없는 오류'}
        </StatusBanner>
      ) : null}

      {analyze.pollTimedOut ? (
        <StatusBanner tone="error">
          분석 시간이 초과되었습니다(120초). 다시 시도하세요.
        </StatusBanner>
      ) : null}

      {analyze.jobError && analyze.job?.status !== 'error' ? (
        <StatusBanner tone="error">{analyze.jobError.message}</StatusBanner>
      ) : null}

      {fromLibrary && step === 'edit' && analyze.libraryHit ? (
        <StatusBanner tone="success">
          저장된 가사를 불러왔습니다 (AI 분석 생략).
        </StatusBanner>
      ) : null}

      {analyze.isPolling ? (
        <>
          <StatusBanner tone="info">
            AI 분석 중… ({analyze.job?.status ?? 'queued'}) — 2~120초 걸릴 수
            있습니다.
          </StatusBanner>
          <Spinner centered />
          <Button variant="secondary" fullWidth onClick={handleResetFlow}>
            분석 취소
          </Button>
        </>
      ) : null}

      {loadingSong ? <Spinner centered /> : null}

      {!analyze.isPolling && !loadingSong && step === 'input' && mainTab === 'library' ? (
        <SongLibraryPanel
          disabled={actionsDisabled}
          onSelect={(id) => void loadSongDetail(id)}
        />
      ) : null}

      {!analyze.isPolling && !loadingSong && step === 'input' && mainTab === 'upload' ? (
        <SongUploadPage
          disabled={analyze.start.isPending}
          onSubmit={handleAnalyze}
        />
      ) : null}

      {!analyze.isPolling && !loadingSong && step === 'candidates' && analyze.candidates ? (
        <SongCandidatesList
          data={analyze.candidates}
          disabled={actionsDisabled}
          onSelect={(id) => void loadSongDetail(id)}
          onBack={handleResetFlow}
        />
      ) : null}

      {!analyze.isPolling && !loadingSong && step === 'edit' ? (
        <>
          {fromLibrary && lastUploadPayload ? (
            <Button
              variant="secondary"
              fullWidth
              disabled={actionsDisabled}
              onClick={() => setReanalyzeConfirmOpen(true)}
            >
              AI 재분석
            </Button>
          ) : null}
          <SongSectionsEditor
            sections={sections}
            warnings={warnings}
            disabled={actionsDisabled}
            canSave={Boolean(songId)}
            savePending={saveSections.isPending}
            saveMessage={saveMessage}
            onChange={setSections}
            onSave={handleSaveSections}
            onConfirm={() => setStep('build')}
            onBack={handleResetFlow}
          />
        </>
      ) : null}

      {!analyze.isPolling && !loadingSong && step === 'build' ? (
        <SongBuildResult
          buildMode={buildMode}
          onBuildModeChange={setBuildMode}
          buildResult={build.data}
          buildPending={build.isPending}
          buildError={build.error}
          triggerPending={trigger.isPending}
          triggerDisabled={!operationalReady || !build.data?.ok}
          pendingIndex={pendingIndex}
          activeIndex={activeIndex}
          statusMessage={statusMessage}
          onBuild={handleBuild}
          onTrigger={handleTrigger}
          onBack={() => setStep('edit')}
        />
      ) : null}

      {reanalyzeConfirmOpen ? (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reanalyze-title"
        >
          <div className={styles.modal}>
            <h2 id="reanalyze-title" className={styles.modalTitle}>
              AI 재분석
            </h2>
            <p className={styles.modalText}>
              DB에 저장된 가사를 무시하고 LLM으로 다시 분석합니다. 계속할까요?
            </p>
            <div className={styles.modalActions}>
              <Button fullWidth onClick={handleForceReanalyze}>
                재분석 시작
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setReanalyzeConfirmOpen(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
