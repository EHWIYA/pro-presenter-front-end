import type { CSSProperties } from 'react';
import type { SongCategory } from '@/api';
import {
  songCategoryAccent,
  songCategoryShortLabel,
} from './songCategoryMeta';
import styles from './SongCategoryBadge.module.css';

interface SongCategoryBadgeProps {
  category: SongCategory;
  size?: 'sm' | 'md';
}

export function SongCategoryBadge({
  category,
  size = 'sm',
}: SongCategoryBadgeProps) {
  const accent = songCategoryAccent(category);

  return (
    <span
      className={[styles.badge, size === 'md' ? styles.badgeMd : '']
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--category-accent': accent,
        } as CSSProperties
      }
    >
      {songCategoryShortLabel(category)}
    </span>
  );
}
