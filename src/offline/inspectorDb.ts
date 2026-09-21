import Dexie, { Table } from 'dexie';
import { Facility, InspectionAssignment, InspectionTemplate, OfflineInspectionDraft } from '../types';

class InspectorOfflineDb extends Dexie {
  assignments!: Table<InspectionAssignment, string>;
  facilities!: Table<Facility, string>;
  templates!: Table<InspectionTemplate, string>;
  drafts!: Table<OfflineInspectionDraft, string>;

  constructor() {
    super('nursing_inspector_offline');
    this.version(1).stores({
      assignments: 'id, assignedInspectorId, status, facilityId',
      facilities: 'id, provinceId, zoneId',
      templates: 'id, isActive, code',
      drafts: 'id, facilityId, syncStatus, createdAt'
    });
  }
}

export const inspectorOfflineDb = new InspectorOfflineDb();

export async function cacheInspectorWorkspace(payload: {
  assignments: InspectionAssignment[];
  facilities: Facility[];
  templates: InspectionTemplate[];
}) {
  await inspectorOfflineDb.transaction('rw', inspectorOfflineDb.assignments, inspectorOfflineDb.facilities, inspectorOfflineDb.templates, async () => {
    await inspectorOfflineDb.assignments.clear();
    await inspectorOfflineDb.facilities.clear();
    await inspectorOfflineDb.templates.clear();
    await inspectorOfflineDb.assignments.bulkPut(payload.assignments);
    await inspectorOfflineDb.facilities.bulkPut(payload.facilities);
    await inspectorOfflineDb.templates.bulkPut(payload.templates);
  });
}

export async function saveInspectionDraft(draft: OfflineInspectionDraft) {
  await inspectorOfflineDb.drafts.put(draft);
}

export async function listPendingDrafts() {
  return inspectorOfflineDb.drafts
    .filter((d) => d.syncStatus === 'QUEUED' || d.syncStatus === 'FAILED')
    .toArray();
}

export async function markDraftStatus(id: string, syncStatus: OfflineInspectionDraft['syncStatus'], lastError?: string) {
  await inspectorOfflineDb.drafts.update(id, { syncStatus, lastError });
}

export async function getCachedActiveTemplate(): Promise<InspectionTemplate | undefined> {
  const rows = await inspectorOfflineDb.templates.toArray();
  return rows.find((t) => t.isActive) || rows[0];
}
