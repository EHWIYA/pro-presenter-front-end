import { Button } from '@/components';
import type { SongUploadPayload } from './SongUploadPage';
import {
  ANALYZE_STEPS,
  analyzePhaseIndex,
  analyzeStatusMessage,
  resolveAnalyzePhase,
} from './songAnalyzeProgress';
import styles from './SongAnalyzingPanel.module.css';

interface SongAnalyzingPanelProps {
  payload: SongUploadPayload;
  jobStatus?: string;
  startPending: boolean;
  onCancel: () => void;
}

export function SongAnalyzingPanel({
  payload,
  jobStatus,
  startPending,
  onCancel,
}: SongAnalyzingPanelProps) {
  const phase = resolveAnalyzePhase(startPending, jobStatus);
  const activeIdx = analyzePhaseIndex(phase);

  return (
    <section
      className={styles.root}
      aria-busy="true"
      aria-labelledby="song-analyzing-title"
    >
      <img
        className={styles.preview}
        src={`data:${payload.imageMimeType};base64,${payload.imageBase64}`}
        alt="분석 중인 악보"
      />

      <div className={styles.spinnerRow}>
        <div className={styles.spinner} aria-hidden />
        <div>
          <h2 id="song-analyzing-title" className={styles.title}>
            악보 분석 중
          </h2>
          <p className={styles.message}>{analyzeStatusMessage(phase, jobStatus)}</p>
        </div>
      </div>

      <p className={styles.eta}>보통 10~120초 걸립니다. 이 화면을 유지해 주세요.</p>

      <ol className={styles.steps} aria-label="분석 진행 단계">
        {ANALYZE_STEPS.map((step, index) => {
          const done = index < activeIdx;
          const active = index === activeIdx;
          return (
            <li
              key={step.id}
              className={[
                styles.step,
                done ? styles.stepDone : '',
                active ? styles.stepActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.stepDot} aria-hidden />
              <span className={styles.stepLabel}>{step.label}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.progressTrack} aria-hidden>
        <div
          className={styles.progressBar}
          style={{ width: `${((activeIdx + 1) / ANALYZE_STEPS.length) * 100}%` }}
        />
      </div>

      <Button variant="secondary" fullWidth onClick={onCancel}>
        분석 취소
      </Button>
    </section>
  );
}
