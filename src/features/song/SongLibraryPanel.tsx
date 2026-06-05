import { useState } from 'react';
import { Spinner, StatusBanner } from '@/components';
import type { SongListItem } from '@/api';
import { useSongs } from '@/hooks';
import { SongCategoryBadge } from './SongCategoryBadge';
import {
  SongCategoryFilter,
  type SongCategoryFilterValue,
} from './SongCategoryFilter';
import { SongCategoryManage } from './SongCategoryManage';
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
  const [categoryFilter, setCategoryFilter] =
    useState<SongCategoryFilterValue>('all');
  const category =
    categoryFilter === 'all' ? undefined : categoryFilter;
  const songs = useSongs(query, category);

  const items = songs.data?.items ?? [];
  const total = songs.data?.total ?? 0;

  return (
    <div className={styles.root}>
      <SongCategoryFilter
        value={categoryFilter}
        onChange={setCategoryFilter}
        disabled={disabled}
      />

      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          type="search"
          placeholder="곡 제목·아티스트 검색…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          aria-label="곡 검색"
        />
        {!songs.isLoading && !songs.error ? (
          <span className={styles.count} aria-live="polite">
            {total}곡
          </span>
        ) : null}
      </div>

      {songs.isLoading ? <Spinner centered /> : null}
      {songs.error ? (
        <StatusBanner tone="error">{songs.error.message}</StatusBanner>
      ) : null}

      {!songs.isLoading && !songs.error ? (
        <ul className={styles.list}>
          {items.map((item: SongListItem) => (
            <li key={item.songId}>
              <button
                type="button"
                className={styles.item}
                disabled={disabled}
                onClick={() => onSelect(item.songId)}
              >
                <div className={styles.itemTop}>
                  <SongCategoryBadge category={item.category} />
                  <span className={styles.itemTitle}>{item.title}</span>
                </div>
                <span className={styles.itemMeta}>
                  {item.artist ? `${item.artist} · ` : ''}
                  구간 {item.sectionCount} · {formatUpdatedAt(item.updatedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!songs.isLoading && !songs.error && items.length === 0 ? (
        <p className={styles.empty}>
          {query.trim() || categoryFilter !== 'all'
            ? '조건에 맞는 곡이 없습니다.'
            : '저장된 곡이 없습니다. 신규·악보 탭에서 추가하세요.'}
        </p>
      ) : null}

      <SongCategoryManage disabled={disabled} compact />
    </div>
  );
}
