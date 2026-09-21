import { useEffect, useRef } from 'react';
import { User } from '../types';
import { publishLocationToSupabase } from '../lib/supabaseLocations';

export function useInspectorHeartbeat(currentUser: User | null, latitude: number, longitude: number, enabled = true) {
  const lastSent = useRef(0);

  useEffect(() => {
    if (!enabled || !currentUser) return;

    const send = async () => {
      const now = Date.now();
      if (now - lastSent.current < 8000) return;
      lastSent.current = now;
      const payload = {
        inspectorId: currentUser.id,
        inspectorName: currentUser.name,
        provinceId: currentUser.provinceId,
        latitude,
        longitude,
        isActive: true
      };
      try {
        await fetch('/api/inspectors/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        /* offline: ignore */
      }
      await publishLocationToSupabase({
        inspector_id: currentUser.id,
        inspector_name: currentUser.name,
        province_id: currentUser.provinceId,
        latitude,
        longitude,
        is_active: true
      });
    };

    send();
    const timer = window.setInterval(send, 10000);
    return () => window.clearInterval(timer);
  }, [currentUser, latitude, longitude, enabled]);
}
