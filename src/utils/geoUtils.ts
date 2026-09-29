import { WoredaInfo } from '../types';

export interface ARVLZoneConfig {
  id: string;
  name: string;
  shortName: string;
  category: 'Rural Zone' | 'Urban City' | 'Town Cluster' | 'Buffer Zone';
  strokeColor: string;
  fillColor: string;
  bgGradient: string;
  badgeTextColor: string;
  icon: string;
  layerKey: 'arvlArsiWoredas' | 'arvlWestArsiWoredas' | 'arvlBaleWoredas' | 'arvlShewaWoredas' | 'arvlUrbanCities';
  description: string;
}

export const ARVL_ZONE_CONFIGS: Record<string, ARVLZoneConfig> = {
  'Arsi': {
    id: 'arsi_zone',
    name: 'Arsi Zone',
    shortName: 'Arsi (25 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.12)',
    bgGradient: 'linear-gradient(135deg, #059669, #047857)',
    badgeTextColor: '#34d399',
    icon: '🌾',
    layerKey: 'arvlArsiWoredas',
    description: 'Central agricultural highlands covering 25 rural woredas under direct ARVL surveillance.'
  },
  'West Arsi': {
    id: 'west_arsi_zone',
    name: 'West Arsi Zone',
    shortName: 'West Arsi (13 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#14b8a6',
    fillColor: 'rgba(20, 184, 166, 0.12)',
    bgGradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    badgeTextColor: '#2dd4bf',
    icon: '🌲',
    layerKey: 'arvlWestArsiWoredas',
    description: 'Rift Valley and agro-pastoral corridor covering 13 rural woredas.'
  },
  'Bale': {
    id: 'bale_zone',
    name: 'Bale Zone',
    shortName: 'Bale (10 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#06b6d4',
    fillColor: 'rgba(6, 182, 212, 0.12)',
    bgGradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    badgeTextColor: '#22d3ee',
    icon: '🏔️',
    layerKey: 'arvlBaleWoredas',
    description: 'Highland pastoral & national park boundary covering 10 rural woredas.'
  },
  'East Bale': {
    id: 'east_bale_zone',
    name: 'East Bale Zone',
    shortName: 'East Bale (7 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.12)',
    bgGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    badgeTextColor: '#60a5fa',
    icon: '🐪',
    layerKey: 'arvlBaleWoredas',
    description: 'Lowland pastoral rangelands covering 7 rural woredas.'
  },
  'East Shewa': {
    id: 'east_shewa_zone',
    name: 'East Shewa Zone',
    shortName: 'East Shewa (11 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.12)',
    bgGradient: 'linear-gradient(135deg, #d97706, #b45309)',
    badgeTextColor: '#fbbf24',
    icon: '🚜',
    layerKey: 'arvlShewaWoredas',
    description: 'Major transit and trade corridor covering 11 rural woredas.'
  },
  'North Shewa': {
    id: 'north_shewa_zone',
    name: 'North Shewa Zone',
    shortName: 'North Shewa (16 Woredas)',
    category: 'Rural Zone',
    strokeColor: '#6366f1',
    fillColor: 'rgba(99, 102, 241, 0.12)',
    bgGradient: 'linear-gradient(135deg, #4f46e5, #4338ca)',
    badgeTextColor: '#818cf8',
    icon: '⛰️',
    layerKey: 'arvlShewaWoredas',
    description: 'Northern highland plateaus covering 16 rural woredas.'
  },
  'Sheger City': {
    id: 'sheger_city',
    name: 'Sheger City',
    shortName: 'Sheger City (12 Sub-cities)',
    category: 'Urban City',
    strokeColor: '#a855f7',
    fillColor: 'rgba(168, 85, 247, 0.14)',
    bgGradient: 'linear-gradient(135deg, #9333ea, #7e22ce)',
    badgeTextColor: '#c084fc',
    icon: '🏢',
    layerKey: 'arvlUrbanCities',
    description: 'Metropolitan peri-urban ring encompassing 12 administrative sub-cities.'
  },
  'Adama City': {
    id: 'adama_city',
    name: 'Adama City',
    shortName: 'Adama City (4 Sub-cities)',
    category: 'Urban City',
    strokeColor: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.14)',
    bgGradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    badgeTextColor: '#a78bfa',
    icon: '🏙️',
    layerKey: 'arvlUrbanCities',
    description: 'Major regional urban hub consisting of 4 administrative sub-cities.'
  },
  'Shashamane City': {
    id: 'shashamane_city',
    name: 'Shashamane City',
    shortName: 'Shashamane City (4 Sub-cities)',
    category: 'Urban City',
    strokeColor: '#d946ef',
    fillColor: 'rgba(217, 70, 239, 0.14)',
    bgGradient: 'linear-gradient(135deg, #c026d3, #a21caf)',
    badgeTextColor: '#e879f9',
    icon: '🚦',
    layerKey: 'arvlUrbanCities',
    description: 'Key southern trade crossroads consisting of 4 administrative sub-cities.'
  },
  'Bishoftu City': {
    id: 'bishoftu_city',
    name: 'Bishoftu City',
    shortName: 'Bishoftu City (3 Sub-cities)',
    category: 'Urban City',
    strokeColor: '#ec4899',
    fillColor: 'rgba(236, 72, 153, 0.14)',
    bgGradient: 'linear-gradient(135deg, #db2777, #be185d)',
    badgeTextColor: '#f472b6',
    icon: '🧪',
    layerKey: 'arvlUrbanCities',
    description: 'Veterinary research and poultry production center consisting of 3 sub-cities.'
  },
  'Town-level operational units': {
    id: 'town_units',
    name: 'Town Administrative Units',
    shortName: 'Towns (7 Urban Units)',
    category: 'Town Cluster',
    strokeColor: '#f97316',
    fillColor: 'rgba(249, 115, 22, 0.12)',
    bgGradient: 'linear-gradient(135deg, #ea580c, #c2410c)',
    badgeTextColor: '#fb923c',
    icon: '🏘️',
    layerKey: 'arvlUrbanCities',
    description: 'Key urban municipality and town veterinary surveillance posts (Asella, Batu, Mojo, Sendafa, Sheno, Robe, Dodola).'
  }
};

