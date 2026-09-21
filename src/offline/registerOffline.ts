import { registerOnlineSyncListeners, flushInspectionSyncQueue } from './syncEngine';

export function registerInspectorOfflineRuntime() {
  if (typeof window === 'undefined') return;
  registerOnlineSyncListeners();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'FLUSH_INSPECTION_QUEUE') {
        flushInspectionSyncQueue().catch(() => undefined);
      }
    });
  }
}
