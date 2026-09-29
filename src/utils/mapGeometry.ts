import { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from 'geojson';
import nationalBoundaryRaw from '../data/eth_national_boundary.json';
import oromiaRegionRaw from '../data/eth_oromia_region.json';
import codAbZonesRaw from '../data/eth_cod_ab_zones.json';
import codAbWoredasRaw from '../data/eth_cod_ab_woredas.json';

// =========================================================================
// 1. DATA TYPES & INTERFACES
// =========================================================================

export type LaboratoryRegion = 'hrvl' | 'arvl' | 'all';
export type ZoneOutlineFilter = 'all' | 'hrvl' | 'arvl' | 'none';

export interface ZoneColorDefinition {
  pcode: string;
  displayName: string;
  shortCode: string;
  laboratory: 'hrvl' | 'arvl';
  strokeColor: string;
  fillColor: string;
  bgGradient: string;
  badgeTextColor: string;
  operationalUnitsCount: number;
  category: string;
}

export interface ZoneGeometryMetadata {
  pcode: string;
  name: string;
  laboratory: 'hrvl' | 'arvl';
  areaSqKm: number;
  bbox?: [number, number, number, number];
  centroid?: [number, number];
}

// =========================================================================
// 2. AUTHORITATIVE ZONE COLOR PALETTES FOR HRVL & ARVL REGIONS
// =========================================================================

export const ZONE_COLOR_PALETTE: Record<string, ZoneColorDefinition> = {
  // HRVL Region Zones (Eastern Surveillance Catchment)
  'ET0410': {
    pcode: 'ET0410',
    displayName: 'East Hararghe Zone',
    shortCode: 'EH',
    laboratory: 'hrvl',
    strokeColor: '#0ea5e9', // Sky Blue
    fillColor: '#0284c7',
    bgGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 21,
    category: 'HRVL Eastern Zone'
  },
  'ET0409': {
    pcode: 'ET0409',
    displayName: 'West Hararghe Zone',
    shortCode: 'WH',
    laboratory: 'hrvl',
    strokeColor: '#d946ef', // Fuchsia / Magenta
    fillColor: '#c026d3',
    bgGradient: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 15,
    category: 'HRVL Western Zone'
  },

  // ARVL Region Zones & Municipalities (Central & Rift Valley Catchment)
  'ET0408': {
    pcode: 'ET0408',
    displayName: 'Arsi Zone',
    shortCode: 'AR',
    laboratory: 'arvl',
    strokeColor: '#10b981', // Emerald Green
    fillColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 25,
    category: 'ARVL Core Zone'
  },
  'ET0417': {
    pcode: 'ET0417',
    displayName: 'West Arsi Zone',
    shortCode: 'WA',
    laboratory: 'arvl',
    strokeColor: '#06b6d4', // Cyan
    fillColor: '#0891b2',
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 13,
    category: 'ARVL Rift Valley Zone'
  },
  'ET0411': {
    pcode: 'ET0411',
    displayName: 'Bale Zone',
    shortCode: 'BA',
    laboratory: 'arvl',
    strokeColor: '#3b82f6', // Royal Blue
    fillColor: '#2563eb',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 10,
    category: 'ARVL Pastoral Zone'
  },
  'ET0421': {
    pcode: 'ET0421',
    displayName: 'East Bale Zone',
    shortCode: 'EB',
    laboratory: 'arvl',
    strokeColor: '#6366f1', // Indigo
    fillColor: '#4f46e5',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 7,
    category: 'ARVL Rangeland Zone'
  },
  'ET0407': {
    pcode: 'ET0407',
    displayName: 'East Shewa Zone',
    shortCode: 'ES',
    laboratory: 'arvl',
    strokeColor: '#f59e0b', // Amber / Gold
    fillColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 11,
    category: 'ARVL Trade Corridor Zone'
  },
  'ET0406': {
    pcode: 'ET0406',
    displayName: 'North Shewa Zone',
    shortCode: 'NS',
    laboratory: 'arvl',
    strokeColor: '#84cc16', // Lime Green
    fillColor: '#65a30d',
    bgGradient: 'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 16,
    category: 'ARVL Highland Zone'
  },
  'ET0420': {
    pcode: 'ET0420',
    displayName: 'Shager City & Sub-cities',
    shortCode: 'SC',
    laboratory: 'arvl',
    strokeColor: '#a855f7', // Purple
    fillColor: '#9333ea',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    badgeTextColor: '#ffffff',
    operationalUnitsCount: 30,
    category: 'ARVL Urban & Sub-City Agglomeration'
  }
};

// =========================================================================
// 3. GEOJSON LOADERS & PARSERS
// =========================================================================

export const NATIONAL_BOUNDARY_GEOJSON: FeatureCollection = nationalBoundaryRaw as unknown as FeatureCollection;
export const OROMIA_REGION_GEOJSON: FeatureCollection = oromiaRegionRaw as unknown as FeatureCollection;
export const COD_AB_ZONES_GEOJSON: FeatureCollection = codAbZonesRaw as unknown as FeatureCollection;
export const COD_AB_WOREDAS_GEOJSON: FeatureCollection = codAbWoredasRaw as unknown as FeatureCollection;

/**
 * Filter and retrieve zone boundaries based on region/laboratory and outline filter mode.
 */
export function getFilteredZoneBoundaries(
  activeLab: LaboratoryRegion,
  outlineMode: ZoneOutlineFilter = 'all'
): FeatureCollection {
  if (outlineMode === 'none') {
    return { type: 'FeatureCollection', features: [] };
  }

  const features = (codAbZonesRaw as unknown as FeatureCollection).features.filter(feature => {
    const pcode = feature.properties?.adm2_pcode;
    const zoneDef = ZONE_COLOR_PALETTE[pcode];
    if (!zoneDef) return false;

    // 1. Respect the outlineMode toggle (All / HRVL / ARVL)
    if (outlineMode === 'hrvl' && zoneDef.laboratory !== 'hrvl') return false;
    if (outlineMode === 'arvl' && zoneDef.laboratory !== 'arvl') return false;

    // 2. If outlineMode is 'all', check the global activeLab if scoped
    if (outlineMode === 'all') {
      if (activeLab === 'hrvl' && zoneDef.laboratory !== 'hrvl') return false;
      if (activeLab === 'arvl' && zoneDef.laboratory !== 'arvl') return false;
    }

    return true;
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Retrieve HRVL-specific zone boundaries (East Hararghe & West Hararghe)
 */
export function getHRVLZoneBoundaries(): FeatureCollection {
  const features = (codAbZonesRaw as unknown as FeatureCollection).features.filter(
    f => f.properties?.adm2_pcode === 'ET0410' || f.properties?.adm2_pcode === 'ET0409'
  );
  return { type: 'FeatureCollection', features };
}

/**
 * Retrieve ARVL-specific zone boundaries (Arsi, West Arsi, Bale, East Bale, etc.)
 */
export function getARVLZoneBoundaries(): FeatureCollection {
  const hrPcodes = new Set(['ET0410', 'ET0409']);
  const features = (codAbZonesRaw as unknown as FeatureCollection).features.filter(
    f => !hrPcodes.has(f.properties?.adm2_pcode)
  );
  return { type: 'FeatureCollection', features };
}

// =========================================================================
// 4. STYLING & TOOLTIP UTILITIES
// =========================================================================

export interface LayerStyleOptions {
  weight?: number;
  opacity?: number;
  fillOpacity?: number;
  dashArray?: string;
  isHovered?: boolean;
  isSelected?: boolean;
  outlineOnly?: boolean;
  densityHeatmap?: boolean;
  cases?: number;
  className?: string;
}

/**
 * Returns dynamic Leaflet styling for a given zone boundary feature.
 */
export function getZoneBoundaryStyle(
  feature: Feature<Geometry, any>,
  options: LayerStyleOptions = {}
) {
  const pcode = feature.properties?.adm2_pcode || '';
  const def = ZONE_COLOR_PALETTE[pcode] || {
    strokeColor: feature.properties?.strokeColor || '#38bdf8',
    fillColor: feature.properties?.fillColor || '#0284c7',
  };

  const isHovered = !!options.isHovered;
  const isSelected = !!options.isSelected;
  const outlineOnly = !!options.outlineOnly;

  return {
    color: def.strokeColor,
    weight: isSelected ? 4.5 : isHovered ? 4.0 : (options.weight ?? 3.0),
    opacity: isSelected || isHovered ? 1.0 : (options.opacity ?? 0.95),
    fillColor: def.fillColor,
    fillOpacity: outlineOnly 
      ? (isSelected ? 0.20 : isHovered ? 0.08 : 0.02) 
      : (isSelected ? 0.24 : isHovered ? 0.18 : (options.fillOpacity ?? 0.08)),
    dashArray: isSelected ? undefined : isHovered ? undefined : (options.dashArray ?? '6, 3'),
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    className: 'cursor-pointer touch-manipulation',
    interactive: true,
  };
}

/**
 * Returns dynamic Leaflet styling for a given woreda boundary feature.
 */
export function getWoredaBoundaryStyle(
  feature: Feature<Geometry, any>,
  options: LayerStyleOptions = {}
) {
  const p = feature.properties || {};
  const adm2Pcode = p.adm2_pcode || '';
  const zoneDef = ZONE_COLOR_PALETTE[adm2Pcode];

  let strokeColor = zoneDef?.strokeColor || p.strokeColor || '#38bdf8';
  let fillColor = zoneDef?.fillColor || p.fillColor || '#0284c7';
  let fillOpacity = options.fillOpacity ?? 0.08;

  const cases = options.cases ?? 0;
  const isHovered = !!options.isHovered;
  const isSelected = !!options.isSelected;

  if (options.densityHeatmap && cases > 0) {
    if (cases >= 50) {
      fillColor = '#ef4444';
      strokeColor = '#dc2626';
      fillOpacity = 0.50;
    } else if (cases >= 20) {
      fillColor = '#f97316';
      strokeColor = '#ea580c';
      fillOpacity = 0.38;
    } else {
      fillColor = '#eab308';
      strokeColor = '#ca8a04';
      fillOpacity = 0.26;
    }
  }

  if (isHovered) {
    fillOpacity = Math.min(fillOpacity + 0.26, 0.70);
  }

  if (isSelected) {
    fillOpacity = Math.max(fillOpacity, 0.40);
  }

  let className = 'woreda-boundary-feature';
  if (isSelected) {
    className += ' woreda-boundary-selected';
  } else if (isHovered) {
    className += ' woreda-boundary-hover';
  }
  if (options.className) {
    className += ` ${options.className}`;
  }

  return {
    color: isSelected ? '#10b981' : isHovered ? '#ffffff' : strokeColor,
    weight: isSelected ? 3.6 : isHovered ? 3.2 : (options.weight ?? 1.5),
    opacity: isSelected || isHovered ? 1.0 : (options.opacity ?? 0.85),
    fillColor,
    fillOpacity,
    dashArray: isSelected ? '4, 2' : options.dashArray,
    className,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  };
}

/**
 * Formats a clean, high-density HTML tooltip for a woreda shapefile boundary.
 */
export function generateWoredaTooltipHtml(
  feature: Feature<Geometry, any>,
  extraInfo?: { cases?: number; admType?: string; zoneDisplayName?: string }
): string {
  const p = feature.properties || {};
  const woredaName = p.adm3_name || 'Woreda';
  const adm3Pcode = p.adm3_pcode || '';
  const adm2Pcode = p.adm2_pcode || '';
  const zoneDef = ZONE_COLOR_PALETTE[adm2Pcode];
  const zoneName = extraInfo?.zoneDisplayName || zoneDef?.displayName || p.adm2_name || 'Administrative Zone';
  const cases = extraInfo?.cases ?? 0;
  const areaSqKm = p.area_sqkm 
    ? `${Math.round(parseFloat(p.area_sqkm)).toLocaleString()} km²` 
    : undefined;

  return `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 6px 9px; min-width: 185px; line-height: 1.35;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
        <span style="font-size: 8.5px; font-weight: 800; color: ${zoneDef?.strokeColor || '#38bdf8'}; text-transform: uppercase; letter-spacing: 0.05em;">
          ${zoneName}
        </span>
        ${adm3Pcode ? `
          <span style="font-size: 8px; font-mono; font-weight: 700; background: #334155; color: #ffffff; padding: 1px 4px; border-radius: 3px;">
            ${adm3Pcode}
          </span>
        ` : ''}
      </div>
      <b style="font-size: 13px; color: #0f172a; display: block; margin-top: 1px; font-weight: 800;">
        📍 ${woredaName}
      </b>
      <div style="font-size: 10px; color: #475569; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 3px;">
        <div>Surveillance Cases: <b style="color: ${cases > 0 ? '#dc2626' : '#0369a1'};">${cases} active</b></div>
        ${areaSqKm ? `<div>Jurisdiction Area: <b style="color: #0f172a;">${areaSqKm}</b></div>` : ''}
        ${extraInfo?.admType ? `<div>Type: <b style="color: #0f172a;">${extraInfo.admType}</b></div>` : ''}
      </div>
      <div style="font-size: 9px; color: #059669; margin-top: 5px; font-weight: 700;">
        🖱️ Click to inspect details & live weather
      </div>
    </div>
  `;
}

/**
 * Formats a clean, high-density HTML tooltip for a zone shapefile boundary.
 */
export function generateZoneTooltipHtml(
  feature: Feature<Geometry, any>,
  extraInfo?: { woredaCount?: number; totalCases?: number }
): string {
  const p = feature.properties || {};
  const pcode = p.adm2_pcode || '';
  const def = ZONE_COLOR_PALETTE[pcode];
  const name = def?.displayName || p.adm2_name || 'Zone';
  const labLabel = def?.laboratory === 'hrvl' ? 'HRVL Catchment' : 'ARVL Catchment';
  const areaSqKm = p.area_sqkm 
    ? `${Math.round(parseFloat(p.area_sqkm)).toLocaleString()} km²` 
    : 'Standard Jurisdiction';
  const unitsCount = extraInfo?.woredaCount ?? def?.operationalUnitsCount ?? 0;

  return `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 7px 10px; min-width: 200px; line-height: 1.35;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
        <span style="font-size: 9px; font-weight: 800; color: ${def?.strokeColor || '#38bdf8'}; text-transform: uppercase; letter-spacing: 0.06em;">
          COD-AB Admin 2 • [${pcode}]
        </span>
        <span style="font-size: 8px; font-weight: 700; background: ${def?.fillColor || '#475569'}; color: #ffffff; padding: 1px 5px; border-radius: 4px;">
          ${def?.shortCode || 'ADM2'}
        </span>
      </div>
      <b style="font-size: 13px; color: #0f172a; display: block; margin-top: 1px; font-weight: 800;">
        ${name}
      </b>
      <div style="font-size: 10px; color: #475569; margin-top: 5px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
        <div>Catchment: <b style="color: #0f172a;">${labLabel}</b></div>
        <div>Operational Units: <b style="color: #0f172a;">${unitsCount} Woredas / Towns</b></div>
        <div>Territory Area: <b style="color: #0f172a;">${areaSqKm}</b></div>
        ${extraInfo?.totalCases !== undefined ? `<div>Active Cases: <b style="color: #dc2626;">${extraInfo.totalCases}</b></div>` : ''}
      </div>
      <div style="font-size: 9px; color: ${def?.strokeColor || '#059669'}; margin-top: 6px; font-weight: 700;">
        🖱️ Click to focus and fly to ${name}
      </div>
    </div>
  `;
}

/**
 * Formats a clean, high-contrast, responsive HTML popup displayed ONLY when a user selects a Zone polygon.
 */
export function generateZonePopupHtml(
  feature: Feature<Geometry, any>,
  extraInfo?: {
    woredaCount?: number;
    totalCases?: number;
    activeOutbreaks?: number;
    category?: string;
  }
): string {
  const p = feature.properties || {};
  const pcode = p.adm2_pcode || '';
  const def = ZONE_COLOR_PALETTE[pcode];
  const name = def?.displayName || p.adm2_name || 'Administrative Zone';
  const labLabel = def?.laboratory === 'hrvl'
    ? 'Hirna Regional Veterinary Laboratory (HRVL)'
    : 'Asela Regional Veterinary Laboratory (ARVL)';
  const areaSqKm = p.area_sqkm
    ? `${Math.round(parseFloat(p.area_sqkm)).toLocaleString()} km²`
    : 'Standard Jurisdiction';
  const unitsCount = extraInfo?.woredaCount ?? def?.operationalUnitsCount ?? 0;
  const category = extraInfo?.category || def?.category || 'Veterinary Surveillance Zone';
  const totalCases = extraInfo?.totalCases ?? 0;
  const activeAlerts = extraInfo?.activeOutbreaks ?? 0;
  const accentColor = def?.strokeColor || '#10b981';

  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2px 2px 4px 2px; min-width: 230px; max-width: 290px; color: #f8fafc;">
      <!-- Category & PCODE Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 9.5px; font-weight: 800; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${accentColor};"></span>
          ${category}
        </span>
        <span style="font-size: 8.5px; font-weight: 700; background: rgba(51, 65, 85, 0.9); color: #cbd5e1; padding: 1.5px 5px; border-radius: 4px; font-family: monospace;">
          ${pcode}
        </span>
      </div>

      <!-- ARVL Zone Name Title -->
      <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-bottom: 3px; line-height: 1.25; letter-spacing: -0.01em;">
        ${name}
      </div>

      <!-- Catchment Subtitle -->
      <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px; font-weight: 500;">
        ${labLabel}
      </div>

      <!-- Stats Grid / Relevant Zone-level Information -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 8px; padding: 7px 9px; font-size: 11px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Operational Units:</span>
          <span style="font-weight: 700; color: #f1f5f9;">${unitsCount} Woredas / Towns</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Territory Area:</span>
          <span style="font-weight: 700; color: #f1f5f9;">${areaSqKm}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8;">Surveillance:</span>
          <span style="font-weight: 700;">
            <span style="color: ${activeAlerts > 0 ? '#f87171' : '#34d399'};">${activeAlerts} Active</span>
            <span style="color: #64748b; margin: 0 3px;">•</span>
            <span style="color: #e2e8f0;">${totalCases} Cases</span>
          </span>
        </div>
      </div>

      <!-- Selection Indicator -->
      <div style="font-size: 9px; color: #64748b; display: flex; align-items: center; justify-content: space-between;">
        <span>Selected Zone Territory</span>
        <span style="color: ${accentColor}; font-weight: 700;">✓ Selected</span>
      </div>
    </div>
  `;
}

