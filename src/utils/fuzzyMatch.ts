import { HARARGHE_WOREDAS, ARSI_WOREDAS, ALL_OPERATIONAL_WOREDAS, getWoredasForLaboratory } from '../data/woredas';
import { WoredaInfo, ZoneName } from '../types';

// Map of common alternate spellings used in field reports
const SPELLING_MAP: Record<string, string> = {
  // Hararghe Woredas
  'badeno': 'Badeno',
  'bedeno': 'Badeno',
  'badano': 'Badeno',
  'haramaya': 'Haramaya',
  'haro maya': 'Haramaya',
  'haromaya': 'Haramaya',
  'deder': 'Dadar',
  'dadar': 'Dadar',
  'golo oda': 'Gola Oda',
  'gola oda': 'Gola Oda',
  'goloda': 'Gola Oda',
  'midega tola': 'Midega Tola',
  'midega': 'Midega Tola',
  'goro gutu': 'Goro Gutu',
  'gorogutu': 'Goro Gutu',
  'goro muti': 'Goro Muti',
  'goromuti': 'Goro Muti',
  'kurfa chele': 'Kurfa Chele',
  'kurfachele': 'Kurfa Chele',
  'meyu muluke': 'Meyu Muluke',
  'meyumuluke': 'Meyu Muluke',
  'malka balo': 'Malka Balo',
  'malkabalo': 'Malka Balo',
  'makanisa oromoo': 'Makanisa Oromoo',
  'makanisa': 'Makanisa Oromoo',
  'oda bultum': 'Oda Bultum',
  'odabultum': 'Oda Bultum',
  'daro lebu': 'Daro Lebu',
  'darolebu': 'Daro Lebu',
  'guba koricha': 'Guba Koricha',
  'gubakoricha': 'Guba Koricha',
  'gumbi bordode': 'Gumbi Bordode',
  'gumbibordode': 'Gumbi Bordode',
  'burqa dhintu': 'Burqa Dhintu',
  'burqadhintu': 'Burqa Dhintu',
  'hawwi gudina': 'Hawwi Gudina',
  'hawwigudina': 'Hawwi Gudina',
  'miesso': 'Mieso',
  'mieso': 'Mieso',

  // Arsi & Asela Catchment Woredas
  'tiyo': 'Tiyo',
  'assela': 'Asella',
  'asela': 'Asella',
  'asella town': 'Asella',
  'hitosa': 'Hetosa',
  'hetosa': 'Hetosa',
  'iteya': 'Hetosa',
  'dodota': 'Dodota',
  'dera': 'Dodota',
  'sire': 'Sire',
  'robe': 'Robe',
  'robe town': 'Robe',
  'robe arsi': 'Robe',
  'digelu': 'Digelu & Tijo',
  'tijo': 'Digelu & Tijo',
  'digelu and tijo': 'Digelu & Tijo',
  'digelu & tijo': 'Digelu & Tijo',
  'shirka': 'Shirka',
  'lemu': 'Limuna Bilbilo',
  'bilbilo': 'Limuna Bilbilo',
  'bekoji': 'Limuna Bilbilo',
  'lemu & bilbilo': 'Limuna Bilbilo',
  'limuna bilbilo': 'Limuna Bilbilo',
  'merti': 'Merti',
  'abomsa': 'Merti',
  'ziway dugda': 'Ziway Dugda',
  'ziwaydugda': 'Ziway Dugda',
  'ogolcho': 'Ziway Dugda',
  'batu': 'Batu',
  'batu town': 'Batu',
  'ziway': 'Batu',
  'aseko': 'Aseko',
  'cholle': 'Chole',
  'chole': 'Chole',
  'gololcha': 'Gololcha',
  'jeju': 'Jeju',
  'arboye': 'Jeju',
  'honkolo wabe': 'Enkelo Wabe',
  'enkelo wabe': 'Enkelo Wabe',
  'tena': 'Tena',
  'munessa': 'Munesa',
  'munesa': 'Munesa',
  'kersa arsi': 'Munesa',
  'seru': 'Seru',
  'adaba': 'Adaba',
  'gedeb asasa': 'Gedeb Hasasa',
  'gedeb hasasa': 'Gedeb Hasasa',
  'asasa': 'Gedeb Hasasa',
  'kofele': 'Kofele',
  'kokosa': 'Kokosa',
  'shashamene': 'Nannawa Shashamene',
  'shashamane': 'Nannawa Shashamene',
  'adami tullu': 'Adami Tullu & Jido Kombolcha',
  'adamitullu': 'Adami Tullu & Jido Kombolcha',
  'bora': 'Bora',
  'mojo': 'Mojo',
  'sendafa': 'Sendafa Bake',
  'sendafa bake': 'Sendafa Bake',
  'sheno': 'Sheno',
  'goba': 'Goba',
  'sinana': 'Sinana',
  'agarfa': 'Agarfa',
  'dinsho': 'Dinsho',
  'sebeta': 'Sebeta',
  'burayu': 'Burayu',
  'gelan': 'Gelan',
  'sululta': 'Sululta (Sub-city)',
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function matchWoreda(inputName: string, labId?: string): WoredaInfo | null {
  if (!inputName) return null;
  const clean = inputName.trim().toLowerCase();
  const searchPool = labId ? getWoredasForLaboratory(labId) : ALL_OPERATIONAL_WOREDAS;

  // 1. Direct districtCode match (e.g. "AR-001", "TW-005", "WA-002", "SW-001")
  const codeMatch = searchPool.find(w => w.districtCode?.toLowerCase() === clean);
  if (codeMatch) return codeMatch;

  // 2. Direct id match
  const idMatch = searchPool.find(w => w.id.toLowerCase() === clean);
  if (idMatch) return idMatch;

  // 3. Direct dictionary lookup
  if (SPELLING_MAP[clean]) {
    const matchedName = SPELLING_MAP[clean];
    const found = searchPool.find(w => w.name.toLowerCase() === matchedName.toLowerCase());
    if (found) return found;
  }

  // 4. Exact case-insensitive match
  const exact = searchPool.find(w => w.name.toLowerCase() === clean);
  if (exact) return exact;

  // 5. Substring match
  const sub = searchPool.find(w => clean.includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(clean));
  if (sub) return sub;

  // 6. Fuzzy Levenshtein (threshold <= 3)
  let bestMatch: WoredaInfo | null = null;
  let minDistance = 999;

  for (const woreda of searchPool) {
    const dist = levenshteinDistance(clean, woreda.name.toLowerCase());
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      bestMatch = woreda;
    }
  }

  return bestMatch;
}