/**
 * 2D Convex Hull (Monotone Chain algorithm) with optional outward expansion
 * Takes a list of [lat, lng] coordinates and returns a convex polygon boundary [lat, lng][]
 */
export function computeConvexHullWithBuffer(
  points: [number, number][],
  bufferOffsetDegrees: number = 0.08
): [number, number][] {
  if (!points || points.length === 0) return [];
  if (points.length === 1) {
    const [lat, lng] = points[0];
    const d = bufferOffsetDegrees;
    return [
      [lat + d, lng],
      [lat, lng + d],
      [lat - d, lng],
      [lat, lng - d]
    ];
  }
  if (points.length === 2) {
    const [p1, p2] = points;
    const d = bufferOffsetDegrees;
    return [
      [p1[0] + d, p1[1] - d],
      [p2[0] + d, p2[1] + d],
      [p2[0] - d, p2[1] + d],
      [p1[0] - d, p1[1] - d]
    ];
  }

  // Calculate centroid
  let sumLat = 0;
  let sumLng = 0;
  for (const pt of points) {
    sumLat += pt[0];
    sumLng += pt[1];
  }
  const centroidLat = sumLat / points.length;
  const centroidLng = sumLng / points.length;

  // Convert to [x, y] = [lng, lat]
  const pts = points.map(p => ({ x: p[1], y: p[0] }));

  // Sort by x, then y
  pts.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  };

  // Build lower hull
  const lower: { x: number; y: number }[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build upper hull
  const upper: { x: number; y: number }[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove last point of each list because it's repeated
  lower.pop();
  upper.pop();

  const hull = lower.concat(upper);

  // Expand hull outward from centroid to give a nice territory buffer
  const expandedHull: [number, number][] = hull.map(p => {
    const lat = p.y;
    const lng = p.x;
    const vLat = lat - centroidLat;
    const vLng = lng - centroidLng;
    const len = Math.sqrt(vLat * vLat + vLng * vLng) || 1;
    const normLat = vLat / len;
    const normLng = vLng / len;

    return [
      lat + normLat * bufferOffsetDegrees,
      lng + normLng * bufferOffsetDegrees
    ];
  });

  return expandedHull;
}

/**
 * Group woredas by zone and calculate polygon hulls + metadata
 */
export interface ZoneTerritorySummary {
  zoneKey: string;
  config: ARVLZoneConfig;
  woredas: WoredaInfo[];
  totalPopulation: number;
  centroid: [number, number];
  hullPolygon: [number, number][];
}

export function buildARVLZoneTerritories(woredas: WoredaInfo[]): ZoneTerritorySummary[] {
  const groups: Record<string, WoredaInfo[]> = {};

  woredas.forEach(w => {
    const z = w.zone || 'Other';
    if (!groups[z]) groups[z] = [];
    groups[z].push(w);
  });

  const results: ZoneTerritorySummary[] = [];

  for (const [zoneKey, zoneWoredas] of Object.entries(groups)) {
    const config = ARVL_ZONE_CONFIGS[zoneKey] || {
      id: `zone_${zoneKey.toLowerCase().replace(/\s+/g, '_')}`,
      name: zoneKey,
      shortName: zoneKey,
      category: 'Rural Zone',
      strokeColor: '#64748b',
      fillColor: 'rgba(100, 116, 139, 0.12)',
      bgGradient: 'linear-gradient(135deg, #475569, #334155)',
      badgeTextColor: '#94a3b8',
      icon: '📍',
      layerKey: 'arvlArsiWoredas',
      description: `Administrative territory covering ${zoneWoredas.length} units.`
    };

    const points: [number, number][] = zoneWoredas.map(w => [w.lat, w.lng]);
    const hull = computeConvexHullWithBuffer(points, 0.09);

    let sumLat = 0;
    let sumLng = 0;
    let totalPop = 0;

    zoneWoredas.forEach(w => {
      sumLat += w.lat;
      sumLng += w.lng;
      totalPop += w.populationEstimate || 0;
    });

    const centroid: [number, number] = [
      sumLat / zoneWoredas.length,
      sumLng / zoneWoredas.length
    ];

    results.push({
      zoneKey,
      config,
      woredas: zoneWoredas,
      totalPopulation: totalPop,
      centroid,
      hullPolygon: hull
    });
  }

  return results;
}
