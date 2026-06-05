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
      <header className={styles.header}>
        <h1 className={styles.title}>찬양 라이브러리</h1>
        <p className={styles.subtitle}>
          제목·아티스트로 검색하거나 장르를 골라 곡을 찾으세요.
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.categoryBlock}>
          <SongCategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            disabled={disabled}
          />
          <div className={styles.manageAlign}>
            <SongCategoryManage disabled={disabled} />
          </div>
        </div>

        <div className={styles.searchBlock}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              className={styles.search}
              type="search"
              placeholder="곡 제목·아티스트 검색…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              aria-label="곡 검색"
            />
          </div>
          {!songs.isLoading && !songs.error ? (
            <p className={styles.resultCount} aria-live="polite">
              {total}곡
            </p>
          ) : null}
        </div>
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
        <div className={styles.empty}>
          <p>
            {query.trim() || categoryFilter !== 'all'
              ? '조건에 맞는 곡이 없습니다.'
              : '저장된 곡이 없습니다.'}
          </p>
          {!query.trim() && categoryFilter === 'all' ? (
            <p className={styles.emptyHint}>
              우측 하단 + 버튼으로 악보를 추가하세요.
            </p>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}
