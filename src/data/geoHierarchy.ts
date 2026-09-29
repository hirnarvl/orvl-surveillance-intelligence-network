import { GeoLocationExtent } from '../types/riskMap';
import { HARARGHE_WOREDAS, ARSI_WOREDAS, ALL_OPERATIONAL_WOREDAS, HIRNA_LAB_COORDS, ASELA_LAB_COORDS } from './woredas';

/**
 * Official UN / OCHA Ethiopia Administrative Boundaries (COD-AB) Reference
 * Source: Humanitarian Data Exchange (HDX) / OCHA Ethiopia COD-AB Dataset
 * Administrative Levels:
 *   Level 0: National (Ethiopia, P-Code: ET)
 *   Level 1: Region (Oromia, P-Code: ET04)
 *   Level 2: Zone / Special Administrative City (P-Codes: ET0408, ET0417, ET0411, ET0421, ET0407, ET0406, ET0420, ET0409, ET0410)
 *   Level 3: Woreda / Sub-City (P-Codes: ET040801 ... ET042012)
 */

export const COD_AB_METADATA = {
  source: 'UN OCHA / Humanitarian Data Exchange (HDX) COD-AB Ethiopia',
  datasetId: 'cb58fa1f-687d-4cac-81a7-655ab1efb2d0',
  downloadUrl: 'https://data.humdata.org/dataset/cb58fa1f-687d-4cac-81a7-655ab1efb2d0/resource/274872ef-5add-48f4-95a4-5ce162af7f3f/download/eth_admin_boundaries.shp.zip',
  version: 'v04',
  releaseDate: '2026-04-17',
  adminLevels: {
    adm0: 'National (Ethiopia)',
    adm1: 'Regional State (Oromia)',
    adm2: 'Zones & Special Administrative Cities',
    adm3: 'Woredas, Sub-cities & Municipal Units'
  }
};

export const NATIONAL_EXTENT: GeoLocationExtent = {
  id: 'ethiopia',
  name: 'Ethiopia (National Multi-RVL)',
  level: 'ethiopia',
  pcode: 'ET',
  adminLevel: 0,
  center: [8.55, 40.10],
  zoom: 6,
  bounds: [
    [3.4, 33.0],
    [14.9, 47.9]
  ]
};

export const OROMIA_EXTENT: GeoLocationExtent = {
  id: 'oromia',
  name: 'Oromia Regional State',
  level: 'oromia',
  parent: 'ethiopia',
  pcode: 'ET04',
  adminLevel: 1,
  center: [8.55, 39.27],
  zoom: 7,
  bounds: [
    [4.0, 34.1],
    [10.8, 43.0]
  ]
};

export const EAST_HARARGHE_EXTENT: GeoLocationExtent = {
  id: 'east_hararghe',
  name: 'East Hararghe Zone (21 Woredas)',
  level: 'east_hararghe',
  parent: 'oromia',
  pcode: 'ET0410',
  admCode: 'ETH-OR-EH',
  adminLevel: 2,
  center: [9.15, 41.95],
  zoom: 9,
  bounds: [
    [8.15, 41.2],
    [9.75, 42.75]
  ]
};

export const WEST_HARARGHE_EXTENT: GeoLocationExtent = {
  id: 'west_hararghe',
  name: 'West Hararghe Zone (15 Woredas)',
  level: 'west_hararghe',
  parent: 'oromia',
  pcode: 'ET0409',
  admCode: 'ETH-OR-WH',
  adminLevel: 2,
  center: [8.95, 40.65],
  zoom: 9,
  bounds: [
    [8.25, 39.85],
    [9.45, 41.35]
  ]
};

export const HARARGHE_REGIONAL_EXTENT: GeoLocationExtent = {
  id: 'hararghe_all',
  name: 'HRVL Operational Area (E/H & W/H — 36 Woredas)',
  level: 'oromia',
  parent: 'oromia',
  pcode: 'ET04-HRVL',
  adminLevel: 1,
  center: [9.15, 41.35],
  zoom: 8,
  bounds: [
    [8.2, 39.9],
    [9.75, 42.75]
  ]
};

