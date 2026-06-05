import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components';
import { useSongCategories } from '@/hooks/useSongCategories';
import type { SongCategoryDef } from '@/lib/songCategoryStore';
import styles from './SongCategoryManage.module.css';

interface SongCategoryManageProps {
  disabled?: boolean;
  triggerLabel?: string;
  triggerVariant?: 'link' | 'button';
}

export function SongCategoryManage({
  disabled = false,
  triggerLabel = '카테고리 관리',
  triggerVariant = 'link',
}: SongCategoryManageProps) {
  const { defs, addCategory, updateCategory, removeCategory } =
    useSongCategories();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function resetEditor() {
    setEditingId(null);
    setEditName('');
    setNewName('');
    setMessage(null);
  }

  function closeModal() {
    setOpen(false);
    resetEditor();
  }

  function handleAdd() {
    setMessage(null);
    const result = addCategory(newName);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setNewName('');
    setMessage('카테고리를 추가했습니다.');
  }

  function startEdit(def: SongCategoryDef) {
    if (def.builtin) return;
    setEditingId(def.id);
    setEditName(def.label);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setMessage(null);
  }

  function handleSaveEdit(id: `custom:${string}`) {
    setMessage(null);
    const result = updateCategory(id, editName);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    cancelEdit();
    setMessage('카테고리를 수정했습니다.');
  }

  function handleRemove(def: SongCategoryDef) {
    if (def.builtin) return;
    const ok = window.confirm(`「${def.label}」 카테고리를 삭제할까요?`);
    if (!ok) return;
    if (editingId === def.id) {
      cancelEdit();
    }
    removeCategory(def.id as `custom:${string}`);
    setMessage('카테고리를 삭제했습니다.');
  }

  const builtins = defs.filter((d) => d.builtin);
  const customs = defs.filter((d) => !d.builtin);

  return (
    <>
      <button
        type="button"
        className={[
          styles.trigger,
          triggerVariant === 'button' ? styles.triggerButton : styles.triggerLink,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>

      {open ? (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-manage-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2 id="category-manage-title" className={styles.modalTitle}>
                카테고리 관리
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="닫기"
                onClick={closeModal}
              >
                ✕
              </button>
            </header>

            <div className={styles.modalBody}>
              <p className={styles.hint}>
                기본·사용자 카테고리를 조회하고, 사용자 카테고리는 추가·수정·삭제할
                수 있습니다. (현재 이 기기·브라우저에만 저장)
              </p>

              <section className={styles.section} aria-labelledby="builtin-cats">
                <h3 id="builtin-cats" className={styles.sectionTitle}>
                  기본 카테고리
                  <span className={styles.sectionCount}>{builtins.length}</span>
                </h3>
                <ul className={styles.list}>
                  {builtins.map((def) => (
                    <CategoryRow
                      key={def.id}
                      def={def}
                      disabled={disabled}
                      editing={false}
                      editName=""
                      onEditNameChange={() => {}}
                      onStartEdit={() => {}}
                      onSaveEdit={() => {}}
                      onCancelEdit={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </ul>
              </section>

              <section className={styles.section} aria-labelledby="custom-cats">
                <h3 id="custom-cats" className={styles.sectionTitle}>
                  사용자 카테고리
                  <span className={styles.sectionCount}>{customs.length}</span>
                </h3>
                {customs.length > 0 ? (
                  <ul className={styles.list}>
                    {customs.map((def) => (
                      <CategoryRow
                        key={def.id}
                        def={def}
                        disabled={disabled}
                        editing={editingId === def.id}
                        editName={editName}
                        onEditNameChange={setEditName}
                        onStartEdit={() => startEdit(def)}
                        onSaveEdit={() =>
                          handleSaveEdit(def.id as `custom:${string}`)
                        }
                        onCancelEdit={cancelEdit}
                        onRemove={() => handleRemove(def)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>추가된 사용자 카테고리가 없습니다.</p>
                )}
              </section>

              <section className={styles.addSection} aria-labelledby="add-cat">
                <h3 id="add-cat" className={styles.sectionTitle}>
                  새 카테고리
                </h3>
                <div className={styles.addRow}>
                  <input
                    className={styles.input}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="예: 주일 1부, 청년부"
                    maxLength={24}
                    disabled={disabled}
                    aria-label="새 카테고리 이름"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd();
                    }}
                  />
                  <Button
                    disabled={disabled || !newName.trim()}
                    onClick={handleAdd}
                  >
                    추가
                  </Button>
                </div>
              </section>

              {message ? <p className={styles.message}>{message}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

interface CategoryRowProps {
  def: SongCategoryDef;
  disabled: boolean;
  editing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}

function CategoryRow({
  def,
  disabled,
  editing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: CategoryRowProps) {
  return (
    <li className={styles.listItem}>
      <span
        className={styles.dot}
        style={
          {
            '--category-accent': def.accent,
          } as CSSProperties
        }
        aria-hidden
      />
      <div className={styles.listMain}>
        {editing ? (
          <input
            className={styles.editInput}
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            maxLength={24}
            disabled={disabled}
            aria-label={`${def.label} 이름 수정`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
        ) : (
          <>
            <span className={styles.listLabel}>{def.label}</span>
            <span className={styles.listDesc}>{def.description}</span>
          </>
        )}
      </div>

      {def.builtin ? (
        <span className={styles.builtinBadge}>기본</span>
      ) : editing ? (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.saveBtn}
            disabled={disabled || !editName.trim()}
            onClick={onSaveEdit}
          >
            저장
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            disabled={disabled}
            onClick={onCancelEdit}
          >
            취소
          </button>
        </div>
      ) : (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.editBtn}
            disabled={disabled}
            onClick={onStartEdit}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.removeBtn}
            disabled={disabled}
            onClick={onRemove}
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
