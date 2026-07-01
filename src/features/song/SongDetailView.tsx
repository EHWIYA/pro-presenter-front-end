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
  libraryCategory?: string;
  presentationFilename?: string;
  sections: SongSection[];
  sectionsHint?: string | null;
  disabled?: boolean;
  buildDisabled?: boolean;
  backLabel?: string;
  onBuild: () => void;
  onBack: () => void;
}

export function SongDetailView({
  title,
  category,
  artist,
  libraryCategory,
  presentationFilename,
  sections,
  sectionsHint,
  disabled = false,
  buildDisabled = false,
  backLabel = '목록으로',
  onBuild,
  onBack,
}: SongDetailViewProps) {
  const safeSections = sections ?? [];

  return (
    <div className={styles.root}>
      <header className={styles.hero}>
        <div className={styles.heroMeta}>
          <SongCategoryBadge category={category} size="md" />
          <span className={styles.heroCategory}>{songCategoryLabel(category)}</span>
          {libraryCategory ? (
            <span className={styles.heroCategory}>{libraryCategory}</span>
          ) : null}
        </div>
        <h2 className={styles.title}>{title}</h2>
        {artist ? <p className={styles.artist}>{artist}</p> : null}
        {presentationFilename ? (
          <p className={styles.sectionSummary}>{presentationFilename}</p>
        ) : null}
        <p className={styles.sectionSummary}>
          가사 구간 {safeSections.length}개
        </p>
      </header>

      {safeSections.length === 0 ? (
        <p className={styles.empty}>
          {sectionsHint ??
            '구간이 없습니다. PP 빌드 시 에이전트가 .pro에서 불러옵니다.'}
        </p>
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
        곡 데이터는 pro-presenter-data에서 관리됩니다. PP 빌드·송출만 이
        화면에서 진행하세요.
      </p>
      <div className={styles.actions}>
        <Button fullWidth disabled={disabled || buildDisabled} onClick={onBuild}>
          PP 빌드 · 송출
        </Button>
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
