import type { SongCategory } from '@/api';
import { Button } from '@/components';
import { SongCategoryBadge } from './SongCategoryBadge';
import { SongCategoryPicker } from './SongCategoryPicker';
import styles from './SongReviewHeader.module.css';

interface SongReviewHeaderProps {
  songTitle: string;
  category: SongCategory;
  sectionCount: number;
  validSectionCount: number;
  isDraft: boolean;
  disabled?: boolean;
  onTitleChange: (title: string) => void;
  onCategoryChange: (category: SongCategory) => void;
  onReanalyze?: () => void;
}

export function SongReviewHeader({
  songTitle,
  category,
  sectionCount,
  validSectionCount,
  isDraft,
  disabled = false,
  onTitleChange,
  onCategoryChange,
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
        <SongCategoryBadge category={category} size="md" />
        <span
          className={[
            styles.validPill,
            allValid ? styles.validOk : styles.validWarn,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {validSectionCount}/{sectionCount} 구간
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

      <SongCategoryPicker
        value={category}
        onChange={onCategoryChange}
        disabled={disabled}
      />

      {isDraft ? (
        <p className={styles.draftNote}>
          장르·제목·구간을 확인한 뒤 저장하세요. 저장 전에 나가면 분석 결과가
          사라집니다.
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
