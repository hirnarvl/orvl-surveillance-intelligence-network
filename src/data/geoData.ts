import { FeatureCollection, Feature, Geometry } from 'geojson';
import nationalBoundaryData from './eth_national_boundary.json';
import oromiaRegionData from './eth_oromia_region.json';
import codAbZonesData from './eth_cod_ab_zones.json';
import codAbWoredasData from './eth_cod_ab_woredas.json';

// =========================================================================
// 1. ETHIOPIA NATIONAL BOUNDARY (Official UN OCHA COD-AB eth_admin0.shp)
// =========================================================================
export const ETHIOPIA_NATIONAL_GEOJSON: FeatureCollection = nationalBoundaryData as unknown as FeatureCollection;

// =========================================================================
// 2. OROMIA REGIONAL STATE (Official UN OCHA COD-AB eth_admin1.shp)
// =========================================================================
export const OROMIA_REGION_GEOJSON: FeatureCollection = oromiaRegionData as unknown as FeatureCollection;

// =========================================================================
// 3. OFFICIAL COD-AB ZONE BOUNDARIES WITH DISTINCT COLOR OUTLINES (eth_admin2.shp)
// =========================================================================
export const COD_AB_ZONES_GEOJSON: FeatureCollection = codAbZonesData as unknown as FeatureCollection;

// =========================================================================
// 4. OFFICIAL COD-AB WOREDA & SUB-CITY BOUNDARIES (eth_admin3.shp)
// =========================================================================
export const COD_AB_WOREDAS_GEOJSON: FeatureCollection = codAbWoredasData as unknown as FeatureCollection;

// Backward-compatibility export
export const HARARGHE_WOREDAS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: (codAbWoredasData as unknown as FeatureCollection).features.filter(
    (f: Feature<Geometry, any>) => f.properties?.adm2_pcode === 'ET0410' || f.properties?.adm2_pcode === 'ET0409'
  )
};

/**
 * Color metadata mapping for each administrative zone (Admin 2)
 */
export const ZONE_COLOR_PALETTE: Record<string, { strokeColor: string; fillColor: string; displayName: string; zoneCode: string }> = {
  'ET0408': { strokeColor: '#10b981', fillColor: '#059669', displayName: 'Arsi Zone', zoneCode: 'AR' }, // Emerald
  'ET0417': { strokeColor: '#06b6d4', fillColor: '#0891b2', displayName: 'West Arsi Zone', zoneCode: 'WA' }, // Cyan
  'ET0411': { strokeColor: '#3b82f6', fillColor: '#2563eb', displayName: 'Bale Zone', zoneCode: 'BA' }, // Royal Blue
  'ET0421': { strokeColor: '#6366f1', fillColor: '#4f46e5', displayName: 'East Bale Zone', zoneCode: 'EB' }, // Indigo
  'ET0407': { strokeColor: '#f59e0b', fillColor: '#d97706', displayName: 'East Shewa Zone', zoneCode: 'ES' }, // Amber / Gold
  'ET0406': { strokeColor: '#84cc16', fillColor: '#65a30d', displayName: 'North Shewa Zone', zoneCode: 'NS' }, // Lime Green
  'ET0420': { strokeColor: '#a855f7', fillColor: '#9333ea', displayName: 'Shager City & Sub-cities', zoneCode: 'SC' }, // Purple
  'ET0410': { strokeColor: '#0ea5e9', fillColor: '#0284c7', displayName: 'East Hararghe Zone', zoneCode: 'EH' }, // Sky Blue
  'ET0409': { strokeColor: '#d946ef', fillColor: '#c026d3', displayName: 'West Hararghe Zone', zoneCode: 'WH' }  // Fuchsia / Magenta
};

/**
 * Get styling for a given zone feature
 */
export function getZoneFeatureStyle(pcode: string, isHovered = false) {
  const palette = ZONE_COLOR_PALETTE[pcode] || { strokeColor: '#64748b', fillColor: '#475569' };
  return {
    color: palette.strokeColor,
    weight: isHovered ? 3.5 : 2.5,
    opacity: isHovered ? 1.0 : 0.9,
    fillColor: palette.fillColor,
    fillOpacity: isHovered ? 0.22 : 0.10,
    dashArray: isHovered ? undefined : '6, 4',
  };
}
