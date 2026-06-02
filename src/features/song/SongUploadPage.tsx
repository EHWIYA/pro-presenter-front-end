import { useRef, useState, type ClipboardEvent } from 'react';
import { Button, StatusBanner } from '@/components';
import styles from './SongUploadPage.module.css';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PASTED_IMAGE_LABEL = '클립보드에서 붙여넣음';

export type SongInputMode = 'lyrics' | 'image';

export interface SongUploadPayload {
  songTitle: string;
  lyricsText?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

interface SongUploadPageProps {
  disabled?: boolean;
  onSubmit: (payload: SongUploadPayload) => void;
}

async function readImageFile(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('JPEG·PNG·WebP 이미지만 업로드할 수 있습니다.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('이미지는 약 4MB 이하여야 합니다.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('이미지를 읽지 못했습니다.'));
        return;
      }
      const comma = result.indexOf(',');
      resolve({
        base64: comma >= 0 ? result.slice(comma + 1) : result,
        mimeType: file.type,
      });
    };
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function getImageFileFromClipboard(clipboardData: DataTransfer): File | null {
  for (const item of clipboardData.items) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) {
      continue;
    }
    const file = item.getAsFile();
    if (!file) {
      continue;
    }
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return file;
    }
    if (!file.type) {
      return new File([file], 'pasted-image.png', { type: 'image/png' });
    }
    return file;
  }
  return null;
}

function clipboardHasNonImageContent(clipboardData: DataTransfer): boolean {
  return [...clipboardData.items].some(
    (item) =>
      (item.kind === 'string' && item.type === 'text/plain') ||
      (item.kind === 'file' && item.type !== '' && !item.type.startsWith('image/')),
  );
}

export function SongUploadPage({ disabled = false, onSubmit }: SongUploadPageProps) {
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<SongInputMode>('lyrics');
  const [songTitle, setSongTitle] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleImageChange(
    file: File | undefined,
    displayName?: string,
  ) {
    setLocalError(null);
    if (!file) {
      setImageName(null);
      setImageData(null);
      return;
    }
    try {
      const data = await readImageFile(file);
      setImageName(displayName ?? file.name);
      setImageData(data);
    } catch (err) {
      setImageName(null);
      setImageData(null);
      setLocalError(err instanceof Error ? err.message : '이미지 오류');
    }
  }

  function handleImagePaste(e: ClipboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }
    const file = getImageFileFromClipboard(e.clipboardData);
    if (!file) {
      if (clipboardHasNonImageContent(e.clipboardData)) {
        e.preventDefault();
        setLocalError('이미지를 붙여넣으세요.');
      }
      return;
    }
    e.preventDefault();
    void handleImageChange(file, PASTED_IMAGE_LABEL);
  }

  function handleSubmit() {
    setLocalError(null);
    const title = songTitle.trim();
    if (!title) {
      setLocalError('곡 제목을 입력하세요.');
      return;
    }

    if (mode === 'lyrics') {
      const lyrics = lyricsText.trim();
      if (!lyrics) {
        setLocalError('가사를 입력하거나 악보 이미지를 선택하세요.');
        return;
      }
      onSubmit({ songTitle: title, lyricsText: lyrics });
      return;
    }

    if (!imageData) {
      setLocalError('악보 이미지를 선택하거나 붙여넣으세요.');
      return;
    }
    onSubmit({
      songTitle: title,
      imageBase64: imageData.base64,
      imageMimeType: imageData.mimeType,
    });
  }

  const canSubmit =
    !disabled &&
    songTitle.trim().length > 0 &&
    (mode === 'lyrics' ? lyricsText.trim().length > 0 : Boolean(imageData));

  return (
    <div className={styles.root}>
      <label className={styles.field} htmlFor="song-title">
        <span className={styles.label}>곡 제목</span>
        <input
          id="song-title"
          className={styles.input}
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="주님의 마음"
          disabled={disabled}
        />
      </label>

      <div className={styles.modeTabs} role="tablist" aria-label="입력 방식">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'lyrics'}
          className={[styles.modeTab, mode === 'lyrics' ? styles.modeTabActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => setMode('lyrics')}
          disabled={disabled}
        >
          가사
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'image'}
          className={[styles.modeTab, mode === 'image' ? styles.modeTabActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => setMode('image')}
          disabled={disabled}
        >
          악보 이미지
        </button>
      </div>

      {mode === 'lyrics' ? (
        <label className={styles.field} htmlFor="song-lyrics">
          <span className={styles.label}>가사</span>
          <textarea
            id="song-lyrics"
            className={styles.textarea}
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder={'1절 가사...\n\n후렴 가사...'}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className={styles.field}>
          <span className={styles.label} id="song-image-label">
            악보 이미지 (JPEG·PNG·WebP, ~4MB)
          </span>
          <div
            ref={pasteZoneRef}
            className={styles.pasteZone}
            tabIndex={disabled ? -1 : 0}
            role="group"
            aria-labelledby="song-image-label"
            aria-describedby="song-image-hint"
            onPaste={handleImagePaste}
            onClick={() => pasteZoneRef.current?.focus()}
          >
            <p id="song-image-hint" className={styles.pasteHint}>
              악보 이미지를 선택하거나 붙여넣기(Ctrl+V / ⌘+V)하세요.
            </p>
            <input
              id="song-image"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className={styles.fileInput}
              disabled={disabled}
              onChange={(e) => void handleImageChange(e.target.files?.[0])}
            />
            {imageData ? (
              <img
                className={styles.preview}
                src={`data:${imageData.mimeType};base64,${imageData.base64}`}
                alt="악보 미리보기"
              />
            ) : null}
            {imageName ? (
              <p className={styles.fileName}>{imageName}</p>
            ) : null}
          </div>
        </div>
      )}

      <p className={styles.hint}>
        AI 분석은 10~120초 걸릴 수 있습니다. 결과는 반드시 검수한 뒤 빌드하세요.
      </p>

      {localError ? <StatusBanner tone="error">{localError}</StatusBanner> : null}

      <Button fullWidth disabled={!canSubmit} onClick={handleSubmit}>
        분석 시작
      </Button>
    </div>
  );
}