export const ARSI_REGIONAL_EXTENT: GeoLocationExtent = {
  id: 'arsi_all',
  name: 'ARVL Operational Area (Asella Catchment — 112 Operational Area Units)',
  level: 'oromia',
  parent: 'oromia',
  pcode: 'ET04-ARVL',
  adminLevel: 1,
  center: [7.95, 39.12],
  zoom: 7,
  bounds: [
    [6.0, 37.5],
    [10.2, 42.0]
  ]
};

export const ARSI_ZONE_EXTENT: GeoLocationExtent = {
  id: 'arsi_zone',
  name: 'Arsi Zone (25 Rural Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0408',
  admCode: 'ETH-OR-AR',
  adminLevel: 2,
  center: [7.95, 39.30],
  zoom: 8,
  bounds: [
    [7.3, 38.8],
    [8.7, 40.3]
  ]
};

export const WEST_ARSI_ZONE_EXTENT: GeoLocationExtent = {
  id: 'west_arsi_zone',
  name: 'West Arsi Zone (13 Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0417',
  admCode: 'ETH-OR-WA',
  adminLevel: 2,
  center: [7.10, 38.80],
  zoom: 8,
  bounds: [
    [6.5, 38.2],
    [7.6, 39.6]
  ]
};

export const BALE_ZONE_EXTENT: GeoLocationExtent = {
  id: 'bale_zone',
  name: 'Bale Zone (10 Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0411',
  admCode: 'ETH-OR-BA',
  adminLevel: 2,
  center: [6.85, 40.05],
  zoom: 8,
  bounds: [
    [6.1, 39.3],
    [7.5, 41.0]
  ]
};

export const EAST_BALE_ZONE_EXTENT: GeoLocationExtent = {
  id: 'east_bale_zone',
  name: 'East Bale Zone (7 Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0421',
  admCode: 'ETH-OR-EB',
  adminLevel: 2,
  center: [7.15, 41.20],
  zoom: 8,
  bounds: [
    [6.6, 40.5],
    [7.8, 42.0]
  ]
};

export const EAST_SHEWA_ZONE_EXTENT: GeoLocationExtent = {
  id: 'east_shewa_zone',
  name: 'East Shewa Zone (11 Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0407',
  admCode: 'ETH-OR-ES',
  adminLevel: 2,
  center: [8.50, 39.15],
  zoom: 8,
  bounds: [
    [7.8, 38.6],
    [9.1, 40.0]
  ]
};

export const NORTH_SHEWA_ZONE_EXTENT: GeoLocationExtent = {
  id: 'north_shewa_zone',
  name: 'North Shewa Zone (16 Woredas)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0406',
  admCode: 'ETH-OR-NS',
  adminLevel: 2,
  center: [9.60, 38.75],
  zoom: 8,
  bounds: [
    [9.0, 38.2],
    [10.2, 39.6]
  ]
};

export const URBAN_CITIES_EXTENT: GeoLocationExtent = {
  id: 'urban_cities',
  name: 'Sheger & Major Cities (23 Sub-cities & 7 Towns)',
  level: 'zone',
  parent: 'arsi_all',
  pcode: 'ET0420',
  admCode: 'ETH-OR-SC',
  adminLevel: 2,
  center: [8.95, 38.78],
  zoom: 9,
  bounds: [
    [6.9, 38.4],
    [9.4, 39.4]
  ]
};

export const HRVL_HUB_EXTENT: GeoLocationExtent = {
  id: 'hrvl_hub',
  name: 'Hirna Regional Veterinary Laboratory (HRVL Hub)',
  level: 'outbreak',
  parent: 'west_hararghe',
  pcode: 'HRVL-HUB',
  adminLevel: 3,
  center: [HIRNA_LAB_COORDS.lat, HIRNA_LAB_COORDS.lng],
  zoom: 14,
};

export const ARVL_HUB_EXTENT: GeoLocationExtent = {
  id: 'arvl_hub',
  name: 'Asela Regional Veterinary Laboratory (ARVL Hub)',
  level: 'outbreak',
  parent: 'arsi_all',
  pcode: 'ARVL-HUB',
  adminLevel: 3,
  center: [ASELA_LAB_COORDS.lat, ASELA_LAB_COORDS.lng],
  zoom: 14,
};

