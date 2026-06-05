import { useSyncExternalStore } from 'react';

let active = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const connectOverlay = {
  show() {
    if (active) return;
    active = true;
    emit();
  },
  hide() {
    if (!active) return;
    active = false;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return active;
  },
};

export function useConnectOverlay(): boolean {
  return useSyncExternalStore(
    connectOverlay.subscribe,
    connectOverlay.getSnapshot,
    connectOverlay.getSnapshot,
  );
}
