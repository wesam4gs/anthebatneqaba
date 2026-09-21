/**
 * Optional Supabase adapter. The live HQ map works via SSE (/api/inspectors/stream)
 * even when VITE_SUPABASE_URL is not set. When credentials exist, heartbeats
 * are also written to inspector_locations for Realtime / PostGIS.
 */
export function getSupabaseConfig() {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = env.VITE_SUPABASE_URL;
  const anon = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return { url, anon };
}

export async function publishLocationToSupabase(row: {
  inspector_id: string;
  inspector_name: string;
  province_id?: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  is_active: boolean;
}) {
  const cfg = getSupabaseConfig();
  if (!cfg) return;
  await fetch(`${cfg.url}/rest/v1/inspector_locations`, {
    method: 'POST',
    headers: {
      apikey: cfg.anon,
      Authorization: `Bearer ${cfg.anon}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      ...row,
      geom: `SRID=4326;POINT(${row.longitude} ${row.latitude})`,
      updated_at: new Date().toISOString()
    })
  }).catch(() => undefined);
}
