import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SongCategory } from '@/api';
import { useSongCategories } from '@/hooks/useSongCategories';
import styles from './SongCategoryFilter.module.css';

export type SongCategoryFilterValue = SongCategory | 'all';

interface SongCategoryFilterProps {
  value: SongCategoryFilterValue;
  onChange: (value: SongCategoryFilterValue) => void;
  disabled?: boolean;
}

const ALL_OPTION = {
  id: 'all' as const,
  label: '전체',
  shortLabel: '전체',
  accent: 'var(--color-text-muted)',
};

export function SongCategoryFilter({
  value,
  onChange,
  disabled = false,
}: SongCategoryFilterProps) {
  const { defs } = useSongCategories();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected =
    value === 'all'
      ? ALL_OPTION
      : defs.find((opt) => opt.id === value) ?? ALL_OPTION;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function selectOption(next: SongCategoryFilterValue) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <span className={styles.label} id={`${listboxId}-label`}>
        장르
      </span>
      <button
        type="button"
        className={[
          styles.trigger,
          open ? styles.triggerOpen : '',
          value !== 'all' ? styles.triggerActive : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listboxId}-label`}
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
      >
        <span
          className={styles.dot}
          style={
            {
              '--category-accent': selected.accent,
            } as CSSProperties
          }
          aria-hidden
        />
        <span className={styles.triggerLabel}>{selected.shortLabel}</span>
        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listboxId}
          className={styles.menu}
          role="listbox"
          aria-labelledby={`${listboxId}-label`}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === 'all'}
              className={[
                styles.option,
                value === 'all' ? styles.optionSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectOption('all')}
            >
              <span className={styles.optionDotMuted} aria-hidden />
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>전체</span>
                <span className={styles.optionDesc}>모든 장르</span>
              </span>
              {value === 'all' ? (
                <svg
                  className={styles.check}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M5 12l5 5L19 7" />
                </svg>
              ) : null}
            </button>
          </li>
          {defs.map((opt) => (
            <li key={opt.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.id}
                className={[
                  styles.option,
                  value === opt.id ? styles.optionSelected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectOption(opt.id)}
              >
                <span
                  className={styles.optionDot}
                  style={
                    {
                      '--category-accent': opt.accent,
                    } as CSSProperties
                  }
                  aria-hidden
                />
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </span>
                {value === opt.id ? (
                  <svg
                    className={styles.check}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M5 12l5 5L19 7" />
                  </svg>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
