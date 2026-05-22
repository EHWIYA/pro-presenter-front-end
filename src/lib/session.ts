const VENUE_KEY = 'pro-app:venue-id';
const VERSE_TEXT_KEY = 'pro-app:verse-text';

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
