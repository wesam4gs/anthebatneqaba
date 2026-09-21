import { useEffect, useState } from 'react';
import { InspectorLiveLocation } from '../types';
import { getSupabaseConfig } from '../lib/supabaseLocations';

const STALE_MS = 180000;

export function useLiveInspectors(enabled = true) {
  const [locations, setLocations] = useState<InspectorLiveLocation[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const apply = (rows: InspectorLiveLocation[]) => {
      const cutoff = Date.now() - STALE_MS;
      setLocations(
        (rows || []).filter((r) => r.isActive && new Date(r.updatedAt).getTime() >= cutoff)
      );
    };

    const load = () => {
      fetch('/api/inspectors/locations')
        .then((r) => r.json())
        .then(apply)
        .catch(() => undefined);

      const cfg = getSupabaseConfig();
      if (!cfg) return;
      fetch(`${cfg.url}/rest/v1/inspector_locations?is_active=eq.true&select=*`, {
        headers: {
          apikey: cfg.anon,
          Authorization: `Bearer ${cfg.anon}`
        }
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((rows: Array<Record<string, unknown>>) => {
          if (!Array.isArray(rows) || !rows.length) return;
          apply(
            rows.map((row) => ({
              inspectorId: String(row.inspector_id || row.inspectorId),
              inspectorName: String(row.inspector_name || row.inspectorName || 'مفتش'),
              provinceId: row.province_id ? String(row.province_id) : undefined,
              latitude: Number(row.latitude),
              longitude: Number(row.longitude),
              accuracyMeters: row.accuracy_meters != null ? Number(row.accuracy_meters) : undefined,
              isActive: row.is_active !== false,
              updatedAt: String(row.updated_at || new Date().toISOString())
            }))
          );
        })
        .catch(() => undefined);
    };

    load();
    const poll = window.setInterval(load, 8000);

    let source: EventSource | null = null;
    try {
      source = new EventSource('/api/inspectors/stream');
      source.onmessage = (ev) => {
        try {
          apply(JSON.parse(ev.data));
        } catch {
          /* ignore malformed frames */
        }
      };
    } catch {
      /* EventSource unavailable */
    }

    return () => {
      window.clearInterval(poll);
      source?.close();
    };
  }, [enabled]);

  return locations;
}