export interface WoredaValidationResult {
  isValid: boolean;
  matchedWoreda: WoredaInfo | null;
  woredaName: string;
  zone: ZoneName;
  status: 'AUTHORIZED' | 'UNMATCHED_WOREDA';
  isUnmatched: boolean;
  originalInput: string;
}

/**
 * Validates any incoming woreda name against authorized operational master woredas.
 * Supports optional laboratory filtering.
 */
export function validateWoreda(woredaName: string, labId?: string): WoredaValidationResult {
  if (!woredaName || typeof woredaName !== 'string' || !woredaName.trim()) {
    return {
      isValid: false,
      matchedWoreda: null,
      woredaName: 'UNMATCHED_WOREDA',
      zone: 'E/H',
      status: 'UNMATCHED_WOREDA',
      isUnmatched: true,
      originalInput: woredaName || ''
    };
  }

  const clean = woredaName.trim();
  const matched = matchWoreda(clean, labId);

  if (matched) {
    return {
      isValid: true,
      matchedWoreda: matched,
      woredaName: matched.name,
      zone: matched.zone,
      status: 'AUTHORIZED',
      isUnmatched: false,
      originalInput: clean
    };
  }

  return {
    isValid: false,
    matchedWoreda: null,
    woredaName: 'UNMATCHED_WOREDA',
    zone: 'E/H',
    status: 'UNMATCHED_WOREDA',
    isUnmatched: true,
    originalInput: clean
  };
}

