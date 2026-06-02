import type { AnalyzeCandidates } from '@/api';
import { Button, StatusBanner } from '@/components';
import styles from './SongLibraryPanel.module.css';

interface SongCandidatesListProps {
  data: AnalyzeCandidates;
  disabled?: boolean;
  onSelect: (songId: string) => void;
  onBack: () => void;
}

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ko-KR');
  } catch {
    return iso;
  }
}

export function SongCandidatesList({
  data,
  disabled = false,
  onSelect,
  onBack,
}: SongCandidatesListProps) {
  return (
    <div className={styles.root}>
      <StatusBanner tone="info">
        「{data.query}」와(과) 비슷한 곡 {data.candidates.length}건 — 선택하세요.
      </StatusBanner>

      <ul className={styles.list}>
        {data.candidates.map((item) => (
          <li key={item.songId}>
            <button
              type="button"
              className={styles.item}
              disabled={disabled}
              onClick={() => onSelect(item.songId)}
            >
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemMeta}>
                구간 {item.sectionCount} · {formatUpdatedAt(item.updatedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="secondary" fullWidth disabled={disabled} onClick={onBack}>
        입력으로
      </Button>
    </div>
  );
}
