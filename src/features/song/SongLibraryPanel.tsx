import { useState } from 'react';
import { Spinner, StatusBanner } from '@/components';
import type { SongListItem } from '@/api';
import { useSongs } from '@/hooks';
import { SongCategoryBadge } from './SongCategoryBadge';
import {
  SongCategoryFilter,
  type SongCategoryFilterValue,
} from './SongCategoryFilter';
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

function formatSectionCount(count: number | null): string {
  if (count == null) return '구간 —';
  return `구간 ${count}`;
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
  const listRefreshing = songs.isFetching;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>찬양 라이브러리</h1>
        <p className={styles.subtitle}>
          pro-presenter-data 카탈로그에서 곡을 검색합니다. 편집·저장은 data
          repo에서 관리합니다.
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <SongCategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            disabled={disabled}
          />
        </div>

        <div className={styles.searchBlock}>
          <div className={styles.searchRow}>
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
                placeholder="제목·아티스트 검색…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={disabled}
                aria-label="곡 검색"
              />
            </div>
            <button
              type="button"
              className={[
                styles.refreshBtn,
                listRefreshing ? styles.refreshBtnActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled || listRefreshing || songs.isLoading}
              aria-label="목록 새로고침"
              onClick={() => void songs.refetch()}
            >
              <svg
                className={[
                  styles.refreshIcon,
                  listRefreshing ? styles.refreshIconSpin : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {songs.isLoading ? <Spinner centered /> : null}
      {songs.error ? (
        <StatusBanner tone="error">{songs.error.message}</StatusBanner>
      ) : null}

      {!songs.isLoading && !songs.error ? (
        <>
          <p className={styles.listMeta} aria-live="polite">
            {listRefreshing ? '목록 갱신 중…' : `${total}곡`}
          </p>
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
                  {item.libraryCategory ? `${item.libraryCategory} · ` : ''}
                  {item.artist ? `${item.artist} · ` : ''}
                  {formatSectionCount(item.sectionCount)} ·{' '}
                  {formatUpdatedAt(item.updatedAt)}
                </span>
              </button>
            </li>
          ))}
          </ul>
        </>
      ) : null}

      {!songs.isLoading && !songs.error && items.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {query.trim() || categoryFilter !== 'all'
              ? '조건에 맞는 곡이 없습니다.'
              : '카탈로그에 곡이 없습니다.'}
          </p>
          {!query.trim() && categoryFilter === 'all' ? (
            <p className={styles.emptyHint}>
              우측 하단 + 버튼으로 신규 악보를 분석·빌드하거나, NAS에
              pro-presenter-data가 배포됐는지 확인하세요.
            </p>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}