export function isAuthorizedWoreda(woredaName: string, labId?: string): boolean {
  return validateWoreda(woredaName, labId).isValid;
}

export function detectZone(woredaName: string, fallbackZone?: string, labId?: string): ZoneName {
  const validation = validateWoreda(woredaName, labId);
  if (validation.isValid) return validation.zone;
  if (fallbackZone) {
    const fz = fallbackZone.toLowerCase();
    if (fz.includes('west hararghe') || fz.includes('w/h')) return 'W/H';
    if (fz.includes('east hararghe') || fz.includes('e/h')) return 'E/H';
    if (fz.includes('west arsi')) return 'West Arsi';
    if (fz.includes('arsi')) return 'Arsi';
    if (fz.includes('east bale')) return 'East Bale';
    if (fz.includes('bale')) return 'Bale';
    if (fz.includes('north shewa')) return 'North Shewa';
    if (fz.includes('east shewa') || fz.includes('shewa')) return 'East Shewa';
    if (fz.includes('sheger')) return 'Sheger City';
    if (fz.includes('adama')) return 'Adama City';
    if (fz.includes('shashamane')) return 'Shashamane City';
    if (fz.includes('bishoftu')) return 'Bishoftu City';
  }
  return 'Arsi';
}

export interface AdnisClassificationResult {
  laboratoryId: 'hrvl' | 'arvl' | null;
  laboratoryName: string;
  woredaName: string;
  zone: ZoneName;
  region: string;
  lat: number;
  lng: number;
  isAuthorized: boolean;
  status: 'AUTHORIZED_HRVL' | 'AUTHORIZED_ARVL' | 'UNMATCHED_OPERATIONAL_AREA';
  quarantineReason?: string;
  matchedWoreda: WoredaInfo | null;
}

/**
 * Authoritative ADNIS Location Classifier:
 * Automatically classifies incoming spreadsheet records into 'hrvl' (36 woredas) or
 * 'arvl' (122 operational units) based on Region -> Zone -> Woreda mapping.
 * Any records not resolving to either operational area are flagged as 'UNMATCHED_OPERATIONAL_AREA'.
 */
