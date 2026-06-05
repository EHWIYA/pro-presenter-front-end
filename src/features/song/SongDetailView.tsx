import type { SongCategory, SongSection, SongSectionType } from '@/api';
import { Button } from '@/components';
import { SongCategoryBadge } from './SongCategoryBadge';
import { songCategoryLabel } from './songCategoryMeta';
import styles from './SongDetailView.module.css';

const SECTION_TYPE_LABELS: Record<SongSectionType, string> = {
  intro: 'Intro',
  verse: 'Verse',
  pre_chorus: 'Pre-chorus',
  chorus: 'Chorus',
  bridge: 'Bridge',
  tag: 'Tag',
  outro: 'Outro',
  instrumental: 'Instrumental',
  unknown: 'Unknown',
};

interface SongDetailViewProps {
  title: string;
  category: SongCategory;
  artist?: string | null;
  sections: SongSection[];
  disabled?: boolean;
  buildDisabled?: boolean;
  deletePending?: boolean;
  backLabel?: string;
  onBuild: () => void;
  onEdit: () => void;
  onBack: () => void;
  onDelete?: () => void;
}

export function SongDetailView({
  title,
  category,
  artist,
  sections,
  disabled = false,
  buildDisabled = false,
  deletePending = false,
  backLabel = '목록으로',
  onBuild,
  onEdit,
  onBack,
  onDelete,
}: SongDetailViewProps) {
  const safeSections = sections ?? [];

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroMeta}>
          <SongCategoryBadge category={category} size="md" />
          <span className={styles.heroCategory}>{songCategoryLabel(category)}</span>
        </div>
        <h2 className={styles.title}>{title}</h2>
        {artist ? <p className={styles.artist}>{artist}</p> : null}
        <p className={styles.sectionSummary}>
          가사 구간 {safeSections.length}개
        </p>
      </header>

      {safeSections.length === 0 ? (
        <p className={styles.empty}>저장된 구간이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {safeSections.map((section, index) => {
            const lines = (section.lines ?? [])
              .map((l) => l.trim())
              .filter(Boolean);
            return (
              <li key={`detail-${index}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardLabel}>{section.label}</span>
                  <span className={styles.cardType}>
                    {SECTION_TYPE_LABELS[section.type] ?? section.type}
                  </span>
                </div>
                {lines.length > 0 ? (
                  <ul className={styles.lines}>
                    {lines.map((line, lineIndex) => (
                      <li key={lineIndex} className={styles.line}>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.cardEmpty}>가사 없음</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.buildHint}>
        ProPresenter 빌드·송출은 라이브러리에 저장된 곡에서 진행합니다.
      </p>
      <div className={styles.actions}>
        <Button fullWidth disabled={disabled || buildDisabled} onClick={onBuild}>
          PP 빌드 · 송출
        </Button>
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onEdit}>
          가사·구간·장르 수정
        </Button>
        {onDelete ? (
          <Button
            variant="danger"
            fullWidth
            disabled={disabled || deletePending}
            onClick={onDelete}
          >
            {deletePending ? '삭제 중…' : '라이브러리에서 삭제'}
          </Button>
        ) : null}
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
