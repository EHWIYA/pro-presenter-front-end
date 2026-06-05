import type { SongCategory } from '@/api';
import { useSongCategories } from '@/hooks/useSongCategories';
import styles from './SongCategoryFilter.module.css';

export type SongCategoryFilterValue = SongCategory | 'all';

interface SongCategoryFilterProps {
  value: SongCategoryFilterValue;
  onChange: (value: SongCategoryFilterValue) => void;
  disabled?: boolean;
}

export function SongCategoryFilter({
  value,
  onChange,
  disabled = false,
}: SongCategoryFilterProps) {
  const { defs } = useSongCategories();

  return (
    <div
      className={styles.root}
      role="tablist"
      aria-label="곡 장르 필터"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'all'}
        className={[
          styles.chip,
          value === 'all' ? styles.chipActive : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        onClick={() => onChange('all')}
      >
        전체
      </button>
      {defs.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          className={[
            styles.chip,
            value === opt.id ? styles.chipActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          onClick={() => onChange(opt.id)}
        >
          {opt.shortLabel}
        </button>
      ))}
    </div>
  );
}
