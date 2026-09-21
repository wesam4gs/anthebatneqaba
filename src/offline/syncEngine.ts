import { OfflineInspectionDraft } from '../types';
import { listPendingDrafts, markDraftStatus } from './inspectorDb';

async function postInspection(draft: OfflineInspectionDraft) {
  const res = await fetch('/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignmentId: draft.assignmentId,
      facilityId: draft.facilityId,
      inspectorId: draft.inspectorId,
      inspectorName: draft.inspectorName,
      inspectorLat: draft.inspectorLat,
      inspectorLng: draft.inspectorLng,
      generalComplianceScore: draft.complianceScore,
      notes: draft.notes,
      photos: draft.photos,
      answersJson: draft.answersJson,
      templateId: draft.templateId,
      recommendedAction: draft.complianceScore >= 80 ? 'PASS' : 'WARNING_ISSUED'
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'sync_failed');
  }
  return res.json();
}

export async function flushInspectionSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }
  const pending = await listPendingDrafts();
  let synced = 0;
  let failed = 0;
  for (const draft of pending) {
    try {
      await markDraftStatus(draft.id, 'SYNCING');
      await postInspection(draft);
      await markDraftStatus(draft.id, 'SYNCED');
      synced += 1;
    } catch (e) {
      failed += 1;
      await markDraftStatus(draft.id, 'FAILED', e instanceof Error ? e.message : 'unknown');
    }
  }
  return { synced, failed };
}

export function requestInspectionBackgroundSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      const syncManager = (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
      if (syncManager?.register) {
        return syncManager.register('inspection-sync');
      }
      navigator.serviceWorker.controller?.postMessage({ type: 'REQUEST_SYNC' });
    })
    .catch(() => undefined);
}

export function registerOnlineSyncListeners() {
  if (typeof window === 'undefined') return;
  const run = () => {
    flushInspectionSyncQueue().catch(() => undefined);
  };
  window.addEventListener('online', run);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run();
  });
  run();
}
