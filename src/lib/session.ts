import { defaultMailPresentationFilename } from './presentationFilename';

const VENUE_KEY = 'pro-app:venue-id';
const VERSE_TEXT_KEY = 'pro-app:verse-text';
const PRESENTATION_FILENAME_KEY = 'pro-app:presentation-filename';

export function getSelectedVenueId(): string | null {
  try {
    return sessionStorage.getItem(VENUE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedVenueId(id: string): void {
  sessionStorage.setItem(VENUE_KEY, id);
}

export function clearSelectedVenueId(): void {
  sessionStorage.removeItem(VENUE_KEY);
}

export function getVerseText(): string {
  try {
    return sessionStorage.getItem(VERSE_TEXT_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setVerseText(text: string): void {
  sessionStorage.setItem(VERSE_TEXT_KEY, text);
}

export function getPresentationFilename(): string {
  try {
    const stored = sessionStorage.getItem(PRESENTATION_FILENAME_KEY)?.trim();
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return defaultMailPresentationFilename();
}

export function setPresentationFilename(filename: string): void {
  sessionStorage.setItem(PRESENTATION_FILENAME_KEY, filename);
}
