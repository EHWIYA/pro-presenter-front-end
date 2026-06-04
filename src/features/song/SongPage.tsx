import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import type { SongAnalyzeRequest, SongBuildMode, SongSection } from '@/api';
import { fetchSong } from '@/api';
import {
  useBuildSong,
  useCreateSong,
  useSongAnalyze,
  useTriggerSlide,
  useUpdateSongSections,
  useVenueProbe,
  useVenueStatuses,
} from '@/hooks';
import { getSelectedVenueId } from '@/lib/session';
import { SongBuildResult } from './SongBuildResult';
import { SongCandidatesList } from './SongCandidatesList';
import { SongDetailView } from './SongDetailView';
import { SongLibraryPanel } from './SongLibraryPanel';
import { SongAnalyzingPanel } from './SongAnalyzingPanel';
import { SongDraftFlowSteps, type DraftFlowStep } from './SongDraftFlowSteps';
import { SongReviewHeader } from './SongReviewHeader';
import { countValidSections, SongSectionsEditor } from './SongSectionsEditor';
import { SongUploadPage, type SongUploadPayload } from './SongUploadPage';
import styles from './SongPage.module.css';

type MainTab = 'library' | 'upload';
type SongStep = 'input' | 'analyzing' | 'candidates' | 'detail' | 'edit' | 'build';
type DetailReturnStep = 'input' | 'candidates';

