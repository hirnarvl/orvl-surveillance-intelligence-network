import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ARVLVaccinationRecord, VaccineDictionaryEntry, EthiopianFiscalMonthKey } from '../../types/arvlVaccination';
import { ASELA_LAB_COORDS } from '../../data/woredas';
import { MapPin, Navigation, Info, ShieldAlert } from 'lucide-react';
import { MONTH_LABELS } from '../../data/arvlVaccinationData';

interface ARVLVaccinationMapProps {
  records: ARVLVaccinationRecord[];
  dictionary: VaccineDictionaryEntry[];
  selectedTargetFilter: string;
  selectedMonthFilter: string;
  selectedQuarterFilter: string;
  onSelectDistrict: (record: ARVLVaccinationRecord) => void;
}

export const ARVLVaccinationMap: React.FC<ARVLVaccinationMapProps> = ({
  records,
  dictionary,
  selectedTargetFilter,
  selectedMonthFilter,
  selectedQuarterFilter,
  onSelectDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [ASELA_LAB_COORDS.lat || 7.956, ASELA_LAB_COORDS.lng || 39.122],
        zoom: 8,
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.85
      }).addTo(map);

      // Attribution
      L.control.attribution({ prefix: false, position: 'bottomright' })
        .addAttribution('&copy; OpenStreetMap | ARVL GIS')
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Add Asela Lab Central Hub Marker
    const labIcon = L.divIcon({
      className: 'custom-hub-icon',
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: #0f172a; 
          border: 3px solid #10b981; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          color: white;
          font-weight: 900;
          font-size: 11px;
        ">
          ARVL
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const hubMarker = L.marker([ASELA_LAB_COORDS.lat, ASELA_LAB_COORDS.lng], { icon: labIcon })
      .bindTooltip(`
        <div style="font-family: sans-serif; padding: 4px 8px;">
          <strong style="color: #0f172a; font-size: 12px;">Asela Regional Veterinary Laboratory (ARVL)</strong><br/>
          <span style="color: #64748b; font-size: 10px;">Central Diagnostic & Epidemiology Hub</span>
        </div>
      `, { direction: 'top', offset: [0, -10] });

    hubMarker.addTo(layerGroup);

    // 2. Add District Markers
    records.forEach((record) => {
      const lat = record.lat || 7.95;
      const lng = record.lng || 39.12;

      // Count scheduled months
      const activeMonths = Object.keys(record.months).filter(m => (record.months[m as EthiopianFiscalMonthKey] || []).length > 0);
      const scheduledMonthsCount = activeMonths.length;

      // Check if matches target filter
      let hasTarget = true;
      if (selectedTargetFilter && selectedTargetFilter !== 'All') {
        const allTargets = Object.values(record.months).flat();
        hasTarget = allTargets.some(t => t.toUpperCase() === selectedTargetFilter.toUpperCase());
      }

      // Check if matches month filter
      let hasMonth = true;
      if (selectedMonthFilter && selectedMonthFilter !== 'All') {
        const mKey = selectedMonthFilter.toLowerCase() as EthiopianFiscalMonthKey;
        const targetsInMonth = record.months[mKey] || [];
        hasMonth = targetsInMonth.length > 0;
        if (selectedTargetFilter && selectedTargetFilter !== 'All') {
          hasMonth = targetsInMonth.some(t => t.toUpperCase() === selectedTargetFilter.toUpperCase());
        }
      }

      // Determine styling
      let fillColor = '#10b981'; // emerald
      let radius = 7;
      let opacity = 0.9;
      let strokeColor = '#ffffff';

      if (selectedTargetFilter && selectedTargetFilter !== 'All') {
        if (hasTarget && hasMonth) {
          fillColor = '#10b981'; // active target
          radius = 10;
          strokeColor = '#064e3b';
        } else {
          fillColor = '#94a3b8'; // inactive
          radius = 5;
          opacity = 0.35;
        }
      } else {
        if (scheduledMonthsCount === 0) {
          fillColor = '#f59e0b'; // amber - no schedule
          radius = 6;
          strokeColor = '#b45309';
        } else if (scheduledMonthsCount >= 8) {
          fillColor = '#059669'; // dense activity
          radius = 9;
        } else if (scheduledMonthsCount >= 4) {
          fillColor = '#0d9488'; // teal
          radius = 7.5;
        } else {
          fillColor = '#06b6d4'; // cyan
          radius = 6;
        }
      }

      const circle = L.circleMarker([lat, lng], {
        radius,
        fillColor,
        fillOpacity: opacity,
        color: strokeColor,
        weight: 1.5
      });

      // Tooltip HTML
      const allTargets = Array.from(new Set(Object.values(record.months).flat()));
      const targetsPreview = allTargets.length > 0 
        ? allTargets.slice(0, 5).join(', ') + (allTargets.length > 5 ? ` +${allTargets.length - 5}` : '')
        : 'No scheduled targets';

      circle.bindTooltip(`
        <div style="font-family: sans-serif; min-width: 150px; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${record.district}</div>
          <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">${record.zone} Zone • ${record.region}</div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 11px;">
            <strong>${scheduledMonthsCount}/12</strong> Active Months<br/>
            <span style="color: #059669; font-weight: 700;">Targets:</span> ${targetsPreview}
          </div>
        </div>
      `, { direction: 'top', offset: [0, -6] });

      circle.on('click', () => {
        onSelectDistrict(record);
      });

      circle.addTo(layerGroup);
    });

    // Invalidate size after mounting
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [records, selectedTargetFilter, selectedMonthFilter, selectedQuarterFilter]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2 max-w-xs">
        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>ARVL Geographic Vaccination GIS</span>
          <span className="text-[10px] text-slate-400 font-mono">{records.length} Units</span>
        </div>

        {selectedTargetFilter && selectedTargetFilter !== 'All' ? (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                Scheduled for {selectedTargetFilter}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-40 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">
                Not scheduled for {selectedTargetFilter}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">High Activity (8–12 months)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Medium Activity (4–7 months)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Low Activity (1–3 months)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">No Scheduled Activity</span>
            </div>
          </div>
        )}

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          Click any district marker to inspect the full annual vaccination profile.
        </div>
      </div>
    </div>
  );
};
