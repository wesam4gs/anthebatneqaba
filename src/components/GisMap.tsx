import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility, Province, DistrictZone } from '../types';
import { calculateRiskScore } from '../utils/riskCalculator';
import { MapPin, Search, Filter, Shield, AlertTriangle, Building2, Eye, Calendar, User, Phone, CheckCircle, Navigation, Plus } from 'lucide-react';

interface GisMapProps {
  facilities: Facility[];
  provinces: Province[];
  zones: DistrictZone[];
  onSelectFacility: (facility: Facility) => void;
  onNewAssignmentRequested?: (facility: Facility) => void;
  onAddFacilityModalOpen?: () => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  facilities,
  provinces,
  zones,
  onSelectFacility,
  onNewAssignmentRequested,
  onAddFacilityModalOpen
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const dispatchLayerRef = useRef<L.LayerGroup | null>(null);
  const [showDispatchRoute, setShowDispatchRoute] = useState(false);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('iq_baghdad');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePopupFacility, setActivePopupFacility] = useState<Facility | null>(null);

  // Compute available neighborhoods dynamically
  const availableNeighborhoods = React.useMemo(() => {
    if (selectedZoneId !== 'ALL') {
      const activeZone = zones.find(z => z.id === selectedZoneId);
      return activeZone ? activeZone.neighborhoods : [];
    }
    if (selectedProvinceId !== 'ALL') {
      const provZones = zones.filter(z => z.provinceId === selectedProvinceId);
      const nSet = new Set<string>();
      provZones.forEach(z => z.neighborhoods.forEach(n => nSet.add(n)));
      facilities
        .filter(f => f.provinceId === selectedProvinceId)
        .forEach(f => nSet.add(f.neighborhood));
      return Array.from(nSet);
    }
    const nSet = new Set<string>();
    zones.forEach(z => z.neighborhoods.forEach(n => nSet.add(n)));
    facilities.forEach(f => nSet.add(f.neighborhood));
    return Array.from(nSet);
  }, [selectedProvinceId, selectedZoneId, zones, facilities]);

  // Filter facilities
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

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      // Default center: Baghdad
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
    }

    return () => {
      // Cleanup on unmount
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  // Update Map Center when Province, Zone, or Neighborhood Changes
  useEffect(() => {
    if (!leafletInstance.current) return;

    if (selectedNeighborhood !== 'ALL') {
      const match = filteredFacilities.find(f => f.neighborhood === selectedNeighborhood) ||
        facilities.find(f => f.neighborhood === selectedNeighborhood);
      if (match && !isNaN(Number(match.latitude)) && !isNaN(Number(match.longitude))) {
        leafletInstance.current.setView([Number(match.latitude), Number(match.longitude)], 14);
        return;
      }
    }

    if (selectedZoneId !== 'ALL') {
      const z = zones.find(zn => zn.id === selectedZoneId);
      if (z && !isNaN(Number(z.centerLat)) && !isNaN(Number(z.centerLng))) {
        leafletInstance.current.setView([Number(z.centerLat), Number(z.centerLng)], 13);
        return;
      }
    }

    if (selectedProvinceId !== 'ALL') {
      const p = provinces.find(pr => pr.id === selectedProvinceId);
      if (p && !isNaN(Number(p.centerLat)) && !isNaN(Number(p.centerLng))) {
        leafletInstance.current.setView([Number(p.centerLat), Number(p.centerLng)], p.zoomLevel || 9);
      }
    } else {
      leafletInstance.current.setView([33.0000, 43.8000], 6);
    }
  }, [selectedNeighborhood, selectedZoneId, selectedProvinceId, zones, provinces]);

    // Dispatch Route Effect
  useEffect(() => {
    if (!leafletInstance.current || !dispatchLayerRef.current) return;
    dispatchLayerRef.current.clearLayers();

    if (showDispatchRoute) {
        // Calculate risk scores for all filtered facilities
        const scoredFacilities = filteredFacilities.map(f => ({ ...f, riskScore: calculateRiskScore(f) }));
        // Sort descending by risk score
        scoredFacilities.sort((a, b) => b.riskScore - a.riskScore);
        
        // Take top 5 high-risk facilities
        const top5 = scoredFacilities.slice(0, 5).filter(f => !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude)));
        
        if (top5.length > 1) {
            const latlngs = top5.map(f => [Number(f.latitude), Number(f.longitude)] as L.LatLngExpression);
            
            // Draw red route line
            const routeLine = L.polyline(latlngs, {
                color: '#ef4444',
                weight: 4,
                dashArray: '10, 10',
                opacity: 0.8
            });
            routeLine.addTo(dispatchLayerRef.current);
            
            // Zoom to route
            leafletInstance.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

            // Add route stops indicators
            top5.forEach((f, idx) => {
                const iconHtml = `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-red-500 text-white flex items-center justify-center font-bold text-[10px] shadow-lg">${idx + 1}</div>`;
                const stopIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
                L.marker([Number(f.latitude), Number(f.longitude)], { icon: stopIcon }).addTo(dispatchLayerRef.current!);
            });
        }
    }
  }, [showDispatchRoute, filteredFacilities]);

  // Update Markers
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

      // Create custom divIcon for high contrast GIS visual
      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${pinColor} text-white flex items-center justify-center font-bold text-xs border-2 shadow-lg hover:scale-110 transition-transform">
            ${facility.type === 'HOSPITAL' ? '🏥' : '🩺'}
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

  return (
    <div className="space-y-4" id="gis-map-dashboard">
      {/* Top Filter & Control Toolbar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3" id="gis-control-panel">
        <div className="flex flex-wrap items-center justify-between gap-3" id="gis-toolbar-top">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">نظام الخرائط والتحليل الجغرافي (GIS Dashboard)</h2>
              <p className="text-xs text-slate-400">متابعة وتفتيش العيادات والمستشفيات الأهلية حسياً في كافة المحافظات العراقية الـ 18 والقطاعات التابعة لها</p>
            </div>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 text-xs" id="gis-counter-badges">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              مرخصة ومفتشة: {facilities.filter(f => f.licenseStatus === 'LICENSED' && f.inspectionStatus === 'INSPECTED').length}
            </span>
            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              تحتاج كشف: {facilities.filter(f => f.inspectionStatus === 'NEEDS_INSPECTION').length}
            </span>
            <span className="bg-red-950 text-red-300 border border-red-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              مخالفة / غير مرخصة: {facilities.filter(f => f.inspectionStatus === 'VIOLATION_RECORDED' || f.licenseStatus === 'UNLICENSED').length}
            </span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800 text-xs" id="gis-filters-row">
          {/* Province Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">المحافظة:</label>
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
              <option value="ALL">جميع محافظات العراق (18)</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* District Zone Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">الفرع / الزون الجغرافي:</label>
            <select
              id="filter-zone-select"
              value={selectedZoneId}
              onChange={(e) => {
                setSelectedZoneId(e.target.value);
                setSelectedNeighborhood('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع فروع المحافظة</option>
              {zones
                .filter((z) => z.provinceId === selectedProvinceId)
                .map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nameAr}
                  </option>
                ))}
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div>
            <label className="text-amber-400 font-bold block mb-1">الحي / المحلة الرسمية:</label>
            <select
              id="filter-neighborhood-select"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/60 text-amber-200 font-semibold rounded-lg p-2 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">جميع أحياء ومحلات الزون ({availableNeighborhoods.length})</option>
              {availableNeighborhoods.map((nh, idx) => (
                <option key={idx} value={nh}>
                  {nh}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Type Filter */}
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
              <option value="HOSPITAL">مستشفى أهلي</option>
              <option value="NURSING_CENTER">مركز رعاية تمريضية</option>
            </select>
          </div>

          {/* Status Filter */}
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

          {/* Search Bar */}
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

      {/* Main Map Container & Active Facility Modal overlay */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[500px]" id="leaflet-map-wrapper">
        <div ref={mapRef} className="w-full h-[520px] z-10" id="leaflet-map-instance" />

                  {/* Smart Dispatch Button */}
          <button
              onClick={() => setShowDispatchRoute(!showDispatchRoute)}
              className={`absolute top-4 right-4 z-20 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border transition ${showDispatchRoute ? 'bg-amber-500 text-slate-900 border-amber-600' : 'bg-slate-900 text-slate-100 border-slate-700'}`}
          >
              <Navigation className="w-4 h-4" />
              <span>{showDispatchRoute ? 'إخفاء مسار التوجيه الذكي' : 'إنشاء مسار التوجيه الذكي (أعلى 5 مخاطرة)'}</span>
          </button>

          {/* Floating Quick Action Button: Add Facility */}
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

        {/* Selected Facility Info Window Modal Overlay */}
        {activePopupFacility && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md text-white border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-3" id="facility-gis-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activePopupFacility.type === 'HOSPITAL' ? '🏥' : '🩺'}</span>
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
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> العنوان والحي:</span>
                <span className="font-semibold text-slate-200">{activePopupFacility.neighborhood} - {activePopupFacility.addressDetail}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5 text-amber-400" /> المدير المسؤول:</span>
                <span className="font-semibold text-slate-200">{activePopupFacility.ownerName} ({activePopupFacility.ownerPhone})</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-amber-400" /> الإحداثيات D-GPS:</span>
                <span className="font-mono text-emerald-400 text-[11px]">{activePopupFacility.latitude.toFixed(4)}, {activePopupFacility.longitude.toFixed(4)}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">حالة الترخيص:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activePopupFacility.licenseStatus === 'LICENSED' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' :
                  activePopupFacility.licenseStatus === 'EXPIRED' ? 'bg-amber-900 text-amber-300 border border-amber-700' : 'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {activePopupFacility.licenseStatus === 'LICENSED' ? 'مرخصة أصولياً' : activePopupFacility.licenseStatus === 'EXPIRED' ? 'ترخيص منتهي' : 'غير مرخصة'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                id="gis-view-details-btn"
                onClick={() => {
                  onSelectFacility(activePopupFacility);
                  setActivePopupFacility(null);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>عرض الملف الميداني</span>
              </button>

              {onNewAssignmentRequested && (
                <button
                  id="gis-schedule-inspection-btn"
                  onClick={() => {
                    onNewAssignmentRequested(activePopupFacility);
                    setActivePopupFacility(null);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تخصيص كشف ميداني</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





