import { useState } from 'react';
import { Button } from '@/components';
import { useSongCategories } from '@/hooks/useSongCategories';
import styles from './SongCategoryManage.module.css';

interface SongCategoryManageProps {
  disabled?: boolean;
  compact?: boolean;
}

export function SongCategoryManage({
  disabled = false,
  compact = false,
}: SongCategoryManageProps) {
  const { customCategories, addCategory, removeCategory } = useSongCategories();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function handleAdd() {
    setMessage(null);
    const result = addCategory(name);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setName('');
    setMessage('카테고리를 추가했습니다.');
  }

  if (!open && compact) {
    return (
      <Button
        variant="secondary"
        fullWidth
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        카테고리 추가·관리
      </Button>
    );
  }

  return (
    <section
      className={[styles.root, compact ? styles.rootCompact : '']
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="song-category-manage-title"
    >
      <div className={styles.header}>
        <h3 id="song-category-manage-title" className={styles.title}>
          사용자 카테고리
        </h3>
        {compact ? (
          <button
            type="button"
            className={styles.collapse}
            disabled={disabled}
            onClick={() => setOpen(false)}
          >
            접기
          </button>
        ) : null}
      </div>
      <p className={styles.hint}>
        기본 장르는 찬양·성가곡·특송입니다. 예배 팀별 분류는 여기서 추가하세요.
        (현재 이 기기·브라우저에만 저장됩니다.)
      </p>

      <div className={styles.addRow}>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 주일 1부, 청년부"
          maxLength={24}
          disabled={disabled}
          aria-label="새 카테고리 이름"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <Button disabled={disabled || !name.trim()} onClick={handleAdd}>
          추가
        </Button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}

      {customCategories.length > 0 ? (
        <ul className={styles.list}>
          {customCategories.map((cat) => (
            <li key={cat.id} className={styles.listItem}>
              <span className={styles.listLabel}>{cat.label}</span>
              <button
                type="button"
                className={styles.remove}
                disabled={disabled}
                onClick={() => removeCategory(cat.id as `custom:${string}`)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>추가된 사용자 카테고리가 없습니다.</p>
      )}
    </section>
  );
}
