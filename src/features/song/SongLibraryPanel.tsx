import { useState } from 'react';
import { Spinner, StatusBanner } from '@/components';
import type { SongListItem } from '@/api';
import { useSongs } from '@/hooks';
import styles from './SongLibraryPanel.module.css';

interface SongLibraryPanelProps {
  disabled?: boolean;
  onSelect: (songId: string) => void;
}

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ko-KR');
  } catch {
    return iso;
  }
}

export function SongLibraryPanel({
  disabled = false,
  onSelect,
}: SongLibraryPanelProps) {
  const [query, setQuery] = useState('');
  const songs = useSongs(query);

  return (
    <div className={styles.root}>
      <input
        className={styles.search}
        type="search"
        placeholder="곡 제목 검색…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        aria-label="곡 검색"
      />

      {songs.isLoading ? <Spinner centered /> : null}
      {songs.error ? (
        <StatusBanner tone="error">{songs.error.message}</StatusBanner>
      ) : null}

      {!songs.isLoading && !songs.error ? (
        <ul className={styles.list}>
          {(songs.data?.items ?? []).map((item: SongListItem) => (
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
      ) : null}

      {!songs.isLoading &&
      !songs.error &&
      (songs.data?.items.length ?? 0) === 0 ? (
        <p className={styles.empty}>
          {query.trim() ? '검색 결과가 없습니다.' : '저장된 곡이 없습니다.'}
        </p>
      ) : null}
    </div>
  );
}