export function classifyAdnisLocation(
  rawLocation: string,
  rawZone?: string,
  rawRegion?: string
): AdnisClassificationResult {
  const cleanLoc = (rawLocation || '').trim();
  const cleanZone = (rawZone || '').trim();
  const cleanRegion = (rawRegion || '').trim();

  // Check if region explicitly belongs to another non-Oromia regional state
  const isOutsideOromia = Boolean(
    cleanRegion &&
    !cleanRegion.toLowerCase().includes('oromia') &&
    !cleanRegion.toLowerCase().includes('oromya') &&
    !cleanRegion.toLowerCase().includes('oromiya')
  );

  // 1. First attempt: match against entire operational master registry (158 units: 36 HRVL + 122 ARVL)
  const validation = validateWoreda(cleanLoc);

  if (validation.isValid && validation.matchedWoreda) {
    const w = validation.matchedWoreda;
    const labId = (w.laboratoryId || (w.zone === 'E/H' || w.zone === 'W/H' ? 'hrvl' : 'arvl')) as 'hrvl' | 'arvl';
    return {
      laboratoryId: labId,
      laboratoryName: labId === 'arvl' ? 'Asela Regional Veterinary Laboratory' : 'Hirna Regional Veterinary Laboratory',
      woredaName: w.name,
      zone: w.zone,
      region: w.region || 'Oromia',
      lat: w.lat,
      lng: w.lng,
      isAuthorized: true,
      status: labId === 'arvl' ? 'AUTHORIZED_ARVL' : 'AUTHORIZED_HRVL',
      matchedWoreda: w
    };
  }

  // 2. Zone-assisted matching
  const zLower = cleanZone.toLowerCase();
  const isHarargheZone = zLower.includes('harar') || zLower.includes('e/h') || zLower.includes('w/h') || zLower === 'east' || zLower === 'west';
  const isArsiCatchmentZone = 
    zLower.includes('arsi') || 
    zLower.includes('shewa') || 
    zLower.includes('bale') || 
    zLower.includes('sheger') || 
    zLower.includes('adama') || 
    zLower.includes('bishoftu') || 
    zLower.includes('shashamane');

  if (isHarargheZone) {
    // Try matching specifically in HRVL woredas
    const hrvlMatch = matchWoreda(cleanLoc, 'hrvl');
    if (hrvlMatch) {
      return {
        laboratoryId: 'hrvl',
        laboratoryName: 'Hirna Regional Veterinary Laboratory',
        woredaName: hrvlMatch.name,
        zone: hrvlMatch.zone,
        region: hrvlMatch.region || 'Oromia',
        lat: hrvlMatch.lat,
        lng: hrvlMatch.lng,
        isAuthorized: true,
        status: 'AUTHORIZED_HRVL',
        matchedWoreda: hrvlMatch
      };
    }
    // Location cannot be verified in HRVL 36 target woredas
    return {
      laboratoryId: null,
      laboratoryName: 'Unassigned',
      woredaName: cleanLoc || 'UNMATCHED_OPERATIONAL_AREA',
      zone: detectZone(cleanLoc, cleanZone, 'hrvl'),
      region: cleanRegion || 'Oromia',
      lat: 9.221312,
      lng: 41.104313,
      isAuthorized: false,
      status: 'UNMATCHED_OPERATIONAL_AREA',
      quarantineReason: `Quarantined: Woreda location cannot be verified in HRVL 36 target woredas [UNMATCHED_OPERATIONAL_AREA] (${cleanZone} / ${cleanLoc})`,
      matchedWoreda: null
    };
  }

  if (isArsiCatchmentZone) {
    // Try matching specifically in ARVL woredas
    const arvlMatch = matchWoreda(cleanLoc, 'arvl');
    if (arvlMatch) {
      return {
        laboratoryId: 'arvl',
        laboratoryName: 'Asela Regional Veterinary Laboratory',
        woredaName: arvlMatch.name,
        zone: arvlMatch.zone,
        region: arvlMatch.region || 'Oromia',
        lat: arvlMatch.lat,
        lng: arvlMatch.lng,
        isAuthorized: true,
        status: 'AUTHORIZED_ARVL',
        matchedWoreda: arvlMatch
      };
    }
    // Location cannot be verified in ARVL 122 target woredas
    return {
      laboratoryId: null,
      laboratoryName: 'Unassigned',
      woredaName: cleanLoc || 'UNMATCHED_OPERATIONAL_AREA',
      zone: detectZone(cleanLoc, cleanZone, 'arvl'),
      region: cleanRegion || 'Oromia',
      lat: 7.9356,
      lng: 39.11467,
      isAuthorized: false,
      status: 'UNMATCHED_OPERATIONAL_AREA',
      quarantineReason: `Quarantined: Woreda location cannot be verified in ARVL 122 target woredas [UNMATCHED_OPERATIONAL_AREA] (${cleanZone} / ${cleanLoc})`,
      matchedWoreda: null
    };
  }

  // 3. Fallback: Not in HRVL or ARVL operational area, or outside Oromia
  const reason = isOutsideOromia
    ? `Excluded: Outside Oromia regional operational area [UNMATCHED_OPERATIONAL_AREA] (${cleanRegion} / ${cleanZone} / ${cleanLoc})`
    : `Quarantined: Woreda and Zone do not match HRVL (36) or ARVL (122) operational area registries [UNMATCHED_OPERATIONAL_AREA] (${cleanZone || 'Unknown Zone'} / ${cleanLoc || 'Unknown Woreda'})`;

  return {
    laboratoryId: null,
    laboratoryName: 'Unassigned',
    woredaName: cleanLoc || 'UNMATCHED_OPERATIONAL_AREA',
    zone: 'Arsi',
    region: cleanRegion || 'Oromia',
    lat: 8.5,
    lng: 39.5,
    isAuthorized: false,
    status: 'UNMATCHED_OPERATIONAL_AREA',
    quarantineReason: reason,
    matchedWoreda: null
  };
}
