import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Spinner, StatusBanner } from '@/components';
import type {
  SongAnalyzeRequest,
  SongBuildMode,
  SongCategory,
  SongSection,
} from '@/api';
import { fetchLibrarySongSections, fetchSong } from '@/api';
import {
  useBuildSong,
  useSongAnalyze,
  useTriggerSlide,
  useInternalStepBack,
  useRequireVenue,
  useTabReselect,
  useVenueProbe,
  useVenueStatuses,
} from '@/hooks';
import { TAB_PATHS } from '@/lib/tabRoutes';
import { inferLibraryCategory } from '@/lib/libraryCategory';
import { allSectionsValid } from '@/features/song/SongSectionsEditor';
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

type SongStep = 'input' | 'analyzing' | 'candidates' | 'detail' | 'edit' | 'build';
type DetailReturnStep = 'input' | 'candidates';

export function SongPage() {
  const queryClient = useQueryClient();
  const venueId = useRequireVenue();
  const probe = useVenueProbe(venueId, Boolean(venueId));
  const statuses = useVenueStatuses();
  const analyze = useSongAnalyze();
  const build = useBuildSong();
  const trigger = useTriggerSlide(venueId);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDraftSession, setIsDraftSession] = useState(false);
  const [step, setStep] = useState<SongStep>('input');
  const [songId, setSongId] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songCategory, setSongCategory] = useState<SongCategory>('praise');
  const [songArtist, setSongArtist] = useState<string | null>(null);
  const [libraryCategory, setLibraryCategory] = useState('');
  const [presentationFilename, setPresentationFilename] = useState('');
  const [sections, setSections] = useState<SongSection[]>([]);
  const [sectionsHint, setSectionsHint] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fromLibrary, setFromLibrary] = useState(false);
  const [buildMode, setBuildMode] = useState<SongBuildMode>('replace');
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastUploadPayload, setLastUploadPayload] =
    useState<SongUploadPayload | null>(null);
  const [reanalyzeConfirmOpen, setReanalyzeConfirmOpen] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false);
  const [detailReturnStep, setDetailReturnStep] =
    useState<DetailReturnStep>('input');

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['songs'] });
  }, [queryClient]);

  const venueStatus = venueId
    ? statuses.data?.find((status) => status.venue_id === venueId)
    : undefined;
  const connected = venueStatus?.connected === true;
  const connectedChecked = statuses.isSuccess || statuses.isError;
  const agentReady = probe.data?.agent_reachable === true;
  const agentChecked = probe.isSuccess || probe.isError;
  const operationalReady = connected && agentReady;
  const isAnalyzing = analyze.start.isPending || analyze.isPolling;

  const actionsDisabled =
    !operationalReady ||
    build.isPending ||
    isAnalyzing ||
    loadingSong;

  const loadSongDetail = useCallback(
    async (id: string, returnStep: DetailReturnStep) => {
      if (!venueId) return;
      setLoadingSong(true);
      setSaveMessage(null);
      setStatusMessage(null);
      setLoadError(null);
      try {
        const detail = await fetchSong(id, { venueId });
        let nextSections = detail.sections;
        let hint = detail.sectionsHint ?? null;

        if (nextSections.length === 0) {
          try {
            const lib = await fetchLibrarySongSections(venueId, id);
            nextSections = lib.sections;
            hint = null;
          } catch {
            // 상세 sectionsHint 유지
          }
        }

        setSongId(detail.songId);
        setSongTitle(detail.title);
        setSongCategory(detail.category);
        setSongArtist(detail.artist);
        setLibraryCategory(detail.libraryCategory);
        setPresentationFilename(detail.presentationFilename);
        setSections(nextSections);
        setSectionsHint(hint);
        setWarnings([]);
        setFromLibrary(true);
        setIsDraftSession(false);
        setDetailReturnStep(returnStep);
        setStep('detail');
        build.reset();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '곡을 불러오지 못했습니다.';
        setLoadError(message);
      } finally {
        setLoadingSong(false);
      }
    },
    [build, venueId],
  );

  useEffect(() => {
    if (!analyze.libraryHit || !venueId) return;
    void loadSongDetail(analyze.libraryHit.songId, 'input');
  }, [analyze.libraryHit, loadSongDetail, venueId]);

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
      setSongId(null);
      setSongCategory('praise');
      setLibraryCategory('');
      setPresentationFilename('');
      setSectionsHint(null);
      setStep('edit');
      return;
    }
    if (
      analyze.job?.status === 'error' ||
      analyze.pollTimedOut ||
      (analyze.jobError && !analyze.start.isPending)
    ) {
      setStep('input');
      setUploadModalOpen(true);
    }
  }, [
    analyze.job,
    analyze.jobError,
    analyze.pollTimedOut,
    analyze.start.isPending,
    step,
  ]);

  function handleAnalyze(payload: SongUploadPayload) {
    if (isAnalyzing || !venueId) return;

    setLastUploadPayload(payload);
    setSongArtist(null);
    setSections([]);
    setWarnings([]);
    setSongId(null);
    setFromLibrary(false);
    setIsDraftSession(true);
    setSaveMessage(null);
    setSectionsHint(null);
    build.reset();
    setStep('analyzing');
    setStatusMessage(null);

    const body: SongAnalyzeRequest = {
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
      venueId,
    };
    analyze.start.mutate(body);
  }

  function handleForceReanalyze() {
    if (!lastUploadPayload || !venueId) return;
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
      librarySongId: songId ?? undefined,
      venueId,
    });
  }

  function handleProceedToBuild() {
    const title = songTitle.trim();
    if (!title) {
      setSaveMessage('곡 제목을 입력하세요.');
      return;
    }
    if (!allSectionsValid(sections)) {
      setSaveMessage('모든 구간에 1~2줄 가사를 넣어 주세요.');
      return;
    }

    setSaveMessage(null);
    setStatusMessage(null);
    setUploadModalOpen(false);
    setLastUploadPayload(null);
    build.reset();
    setActiveIndex(null);
    setPendingIndex(null);
    setStep('build');
  }

  function handleStartBuildFromLibrary() {
    setStatusMessage(null);
    setSaveMessage(null);
    build.reset();
    setActiveIndex(null);
    setPendingIndex(null);
    setStep('build');
  }

  function handleBuild() {
    if (!venueId || build.isPending || !operationalReady) return;

    const title = songTitle.trim();
    const libraryCategoryOverride = inferLibraryCategory(songCategory, title);

    if (isDraftSession || !songId) {
      if (!title || !allSectionsValid(sections)) {
        setStatusMessage('검수 화면에서 제목·구간을 확인하세요.');
        return;
      }
      if (buildMode === 'replace') {
        const ok = window.confirm(
          'Libraries 폴더의 .pro 슬라이드를 새로 만듭니다. 계속할까요?',
        );
        if (!ok) return;
      }
      build.mutate({
        venueId,
        buildMode,
        songTitle: title,
        sections,
        ...(libraryCategoryOverride ? { libraryCategory: libraryCategoryOverride } : {}),
      });
      return;
    }

    if (buildMode === 'replace') {
      const ok = window.confirm(
        'Libraries 폴더의 .pro 슬라이드를 새로 만듭니다. 계속할까요?',
      );
      if (!ok) return;
    }

    build.mutate({
      venueId,
      buildMode,
      songId,
      ...(libraryCategoryOverride ? { libraryCategory: libraryCategoryOverride } : {}),
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
    setSectionsHint(null);
    setWarnings([]);
    setFromLibrary(false);
    setIsDraftSession(false);
    setSaveMessage(null);
    setStatusMessage(null);
    setActiveIndex(null);
    setPendingIndex(null);
    setLastUploadPayload(null);
    setSongTitle('');
    setSongCategory('praise');
    setSongArtist(null);
    setLibraryCategory('');
    setPresentationFilename('');
    setUploadModalOpen(false);
  }

  const stepRef = useRef(step);
  const detailReturnStepRef = useRef(detailReturnStep);
  const isDraftSessionRef = useRef(isDraftSession);

  stepRef.current = step;
  detailReturnStepRef.current = detailReturnStep;
  isDraftSessionRef.current = isDraftSession;

  const handleInternalBack = useCallback(() => {
    const current = stepRef.current;

    switch (current) {
      case 'build':
        setStep(isDraftSessionRef.current ? 'edit' : 'detail');
        break;
      case 'detail':
        setStep(detailReturnStepRef.current);
        break;
      case 'edit':
        handleResetFlow();
        break;
      case 'candidates':
        analyze.reset();
        setStep('input');
        break;
      case 'analyzing':
        handleResetFlow();
        break;
      default:
        break;
    }
  }, [analyze]);

  const { collapseInternalHistory, syncHistoryBack } = useInternalStepBack({
    isAtRoot: step === 'input',
    onBack: handleInternalBack,
  });

  useTabReselect(TAB_PATHS.song, handleResetFlow, {
    beforeNavigate: collapseInternalHistory,
  });

  function handleDetailBack() {
    setSaveMessage(null);
    setStatusMessage(null);
    if (syncHistoryBack()) return;
    setStep(detailReturnStep);
  }

  function handleEditBack() {
    const ok = window.confirm(
      '검수를 취소하면 분석 결과가 사라집니다. 계속할까요?',
    );
    if (!ok) return;
    if (syncHistoryBack()) return;
    handleResetFlow();
  }

  function handleUploadSubmit(payload: SongUploadPayload) {
    setUploadModalOpen(false);
    handleAnalyze(payload);
  }

  if (!venueId) return null;

  const showDraftFlow =
    step === 'analyzing' || (step === 'edit' && isDraftSession);

  const draftFlowStep: DraftFlowStep =
    step === 'analyzing' ? 'analyzing' : 'edit';

  const isLibraryHome = step === 'input';

  const canShowBuild =
    step === 'build' &&
    (Boolean(songId) || (isDraftSession && sections.length > 0));

  const subtitle = isLibraryHome
    ? '제목·아티스트로 검색하거나 장르를 골라 곡을 찾으세요.'
    : step === 'analyzing'
      ? '올린 악보를 분석하고 있습니다. 완료되면 검수 화면으로 이어집니다.'
      : step === 'candidates'
        ? '라이브러리 후보 중 곡을 선택하세요.'
        : step === 'detail'
          ? '카탈로그 곡입니다. PP 빌드·송출을 진행하세요.'
          : step === 'edit'
            ? '제목·장르·구간을 검수한 뒤 PP 빌드를 진행하세요.'
            : step === 'build'
              ? `${songTitle || '곡'} — PP 빌드 후 슬라이드를 탭해 송출하세요.`
              : '';

  return (
    <>
    <Card
      title={isLibraryHome ? undefined : '찬양'}
      subtitle={isLibraryHome ? undefined : subtitle}
      className={isLibraryHome ? styles.libraryCard : undefined}
    >
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

      {step === 'edit' &&
      isDraftSession &&
      analyze.job?.status === 'finished' ? (
        <StatusBanner tone="info">
          라이브러리는 pro-presenter-data에서 관리합니다. 검수 후 PP 빌드를
          진행하고, 영구 반영은 data repo에 commit하세요.
        </StatusBanner>
      ) : null}

      {fromLibrary && step === 'detail' && analyze.libraryHit ? (
        <StatusBanner tone="success">
          저장된 가사를 불러왔습니다 (AI 분석 생략).
        </StatusBanner>
      ) : null}

      {loadingSong ? <Spinner centered /> : null}

      {loadError && (isLibraryHome || step === 'candidates') ? (
        <StatusBanner tone="error">{loadError}</StatusBanner>
      ) : null}

      {!isAnalyzing && !loadingSong && isLibraryHome ? (
        <SongLibraryPanel
          disabled={actionsDisabled}
          onSelect={(id) => void loadSongDetail(id, 'input')}
        />
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
        <StatusBanner tone="info">{statusMessage}</StatusBanner>
      ) : null}

      {!loadingSong && step === 'detail' ? (
        <SongDetailView
          title={songTitle}
          category={songCategory}
          artist={songArtist}
          libraryCategory={libraryCategory}
          presentationFilename={presentationFilename}
          sections={sections ?? []}
          sectionsHint={sectionsHint}
          disabled={actionsDisabled}
          buildDisabled={!operationalReady}
          backLabel={
            detailReturnStep === 'candidates' ? '후보 목록으로' : '목록으로'
          }
          onBuild={handleStartBuildFromLibrary}
          onBack={() => {
            setStatusMessage(null);
            handleDetailBack();
          }}
        />
      ) : null}

      {!loadingSong && step === 'edit' && isDraftSession ? (
        <>
          <SongReviewHeader
            songTitle={songTitle}
            category={songCategory}
            sectionCount={sections.length}
            validSectionCount={countValidSections(sections)}
            isDraft={isDraftSession}
            disabled={actionsDisabled}
            onTitleChange={setSongTitle}
            onCategoryChange={setSongCategory}
            onReanalyze={
              lastUploadPayload && songTitle.trim()
                ? () => setReanalyzeConfirmOpen(true)
                : undefined
            }
          />
          <SongSectionsEditor
            sections={sections}
            warnings={warnings}
            disabled={actionsDisabled}
            canSave
            saveMessage={saveMessage}
            saveLabel="PP 빌드 진행"
            onChange={setSections}
            onSave={handleProceedToBuild}
            savePrimary
            onBack={handleEditBack}
            backLabel="분석 취소"
          />
        </>
      ) : null}

      {!loadingSong && canShowBuild ? (
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
            setStep(isDraftSession ? 'edit' : 'detail');
          }}
        />
      ) : null}

    </Card>

      {isLibraryHome && !uploadModalOpen ? (
        <button
          type="button"
          className={styles.fab}
          aria-label="신규 악보 추가"
          disabled={isAnalyzing}
          onClick={() => setUploadModalOpen(true)}
        >
          <span className={styles.fabIcon} aria-hidden>
            +
          </span>
        </button>
      ) : null}

      {uploadModalOpen && isLibraryHome ? (
        <div
          className={styles.uploadModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setUploadModalOpen(false);
            }
          }}
        >
          <div className={styles.uploadModal}>
            <header className={styles.uploadModalHeader}>
              <h2 id="upload-modal-title" className={styles.uploadModalTitle}>
                신규 악보
              </h2>
              <button
                type="button"
                className={styles.uploadModalClose}
                aria-label="닫기"
                onClick={() => setUploadModalOpen(false)}
              >
                ✕
              </button>
            </header>
            <div className={styles.uploadModalBody}>
              <SongDraftFlowSteps current="upload" />
              <SongUploadPage
                variant="modal"
                disabled={isAnalyzing}
                onSubmit={handleUploadSubmit}
              />
            </div>
          </div>
        </div>
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
              악보 이미지로 AI 분석을 다시 실행합니다. 라이브러리에는 자동
              저장되지 않습니다. 계속할까요?
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
    </>
  );
}
