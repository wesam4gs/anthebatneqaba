import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility, Province, DistrictZone, User, PriorityLevel, InspectorLiveLocation } from '../types';
import { calculateRiskScore } from '../utils/riskCalculator';
import { facilityTypeLabel, facilityTypeEmoji } from '../utils/facilityLabels';
import { MapPin, Search, Calendar, User as UserIcon, Navigation, Plus, Eye, Building2, Send, CheckCircle } from 'lucide-react';

interface GisMapProps {
  facilities: Facility[];
  provinces: Province[];
  zones: DistrictZone[];
  inspectors?: User[];
  currentUser?: User | null;
  onSelectFacility: (facility: Facility) => void;
  onCreateAssignment?: (assignmentData: {
    facilityId: string;
    assignedInspectorId: string;
    scheduledDate: string;
    priority: PriorityLevel;
    notes: string;
  }) => void;
  onAddFacilityModalOpen?: () => void;
  liveInspectors?: InspectorLiveLocation[];
  onDispatchNearest?: (facility: Facility) => Promise<void> | void;
}


export const GisMap: React.FC<GisMapProps> = ({
  facilities,
  provinces,
  zones,
  inspectors = [],
  currentUser,
  onSelectFacility,
  onCreateAssignment,
  onAddFacilityModalOpen,
  liveInspectors = [],
  onDispatchNearest
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const dispatchLayerRef = useRef<L.LayerGroup | null>(null);
  const inspectorsLayerRef = useRef<L.LayerGroup | null>(null);
  const [showDispatchRoute, setShowDispatchRoute] = useState(false);
  const [dispatchBusy, setDispatchBusy] = useState(false);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('ALL');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePopupFacility, setActivePopupFacility] = useState<Facility | null>(null);

  const [facilityToSchedule, setFacilityToSchedule] = useState<Facility | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [assignedInspectorId, setAssignedInspectorId] = useState<string>('');
  const [scheduleNotes, setScheduleNotes] = useState<string>('');
  const [scheduleSuccess, setScheduleSuccess] = useState<string>('');

  const availableZones = React.useMemo(() => {
    if (selectedProvinceId === 'ALL') return zones;
    return zones.filter((z) => z.provinceId === selectedProvinceId);
  }, [selectedProvinceId, zones]);

  const availableNeighborhoods = React.useMemo(() => {
    const nSet = new Set<string>();
    if (selectedZoneId !== 'ALL') {
      const activeZone = zones.find((z) => z.id === selectedZoneId);
      activeZone?.neighborhoods.forEach((n) => nSet.add(n));
      facilities
        .filter((f) => f.zoneId === selectedZoneId)
        .forEach((f) => nSet.add(f.neighborhood));
    } else if (selectedProvinceId !== 'ALL') {
      zones
        .filter((z) => z.provinceId === selectedProvinceId)
        .forEach((z) => z.neighborhoods.forEach((n) => nSet.add(n)));
      facilities
        .filter((f) => f.provinceId === selectedProvinceId)
        .forEach((f) => nSet.add(f.neighborhood));
    } else {
      zones.forEach((z) => z.neighborhoods.forEach((n) => nSet.add(n)));
      facilities.forEach((f) => nSet.add(f.neighborhood));
    }
    return Array.from(nSet).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [selectedProvinceId, selectedZoneId, zones, facilities]);

  const filteredFacilities = facilities.filter((f) => {
    if (selectedProvinceId !== 'ALL' && f.provinceId !== selectedProvinceId) return false;
    if (selectedZoneId !== 'ALL' && f.zoneId !== selectedZoneId) return false;
    if (selectedNeighborhood !== 'ALL' && f.neighborhood !== selectedNeighborhood) return false;
    if (statusFilter !== 'ALL' && f.licenseStatus !== statusFilter && f.inspectionStatus !== statusFilter) return false;
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return (
        f.name.toLowerCase().includes(q) ||
        f.licenseNumber.toLowerCase().includes(q) ||
        f.ownerName.toLowerCase().includes(q) ||
        f.ownerPhone.includes(q) ||
        f.neighborhood.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedProvinceName =
    selectedProvinceId === 'ALL'
      ? 'جميع المحافظات'
      : provinces.find((p) => p.id === selectedProvinceId)?.nameAr || '';
  const selectedZoneName =
    selectedZoneId === 'ALL'
      ? 'جميع المناطق'
      : zones.find((z) => z.id === selectedZoneId)?.nameAr || '';
  const selectedNeighborhoodName = selectedNeighborhood === 'ALL' ? 'جميع الأحياء' : selectedNeighborhood;

  const zoneInspectors = React.useMemo(() => {
    const inZone = inspectors.filter((u) => {
      if (u.role !== 'FIELD_INSPECTOR') return false;
      if (selectedZoneId !== 'ALL' && u.assignedZoneId && u.assignedZoneId !== 'all_zones' && u.assignedZoneId !== selectedZoneId) {
        return u.provinceId === selectedProvinceId;
      }
      if (selectedProvinceId !== 'ALL' && u.provinceId && u.provinceId !== 'all' && u.provinceId !== selectedProvinceId) {
        return false;
      }
      return true;
    });
    return inZone.length > 0 ? inZone : inspectors.filter((u) => u.role === 'FIELD_INSPECTOR');
  }, [inspectors, selectedProvinceId, selectedZoneId]);

  const openScheduleModal = (facility: Facility) => {
    const preferred =
      zoneInspectors.find((i) => i.assignedZoneId === facility.zoneId)?.id ||
      zoneInspectors[0]?.id ||
      '';
    setAssignedInspectorId(preferred);
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setPriority(facility.inspectionStatus === 'VIOLATION_RECORDED' || facility.licenseStatus === 'UNLICENSED' ? 'URGENT' : 'HIGH');
    setScheduleNotes(`كشف ميداني مباشر من الخريطة — ${facility.neighborhood} — ${facility.name}`);
    setFacilityToSchedule(facility);
    setActivePopupFacility(null);
    setScheduleSuccess('');
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityToSchedule || !onCreateAssignment) return;
    onCreateAssignment({
      facilityId: facilityToSchedule.id,
      assignedInspectorId,
      scheduledDate,
      priority,
      notes: scheduleNotes
    });
    setScheduleSuccess(`تم جدولة الكشف لـ ${facilityToSchedule.name} بتاريخ ${scheduledDate}`);
    setFacilityToSchedule(null);
    setTimeout(() => setScheduleSuccess(''), 5000);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, {
        center: [33.3152, 44.3661],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | نقابة التمريض العراقية - GIS',
        maxZoom: 19
      }).addTo(map);

      leafletInstance.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      dispatchLayerRef.current = L.layerGroup().addTo(map);
      inspectorsLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletInstance.current) return;

    const points = filteredFacilities.filter(
      (f) => !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude))
    );

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map((f) => [Number(f.latitude), Number(f.longitude)] as [number, number]));
      leafletInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      return;
    }

    if (points.length === 1) {
      leafletInstance.current.setView([Number(points[0].latitude), Number(points[0].longitude)], 15);
      return;
    }

    if (selectedZoneId !== 'ALL') {
      const z = zones.find((zn) => zn.id === selectedZoneId);
      if (z && !isNaN(Number(z.centerLat)) && !isNaN(Number(z.centerLng))) {
        leafletInstance.current.setView([Number(z.centerLat), Number(z.centerLng)], 13);
        return;
      }
    }

    if (selectedProvinceId !== 'ALL') {
      const p = provinces.find((pr) => pr.id === selectedProvinceId);
      if (p && !isNaN(Number(p.centerLat)) && !isNaN(Number(p.centerLng))) {
        leafletInstance.current.setView([Number(p.centerLat), Number(p.centerLng)], p.zoomLevel || 9);
      }
    } else {
      leafletInstance.current.setView([33.0000, 43.8000], 6);
    }
  }, [selectedNeighborhood, selectedZoneId, selectedProvinceId, filteredFacilities, zones, provinces]);

  useEffect(() => {
    if (!leafletInstance.current || !dispatchLayerRef.current) return;
    dispatchLayerRef.current.clearLayers();

    if (showDispatchRoute) {
      const scoredFacilities = filteredFacilities.map((f) => ({ ...f, riskScore: calculateRiskScore(f) }));
      scoredFacilities.sort((a, b) => b.riskScore - a.riskScore);
      const top5 = scoredFacilities.slice(0, 5).filter((f) => !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude)));

      if (top5.length > 1) {
        const latlngs = top5.map((f) => [Number(f.latitude), Number(f.longitude)] as L.LatLngExpression);
        const routeLine = L.polyline(latlngs, {
          color: '#ef4444',
          weight: 4,
          dashArray: '10, 10',
          opacity: 0.8
        });
        routeLine.addTo(dispatchLayerRef.current);
        leafletInstance.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        top5.forEach((f, idx) => {
          const iconHtml = `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-red-500 text-white flex items-center justify-center font-bold text-[10px] shadow-lg">${idx + 1}</div>`;
          const stopIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
          L.marker([Number(f.latitude), Number(f.longitude)], { icon: stopIcon }).addTo(dispatchLayerRef.current!);
        });
      }
    }
  }, [showDispatchRoute, filteredFacilities]);

  useEffect(() => {
    if (!leafletInstance.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredFacilities.forEach((facility) => {
      const facLat = Number(facility.latitude);
      const facLng = Number(facility.longitude);
      if (isNaN(facLat) || isNaN(facLng)) return;

      let pinColor = 'bg-emerald-600 border-emerald-400';
      if (facility.inspectionStatus === 'VIOLATION_RECORDED' || facility.licenseStatus === 'UNLICENSED') {
        pinColor = 'bg-red-600 border-red-300 animate-pulse';
      } else if (facility.licenseStatus === 'EXPIRED' || facility.inspectionStatus === 'NEEDS_INSPECTION') {
        pinColor = 'bg-amber-500 border-amber-300';
      }

      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${pinColor} text-white flex items-center justify-center font-bold text-xs border-2 shadow-lg hover:scale-110 transition-transform">
            ${facilityTypeEmoji(facility.type)}
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${pinColor} rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-gis-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([facLat, facLng], { icon: customIcon });

      marker.on('click', () => {
        setActivePopupFacility(facility);
        if (leafletInstance.current) {
          leafletInstance.current.panTo([facLat, facLng]);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredFacilities]);

  useEffect(() => {
    if (!leafletInstance.current || !inspectorsLayerRef.current) return;
    inspectorsLayerRef.current.clearLayers();
    liveInspectors.forEach((loc) => {
      if (isNaN(Number(loc.latitude)) || isNaN(Number(loc.longitude))) return;
      const html = `
        <div class="relative">
          <div class="w-9 h-9 rounded-full bg-cyan-500 border-2 border-white text-slate-950 flex items-center justify-center font-black text-[10px] shadow-[0_0_16px_rgba(6,182,212,0.8)]">
            📡
          </div>
          <span class="absolute -bottom-5 right-1/2 translate-x-1/2 whitespace-nowrap text-[9px] font-black bg-cyan-950 text-cyan-100 px-1.5 py-0.5 rounded">${loc.inspectorName.split(' ').slice(-2).join(' ')}</span>
        </div>`;
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: L.divIcon({ html, className: 'live-inspector-pin', iconSize: [36, 36], iconAnchor: [18, 18] }),
        zIndexOffset: 800
      });
      marker.bindPopup(`<strong>${loc.inspectorName}</strong><br/>مفتش نشط — ${loc.provinceId || ''}`);
      inspectorsLayerRef.current?.addLayer(marker);
    });
  }, [liveInspectors]);

  const focusFacilityOnMap = (facility: Facility) => {
    setActivePopupFacility(facility);
    if (leafletInstance.current && !isNaN(Number(facility.latitude)) && !isNaN(Number(facility.longitude))) {
      leafletInstance.current.setView([Number(facility.latitude), Number(facility.longitude)], 16);
    }
  };

  return (
    <div className="space-y-4" id="gis-map-dashboard" dir="rtl">
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3" id="gis-control-panel">
        <div className="flex flex-wrap items-center justify-between gap-3" id="gis-toolbar-top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">نظام الخرائط والتحليل الجغرافي (GIS Dashboard)</h2>
              <p className="text-xs text-slate-400">
                اختر المحافظة ثم المنطقة ثم الحي لعرض العيادات التمريضية وجدولة الكشف مباشرة من الخريطة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" id="gis-counter-badges">
            <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg">
              المعروض الآن: {filteredFacilities.length} منشأة
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg font-semibold">
              مرخصة: {facilities.filter((f) => f.licenseStatus === 'LICENSED').length}
            </span>
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-lg font-semibold">
              مفتشون أحياء: {liveInspectors.length}
            </span>
          </div>
        </div>

        {scheduleSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl px-3 py-2">
            <CheckCircle className="w-4 h-4" />
            {scheduleSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800 text-xs" id="gis-filters-row">
          <div>
            <label className="text-slate-400 font-medium block mb-1">1) المحافظة:</label>
            <select
              id="filter-province-select"
              value={selectedProvinceId}
              onChange={(e) => {
                setSelectedProvinceId(e.target.value);
                setSelectedZoneId('ALL');
                setSelectedNeighborhood('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع المحافظات الـ 15</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">2) المنطقة / القطاع:</label>
            <select
              id="filter-zone-select"
              value={selectedZoneId}
              onChange={(e) => {
                setSelectedZoneId(e.target.value);
                setSelectedNeighborhood('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع مناطق المحافظة</option>
              {availableZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-amber-400 font-bold block mb-1">3) الحي / المحلة:</label>
            <select
              id="filter-neighborhood-select"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/60 text-amber-200 font-semibold rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع أحياء المنطقة ({availableNeighborhoods.length})</option>
              {availableNeighborhoods.map((nh) => (
                <option key={nh} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">نوع المنشأة:</label>
            <select
              id="filter-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع المنشآت</option>
              <option value="CLINIC">عيادة تمريضية / ضماد</option>
              <option value="MIDWIFE_CLINIC">عيادة قابلات</option>
              <option value="HOSPITAL">مستشفى أهلي</option>
              <option value="NURSING_CENTER">مركز رعاية تمريضية</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">حالة الترخيص والتفتيش:</label>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="LICENSED">مرخصة رسمياً</option>
              <option value="PENDING">قيد الترخيص</option>
              <option value="EXPIRED">ترخيص منتهي</option>
              <option value="UNLICENSED">غير مرخصة (مخالفة)</option>
              <option value="NEEDS_INSPECTION">تتطلب كشف ميداني</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">بحث سريع بالخريطة:</label>
            <div className="relative">
              <input
                id="filter-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اسم العيادة، رقم الإجازة، الحي..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pr-8 pl-3 p-2 text-xs focus:border-amber-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" id="gis-map-and-list">
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[500px] xl:col-span-2" id="leaflet-map-wrapper">
          <div ref={mapRef} className="w-full h-[560px] z-10" id="leaflet-map-instance" />

          <button
            onClick={() => setShowDispatchRoute(!showDispatchRoute)}
            className={`absolute top-4 right-4 z-20 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border transition ${showDispatchRoute ? 'bg-amber-500 text-slate-900 border-amber-600' : 'bg-slate-900 text-slate-100 border-slate-700'}`}
          >
            <Navigation className="w-4 h-4" />
            <span>{showDispatchRoute ? 'إخفاء مسار التوجيه الذكي' : 'إنشاء مسار التوجيه الذكي (أعلى 5 مخاطرة)'}</span>
          </button>

          {onAddFacilityModalOpen && (
            <button
              id="gis-add-facility-btn"
              onClick={onAddFacilityModalOpen}
              className="absolute top-4 left-4 z-20 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border border-amber-300 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منشأة جديدة بالـ GPS</span>
            </button>
          )}

          {activePopupFacility && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md text-white border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-3" id="facility-gis-modal">
              <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{facilityTypeEmoji(activePopupFacility.type)}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{activePopupFacility.name}</h3>
                    <p className="text-[11px] text-amber-400 font-mono">إجازة #: {activePopupFacility.licenseNumber}</p>
                  </div>
                </div>
                <button
                  id="close-facility-popup-btn"
                  onClick={() => setActivePopupFacility(null)}
                  className="text-slate-400 hover:text-white text-base font-bold bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 gap-2">
                  <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> الموقع:</span>
                  <span className="font-semibold text-slate-200 text-left">{activePopupFacility.neighborhood} — {activePopupFacility.addressDetail}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1"><UserIcon className="w-3.5 h-3.5 text-amber-400" /> المسؤول:</span>
                  <span className="font-semibold text-slate-200">{activePopupFacility.ownerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="gis-view-details-btn"
                  onClick={() => onSelectFacility(activePopupFacility)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>عرض الملف</span>
                </button>
                {onCreateAssignment && (
                  <button
                    id="gis-schedule-inspection-btn"
                    onClick={() => openScheduleModal(activePopupFacility)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>جدولة كشف</span>
                  </button>
                )}
              </div>
              {onDispatchNearest && (
                <button
                  type="button"
                  disabled={dispatchBusy || liveInspectors.length === 0}
                  onClick={async () => {
                    setDispatchBusy(true);
                    try {
                      await onDispatchNearest(activePopupFacility);
                      setScheduleSuccess(`تم إيفاد أقرب مفتش نشط إلى ${activePopupFacility.name}`);
                      setTimeout(() => setScheduleSuccess(''), 5000);
                    } catch (e) {
                      setScheduleSuccess(e instanceof Error ? e.message : 'تعذر الإيفاد الجغرافي');
                    } finally {
                      setDispatchBusy(false);
                    }
                  }}
                  className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black py-2 px-3 rounded-xl text-xs"
                >
                  {dispatchBusy ? 'جاري حساب أقرب مفتش…' : `إيفاد أقرب مفتش نشط (${liveInspectors.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-sm overflow-hidden flex flex-col max-h-[560px]" id="gis-area-facilities-list">
          <div className="p-4 border-b border-[var(--theme-card-border)] bg-slate-900 text-white">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              عيادات المنطقة المحددة
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {selectedProvinceName} ← {selectedZoneName} ← {selectedNeighborhoodName}
            </p>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredFacilities.length === 0 && (
              <div className="p-6 text-center text-xs text-[var(--theme-text-muted)] space-y-2">
                <p className="font-bold text-[var(--theme-text-primary)]">لا توجد عيادات في هذا النطاق</p>
                <p>غيّر الحي أو المنطقة، أو أضف منشأة جديدة بالإحداثيات.</p>
              </div>
            )}
            {filteredFacilities.map((f) => (
              <div key={f.id} className="p-3 hover:bg-amber-50/40 transition text-xs space-y-2">
                <button
                  type="button"
                  onClick={() => focusFacilityOnMap(f)}
                  className="w-full text-right"
                >
                  <p className="font-bold text-[var(--theme-text-primary)]">{f.name}</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                    {facilityTypeLabel(f.type)} — {f.neighborhood}
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold">{f.addressDetail}</p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => focusFacilityOnMap(f)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 rounded-lg text-[10px]"
                  >
                    إظهار على الخريطة
                  </button>
                  {onCreateAssignment && (
                    <button
                      type="button"
                      id={`gis-list-schedule-${f.id}`}
                      onClick={() => openScheduleModal(f)}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded-lg text-[10px]"
                    >
                      جدولة كشف
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {facilityToSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="gis-direct-schedule-modal">
          <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] my-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3">
              <h3 className="font-bold text-[var(--theme-text-primary)] text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                جدولة كشف ميداني مباشرة من الخريطة
              </h3>
              <button
                type="button"
                onClick={() => setFacilityToSchedule(null)}
                className="text-slate-400 hover:text-[var(--theme-text-primary)] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs mt-4">
              <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
                <p className="font-bold text-[var(--theme-text-primary)]">{facilityToSchedule.name}</p>
                <p className="text-[var(--theme-text-muted)] mt-1">
                  {facilityToSchedule.neighborhood} — {facilityToSchedule.addressDetail}
                </p>
              </div>

              <div>
                <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المفتش الميداني المكلف:</label>
                <select
                  id="gis-modal-inspector-select"
                  value={assignedInspectorId}
                  onChange={(e) => setAssignedInspectorId(e.target.value)}
                  className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
                  required
                >
                  {zoneInspectors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} ({ins.badgeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--theme-text-primary)] block mb-1">تاريخ الزيارة:</label>
                  <input
                    id="gis-modal-scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الأولوية:</label>
                  <select
                    id="gis-modal-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="LOW">عادية</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="HIGH">عالية</option>
                    <option value="URGENT">طارئة جداً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--theme-text-primary)] block mb-1">التوجيهات للمفتش:</label>
                <textarea
                  id="gis-modal-notes-input"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="gis-confirm-schedule-btn"
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                >
                  تأكيد جدولة الكشف
                </button>
                <button
                  type="button"
                  onClick={() => setFacilityToSchedule(null)}
                  className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-2.5 px-4 rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
              {currentUser && (
                <p className="text-[10px] text-[var(--theme-text-muted)]">الأمر سيصدر باسم: {currentUser.name}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
