import { Button } from '@/components';
import styles from './SongReviewHeader.module.css';

interface SongReviewHeaderProps {
  songTitle: string;
  sectionCount: number;
  validSectionCount: number;
  isDraft: boolean;
  disabled?: boolean;
  onTitleChange: (title: string) => void;
  onReanalyze?: () => void;
}

export function SongReviewHeader({
  songTitle,
  sectionCount,
  validSectionCount,
  isDraft,
  disabled = false,
  onTitleChange,
  onReanalyze,
}: SongReviewHeaderProps) {
  const allValid = sectionCount > 0 && validSectionCount === sectionCount;

  return (
    <header className={styles.root}>
      <div className={styles.topRow}>
        <span
          className={[
            styles.statusPill,
            isDraft ? styles.statusDraft : styles.statusSaved,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isDraft ? '미저장 초안' : '라이브러리'}
        </span>
        <span
          className={[
            styles.validPill,
            allValid ? styles.validOk : styles.validWarn,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {validSectionCount}/{sectionCount} 구간 준비
        </span>
      </div>

      <label className={styles.titleWrap} htmlFor="song-edit-title">
        <span className={styles.titleLabel}>곡 제목</span>
        <input
          id="song-edit-title"
          className={styles.titleInput}
          value={songTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="AI가 추출한 제목"
          disabled={disabled}
        />
      </label>

      {isDraft ? (
        <p className={styles.draftNote}>
          저장·빌드 전에 나가면 분석 결과가 사라집니다.
        </p>
      ) : null}

      {onReanalyze ? (
        <Button
          variant="secondary"
          fullWidth
          disabled={disabled}
          onClick={onReanalyze}
        >
          AI 재분석
        </Button>
      ) : null}
    </header>
  );
}
