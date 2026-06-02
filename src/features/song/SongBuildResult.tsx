import type { SongBuildMode, SongBuildResponse } from '@/api';
import { Button, SlideGrid, Spinner, StatusBanner } from '@/components';
import styles from './SongBuildResult.module.css';

interface SongBuildResultProps {
  buildMode: SongBuildMode;
  onBuildModeChange: (mode: SongBuildMode) => void;
  buildResult: SongBuildResponse | undefined;
  buildPending: boolean;
  buildError: Error | null;
  triggerPending: boolean;
  triggerDisabled: boolean;
  pendingIndex: number | null;
  activeIndex: number | null;
  statusMessage: string | null;
  onBuild: () => void;
  onTrigger: (index: number) => void;
  onBack: () => void;
}

export function SongBuildResult({
  buildMode,
  onBuildModeChange,
  buildResult,
  buildPending,
  buildError,
  triggerPending,
  triggerDisabled,
  pendingIndex,
  activeIndex,
  statusMessage,
  onBuild,
  onTrigger,
  onBack,
}: SongBuildResultProps) {
  const slideMap = buildResult?.slide_map;

  return (
    <div className={styles.root}>
      <fieldset className={styles.modeFieldset} disabled={buildPending}>
        <legend className={styles.legend}>빌드 모드</legend>
        <label className={styles.radio}>
          <input
            type="radio"
            name="buildMode"
            checked={buildMode === 'append'}
            onChange={() => onBuildModeChange('append')}
          />
          append — 기존 슬라이드 뒤에 추가
        </label>
        <label className={styles.radio}>
          <input
            type="radio"
            name="buildMode"
            checked={buildMode === 'replace'}
            onChange={() => onBuildModeChange('replace')}
          />
          replace — worship-2 전체 교체
        </label>
      </fieldset>

      {buildMode === 'replace' ? (
        <StatusBanner tone="warning">
          replace는 worship-2 프레젠테이션 전체를 교체합니다. 첫 예배 세팅 때만
          사용하세요.
        </StatusBanner>
      ) : null}

      <Button fullWidth disabled={buildPending} onClick={onBuild}>
        {buildPending ? 'PP 빌드 중…' : 'ProPresenter 빌드'}
      </Button>

      {buildPending ? <Spinner centered /> : null}
      {buildError ? (
        <StatusBanner tone="error">{buildError.message}</StatusBanner>
      ) : null}

      {buildResult?.ok && slideMap && slideMap.length > 0 ? (
        <>
          <StatusBanner tone="success">
            {buildResult.song_title} · 슬라이드 {buildResult.total_slide_count}개 ·{' '}
            {buildResult.groups.length}개 그룹
          </StatusBanner>
          <SlideGrid
            slides={slideMap}
            onTrigger={onTrigger}
            disabled={triggerDisabled || triggerPending}
            pendingIndex={pendingIndex}
            activeIndex={activeIndex}
          />
        </>
      ) : null}

      {statusMessage ? (
        <StatusBanner tone="info">{statusMessage}</StatusBanner>
      ) : null}

      <Button variant="secondary" fullWidth disabled={buildPending} onClick={onBack}>
        구간 편집으로
      </Button>
    </div>
  );
}