// Generate Woreda Extents from ALL_OPERATIONAL_WOREDAS list
export const WOREDA_EXTENTS: GeoLocationExtent[] = ALL_OPERATIONAL_WOREDAS.map(w => {
  let parent = 'arsi_all';
  let zonePcode = 'ET04';
  
  if (w.zone === 'E/H') {
    parent = 'east_hararghe';
    zonePcode = 'ET0410';
  } else if (w.zone === 'W/H') {
    parent = 'west_hararghe';
    zonePcode = 'ET0409';
  } else if (w.zone === 'Arsi') {
    parent = 'arsi_zone';
    zonePcode = 'ET0408';
  } else if (w.zone === 'West Arsi') {
    parent = 'west_arsi_zone';
    zonePcode = 'ET0417';
  } else if (w.zone === 'Bale') {
    parent = 'bale_zone';
    zonePcode = 'ET0411';
  } else if (w.zone === 'East Bale') {
    parent = 'east_bale_zone';
    zonePcode = 'ET0421';
  } else if (w.zone === 'East Shewa') {
    parent = 'east_shewa_zone';
    zonePcode = 'ET0407';
  } else if (w.zone === 'North Shewa') {
    parent = 'north_shewa_zone';
    zonePcode = 'ET0406';
  } else if (w.zone.includes('City') || w.zone.includes('Town')) {
    parent = 'urban_cities';
    zonePcode = 'ET0420';
  }

  return {
    id: `woreda_${w.id}`,
    name: w.districtCode ? `${w.name} [${w.districtCode}] (${w.zone})` : `${w.name} (${w.zone})`,
    level: 'woreda',
    parent,
    pcode: w.pcode || `${zonePcode}-${w.districtCode || w.id.toUpperCase()}`,
    adminLevel: 3,
    areaSqKm: w.areaSqKm,
    center: [w.lat, w.lng],
    zoom: 11,
    bounds: [
      [w.lat - 0.15, w.lng - 0.15],
      [w.lat + 0.15, w.lng + 0.15]
    ]
  };
});

export const ALL_GEO_EXTENTS: GeoLocationExtent[] = [
  NATIONAL_EXTENT,
  OROMIA_EXTENT,
  HARARGHE_REGIONAL_EXTENT,
  ARSI_REGIONAL_EXTENT,
  EAST_HARARGHE_EXTENT,
  WEST_HARARGHE_EXTENT,
  ARSI_ZONE_EXTENT,
  WEST_ARSI_ZONE_EXTENT,
  BALE_ZONE_EXTENT,
  EAST_BALE_ZONE_EXTENT,
  EAST_SHEWA_ZONE_EXTENT,
  NORTH_SHEWA_ZONE_EXTENT,
  URBAN_CITIES_EXTENT,
  HRVL_HUB_EXTENT,
  ARVL_HUB_EXTENT,
  ...WOREDA_EXTENTS
];

export function getExtentById(id: string): GeoLocationExtent | undefined {
  return ALL_GEO_EXTENTS.find(ext => ext.id === id);
}

export function getExtentsForLaboratory(labId: string = 'all'): GeoLocationExtent[] {
  if (labId === 'hrvl') {
    return [
      HARARGHE_REGIONAL_EXTENT,
      EAST_HARARGHE_EXTENT,
      WEST_HARARGHE_EXTENT,
      HRVL_HUB_EXTENT,
      ...WOREDA_EXTENTS.filter(w => w.parent === 'east_hararghe' || w.parent === 'west_hararghe')
    ];
  }
  if (labId === 'arvl') {
    return [
      ARSI_REGIONAL_EXTENT,
      ARSI_ZONE_EXTENT,
      WEST_ARSI_ZONE_EXTENT,
      BALE_ZONE_EXTENT,
      EAST_BALE_ZONE_EXTENT,
      EAST_SHEWA_ZONE_EXTENT,
      NORTH_SHEWA_ZONE_EXTENT,
      URBAN_CITIES_EXTENT,
      ARVL_HUB_EXTENT,
      ...WOREDA_EXTENTS.filter(w => 
        w.parent === 'arsi_zone' ||
        w.parent === 'west_arsi_zone' ||
        w.parent === 'bale_zone' ||
        w.parent === 'east_bale_zone' ||
        w.parent === 'east_shewa_zone' ||
        w.parent === 'north_shewa_zone' ||
        w.parent === 'urban_cities' ||
        w.parent === 'arsi_all'
      )
    ];
  }
  return ALL_GEO_EXTENTS;
}
