import type { SongSection, SongSectionType } from '@/api';
import { Button } from '@/components';
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
  sections: SongSection[];
  disabled?: boolean;
  backLabel?: string;
  onEdit: () => void;
  onBack: () => void;
}

export function SongDetailView({
  title,
  sections,
  disabled = false,
  backLabel = '목록으로',
  onEdit,
  onBack,
}: SongDetailViewProps) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{title}</h2>

      {sections.length === 0 ? (
        <p className={styles.empty}>저장된 구간이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {sections.map((section, index) => {
            const lines = section.lines.map((l) => l.trim()).filter(Boolean);
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
                  <p className={styles.empty}>가사 없음</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.actions}>
        <Button fullWidth disabled={disabled} onClick={onEdit}>
          수정
        </Button>
        <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}
