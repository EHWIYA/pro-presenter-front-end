import type { SongCategory } from '@/api';
import { getAllCategoryDefs } from '@/lib/songCategoryStore';
import styles from './SongCategoryPicker.module.css';

interface SongCategoryPickerProps {
  value: SongCategory;
  onChange: (category: SongCategory) => void;
  disabled?: boolean;
  label?: string;
}

export function SongCategoryPicker({
  value,
  onChange,
  disabled = false,
  label = '곡 장르',
}: SongCategoryPickerProps) {
  const defs = getAllCategoryDefs();

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>{label}</legend>
      <div
        className={styles.builtinGrid}
        role="radiogroup"
        aria-label={label}
      >
        {defs.map((opt) => {
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
                name="song-category"
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
    </fieldset>
  );
}
