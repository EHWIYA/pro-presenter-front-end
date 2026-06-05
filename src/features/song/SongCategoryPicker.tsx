import type { SongCategory } from '@/api';
import { useSongCategories } from '@/hooks/useSongCategories';
import { SongCategoryManage } from './SongCategoryManage';
import styles from './SongCategoryPicker.module.css';

interface SongCategoryPickerProps {
  value: SongCategory;
  onChange: (category: SongCategory) => void;
  disabled?: boolean;
  label?: string;
  showManage?: boolean;
}

export function SongCategoryPicker({
  value,
  onChange,
  disabled = false,
  label = '곡 장르',
  showManage = true,
}: SongCategoryPickerProps) {
  const { defs } = useSongCategories();
  const builtins = defs.filter((d) => d.builtin);
  const customs = defs.filter((d) => !d.builtin);

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>{label}</legend>
      <div
        className={styles.builtinGrid}
        role="radiogroup"
        aria-label={`${label} 기본`}
      >
        {builtins.map((opt) => {
          const selected = value === opt.id;
          return (
            <label
              key={opt.id}
              className={[
                styles.chip,
                selected ? styles.chipSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                name="song-category-builtin"
                className={styles.input}
                value={opt.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(opt.id)}
              />
              <span className={styles.chipLabel}>{opt.label}</span>
            </label>
          );
        })}
      </div>

      {customs.length > 0 ? (
        <div
          className={styles.customSection}
          role="radiogroup"
          aria-label={`${label} 사용자 추가`}
        >
          <span className={styles.customLegend}>추가 카테고리</span>
          <div className={styles.customGrid}>
            {customs.map((opt) => {
              const selected = value === opt.id;
              return (
                <label
                  key={opt.id}
                  className={[
                    styles.chip,
                    styles.chipCustom,
                    selected ? styles.chipSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <input
                    type="radio"
                    name="song-category-custom"
                    className={styles.input}
                    value={opt.id}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => onChange(opt.id)}
                  />
                  <span className={styles.chipLabel}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {showManage ? (
        <SongCategoryManage disabled={disabled} layout="block" />
      ) : null}
    </fieldset>
  );
}
