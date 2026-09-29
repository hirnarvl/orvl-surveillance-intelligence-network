import { WoredaInfo, DiagnosticHubInfo } from '../types';

/**
 * HRVL Operational Catchment (36 Woredas)
 * East Hararghe (E/H): 21 Woredas
 * West Hararghe (W/H): 15 Woredas
 */
export const HARARGHE_WOREDAS: WoredaInfo[] = [
  // East Hararghe (21 Woredas)
  { id: 'eh-1', name: 'Babile', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.2312, lng: 42.3321, populationEstimate: 125000, districtCode: 'EH-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-2', name: 'Badeno', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.9045, lng: 41.6312, populationEstimate: 110000, districtCode: 'EH-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-3', name: 'Chinaksen', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.5021, lng: 42.5011, populationEstimate: 98000, districtCode: 'EH-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-4', name: 'Dadar', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.3214, lng: 41.4523, populationEstimate: 145000, districtCode: 'EH-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-5', name: 'Fedis', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.1235, lng: 42.0211, populationEstimate: 132000, districtCode: 'EH-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-6', name: 'Girawa', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.1342, lng: 41.8312, populationEstimate: 160000, districtCode: 'EH-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-7', name: 'Gola Oda', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.5812, lng: 41.6823, populationEstimate: 87000, districtCode: 'EH-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-8', name: 'Goro Gutu', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4012, lng: 41.3812, populationEstimate: 115000, districtCode: 'EH-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-9', name: 'Gursum', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.3521, lng: 42.4012, populationEstimate: 105000, districtCode: 'EH-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-10', name: 'Haramaya', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4123, lng: 42.0123, populationEstimate: 210000, districtCode: 'EH-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-11', name: 'Jarso', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.5312, lng: 42.2012, populationEstimate: 94000, districtCode: 'EH-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-12', name: 'Kersa', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4512, lng: 41.8723, populationEstimate: 135000, districtCode: 'EH-012', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-13', name: 'Kombolcha', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4312, lng: 42.1234, populationEstimate: 140000, districtCode: 'EH-013', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-14', name: 'Kurfa Chele', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.2812, lng: 41.7712, populationEstimate: 89000, districtCode: 'EH-014', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-15', name: 'Malka Balo', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.8812, lng: 41.4012, populationEstimate: 128000, districtCode: 'EH-015', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-16', name: 'Meyu Muluke', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.6212, lng: 41.9212, populationEstimate: 76000, districtCode: 'EH-016', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-17', name: 'Meta', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4212, lng: 41.5712, populationEstimate: 155000, districtCode: 'EH-017', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-18', name: 'Midega Tola', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.7312, lng: 41.8212, populationEstimate: 82000, districtCode: 'EH-018', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-19', name: 'Kumbi', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.3512, lng: 42.1512, populationEstimate: 65000, districtCode: 'EH-019', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-20', name: 'Goro Muti', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.4812, lng: 41.6212, populationEstimate: 91000, districtCode: 'EH-020', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'eh-21', name: 'Makanisa Oromoo', zone: 'E/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.5012, lng: 41.7512, populationEstimate: 78000, districtCode: 'EH-021', admType: 'Rural Woreda', urbanRural: 'Rural' },

  // West Hararghe (15 Woredas)
  { id: 'wh-1', name: 'Boke', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.8312, lng: 40.8212, populationEstimate: 112000, districtCode: 'WH-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-2', name: 'Oda Bultum', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.8512, lng: 40.5212, populationEstimate: 138000, districtCode: 'WH-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-3', name: 'Chiro', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.0812, lng: 40.8712, populationEstimate: 195000, districtCode: 'WH-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-4', name: 'Daro Lebu', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.6012, lng: 40.3012, populationEstimate: 165000, districtCode: 'WH-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-5', name: 'Doba', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.2212, lng: 40.9512, populationEstimate: 122000, districtCode: 'WH-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-6', name: 'Habro', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.8212, lng: 40.5312, populationEstimate: 148000, districtCode: 'WH-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-7', name: 'Gamachis', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.9512, lng: 40.8512, populationEstimate: 129000, districtCode: 'WH-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-8', name: 'Guba Koricha', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.7812, lng: 40.1512, populationEstimate: 95000, districtCode: 'WH-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-9', name: 'Mesela', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.1712, lng: 41.1312, populationEstimate: 104000, districtCode: 'WH-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-10', name: 'Mieso', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.2312, lng: 40.7512, populationEstimate: 142000, districtCode: 'WH-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-11', name: 'Tulo', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.1812, lng: 41.0212, populationEstimate: 118000, districtCode: 'WH-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-12', name: 'Gumbi Bordode', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 9.2012, lng: 40.1012, populationEstimate: 88000, districtCode: 'WH-012', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-13', name: 'Burqa Dhintu', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.5512, lng: 40.0512, populationEstimate: 74000, districtCode: 'WH-013', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-14', name: 'Anchar', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.9212, lng: 40.1812, populationEstimate: 92000, districtCode: 'WH-014', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'wh-15', name: 'Hawwi Gudina', zone: 'W/H', region: 'Oromia', laboratoryId: 'hrvl', lat: 8.4512, lng: 40.4012, populationEstimate: 81000, districtCode: 'WH-015', admType: 'Rural Woreda', urbanRural: 'Rural' },
];

/**
 * ARVL Official 112 Master Operational Units from Official Regional Gazetteer
 * Source: Asella Regional Veterinary Laboratory Master Operational Area District List
 * 82 Rural Woredas + 23 Sub-cities + 7 Town Units = 112 Units
 */
export const ARSI_MASTER_112_WOREDAS: WoredaInfo[] = [
  { id: 'arvl-ar-001', name: 'Aminya', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.65, lng: 40.18, populationEstimate: 92000, districtCode: 'AR-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-002', name: 'Aseko', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.52, lng: 40.02, populationEstimate: 82000, districtCode: 'AR-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-003', name: 'Bale Gasegar', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.22, lng: 39.88, populationEstimate: 79000, districtCode: 'AR-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-004', name: 'Batu Dugda', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.1, lng: 39.05, populationEstimate: 114000, districtCode: 'AR-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-005', name: 'Chole', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.35, lng: 39.78, populationEstimate: 94000, districtCode: 'AR-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-006', name: 'Digelu & Tijo', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.75, lng: 39.25, populationEstimate: 152000, districtCode: 'AR-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-007', name: 'Diksis', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.05, lng: 39.62, populationEstimate: 88000, districtCode: 'AR-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-008', name: 'Dodota', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.32, lng: 39.31, populationEstimate: 120000, districtCode: 'AR-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-009', name: 'Enkelo Wabe', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.42, lng: 39.65, populationEstimate: 85000, districtCode: 'AR-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-010', name: 'Gololcha', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.2, lng: 39.95, populationEstimate: 108000, districtCode: 'AR-010', admType: 'Rural Woreda', urbanRural: 'Rural', hasDuplicateName: true },
  { id: 'arvl-ar-011', name: 'Guna', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.8, lng: 39.85, populationEstimate: 96000, districtCode: 'AR-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-012', name: 'Hetosa', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.13, lng: 39.23, populationEstimate: 142000, districtCode: 'AR-012', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-013', name: 'Jeju', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.4, lng: 39.6, populationEstimate: 118000, districtCode: 'AR-013', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-014', name: 'Limuna Bilbilo', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.52, lng: 39.26, populationEstimate: 178000, districtCode: 'AR-014', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-015', name: 'Lude Hitosa', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.08, lng: 39.4, populationEstimate: 105000, districtCode: 'AR-015', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-016', name: 'Merti', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.6, lng: 39.85, populationEstimate: 110000, districtCode: 'AR-016', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-017', name: 'Munesa', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.62, lng: 38.92, populationEstimate: 168000, districtCode: 'AR-017', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-018', name: 'Robe', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.88, lng: 39.62, populationEstimate: 165000, districtCode: 'AR-018', admType: 'Rural Woreda', urbanRural: 'Rural', hasDuplicateName: true },
  { id: 'arvl-ar-019', name: 'Seru', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.68, lng: 40.2, populationEstimate: 68000, districtCode: 'AR-019', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-020', name: 'Sire', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.45, lng: 39.48, populationEstimate: 98000, districtCode: 'AR-020', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-021', name: 'Shirka', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.55, lng: 39.5, populationEstimate: 138000, districtCode: 'AR-021', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-022', name: 'Sude', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.25, lng: 39.68, populationEstimate: 86000, districtCode: 'AR-022', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-023', name: 'Tena', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.82, lng: 39.8, populationEstimate: 92000, districtCode: 'AR-023', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-024', name: 'Tiyo', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.95, lng: 39.12, populationEstimate: 135000, districtCode: 'AR-024', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ar-025', name: 'Ziway Dugda', zone: 'Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 8.05, lng: 38.9, populationEstimate: 125000, districtCode: 'AR-025', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-001', name: 'Adaba', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.0, lng: 39.38, populationEstimate: 145000, districtCode: 'WA-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-002', name: 'Negele Arsi', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.35, lng: 38.7, populationEstimate: 175000, districtCode: 'WA-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-003', name: 'Dodola', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 6.98, lng: 39.18, populationEstimate: 160000, districtCode: 'WA-003', admType: 'Rural Woreda', urbanRural: 'Rural', hasDuplicateName: true },
  { id: 'arvl-wa-004', name: 'Gedeb Hasasa', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.1, lng: 39.18, populationEstimate: 155000, districtCode: 'WA-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-005', name: 'Kofele', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.05, lng: 38.8, populationEstimate: 160000, districtCode: 'WA-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-006', name: 'Kokosa', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 6.8, lng: 38.75, populationEstimate: 130000, districtCode: 'WA-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-007', name: 'Qore', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.25, lng: 38.45, populationEstimate: 115000, districtCode: 'WA-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-008', name: 'Nannawa Shashamene', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.2, lng: 38.6, populationEstimate: 190000, districtCode: 'WA-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-009', name: 'Nensebo', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 6.85, lng: 39.45, populationEstimate: 105000, districtCode: 'WA-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-010', name: 'Seraro', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.32, lng: 38.3, populationEstimate: 140000, districtCode: 'WA-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-011', name: 'Shala', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.45, lng: 38.52, populationEstimate: 135000, districtCode: 'WA-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-012', name: 'Heban Arsi', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 7.28, lng: 38.65, populationEstimate: 122000, districtCode: 'WA-012', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-wa-013', name: 'Wondo', zone: 'West Arsi', region: 'Oromia', laboratoryId: 'arvl', lat: 6.6, lng: 38.58, populationEstimate: 98000, districtCode: 'WA-013', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-001', name: 'Agarfa', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.28, lng: 39.82, populationEstimate: 105000, districtCode: 'BA-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-002', name: 'Berbere', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.8, lng: 40.05, populationEstimate: 88000, districtCode: 'BA-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-003', name: 'Dinsho', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.1, lng: 39.78, populationEstimate: 72000, districtCode: 'BA-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-004', name: 'Gasera', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.35, lng: 40.2, populationEstimate: 84000, districtCode: 'BA-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-005', name: 'Goba', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.01, lng: 39.98, populationEstimate: 148000, districtCode: 'BA-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-006', name: 'Goro', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.95, lng: 40.5, populationEstimate: 95000, districtCode: 'BA-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-007', name: 'Guradamole', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.45, lng: 40.85, populationEstimate: 62000, districtCode: 'BA-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-008', name: 'Harena Buluk', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.4, lng: 39.75, populationEstimate: 78000, districtCode: 'BA-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-009', name: 'Meda Welabu', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.25, lng: 39.5, populationEstimate: 89000, districtCode: 'BA-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ba-010', name: 'Sinana', zone: 'Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.08, lng: 40.18, populationEstimate: 155000, districtCode: 'BA-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-001', name: 'Sawena', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.45, lng: 41.25, populationEstimate: 68000, districtCode: 'EB-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-002', name: 'Rayitu', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.75, lng: 41.4, populationEstimate: 54000, districtCode: 'EB-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-003', name: 'Lega Hida', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.55, lng: 41.6, populationEstimate: 62000, districtCode: 'EB-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-004', name: 'Gindhir', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.15, lng: 40.7, populationEstimate: 130000, districtCode: 'EB-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-005', name: 'Dawe Qachan', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.9, lng: 41.15, populationEstimate: 59000, districtCode: 'EB-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-006', name: 'Dawe Serar', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 6.7, lng: 40.9, populationEstimate: 56000, districtCode: 'EB-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-eb-007', name: 'Gololcha', zone: 'East Bale', region: 'Oromia', laboratoryId: 'arvl', lat: 7.7, lng: 40.8, populationEstimate: 71000, districtCode: 'EB-007', admType: 'Rural Woreda', urbanRural: 'Rural', hasDuplicateName: true },
  { id: 'arvl-es-001', name: 'Ada’a', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.78, lng: 38.98, populationEstimate: 165000, districtCode: 'ES-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-002', name: 'Adama Zuria', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.55, lng: 39.27, populationEstimate: 185000, districtCode: 'ES-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-003', name: 'Adami Tullu & Jido Kombolcha', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 7.85, lng: 38.7, populationEstimate: 152000, districtCode: 'ES-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-004', name: 'Bora', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.28, lng: 38.88, populationEstimate: 95000, districtCode: 'ES-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-005', name: 'Boset', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.65, lng: 39.55, populationEstimate: 142000, districtCode: 'ES-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-006', name: 'Dugda', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.15, lng: 38.75, populationEstimate: 138000, districtCode: 'ES-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-007', name: 'Fentale', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.95, lng: 39.92, populationEstimate: 92000, districtCode: 'ES-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-008', name: 'Gimbichu', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.02, lng: 39.15, populationEstimate: 115000, districtCode: 'ES-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-009', name: 'Liben', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.58, lng: 39.02, populationEstimate: 108000, districtCode: 'ES-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-010', name: 'Lume', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 8.68, lng: 39.18, populationEstimate: 148000, districtCode: 'ES-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-es-011', name: 'Ziway/Batu Rural', zone: 'East Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 7.92, lng: 38.72, populationEstimate: 102000, districtCode: 'ES-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-001', name: 'Abichu & Gnaa', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.5, lng: 39.15, populationEstimate: 88000, districtCode: 'NS-001', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-002', name: 'Aleltu', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.22, lng: 39.1, populationEstimate: 76000, districtCode: 'NS-002', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-003', name: 'Bereh', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.12, lng: 38.95, populationEstimate: 84000, districtCode: 'NS-003', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-004', name: 'Degem', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.8, lng: 38.65, populationEstimate: 112000, districtCode: 'NS-004', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-005', name: 'Dera', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 10.05, lng: 38.6, populationEstimate: 135000, districtCode: 'NS-005', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-006', name: 'Debre Libanos', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.72, lng: 38.85, populationEstimate: 68000, districtCode: 'NS-006', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-007', name: 'Gerar Jarso', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.65, lng: 38.7, populationEstimate: 95000, districtCode: 'NS-007', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-008', name: 'Hidabu Abote', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.95, lng: 38.45, populationEstimate: 87000, districtCode: 'NS-008', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-009', name: 'Jida', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.6, lng: 39.05, populationEstimate: 74000, districtCode: 'NS-009', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-010', name: 'Kembibit', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.42, lng: 39.22, populationEstimate: 98000, districtCode: 'NS-010', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-011', name: 'Kuyu', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.7, lng: 38.4, populationEstimate: 125000, districtCode: 'NS-011', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-012', name: 'Mulo', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.3, lng: 38.55, populationEstimate: 65000, districtCode: 'NS-012', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-013', name: 'Sululta', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.18, lng: 38.72, populationEstimate: 140000, districtCode: 'NS-013', admType: 'Rural Woreda', urbanRural: 'Rural', hasDuplicateName: true },
  { id: 'arvl-ns-014', name: 'Wara Jarso', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.9, lng: 38.3, populationEstimate: 110000, districtCode: 'NS-014', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-015', name: 'Wuchale', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.55, lng: 38.85, populationEstimate: 104000, districtCode: 'NS-015', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-ns-016', name: 'Yaya Gulele', zone: 'North Shewa', region: 'Oromia', laboratoryId: 'arvl', lat: 9.85, lng: 38.78, populationEstimate: 86000, districtCode: 'NS-016', admType: 'Rural Woreda', urbanRural: 'Rural' },
  { id: 'arvl-sh-001', name: 'Burayu', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.05, lng: 38.65, populationEstimate: 185000, districtCode: 'SH-001', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-002', name: 'Eka Tafo', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.08, lng: 38.88, populationEstimate: 145000, districtCode: 'SH-002', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-003', name: 'Furi', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.9, lng: 38.68, populationEstimate: 160000, districtCode: 'SH-003', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-004', name: 'Gefersa Guji', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.08, lng: 38.62, populationEstimate: 130000, districtCode: 'SH-004', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-005', name: 'Gelan', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.88, lng: 38.8, populationEstimate: 175000, districtCode: 'SH-005', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-006', name: 'Gelan Guda', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.85, lng: 38.82, populationEstimate: 120000, districtCode: 'SH-006', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-007', name: 'Koye', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.92, lng: 38.86, populationEstimate: 140000, districtCode: 'SH-007', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-008', name: 'Kara Gida', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.02, lng: 38.92, populationEstimate: 125000, districtCode: 'SH-008', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-009', name: 'Mana Abichu', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.2, lng: 38.78, populationEstimate: 115000, districtCode: 'SH-009', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-010', name: 'Melka Nono', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.75, lng: 38.3, populationEstimate: 95000, districtCode: 'SH-010', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-011', name: 'Sebeta', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.92, lng: 38.62, populationEstimate: 210000, districtCode: 'SH-011', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-sh-012', name: 'Sululta', zone: 'Sheger City', region: 'Oromia', laboratoryId: 'arvl', lat: 9.18, lng: 38.75, populationEstimate: 195000, districtCode: 'SH-012', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban', hasDuplicateName: true },
  { id: 'arvl-ad-001', name: 'Adama Sub-city 1', zone: 'Adama City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.54, lng: 39.26, populationEstimate: 110000, districtCode: 'AD-001', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ad-002', name: 'Adama Sub-city 2', zone: 'Adama City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.56, lng: 39.28, populationEstimate: 115000, districtCode: 'AD-002', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ad-003', name: 'Adama Sub-city 3', zone: 'Adama City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.53, lng: 39.29, populationEstimate: 105000, districtCode: 'AD-003', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ad-004', name: 'Adama Sub-city 4', zone: 'Adama City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.52, lng: 39.25, populationEstimate: 98000, districtCode: 'AD-004', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ss-001', name: 'Shashamane Sub-city 1', zone: 'Shashamane City', region: 'Oromia', laboratoryId: 'arvl', lat: 7.2, lng: 38.59, populationEstimate: 85000, districtCode: 'SS-001', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ss-002', name: 'Shashamane Sub-city 2', zone: 'Shashamane City', region: 'Oromia', laboratoryId: 'arvl', lat: 7.22, lng: 38.61, populationEstimate: 90000, districtCode: 'SS-002', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ss-003', name: 'Shashamane Sub-city 3', zone: 'Shashamane City', region: 'Oromia', laboratoryId: 'arvl', lat: 7.19, lng: 38.6, populationEstimate: 88000, districtCode: 'SS-003', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-ss-004', name: 'Shashamane Sub-city 4', zone: 'Shashamane City', region: 'Oromia', laboratoryId: 'arvl', lat: 7.21, lng: 38.58, populationEstimate: 82000, districtCode: 'SS-004', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-bi-001', name: 'Bishoftu Sub-city 1', zone: 'Bishoftu City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.75, lng: 38.97, populationEstimate: 78000, districtCode: 'BI-001', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-bi-002', name: 'Bishoftu Sub-city 2', zone: 'Bishoftu City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.76, lng: 38.99, populationEstimate: 82000, districtCode: 'BI-002', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-bi-003', name: 'Bishoftu Sub-city 3', zone: 'Bishoftu City', region: 'Oromia', laboratoryId: 'arvl', lat: 8.74, lng: 38.98, populationEstimate: 75000, districtCode: 'BI-003', admType: 'Sub-city / Woreda-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-001', name: 'Sheno', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 9.33, lng: 39.3, populationEstimate: 48000, districtCode: 'TW-001', admType: 'Town / District-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-002', name: 'Sendafa Bake', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 9.15, lng: 39.02, populationEstimate: 52000, districtCode: 'TW-002', admType: 'Town / District-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-003', name: 'Mojo', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 8.6, lng: 39.12, populationEstimate: 65000, districtCode: 'TW-003', admType: 'Town / District-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-004', name: 'Batu', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 7.93, lng: 38.72, populationEstimate: 72000, districtCode: 'TW-004', admType: 'Town / District-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-005', name: 'Asella', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 7.96, lng: 39.13, populationEstimate: 112000, districtCode: 'TW-005', admType: 'Town / District-equivalent', urbanRural: 'Urban' },
  { id: 'arvl-tw-006', name: 'Dodola', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 6.98, lng: 39.18, populationEstimate: 58000, districtCode: 'TW-006', admType: 'Town / District-equivalent', urbanRural: 'Urban', hasDuplicateName: true },
  { id: 'arvl-tw-007', name: 'Robe', zone: 'Town-level operational units', region: 'Oromia', laboratoryId: 'arvl', lat: 7.12, lng: 40.0, populationEstimate: 68000, districtCode: 'TW-007', admType: 'Town / District-equivalent', urbanRural: 'Urban', hasDuplicateName: true },
];

/**
 * ARVL Official Operational Catchment — 112 Operational Area Units
 * (82 Rural Woredas, 23 Sub-cities, 7 Towns across 6 Zones & 4 Cities)
 */
export const ARSI_WOREDAS: WoredaInfo[] = ARSI_MASTER_112_WOREDAS;

export const ARVL_OPERATIONAL_WOREDAS = ARSI_WOREDAS;

/**
 * All Authorized Woredas across both Regional Veterinary Laboratories (148 Operational Units)
 * HRVL: 36 Baseline Hararghe Woredas
 * ARVL: 112 Operational Area Units
 */
export const ALL_OPERATIONAL_WOREDAS: WoredaInfo[] = [
  ...HARARGHE_WOREDAS,
  ...ARSI_WOREDAS
];

/**
 * Authoritative Google Maps Location References
 */
export const HIRNA_LAB_COORDS: DiagnosticHubInfo = {
  id: 'hrvl-diagnostic-hub',
  type: 'diagnostic_hub',
  name: 'Hirna Regional Veterinary Laboratory',
  shortName: 'HRVL Diagnostic Hub',
  locationName: 'Hirna, West Hararghe Zone, Oromia Regional State, Ethiopia',
  operationalArea: 'West and East Hararghe Zones, Oromia Regional State, Ethiopia (36 Baseline Woredas)',
  plusCode: '64C3+GP',
  fullPlusCode: '6HX364C3+GP',
  lat: 9.221312,
  lng: 41.104313,
  zone: 'W/H',
  googleMapsCid: '15875862256016053253',
  googleMapsQuery: 'Hirna Regional Veterinary Laboratory, Hirna, Ethiopia',
  googleMapsUrl: 'https://maps.google.com/?cid=15875862256016053253',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?cid=15875862256016053253&output=embed',
  description: 'Regional Epizootiological Surveillance, Diagnostic Reference Laboratory & Molecular Pathogen Testing Center'
};

export const ASELA_LAB_COORDS: DiagnosticHubInfo = {
  id: 'arvl-diagnostic-hub',
  type: 'diagnostic_hub',
  name: 'Asela Regional Veterinary Laboratory',
  shortName: 'ARVL Diagnostic Hub',
  locationName: 'Asela, Arsi Zone, Oromia Regional State, Ethiopia',
  operationalArea: 'Arsi Catchment: 112 Master Units (82 Rural Woredas, 23 Sub-cities, 7 Towns across 6 Zones & 4 Cities)',
  plusCode: 'X44C+64',
  fullPlusCode: '6GX2X44C+64',
  lat: 7.9356,
  lng: 39.11467,
  zone: 'Arsi',
  googleMapsCid: '14839201948271049281',
  googleMapsQuery: 'Asela Regional Veterinary Laboratory, Asela, Ethiopia',
  googleMapsUrl: 'https://maps.google.com/?cid=14839201948271049281',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?cid=14839201948271049281&output=embed',
  description: 'Regional Diagnostic Center, Dairy Cattle Pathology & Serological Reference Testing Center for 112 Operational Districts'
};

export const ALL_DIAGNOSTIC_HUBS: DiagnosticHubInfo[] = [
  HIRNA_LAB_COORDS,
  ASELA_LAB_COORDS
];

export function getWoredasForLaboratory(labId: string = 'all'): WoredaInfo[] {
  if (labId === 'hrvl') {
    return HARARGHE_WOREDAS;
  }
  if (labId === 'arvl') {
    return ARSI_WOREDAS;
  }
  return ALL_OPERATIONAL_WOREDAS;
}

export function getDiagnosticHub(labId: string = 'hrvl'): DiagnosticHubInfo {
  if (labId === 'arvl') {
    return ASELA_LAB_COORDS;
  }
  return HIRNA_LAB_COORDS;
}

export function validateArvlOperationalAreaCount(): { isValid: boolean; count: number; expected: number } {
  const count = ARSI_WOREDAS.length;
  const expected = 112;
  const isValid = count === expected;
  if (!isValid) {
    console.error(`[ARVL Registry Error] Expected exactly 112 ARVL operational areas, but found ${count}.`);
  }
  return { isValid, count, expected };
}

export function validateHrvlOperationalAreaCount(): { isValid: boolean; count: number; expected: number } {
  const count = HARARGHE_WOREDAS.length;
  const expected = 36;
  const isValid = count === expected;
  if (!isValid) {
    console.error(`[HRVL Registry Error] Expected exactly 36 HRVL operational areas, but found ${count}.`);
  }
  return { isValid, count, expected };
}

// Runtime validation checks
validateArvlOperationalAreaCount();
validateHrvlOperationalAreaCount();

export { validateWoreda, isAuthorizedWoreda } from '../utils/fuzzyMatch';
export type { WoredaValidationResult } from '../utils/fuzzyMatch';