export function SongPage() {
  const navigate = useNavigate();
  const venueId = getSelectedVenueId();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const statuses = useVenueStatuses();
  const analyze = useSongAnalyze();
  const build = useBuildSong();
  const trigger = useTriggerSlide(venueId);
  const saveSections = useUpdateSongSections();
  const createSongMutation = useCreateSong();

  const [mainTab, setMainTab] = useState<MainTab>('upload');
  const [isDraftSession, setIsDraftSession] = useState(false);
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
  const [detailReturnStep, setDetailReturnStep] =
    useState<DetailReturnStep>('input');

  const venueStatus = venueId
    ? statuses.data?.find((status) => status.venue_id === venueId)
    : undefined;
  const connected = venueStatus?.connected === true;
  const connectedChecked = statuses.isSuccess || statuses.isError;
  const agentReady = probe.data?.agent_reachable === true;
  const agentChecked = probe.isSuccess || probe.isError;
  const operationalReady = connected && agentReady;
  const isAnalyzing = analyze.start.isPending || analyze.isPolling;

  const savePending = saveSections.isPending || createSongMutation.isPending;

  const actionsDisabled =
    !operationalReady ||
    build.isPending ||
    isAnalyzing ||
    loadingSong ||
    savePending;

  const loadSongDetail = useCallback(
    async (id: string, returnStep: DetailReturnStep) => {
      setLoadingSong(true);
      setSaveMessage(null);
      setStatusMessage(null);
      try {
        const detail = await fetchSong(id);
        setSongId(detail.songId);
        setSongTitle(detail.title);
        setSections(detail.sections);
        setWarnings([]);
        setFromLibrary(true);
        setIsDraftSession(false);
        setDetailReturnStep(returnStep);
        setStep('detail');
        build.reset();
      } catch (err) {
        setStatusMessage(
          err instanceof Error ? err.message : '곡을 불러오지 못했습니다.',
        );
      } finally {
        setLoadingSong(false);
      }
    },
    [build],
  );

  useEffect(() => {
    if (analyze.libraryHit) {
      setSongId(analyze.libraryHit.songId);
      setSongTitle(analyze.libraryHit.title);
      setSections(analyze.libraryHit.sections);
      setWarnings([]);
      setFromLibrary(true);
      setIsDraftSession(false);
      setDetailReturnStep('input');
      setStep('detail');
    }
  }, [analyze.libraryHit]);

  useEffect(() => {
    if (analyze.candidates) {
      setStep('candidates');
    }
  }, [analyze.candidates]);

  useEffect(() => {
    if (step !== 'analyzing') {
      return;
    }
    if (analyze.job?.status === 'finished' && analyze.job.parsed) {
      setSongTitle(analyze.job.parsed.song_title);
      setSections(analyze.job.parsed.sections);
      setWarnings(analyze.job.parsed.warnings ?? []);
      if (analyze.job.songId) {
        setSongId(analyze.job.songId);
      }
      setStep('edit');
      return;
    }
    if (
      analyze.job?.status === 'error' ||
      analyze.pollTimedOut ||
      (analyze.jobError && !analyze.start.isPending)
    ) {
      setStep('input');
      setMainTab('upload');
    }
  }, [
    analyze.job,
    analyze.jobError,
    analyze.pollTimedOut,
    analyze.start.isPending,
    step,
  ]);

  function handleAnalyze(payload: SongUploadPayload) {
    if (isAnalyzing) return;

    setLastUploadPayload(payload);
    setSections([]);
    setWarnings([]);
    setSongId(null);
    setFromLibrary(false);
    setIsDraftSession(true);
    setSaveMessage(null);
    build.reset();
    setStep('analyzing');
    setStatusMessage(null);

    const body: SongAnalyzeRequest = {
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
      saveToLibrary: true,
    };
    analyze.start.mutate(body);
  }

  function handleForceReanalyze() {
    if (!lastUploadPayload) return;
    const title = songTitle.trim();
    if (!title) {
      setSaveMessage('곡 제목을 입력한 뒤 분석해 주세요.');
      setReanalyzeConfirmOpen(false);
      return;
    }
    setReanalyzeConfirmOpen(false);
    setIsDraftSession(true);
    setSaveMessage(null);
    setStep('analyzing');
    analyze.reset();
    analyze.start.mutate({
      songTitle: title,
      imageBase64: lastUploadPayload.imageBase64,
      imageMimeType: lastUploadPayload.imageMimeType,
      forceReanalyze: true,
      saveToLibrary: false,
      librarySongId: songId ?? undefined,
    });
  }

  function goToLibraryDetailAfterSave(message: string) {
    setIsDraftSession(false);
    setFromLibrary(true);
    setSaveMessage(null);
    setMainTab('library');
    setDetailReturnStep('input');
    setStep('detail');
    setStatusMessage(message);
    setLastUploadPayload(null);
    build.reset();
  }

  function handleSaveToLibrary() {
    if (savePending) return;
    const title = songTitle.trim();
    if (!title) {
      setSaveMessage('곡 제목을 입력하세요.');
      return;
    }

    setSaveMessage(null);

    if (songId) {
      saveSections.mutate(
        { songId, sections, title },
        {
          onSuccess: () => {
            if (isDraftSession) {
              goToLibraryDetailAfterSave(
                '라이브러리에 저장했습니다. 아래에서 PP 빌드·송출을 진행하세요.',
              );
            } else {
              setSaveMessage(null);
              setStep('detail');
              setStatusMessage('라이브러리에 저장했습니다.');
            }
          },
          onError: (err) => setSaveMessage(err.message),
        },
      );
      return;
    }

    createSongMutation.mutate(
      { title, sections },
      {
        onSuccess: (detail) => {
          setSongId(detail.songId);
          if (detail.title) {
            setSongTitle(detail.title);
          }
          if (Array.isArray(detail.sections)) {
            setSections(detail.sections);
          }
          goToLibraryDetailAfterSave(
            '라이브러리에 저장했습니다. 아래에서 PP 빌드·송출을 진행하세요.',
          );
        },
        onError: (err) => setSaveMessage(err.message),
      },
    );
  }

  function handleStartBuildFromLibrary() {
    if (!songId) {
      setStatusMessage('먼저 라이브러리에 곡을 저장하세요.');
      return;
    }
    setStatusMessage(null);
    setSaveMessage(null);
    build.reset();
    setActiveIndex(null);
    setPendingIndex(null);
    setStep('build');
  }

  function handleBuild() {
    if (!venueId || build.isPending || !operationalReady) return;
    if (!songId) {
      setStatusMessage('저장된 곡만 빌드할 수 있습니다. 곡 라이브러리에서 진행하세요.');
      return;
    }
    if (buildMode === 'replace') {
      const ok = window.confirm(
        'worship-2 프레젠테이션 전체를 교체합니다. 계속할까요?',
      );
      if (!ok) return;
    }

    build.mutate({ venueId, songId, buildMode });
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

  function handleDetailBack() {
    setSaveMessage(null);
    setStatusMessage(null);
    setStep(detailReturnStep);
  }

  function handleEditBack() {
    if (isDraftSession) {
      const ok = window.confirm(
        '저장하지 않은 분석 결과가 사라집니다. 계속할까요?',
      );
      if (!ok) return;
      handleResetFlow();
      return;
    }
    if (fromLibrary && songId) {
      setStep('detail');
      return;
    }
    handleResetFlow();
  }

  function handleResetFlow() {
    analyze.reset();
    build.reset();
    setStep('input');
    setSongId(null);
    setSections([]);
    setWarnings([]);
    setFromLibrary(false);
    setIsDraftSession(false);
    setSaveMessage(null);
    setStatusMessage(null);
    setActiveIndex(null);
    setPendingIndex(null);
    setLastUploadPayload(null);
    setSongTitle('');
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

  const showDraftFlow =
    mainTab === 'upload' &&
    (step === 'input' || step === 'analyzing' || step === 'edit');

  const draftFlowStep: DraftFlowStep =
    step === 'input'
      ? 'upload'
      : step === 'analyzing'
        ? 'analyzing'
        : 'edit';

  const subtitle =
    step === 'input' && mainTab === 'library'
      ? '저장된 곡을 검색·선택하세요.'
      : step === 'input'
        ? '악보 이미지를 넣고 AI 분석을 시작하세요. 제목은 분석 결과에서 확인합니다.'
        : step === 'analyzing'
          ? '올린 악보를 분석하고 있습니다. 완료되면 검수 화면으로 이어집니다.'
        : step === 'candidates'
          ? '라이브러리 후보 중 곡을 선택하세요.'
          : step === 'detail'
            ? '저장된 곡입니다. PP 빌드·송출 또는 가사 수정을 선택하세요.'
            : step === 'edit'
              ? isDraftSession
                ? '제목·구간을 검수한 뒤 라이브러리에 저장하세요. 빌드는 저장 후 라이브러리에서 진행합니다.'
                : '구간을 수정한 뒤 저장하세요. 빌드는 상세 화면에서 진행합니다.'
              : step === 'build'
                ? `${songTitle || '곡'} — PP 빌드 후 슬라이드를 탭해 송출하세요.`
                : '';

  const showMainTabs = step === 'input';

  return (
    <Card title="찬양" subtitle={subtitle}>
      {showDraftFlow ? <SongDraftFlowSteps current={draftFlowStep} /> : null}
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

      {fromLibrary && step === 'detail' && analyze.libraryHit ? (
        <StatusBanner tone="success">
          저장된 가사를 불러왔습니다 (AI 분석 생략).
        </StatusBanner>
      ) : null}

      {loadingSong ? <Spinner centered /> : null}

      {!isAnalyzing && !loadingSong && step === 'input' && mainTab === 'library' ? (
        <SongLibraryPanel
          disabled={actionsDisabled}
          onSelect={(id) => void loadSongDetail(id, 'input')}
        />
      ) : null}

      {!loadingSong && step === 'input' && mainTab === 'upload' ? (
        <SongUploadPage disabled={isAnalyzing} onSubmit={handleAnalyze} />
      ) : null}

      {step === 'analyzing' && lastUploadPayload ? (
        <SongAnalyzingPanel
          payload={lastUploadPayload}
          jobStatus={analyze.job?.status}
          startPending={analyze.start.isPending}
          onCancel={handleResetFlow}
        />
      ) : null}

      {!loadingSong && step === 'candidates' && analyze.candidates ? (
        <SongCandidatesList
          data={analyze.candidates}
          disabled={actionsDisabled}
          onSelect={(id) => void loadSongDetail(id, 'candidates')}
          onBack={handleResetFlow}
        />
      ) : null}

      {statusMessage && step === 'detail' ? (
        <StatusBanner tone="success">{statusMessage}</StatusBanner>
      ) : null}

      {!loadingSong && step === 'detail' ? (
        <SongDetailView
          title={songTitle}
          sections={sections ?? []}
          disabled={actionsDisabled}
          buildDisabled={!operationalReady || !songId}
          backLabel={
            detailReturnStep === 'candidates' ? '후보 목록으로' : '목록으로'
          }
          onBuild={handleStartBuildFromLibrary}
          onEdit={() => {
            setStatusMessage(null);
            setStep('edit');
          }}
          onBack={() => {
            setStatusMessage(null);
            handleDetailBack();
          }}
        />
      ) : null}

      {!loadingSong && step === 'edit' ? (
        <>
          <SongReviewHeader
            songTitle={songTitle}
            sectionCount={sections.length}
            validSectionCount={countValidSections(sections)}
            isDraft={isDraftSession}
            disabled={actionsDisabled}
            onTitleChange={setSongTitle}
            onReanalyze={
              isDraftSession && lastUploadPayload && songTitle.trim()
                ? () => setReanalyzeConfirmOpen(true)
                : undefined
            }
          />
          <SongSectionsEditor
            sections={sections}
            warnings={warnings}
            disabled={actionsDisabled}
            canSave={isDraftSession || Boolean(songId)}
            savePending={savePending}
            saveMessage={saveMessage}
            saveLabel={
              isDraftSession && !songId
                ? '라이브러리에 최종 저장'
                : '라이브러리에 저장'
            }
            onChange={setSections}
            onSave={handleSaveToLibrary}
            savePrimary
            onBack={handleEditBack}
            backLabel={
              isDraftSession
                ? '분석 취소'
                : fromLibrary && songId
                  ? '상세로'
                  : '입력으로'
            }
          />
        </>
      ) : null}

      {!loadingSong && step === 'build' && songId ? (
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
          onBack={() => {
            setStatusMessage(null);
            setStep('detail');
          }}
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
              악보 이미지로 AI 분석을 다시 실행합니다. 저장하기 전까지 DB에는
              반영되지 않습니다. 계속할까요?
            </p>
            <div className={styles.modalActions}>
              <Button
                fullWidth
                disabled={!songTitle.trim()}
                onClick={handleForceReanalyze}
              >
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
