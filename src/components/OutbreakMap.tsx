import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { toPng } from 'html-to-image';
import { 
  Compass, 
  Layers, 
  ShieldAlert, 
  MapPin, 
  Info,
  Check,
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Globe, 
  Mountain, 
  Moon, 
  Sun, 
  Search, 
  Crosshair, 
  Activity, 
  AlertTriangle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  CloudSun,
  Maximize2,
  Minimize2,
  BookOpen,
  Eye,
  EyeOff,
  Radio,
  FileSpreadsheet,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  X
} from 'lucide-react';
import { Outbreak, SurveillanceRecord, WoredaInfo, DiagnosticHubInfo } from '../types';
import { GeoLocationExtent, LiveWeatherData, MapLayerVisibilityState } from '../types/riskMap';
import { HARARGHE_WOREDAS, ARSI_WOREDAS, ALL_OPERATIONAL_WOREDAS, HIRNA_LAB_COORDS, ASELA_LAB_COORDS } from '../data/woredas';
import { LABORATORIES_REGISTRY } from '../data/laboratories';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { 
  ETHIOPIA_NATIONAL_GEOJSON, 
  OROMIA_REGION_GEOJSON, 
  HARARGHE_WOREDAS_GEOJSON,
  COD_AB_ZONES_GEOJSON,
  COD_AB_WOREDAS_GEOJSON,
  getZoneFeatureStyle
} from '../data/geoData';
import {
  ZONE_COLOR_PALETTE,
  getFilteredZoneBoundaries,
  getZoneBoundaryStyle,
  getWoredaBoundaryStyle,
  generateZoneTooltipHtml,
  generateZonePopupHtml,
  generateWoredaTooltipHtml,
  ZoneOutlineFilter,
  ZoneColorDefinition
} from '../utils/mapGeometry';
import { ALL_GEO_EXTENTS, HARARGHE_REGIONAL_EXTENT, ARSI_REGIONAL_EXTENT, NATIONAL_EXTENT, getExtentById } from '../data/geoHierarchy';
import { DISEASE_RISK_PROFILES, getDiseaseRiskProfile } from '../data/diseaseRiskProfiles';
import { fetchLiveWeather } from '../utils/weatherService';
import { loadFieldInvestigations } from '../utils/fieldToolkitStorage';
import { FieldInvestigation } from '../types/fieldToolkit';
import { useMarkerPulseRAF } from '../utils/markerPulseRAF';
import { GeoHierarchyNav } from './gis/GeoHierarchyNav';
import { LayerControlPanel } from './gis/LayerControlPanel';
import { WeatherOverlayPanel } from './gis/WeatherOverlayPanel';
import { RiskZoneDetailModal } from './gis/RiskZoneDetailModal';
import { ScientificReferencesModal } from './gis/ScientificReferencesModal';

interface OutbreakMapProps {
  outbreaks: Outbreak[];
  records: SurveillanceRecord[];
  darkMode: boolean;
  selectedZone: string;
  laboratoryId?: 'hrvl' | 'arvl' | 'all';
  isPrintMode?: boolean;
}

type BasemapType = 'satellite' | 'hybrid' | 'topo' | 'voyager' | 'dark';

export const KNOWN_DISEASES = [
  { id: 'fmd', name: 'Foot-and-Mouth (FMD)', keyword: 'foot-and-mouth', color: '#ef4444', icon: '🧬' },
  { id: 'ppr', name: 'Peste des Petits (PPR)', keyword: 'peste des petits', color: '#f97316', icon: '🐐' },
  { id: 'lsd', name: 'Lumpy Skin (LSD)', keyword: 'lumpy skin', color: '#eab308', icon: '🐄' },
  { id: 'cbpp', name: 'CBPP (Bovine Pleuro)', keyword: 'contagious bovine', color: '#3b82f6', icon: '🫁' },
  { id: 'anthrax', name: 'Anthrax (Lethal)', keyword: 'anthrax', color: '#a855f7', icon: '⚠️' },
  { id: 'newcastle', name: 'Newcastle Disease', keyword: 'newcastle', color: '#ec4899', icon: '🐔' },
];

const checkZoneIsEast = (props: any): boolean => {
  if (!props) return true;
  const rawZone = props.zone || '';
  if (rawZone === 'E/H' || rawZone === 'East Hararghe') return true;
  if (rawZone === 'W/H' || rawZone === 'West Hararghe') return false;
  if (props.id && typeof props.id === 'string' && props.id.toLowerCase().startsWith('eh')) return true;
  if (props.id && typeof props.id === 'string' && props.id.toLowerCase().startsWith('wh')) return false;
  const woredaName = props.name || props.WOREDABAME || '';
  const matched = HARARGHE_WOREDAS.find(w => w.name.toLowerCase() === woredaName.toLowerCase());
  return matched ? matched.zone === 'E/H' : true;
};

export const OutbreakMap: React.FC<OutbreakMapProps> = ({
  outbreaks,
  records,
  darkMode,
  selectedZone,
  laboratoryId,
  isPrintMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const adminLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const riskLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const surveillanceLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const weatherLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const zoneLayersByPcodeRef = useRef<Record<string, L.Layer>>({});

  // Hardware-accelerated marker pulse animation loop (requestAnimationFrame)
  useMarkerPulseRAF();

  // Layout & Fullscreen
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);

  // Navigation & Extent
  const [currentExtentId, setCurrentExtentId] = useState<string>('hararghe_all');
  const [currentZoom, setCurrentZoom] = useState<number>(8);
  const [centerCoords, setCenterCoords] = useState<[number, number]>([9.15, 41.35]);

  // Basemap
  const [basemap, setBasemap] = useState<BasemapType>(darkMode ? 'dark' : 'hybrid');

  // Layer Visibility State
  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibilityState>({
    ethiopiaBoundary: true,
    oromiaBoundary: true,
    eastHarargheWoredas: true,
    westHarargheWoredas: true,
    zonalFractureLine: true,
    arvlZoneEnvelopes: true,
    arvlArsiWoredas: true,
    arvlWestArsiWoredas: true,
    arvlBaleWoredas: true,
    arvlShewaWoredas: true,
    arvlUrbanCities: true,
    woredaFootprints: true,
    outbreaksConfirmed: true,
    outbreaksSuspected: true,
    fieldInvestigations: true,
    zeroReports: true,
    hrvlHub: true,
    diseaseRiskZones: true,
    investigationCore: true,
    surveillancePerimeter: true,
    densityHeatmap: false,
    mortalityHeatmap: false,
    weatherOverlay: true,
    windVectors: true,
    temperatureContours: false,
    precipitationGrid: false,
  });

  // Floating Panels Visibility
  const [isLayerControlOpen, setIsLayerControlOpen] = useState<boolean>(false);
  const [isWeatherPanelOpen, setIsWeatherPanelOpen] = useState<boolean>(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [zoneOutlineMode, setZoneOutlineMode] = useState<ZoneOutlineFilter>('all');
  const [isZoneLegendOpen, setIsZoneLegendOpen] = useState<boolean>(false);

  // Modals
  const [isScientificReferencesOpen, setIsScientificReferencesOpen] = useState<boolean>(false);
  const [selectedDiseaseForReferences, setSelectedDiseaseForReferences] = useState<string>('fmd');
  const [inspectedRiskOutbreak, setInspectedRiskOutbreak] = useState<Outbreak | null>(null);

  // Selected Inspect Item
  const { selectedLab: globalLab, currentLabInfo: globalLabInfo } = useLaboratory();
  const selectedLab = laboratoryId || globalLab;
  const currentLabInfo = laboratoryId ? (LABORATORIES_REGISTRY[laboratoryId] || globalLabInfo) : globalLabInfo;
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(outbreaks[0] || null);
  const [selectedWoreda, setSelectedWoreda] = useState<WoredaInfo | null>(null);
  const [isHubSelected, setIsHubSelected] = useState<boolean>(false);
  const [selectedHubInfo, setSelectedHubInfo] = useState<DiagnosticHubInfo>(
    selectedLab === 'arvl' ? ASELA_LAB_COORDS : HIRNA_LAB_COORDS
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('All');
  const [enabledDiseases, setEnabledDiseases] = useState<string[]>([]);

  // Weather Telemetry State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Field Investigations
  const [fieldInvestigations, setFieldInvestigations] = useState<FieldInvestigation[]>([]);

  useEffect(() => {
    try {
      setFieldInvestigations(loadFieldInvestigations());
    } catch {
      // fallback
    }
  }, []);

  // Fetch Weather for current focus
  const loadWeatherForCurrentFocus = async (
    lat: number = selectedLab === 'arvl' ? ASELA_LAB_COORDS.lat : HIRNA_LAB_COORDS.lat, 
    lng: number = selectedLab === 'arvl' ? ASELA_LAB_COORDS.lng : HIRNA_LAB_COORDS.lng, 
    name: string = selectedLab === 'arvl' ? 'ARVL Diagnostic Hub' : 'HRVL Diagnostic Hub'
  ) => {
    setIsWeatherLoading(true);
    try {
      const data = await fetchLiveWeather(lat, lng, name);
      setLiveWeather(data);
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    const hub = selectedLab === 'arvl' ? ASELA_LAB_COORDS : HIRNA_LAB_COORDS;
    setSelectedHubInfo(hub);
    loadWeatherForCurrentFocus(hub.lat, hub.lng, hub.shortName);

    // Pan map to appropriate regional focus
    const map = mapInstanceRef.current;
    if (map) {
      if (selectedLab === 'arvl') {
        map.flyTo([7.95, 39.12], 8, { duration: 1.2 });
        setCurrentExtentId('arsi_all');
      } else if (selectedLab === 'hrvl') {
        map.flyTo([9.15, 41.35], 8, { duration: 1.2 });
        setCurrentExtentId('hararghe_all');
      } else {
        map.flyTo([8.55, 40.10], 6.5, { duration: 1.2 });
        setCurrentExtentId('ethiopia');
      }
    }
  }, [selectedLab]);

  // Sync dark mode preference with default basemap if user hasn't overridden
  useEffect(() => {
    if (darkMode && (basemap === 'voyager' || basemap === 'topo')) {
      setBasemap('dark');
    } else if (!darkMode && basemap === 'dark') {
      setBasemap('hybrid');
    }
  }, [darkMode]);

  // Filtered outbreaks
  const filteredOutbreaks = useMemo(() => {
    return outbreaks.filter(ob => {
      if (selectedZone !== 'All' && ob.zone !== selectedZone) return false;
      if (selectedDiseaseFilter !== 'All' && !ob.disease.toLowerCase().includes(selectedDiseaseFilter.toLowerCase())) return false;
      if (enabledDiseases.length > 0) {
        const isEnabled = enabledDiseases.some(kw => ob.disease.toLowerCase().includes(kw.toLowerCase()));
        if (!isEnabled) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ob.disease.toLowerCase().includes(q) ||
          ob.woreda.toLowerCase().includes(q) ||
          ob.outbreakCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [outbreaks, selectedZone, selectedDiseaseFilter, enabledDiseases, searchQuery]);

  // Woreda Aggregations
  const woredaCaseMap = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      const wName = r.woreda.trim().toLowerCase();
      map[wName] = (map[wName] || 0) + (r.cases || 0);
    });
    outbreaks.forEach(o => {
      const wName = o.woreda.trim().toLowerCase();
      map[wName] = (map[wName] || 0) + (o.cases || 0);
    });
    return map;
  }, [records, outbreaks]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [9.15, 41.35],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      });

      mapInstanceRef.current = map;

      // Create Layer Groups
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
      adminLayerGroupRef.current = L.layerGroup().addTo(map);
      riskLayerGroupRef.current = L.layerGroup().addTo(map);
      surveillanceLayerGroupRef.current = L.layerGroup().addTo(map);
      weatherLayerGroupRef.current = L.layerGroup().addTo(map);

      // Listen to map move/zoom
      map.on('moveend zoomend', () => {
        const center = map.getCenter();
        setCenterCoords([center.lat, center.lng]);
        setCurrentZoom(map.getZoom());
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tileGroup = tileLayerGroupRef.current;
    if (!map || !tileGroup) return;

    tileGroup.clearLayers();

    let url = '';
    let maxZoom = 19;
    let subdomains: string | string[] = 'abc';

    switch (basemap) {
      case 'satellite':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        maxZoom = 19;
        break;
      case 'hybrid':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        maxZoom = 19;
        break;
      case 'topo':
        url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        maxZoom = 17;
        break;
      case 'dark':
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        subdomains = 'abcd';
        maxZoom = 19;
        break;
      case 'voyager':
      default:
        url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        subdomains = 'abcd';
        maxZoom = 19;
        break;
    }

    const baseTile = L.tileLayer(url, { maxZoom, subdomains });
    tileGroup.addLayer(baseTile);

    // If hybrid, add Carto borders/labels overlay
    if (basemap === 'hybrid') {
      const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      });
      tileGroup.addLayer(labels);
    }
  }, [basemap]);

  // Render Administrative Boundaries Layer Group
  useEffect(() => {
    const adminGroup = adminLayerGroupRef.current;
    if (!adminGroup) return;

    adminGroup.clearLayers();

    // 1. Ethiopia National Boundary
    if (layerVisibility.ethiopiaBoundary && ETHIOPIA_NATIONAL_GEOJSON) {
      const ethiopiaLayer = L.geoJSON(ETHIOPIA_NATIONAL_GEOJSON as any, {
        style: {
          color: '#10b981',
          weight: 2.2,
          opacity: 0.8,
          fillColor: '#10b981',
          fillOpacity: 0.02,
          dashArray: '4, 4',
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip('<b>🇪🇹 Ethiopia National Border</b>', { sticky: true });
        }
      });
      adminGroup.addLayer(ethiopiaLayer);
    }

    // 2. Oromia Regional Boundary
    if (layerVisibility.oromiaBoundary && OROMIA_REGION_GEOJSON) {
      const oromiaLayer = L.geoJSON(OROMIA_REGION_GEOJSON as any, {
        style: {
          color: '#f59e0b',
          weight: 2.5,
          opacity: 0.85,
          fillColor: '#f59e0b',
          fillOpacity: 0.03,
          dashArray: '6, 3',
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip('<b>Oromia Regional State</b>', { sticky: true });
        }
      });
      adminGroup.addLayer(oromiaLayer);
    }

    // 3. Interactive Woreda-Level Boundary Outlines (UN OCHA COD-AB eth_admin3.shp)
    // Covers all woredas, sub-cities and towns across both HRVL and ARVL catchments
    if (COD_AB_WOREDAS_GEOJSON) {
      const allOperationalUnits = [...HARARGHE_WOREDAS, ...ARSI_WOREDAS];

      const woredasGeoJsonLayer = L.geoJSON(COD_AB_WOREDAS_GEOJSON as any, {
        filter: (feature) => {
          const adm2Pcode = feature?.properties?.adm2_pcode || '';
          const zoneDef = ZONE_COLOR_PALETTE[adm2Pcode];
          const isHR = adm2Pcode === 'ET0410' || adm2Pcode === 'ET0409';

          // Laboratory catchment filter
          if (selectedLab === 'hrvl' && !isHR) return false;
          if (selectedLab === 'arvl' && isHR) return false;

          // Individual Zone layer toggles
          if (adm2Pcode === 'ET0410' && !layerVisibility.eastHarargheWoredas) return false;
          if (adm2Pcode === 'ET0409' && !layerVisibility.westHarargheWoredas) return false;
          if (adm2Pcode === 'ET0408' && !layerVisibility.arvlArsiWoredas) return false;
          if (adm2Pcode === 'ET0417' && !layerVisibility.arvlWestArsiWoredas) return false;
          if ((adm2Pcode === 'ET0411' || adm2Pcode === 'ET0421') && !layerVisibility.arvlBaleWoredas) return false;
          if ((adm2Pcode === 'ET0407' || adm2Pcode === 'ET0406') && !layerVisibility.arvlShewaWoredas) return false;
          if (adm2Pcode === 'ET0420' && !layerVisibility.arvlUrbanCities) return false;

          return true;
        },
        style: (feature) => {
          const wName = feature?.properties?.adm3_name || '';
          const pcode = feature?.properties?.adm3_pcode || '';
          const cases = woredaCaseMap[wName.toLowerCase()] || 0;
          const isSelected = !!selectedWoreda && (
            selectedWoreda.name.toLowerCase() === wName.toLowerCase() ||
            selectedWoreda.districtCode === pcode ||
            selectedWoreda.pcode === pcode ||
            selectedWoreda.id === pcode
          );

          return getWoredaBoundaryStyle(feature as any, {
            densityHeatmap: layerVisibility.densityHeatmap,
            cases,
            isSelected,
            weight: isSelected ? 3.5 : 1.5,
            opacity: isSelected ? 1.0 : 0.85,
            fillOpacity: isSelected ? 0.40 : cases > 0 ? 0.20 : 0.06
          });
        },
        onEachFeature: (feature, layer) => {
          const wName = feature?.properties?.adm3_name || 'Woreda';
          const adm2Pcode = feature?.properties?.adm2_pcode || '';
          const adm3Pcode = feature?.properties?.adm3_pcode || '';
          const zoneDef = ZONE_COLOR_PALETTE[adm2Pcode];
          const cases = woredaCaseMap[wName.toLowerCase()] || 0;

          // Find matching woreda in local master records
          const matchedUnit = allOperationalUnits.find(
            w => w.name.toLowerCase() === wName.toLowerCase() ||
                 wName.toLowerCase().includes(w.name.toLowerCase()) ||
                 w.name.toLowerCase().includes(wName.toLowerCase())
          );

          const tooltipHtml = generateWoredaTooltipHtml(feature as any, {
            cases,
            admType: matchedUnit?.admType || (feature?.properties?.adm3_name?.includes('Town') || feature?.properties?.adm3_name?.includes('City') ? 'Urban Municipality' : 'Rural Woreda'),
            zoneDisplayName: zoneDef?.displayName || feature?.properties?.adm2_name
          });

          layer.bindTooltip(tooltipHtml, { sticky: true, className: 'woreda-interactive-tooltip' });

          layer.on({
            mouseover: (e) => {
              const l = e.target;
              const isSelected = !!selectedWoreda && (
                selectedWoreda.name.toLowerCase() === wName.toLowerCase() ||
                selectedWoreda.districtCode === adm3Pcode ||
                selectedWoreda.pcode === adm3Pcode ||
                selectedWoreda.id === adm3Pcode
              );

              l.setStyle(getWoredaBoundaryStyle(feature as any, {
                isHovered: true,
                isSelected,
                densityHeatmap: layerVisibility.densityHeatmap,
                cases
              }));

              const pathEl = l.getElement?.() || (l as any)._path;
              if (pathEl) {
                pathEl.classList.add('woreda-boundary-hover');
              }
              l.bringToFront();
            },
            mouseout: (e) => {
              const l = e.target;
              const isSelected = !!selectedWoreda && (
                selectedWoreda.name.toLowerCase() === wName.toLowerCase() ||
                selectedWoreda.districtCode === adm3Pcode ||
                selectedWoreda.pcode === adm3Pcode ||
                selectedWoreda.id === adm3Pcode
              );

              const pathEl = l.getElement?.() || (l as any)._path;
              if (pathEl) {
                pathEl.classList.remove('woreda-boundary-hover');
              }

              if (isSelected) {
                l.setStyle(getWoredaBoundaryStyle(feature as any, {
                  isSelected: true,
                  densityHeatmap: layerVisibility.densityHeatmap,
                  cases
                }));
                if (pathEl) {
                  pathEl.classList.add('woreda-boundary-selected');
                }
              } else {
                woredasGeoJsonLayer.resetStyle(l);
              }
            },
            click: (e) => {
              const l = e.target;
              const pathEl = l.getElement?.() || (l as any)._path;
              if (pathEl) {
                pathEl.classList.add('woreda-boundary-selected');
              }

              if (matchedUnit) {
                setSelectedWoreda(matchedUnit);
                setSelectedOutbreak(null);
                setIsHubSelected(false);
                loadWeatherForCurrentFocus(matchedUnit.lat, matchedUnit.lng, `${matchedUnit.name} (${matchedUnit.zone})`);
              } else {
                // Fallback woreda object from GeoJSON center
                const bounds = e.target.getBounds();
                const center = bounds.getCenter();
                const syntheticWoreda: WoredaInfo = {
                  id: feature?.properties?.adm3_pcode || wName,
                  name: wName,
                  zone: (zoneDef?.displayName || 'Zone') as any,
                  region: 'Oromia',
                  lat: center.lat,
                  lng: center.lng,
                  populationEstimate: Math.round((parseFloat(feature?.properties?.area_sqkm || '100') * 140)) || 50000,
                  districtCode: feature?.properties?.adm3_pcode || '',
                  pcode: feature?.properties?.adm3_pcode || '',
                  admType: feature?.properties?.adm3_name?.includes('Town') || feature?.properties?.adm3_name?.includes('City') ? 'Urban Municipality' : 'Rural Woreda',
                  urbanRural: feature?.properties?.adm3_name?.includes('Town') || feature?.properties?.adm3_name?.includes('City') ? 'Urban' : 'Rural'
                };
                setSelectedWoreda(syntheticWoreda);
                setSelectedOutbreak(null);
                setIsHubSelected(false);
                loadWeatherForCurrentFocus(center.lat, center.lng, `${wName} (${zoneDef?.displayName || 'Woreda'})`);
              }

              if (mapInstanceRef.current) {
                mapInstanceRef.current.fitBounds(e.target.getBounds(), { padding: [30, 30], maxZoom: 11 });
              }
            }
          });
        }
      });

      adminGroup.addLayer(woredasGeoJsonLayer);
    }

    // 4. Real Shapefile Zone Boundaries (COD-AB Admin 2) for both HRVL and ARVL regions
    if (zoneOutlineMode !== 'none' && layerVisibility.arvlZoneEnvelopes && COD_AB_ZONES_GEOJSON) {
      zoneLayersByPcodeRef.current = {};

      const zoneGeoJsonLayer = L.geoJSON(COD_AB_ZONES_GEOJSON as any, {
        filter: (feature) => {
          const pcode = feature?.properties?.adm2_pcode;
          const zoneDef = ZONE_COLOR_PALETTE[pcode];
          if (!zoneDef) return false;

          // Check zoneOutlineMode filter
          if (zoneOutlineMode === 'hrvl' && zoneDef.laboratory !== 'hrvl') return false;
          if (zoneOutlineMode === 'arvl' && zoneDef.laboratory !== 'arvl') return false;

          // If mode is 'all', also check if user has selected a specific lab in the header
          if (zoneOutlineMode === 'all') {
            if (selectedLab === 'hrvl' && zoneDef.laboratory !== 'hrvl') return false;
            if (selectedLab === 'arvl' && zoneDef.laboratory !== 'arvl') return false;
          }

          // Specific zone layer toggles
          if (pcode === 'ET0410' && !layerVisibility.eastHarargheWoredas) return false;
          if (pcode === 'ET0409' && !layerVisibility.westHarargheWoredas) return false;
          if (pcode === 'ET0408' && !layerVisibility.arvlArsiWoredas) return false;
          if (pcode === 'ET0417' && !layerVisibility.arvlWestArsiWoredas) return false;
          if ((pcode === 'ET0411' || pcode === 'ET0421') && !layerVisibility.arvlBaleWoredas) return false;
          if ((pcode === 'ET0407' || pcode === 'ET0406') && !layerVisibility.arvlShewaWoredas) return false;
          if (pcode === 'ET0420' && !layerVisibility.arvlUrbanCities) return false;

          return true;
        },
        style: (feature) => {
          return getZoneBoundaryStyle(feature as any, {
            weight: 3.2,
            opacity: 0.95,
            fillOpacity: 0.05,
            dashArray: '6, 3'
          });
        },
        onEachFeature: (feature, layer) => {
          const pcode = feature?.properties?.adm2_pcode || '';
          const def = ZONE_COLOR_PALETTE[pcode];

          // Count matching operational units
          const allUnits = [...HARARGHE_WOREDAS, ...ARSI_WOREDAS];
          const matchingUnits = allUnits.filter(w => {
            if (pcode === 'ET0410') return w.zone === 'E/H';
            if (pcode === 'ET0409') return w.zone === 'W/H';
            if (pcode === 'ET0408') return w.zone === 'Arsi';
            if (pcode === 'ET0417') return w.zone === 'West Arsi';
            if (pcode === 'ET0411') return w.zone === 'Bale';
            if (pcode === 'ET0421') return w.zone === 'East Bale';
            if (pcode === 'ET0407') return w.zone === 'East Shewa';
            if (pcode === 'ET0406') return w.zone === 'North Shewa';
            if (pcode === 'ET0420') return w.zone.includes('City') || w.zone.includes('Town') || w.zone === 'Sheger City';
            return false;
          });

          // Calculate active outbreaks and total reported cases in this zone
          const matchingOutbreaks = outbreaks.filter(ob => {
            if (pcode === 'ET0410') return ob.zone === 'E/H' || ob.zone === 'East Hararghe';
            if (pcode === 'ET0409') return ob.zone === 'W/H' || ob.zone === 'West Hararghe';
            if (pcode === 'ET0408') return ob.zone === 'Arsi';
            if (pcode === 'ET0417') return ob.zone === 'West Arsi';
            if (pcode === 'ET0411') return ob.zone === 'Bale';
            if (pcode === 'ET0421') return ob.zone === 'East Bale';
            if (pcode === 'ET0407') return ob.zone === 'East Shewa';
            if (pcode === 'ET0406') return ob.zone === 'North Shewa';
            if (pcode === 'ET0420') return ob.zone?.includes('City') || ob.zone?.includes('Town') || ob.zone === 'Sheger City';
            return false;
          });
          const zoneCases = matchingOutbreaks.reduce((acc, o) => acc + (o.cases || 0), 0);
          const zoneActiveOutbreaks = matchingOutbreaks.filter(o => o.status === 'Active' || o.status === 'Under Investigation').length;

          // Generate rich interactive popup HTML
          const popupHtml = generateZonePopupHtml(feature as any, {
            woredaCount: matchingUnits.length || def?.operationalUnitsCount,
            totalCases: zoneCases,
            activeOutbreaks: zoneActiveOutbreaks,
            category: def?.category
          });

          // Save layer reference by pcode for legend selection
          if (pcode) {
            zoneLayersByPcodeRef.current[pcode] = layer;
          }

          // Attach popup: opens ONLY on user selection (click/tap)
          layer.bindPopup(popupHtml, {
            className: 'custom-zone-selection-popup',
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            maxWidth: 310,
            minWidth: 230,
            autoPan: true,
            autoPanPadding: L.point(16, 16),
            offset: L.point(0, -6)
          });

          layer.on({
            mouseover: (e) => {
              const l = e.target;
              if (!l.isPopupOpen?.()) {
                l.setStyle(getZoneBoundaryStyle(feature as any, { isHovered: true }));
              }
            },
            mouseout: (e) => {
              const l = e.target;
              if (!l.isPopupOpen?.()) {
                zoneGeoJsonLayer.resetStyle(l);
              }
            },
            click: (e) => {
              const l = e.target;
              l.bringToFront();
              // Determine best coordinate: tap position or geometry centroid fallback
              const targetLatLng = e.latlng || (l.getBounds ? l.getBounds().getCenter() : undefined);
              if (targetLatLng) {
                l.openPopup(targetLatLng);
              } else {
                l.openPopup();
              }
            },
            popupopen: (e) => {
              const l = e.target;
              // Highlight the selected zone polygon with enhanced prominence while preserving zone color
              l.setStyle(getZoneBoundaryStyle(feature as any, { isSelected: true }));
              l.bringToFront();
            },
            popupclose: (e) => {
              // Return to the clean unselected polygon state
              zoneGeoJsonLayer.resetStyle(e.target);
            }
          });
        }
      });

      adminGroup.addLayer(zoneGeoJsonLayer);
    }
  }, [
    selectedLab,
    layerVisibility.ethiopiaBoundary,
    layerVisibility.oromiaBoundary,
    layerVisibility.eastHarargheWoredas,
    layerVisibility.westHarargheWoredas,
    layerVisibility.arvlZoneEnvelopes,
    layerVisibility.arvlArsiWoredas,
    layerVisibility.arvlWestArsiWoredas,
    layerVisibility.arvlBaleWoredas,
    layerVisibility.arvlShewaWoredas,
    layerVisibility.arvlUrbanCities,
    layerVisibility.woredaFootprints,
    layerVisibility.densityHeatmap,
    zoneOutlineMode,
    woredaCaseMap,
    selectedWoreda
  ]);

  // Render Disease Risk Zones & Buffer Rings (Evidence-Based Engine)
  useEffect(() => {
    const riskGroup = riskLayerGroupRef.current;
    if (!riskGroup) return;

    riskGroup.clearLayers();

    if (!layerVisibility.diseaseRiskZones) return;

    filteredOutbreaks.forEach(ob => {
      if (ob.status !== 'Active' && ob.status !== 'Under Investigation') return;

      const profile = getDiseaseRiskProfile(ob.disease);
      const innerMeters = profile.innerHighRiskRadiusMeters;
      const outerMeters = profile.outerSurveillanceRadiusMeters;

      // 1. Inner High-Risk / Protection Zone (Core ring)
      if (layerVisibility.investigationCore) {
        const innerCircle = L.circle([ob.lat, ob.lng], {
          radius: innerMeters,
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.22,
          dashArray: '2, 4',
        });

        innerCircle.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 6px; min-width: 170px;">
            <b style="color: #b91c1c; font-size: 11px;">⚠️ ${profile.name} Core Zone</b>
            <div style="font-size: 10px; color: #334155; margin-top: 2px;">
              <b>Inner Radius:</b> ${(innerMeters / 1000).toFixed(1)} km<br/>
              <b>Rationale:</b> ${profile.innerZoneLabel}
            </div>
          </div>
        `, { sticky: true });

        innerCircle.on('click', () => {
          setInspectedRiskOutbreak(ob);
        });

        riskGroup.addLayer(innerCircle);
      }

      // 2. Outer Surveillance Perimeter (Buffer monitoring ring)
      if (layerVisibility.surveillancePerimeter) {
        const outerCircle = L.circle([ob.lat, ob.lng], {
          radius: outerMeters,
          color: '#f59e0b',
          weight: 1.5,
          fillColor: '#f59e0b',
          fillOpacity: 0.08,
          dashArray: '5, 5',
        });

        outerCircle.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 6px; min-width: 170px;">
            <b style="color: #d97706; font-size: 11px;">🛡️ ${profile.name} Surveillance Ring</b>
            <div style="font-size: 10px; color: #334155; margin-top: 2px;">
              <b>Outer Radius:</b> ${(outerMeters / 1000).toFixed(1)} km<br/>
              <b>Standard:</b> ${profile.evidenceLevel}
            </div>
          </div>
        `, { sticky: true });

        outerCircle.on('click', () => {
          setInspectedRiskOutbreak(ob);
        });

        riskGroup.addLayer(outerCircle);
      }
    });
  }, [
    filteredOutbreaks,
    layerVisibility.diseaseRiskZones,
    layerVisibility.investigationCore,
    layerVisibility.surveillancePerimeter
  ]);

  // Render Surveillance Markers (Outbreaks, Field Investigations, Zero Reports, HRVL Hub)
  useEffect(() => {
    const survGroup = surveillanceLayerGroupRef.current;
    if (!survGroup) return;

    survGroup.clearLayers();

    // 1. Diagnostic Hub Markers (HRVL & ARVL)
    if (layerVisibility.hrvlHub) {
      const hubsToRender: DiagnosticHubInfo[] = [];
      if (selectedLab === 'hrvl') {
        hubsToRender.push(HIRNA_LAB_COORDS);
      } else if (selectedLab === 'arvl') {
        hubsToRender.push(ASELA_LAB_COORDS);
      } else {
        hubsToRender.push(HIRNA_LAB_COORDS, ASELA_LAB_COORDS);
      }

      hubsToRender.forEach((hub) => {
        const isArvl = hub.id === 'arvl-diagnostic-hub';
        const ringColor = isArvl ? '#34d399' : '#818cf8';
        const ringBg = isArvl ? 'rgba(16, 185, 129, 0.18)' : 'rgba(99, 102, 241, 0.18)';
        const coreGradient = isArvl 
          ? 'linear-gradient(135deg, #059669, #047857)' 
          : 'linear-gradient(135deg, #4f46e5, #4338ca)';

        const hubIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `
            <div class="live-signal-container" style="width: 40px; height: 40px; position: relative;" aria-label="${hub.name}">
              <div class="live-signal-ring-hub" style="
                position: absolute;
                inset: -5px;
                border-radius: 50%;
                border: 2px solid ${ringColor};
                background: ${ringBg};
                pointer-events: none;
              "></div>
              <div class="live-signal-core-hub" style="
                width: 34px; height: 34px;
                background: ${coreGradient};
                border: 2px solid #ffffff;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                z-index: 2;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              ">
                <span style="font-size: 15px;">🏥</span>
                <span class="live-dot-pulse" style="
                  position: absolute;
                  top: -1px; right: -1px;
                  width: 6px; height: 6px;
                  background: ${isArvl ? '#10b981' : '#38bdf8'};
                  border: 1.5px solid #ffffff;
                  border-radius: 50%;
                "></span>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const hubMarker = L.marker([hub.lat, hub.lng], {
          icon: hubIcon,
          title: hub.name,
          alt: `${hub.name} — Diagnostic Hub`
        });

        hubMarker.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 6px;">
            <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 800; color: ${isArvl ? '#059669' : '#4f46e5'}; text-transform: uppercase; margin-bottom: 2px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isArvl ? '#059669' : '#4f46e5'}; display: inline-block;"></span>
              LIVE DIAGNOSTIC HUB
            </div>
            <b style="color: ${isArvl ? '#047857' : '#4338ca'}; font-size: 11px;">🏥 ${hub.name}</b>
            <div style="font-size: 10px; color: #475569; margin-top: 2px;">
              Plus Code: <b>${hub.plusCode}</b> • ${hub.zone} Zone
            </div>
          </div>
        `, { sticky: true });

        hubMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 8px 10px; min-width: 250px; max-width: 300px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 800; color: ${isArvl ? '#047857' : '#4338ca'}; text-transform: uppercase; background: ${isArvl ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)'}; padding: 2px 6px; border-radius: 4px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: ${isArvl ? '#059669' : '#4f46e5'}; display: inline-block;"></span>
                ${isArvl ? 'ARVL DIAGNOSTIC HUB' : 'HRVL DIAGNOSTIC HUB'}
              </span>
              <span style="font-size: 9px; color: ${isArvl ? '#059669' : '#0284c7'}; font-weight: 700; background: ${isArvl ? '#ecfdf5' : '#e0f2fe'}; padding: 1px 4px; border-radius: 3px;">CID: ${hub.googleMapsCid}</span>
            </div>
            <b style="color: #1e1b4b; font-size: 13px; display: block; line-height: 1.3;">${hub.name}</b>
            <div style="font-size: 10.5px; color: #334155; margin-top: 5px; line-height: 1.45;">
              <b>Location:</b> ${hub.locationName}<br/>
              <b>Operational Area:</b> ${hub.operationalArea}<br/>
              <b>Plus Code:</b> <span style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-weight: 800; color: #0f766e; font-family: monospace;">${hub.plusCode}</span><br/>
              <b>Coordinates:</b> ${hub.lat.toFixed(6)}° N, ${hub.lng.toFixed(6)}° E
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
              <a
                href="${hub.googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open ${hub.name} in Google Maps"
                style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; background: ${isArvl ? '#059669' : '#4f46e5'}; color: #ffffff; text-decoration: none; padding: 6px 10px; border-radius: 7px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.15); text-align: center;"
              >
                <span>🌐 View on Google Maps ↗</span>
              </a>
            </div>
          </div>
        `, { minWidth: 250, maxWidth: 300 });

        hubMarker.on('click', () => {
          setSelectedOutbreak(null);
          setSelectedWoreda(null);
          setSelectedHubInfo(hub);
          setIsHubSelected(true);
          setIsInspectorOpen(true);
          loadWeatherForCurrentFocus(hub.lat, hub.lng, hub.shortName);
        });

        survGroup.addLayer(hubMarker);
      });
    }

    // 2. Outbreak Markers (Confirmed & Suspected)
    if (layerVisibility.outbreaksConfirmed || layerVisibility.outbreaksSuspected) {
      filteredOutbreaks.forEach(ob => {
        const isConfirmed = ob.status === 'Active' || ob.status === 'Resolved';
        if (isConfirmed && !layerVisibility.outbreaksConfirmed) return;
        if (!isConfirmed && !layerVisibility.outbreaksSuspected) return;

        const profile = getDiseaseRiskProfile(ob.disease);
        const color = isConfirmed ? '#ef4444' : '#f59e0b';
        const ringClass = isConfirmed ? 'live-signal-ring-confirmed' : 'live-signal-ring-suspected';
        const coreClass = isConfirmed ? 'live-signal-core-confirmed' : 'live-signal-core-suspected';
        const ringBorder = isConfirmed ? '#ef4444' : '#f59e0b';
        const ringBg = isConfirmed ? 'rgba(239, 68, 68, 0.22)' : 'rgba(245, 158, 11, 0.2)';
        const liveDotBg = isConfirmed ? '#ef4444' : '#f59e0b';

        const markerIcon = L.divIcon({
          className: 'custom-outbreak-pin',
          html: `
            <div class="live-signal-container" style="width: 36px; height: 36px; position: relative;">
              <div class="${ringClass}" style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid ${ringBorder};
                background: ${ringBg};
                pointer-events: none;
              "></div>
              <div class="${coreClass}" style="
                width: 30px; height: 30px;
                background-color: ${color};
                border: 2px solid #ffffff;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                z-index: 2;
                cursor: pointer;
              ">
                <span style="font-size: 12px; color: white; font-weight: bold;">
                  ${ob.cases > 20 ? '🔥' : '⚠️'}
                </span>
                <span class="live-dot-pulse" style="
                  position: absolute;
                  top: -1px; right: -1px;
                  width: 6px; height: 6px;
                  background: #ffffff;
                  border: 1.5px solid ${liveDotBg};
                  border-radius: 50%;
                "></span>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([ob.lat, ob.lng], { icon: markerIcon });
        
        // Species icon mapper
        const formattedSpecies = (ob.speciesAffected && ob.speciesAffected.length > 0)
          ? ob.speciesAffected.map(s => {
              const sl = s.toLowerCase();
              let icon = '🐾';
              if (sl.includes('catt') || sl.includes('bov')) icon = '🐄';
              else if (sl.includes('goat') || sl.includes('capr')) icon = '🐐';
              else if (sl.includes('sheep') || sl.includes('ovin')) icon = '🐑';
              else if (sl.includes('camel')) icon = '🐪';
              else if (sl.includes('equin') || sl.includes('hors') || sl.includes('donk')) icon = '🐎';
              else if (sl.includes('poul') || sl.includes('chick') || sl.includes('avian')) icon = '🐔';
              else if (sl.includes('dog') || sl.includes('rabi')) icon = '🐕';
              return `${icon} ${s}`;
            }).join(', ')
          : '🐾 Livestock Host';

        // Calculate days elapsed
        let daysActiveText = '';
        try {
          if (ob.startDate) {
            const start = new Date(ob.startDate);
            if (!isNaN(start.getTime())) {
              const diffDays = Math.max(1, Math.ceil(Math.abs(Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
              daysActiveText = `${diffDays}d active`;
            }
          }
        } catch {
          // ignore
        }

        const cfrPercent = ob.cases > 0 ? ((ob.deaths / ob.cases) * 100).toFixed(1) : '0.0';
        const mortalitySeverity = ob.deaths > 5 ? 'Critical Mortality' : ob.deaths > 0 ? 'Confirmed Fatalities' : 'Zero Recorded Deaths';
        const mortalitySeverityColor = ob.deaths > 5 ? '#ef4444' : ob.deaths > 0 ? '#f97316' : '#10b981';
        const diseaseEmoji = (profile as any).icon || (
          ob.disease.toLowerCase().includes('foot') ? '🧬' :
          ob.disease.toLowerCase().includes('peste') || ob.disease.toLowerCase().includes('ppr') ? '🐐' :
          ob.disease.toLowerCase().includes('lumpy') ? '🐄' :
          ob.disease.toLowerCase().includes('anthrax') ? '⚠️' :
          ob.disease.toLowerCase().includes('rabies') ? '🐕' : '🦠'
        );

        const hoverCardHtml = `
          <div class="outbreak-hover-card" style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 290px;
            background: ${darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)'};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: ${darkMode ? '#f8fafc' : '#0f172a'};
            border: 1.5px solid ${darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.9)'};
            border-top: 3.5px solid ${color};
            border-radius: 14px;
            box-shadow: 0 16px 36px -6px rgba(0, 0, 0, ${darkMode ? '0.7' : '0.22'}), 0 4px 12px -2px rgba(0, 0, 0, ${darkMode ? '0.5' : '0.1'});
            padding: 12px 14px 11px;
            text-align: left;
            pointer-events: none;
            overflow: hidden;
          ">
            <!-- Top Alert Badge & Code -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 7px;">
              <span style="
                display: inline-flex;
                align-items: center;
                gap: 5px;
                font-size: 9.5px;
                font-weight: 800;
                color: ${color};
                text-transform: uppercase;
                letter-spacing: 0.3px;
                background: ${isConfirmed ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'};
                padding: 2.5px 7px;
                border-radius: 6px;
                border: 1px solid ${isConfirmed ? 'rgba(239, 68, 68, 0.28)' : 'rgba(245, 158, 11, 0.28)'};
              ">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block; box-shadow: 0 0 6px ${color};"></span>
                ${isConfirmed ? 'Confirmed Outbreak' : 'Suspected Cluster'}
              </span>
              <span style="font-size: 10px; font-weight: 800; color: ${darkMode ? '#94a3b8' : '#64748b'}; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.2px;">
                ${ob.outbreakCode || `#OB-${ob.id.slice(0, 6)}`}
              </span>
            </div>

            <!-- Disease Name & Epidemiological Location -->
            <div style="margin-bottom: 9px;">
              <div style="
                display: flex;
                align-items: baseline;
                gap: 6px;
                font-size: 14.5px;
                font-weight: 900;
                color: ${darkMode ? '#ffffff' : '#0f172a'};
                line-height: 1.25;
                letter-spacing: -0.2px;
              ">
                <span style="font-size: 15px;">${diseaseEmoji}</span>
                <span style="color: ${color};">${ob.disease}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: ${darkMode ? '#cbd5e1' : '#475569'}; margin-top: 3px; font-weight: 600;">
                <span>📍 <b>${ob.woreda}</b> Woreda</span>
                <span style="color: ${darkMode ? '#64748b' : '#94a3b8'};">•</span>
                <span style="color: ${ob.zone === 'E/H' ? '#38bdf8' : '#e879f9'}; font-weight: 700;">${ob.zone === 'E/H' ? 'East Hararghe' : 'West Hararghe'}</span>
              </div>
            </div>

            <!-- Featured Metrics: Case Count & Death Count -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              background: ${darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.85)'};
              border: 1px solid ${darkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.9)'};
              border-radius: 10px;
              padding: 8px 10px;
              margin-bottom: 8px;
            ">
              <!-- Case Count -->
              <div style="border-right: 1px solid ${darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)'}; padding-right: 4px;">
                <div style="display: flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${darkMode ? '#94a3b8' : '#64748b'}; letter-spacing: 0.3px;">
                  <span>📊</span> Case Count
                </div>
                <div style="font-size: 17px; font-weight: 900; color: ${color}; line-height: 1.2; margin-top: 2px;">
                  ${Number(ob.cases).toLocaleString()}
                </div>
                <div style="font-size: 9px; color: ${darkMode ? '#94a3b8' : '#64748b'}; margin-top: 1px;">
                  Morbidity: <b style="color: ${darkMode ? '#e2e8f0' : '#1e293b'};">${ob.morbidityRate ? `${ob.morbidityRate}%` : 'Elevated'}</b>
                </div>
              </div>

              <!-- Death Count -->
              <div style="padding-left: 4px;">
                <div style="display: flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${ob.deaths > 0 ? '#ef4444' : (darkMode ? '#94a3b8' : '#64748b')}; letter-spacing: 0.3px;">
                  <span>💀</span> Death Count
                </div>
                <div style="font-size: 17px; font-weight: 900; color: ${ob.deaths > 0 ? '#ef4444' : (darkMode ? '#94a3b8' : '#64748b')}; line-height: 1.2; margin-top: 2px;">
                  ${Number(ob.deaths).toLocaleString()}
                </div>
                <div style="font-size: 9px; color: ${ob.deaths > 0 ? '#ef4444' : (darkMode ? '#94a3b8' : '#64748b')}; margin-top: 1px;">
                  CFR: <b style="color: ${ob.deaths > 0 ? '#ef4444' : (darkMode ? '#cbd5e1' : '#475569')};">${cfrPercent}%</b>
                </div>
              </div>
            </div>

            <!-- Visual Fatality Ratio Bar -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 8.5px; font-weight: 700; color: ${darkMode ? '#94a3b8' : '#64748b'}; margin-bottom: 3px;">
                <span style="color: ${mortalitySeverityColor};">● ${mortalitySeverity}</span>
                <span>${ob.cases > 0 ? `${Math.max(0, ob.cases - ob.deaths)} survivors` : ''}</span>
              </div>
              <div style="width: 100%; height: 5px; background: ${darkMode ? '#334155' : '#e2e8f0'}; border-radius: 4px; overflow: hidden; display: flex;">
                <div style="width: ${Math.min(100, Math.max(5, (ob.deaths / Math.max(1, ob.cases)) * 100))}%; height: 100%; background: #ef4444;"></div>
                <div style="flex: 1; height: 100%; background: ${color}; opacity: 0.7;"></div>
              </div>
            </div>

            <!-- Species Affected & Outbreak Date -->
            <div style="font-size: 10px; line-height: 1.45; border-top: 1px solid ${darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)'}; padding-top: 6px; margin-bottom: 7px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <span style="color: ${darkMode ? '#94a3b8' : '#64748b'}; font-weight: 600;">Species:</span>
                <span style="font-weight: 700; color: ${darkMode ? '#f1f5f9' : '#0f172a'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 175px;">
                  ${formattedSpecies}
                </span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-top: 2.5px;">
                <span style="color: ${darkMode ? '#94a3b8' : '#64748b'}; font-weight: 600;">Report Date:</span>
                <span style="font-weight: 700; color: ${darkMode ? '#e2e8f0' : '#1e293b'};">
                  📅 ${ob.startDate} ${daysActiveText ? `• <span style="color: #38bdf8;">${daysActiveText}</span>` : ''}
                </span>
              </div>
            </div>

            <!-- Quarantine SLA & Biosecurity Buffer -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 4px;
              font-size: 9.5px;
              font-weight: 700;
              background: ${darkMode ? 'rgba(2, 6, 23, 0.75)' : 'rgba(241, 245, 249, 0.85)'};
              padding: 4px 8px;
              border-radius: 7px;
              border: 1px solid ${darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.9)'};
            ">
              <span style="display: flex; align-items: center; gap: 4px; color: ${ob.quarantineApplied ? '#10b981' : '#f59e0b'};">
                <span>${ob.quarantineApplied ? '🔒' : '⚠️'}</span>
                <span>${ob.quarantineApplied ? 'Quarantine Active' : 'No Quarantine'}</span>
              </span>
              <span style="color: ${darkMode ? '#94a3b8' : '#64748b'};">
                ${(profile.innerHighRiskRadiusMeters / 1000).toFixed(1)}km Ring SLA
              </span>
            </div>

            <!-- Action Prompt -->
            <div style="margin-top: 6px; text-align: center; font-size: 9px; color: ${darkMode ? '#64748b' : '#94a3b8'}; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 3px;">
              <span>👆</span> <span>Click marker for Inspector, Buffer & Weather</span>
            </div>
          </div>
        `;

        marker.bindTooltip(hoverCardHtml, {
          sticky: false,
          direction: 'top',
          offset: [0, -22],
          className: 'hrvl-hovercard-tooltip',
          opacity: 1.0
        });

        marker.on('click', () => {
          setSelectedOutbreak(ob);
          setSelectedWoreda(null);
          setIsHubSelected(false);
          setIsInspectorOpen(true);
          loadWeatherForCurrentFocus(ob.lat, ob.lng, `${ob.woreda} Outbreak Zone`);
        });

        survGroup.addLayer(marker);
      });
    }

    // 3. Field Investigations
    if (layerVisibility.fieldInvestigations && fieldInvestigations.length > 0) {
      fieldInvestigations.forEach(inv => {
        const invIcon = L.divIcon({
          className: 'custom-field-investigation-pin',
          html: `
            <div class="live-signal-container" style="width: 34px; height: 34px; position: relative;">
              <div class="live-signal-ring-mission" style="
                position: absolute;
                inset: -5px;
                border-radius: 8px;
                border: 2px solid #10b981;
                background: rgba(16, 185, 129, 0.2);
                pointer-events: none;
              "></div>
              <div class="live-signal-core-mission" style="
                width: 26px; height: 26px;
                background-color: #10b981;
                border: 2px solid #ffffff;
                border-radius: 6px;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                z-index: 2;
                cursor: pointer;
              ">
                <span style="font-size: 12px;">🔬</span>
                <span class="live-dot-pulse" style="
                  position: absolute;
                  top: -1px; right: -1px;
                  width: 5px; height: 5px;
                  background: #ffffff;
                  border: 1.5px solid #10b981;
                  border-radius: 50%;
                "></span>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const invMarker = L.marker([inv.lat || 9.2, inv.lng || 41.1], { icon: invIcon });
        invMarker.bindTooltip(`
          <div class="outbreak-hover-card" style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 230px;
            background: ${darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)'};
            color: ${darkMode ? '#f8fafc' : '#0f172a'};
            border: 1.5px solid ${darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.9)'};
            border-top: 3px solid #10b981;
            border-radius: 12px;
            box-shadow: 0 14px 28px -4px rgba(0, 0, 0, ${darkMode ? '0.6' : '0.15'});
            padding: 10px 12px;
            text-align: left;
            pointer-events: none;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 5px;">
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 800; color: #10b981; text-transform: uppercase; background: rgba(16, 185, 129, 0.12); padding: 2px 6px; border-radius: 5px; border: 1px solid rgba(16, 185, 129, 0.25);">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                Live Field Mission
              </span>
              <span style="font-size: 9.5px; font-weight: 700; color: ${darkMode ? '#94a3b8' : '#64748b'}; font-family: ui-monospace, monospace;">
                ${inv.investigationCode || `#FM-${inv.id.slice(0, 6)}`}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: ${darkMode ? '#ffffff' : '#0f172a'}; margin-bottom: 3px;">
              🔬 ${inv.disease || inv.title}
            </div>
            <div style="font-size: 10.5px; color: ${darkMode ? '#cbd5e1' : '#475569'}; margin-top: 2px;">
              📍 <b>${inv.woreda}</b> Woreda (${inv.zone})
            </div>
            ${(inv as any).farmerName || (inv as any).leadInvestigator ? `
            <div style="font-size: 9.5px; color: ${darkMode ? '#94a3b8' : '#64748b'}; margin-top: 4px; border-top: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; pt-1;">
              Reporter: <b>${(inv as any).farmerName || (inv as any).leadInvestigator}</b>
            </div>` : ''}
          </div>
        `, { 
          sticky: false, 
          direction: 'top', 
          offset: [0, -18],
          className: 'hrvl-hovercard-tooltip', 
          opacity: 1.0 
        });

        survGroup.addLayer(invMarker);
      });
    }

    // 4. Zero Reports Baseline Points
    if (layerVisibility.zeroReports) {
      const zeroRecords = records.filter(r => r.isZeroReport);
      zeroRecords.slice(0, 40).forEach(zr => {
        const dot = L.circleMarker([zr.lat, zr.lng], {
          radius: 4,
          color: '#0284c7',
          weight: 1.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.6,
        });

        dot.bindTooltip(`
          <div style="font-family: sans-serif; padding: 3px 5px;">
            <b style="color: #0369a1; font-size: 10px;">✅ Zero-Report Return</b>
            <div style="font-size: 9px; color: #475569;">${zr.woreda} (${zr.zone})</div>
          </div>
        `, { sticky: true });

        survGroup.addLayer(dot);
      });
    }
  }, [
    filteredOutbreaks,
    fieldInvestigations,
    records,
    darkMode,
    layerVisibility.hrvlHub,
    layerVisibility.outbreaksConfirmed,
    layerVisibility.outbreaksSuspected,
    layerVisibility.fieldInvestigations,
    layerVisibility.zeroReports
  ]);

  // Render Weather Wind Vectors Layer
  useEffect(() => {
    const weatherGroup = weatherLayerGroupRef.current;
    if (!weatherGroup) return;

    weatherGroup.clearLayers();

    if (!layerVisibility.windVectors || !liveWeather) return;

    // Draw downwind plume vector arrows from active outbreak clusters
    filteredOutbreaks.slice(0, 10).forEach(ob => {
      const windAngleRad = (liveWeather.windDirection * Math.PI) / 180;
      const lengthKm = Math.min(Math.max(liveWeather.windSpeed * 0.4, 4), 14); // Length scales with wind speed
      
      // Calculate destination coordinates
      const latOffset = (lengthKm / 111) * Math.cos(windAngleRad);
      const lngOffset = (lengthKm / (111 * Math.cos((ob.lat * Math.PI) / 180))) * Math.sin(windAngleRad);
      
      const destLat = ob.lat + latOffset;
      const destLng = ob.lng + lngOffset;

      const polyline = L.polyline([[ob.lat, ob.lng], [destLat, destLng]], {
        color: '#38bdf8',
        weight: 2.5,
        opacity: 0.8,
        dashArray: '3, 4',
      });

      polyline.bindTooltip(`
        <div style="font-family: sans-serif; padding: 4px 6px;">
          <b style="color: #0284c7; font-size: 10px;">💨 Downwind Transport Vector</b>
          <div style="font-size: 9px; color: #475569;">
            Heading: ${liveWeather.windDirection}° • Speed: ${liveWeather.windSpeed} km/h
          </div>
        </div>
      `, { sticky: true });

      weatherGroup.addLayer(polyline);
    });
  }, [filteredOutbreaks, liveWeather, layerVisibility.windVectors]);

  // Handle Geographic Extent Navigation Jump
  const handleSelectExtent = (extent: GeoLocationExtent) => {
    setCurrentExtentId(extent.id);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (extent.bounds) {
      map.fitBounds(extent.bounds, { padding: [30, 30], maxZoom: extent.zoom });
    } else {
      map.flyTo(extent.center, extent.zoom, { duration: 1.2 });
    }

    loadWeatherForCurrentFocus(extent.center[0], extent.center[1], extent.name);
  };

  const handleResetHome = () => {
    handleSelectExtent(HARARGHE_REGIONAL_EXTENT);
  };

  // Toggle Layer Helper
  const handleToggleLayer = (layerKey: keyof MapLayerVisibilityState) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Export Map Image Snapshot
  const handleExportMapImage = async () => {
    if (!mapWrapperRef.current) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(mapWrapperRef.current, {
        quality: 0.95,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${currentLabInfo.shortCode}_Epi_GIS_Map_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Map image export failed:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Geographic Hierarchy Breadcrumb / Selector Bar */}
      <GeoHierarchyNav
        currentExtentId={currentExtentId}
        onSelectExtent={handleSelectExtent}
        onResetHome={handleResetHome}
        currentZoom={currentZoom}
        centerCoords={centerCoords}
        isFullScreen={isFullScreen}
      />

      {/* Main Map Container Wrapper */}
      <div
        ref={mapWrapperRef}
        className={`relative overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl transition-all duration-300 ${
          isFullScreen 
            ? 'fixed inset-0 z-50 rounded-none border-0 h-screen w-screen bg-slate-950' 
            : isPrintMode
            ? 'h-[500px] sm:h-[560px] w-full bg-slate-900'
            : 'h-[480px] sm:h-[540px] md:h-[580px] lg:h-[calc(100vh-210px)] min-h-[480px] max-h-[740px] 2xl:max-h-[840px] w-full bg-slate-900'
        }`}
      >
        {/* Leaflet Mount Target */}
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

        {/* Top Floating Control Bar - Responsive Non-Colliding Layout */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Left Floating Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-full">
            {/* Layer Control Toggle Button */}
            <button
              onClick={() => setIsLayerControlOpen(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer backdrop-blur-md border ${
                isLayerControlOpen
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Layers</span>
            </button>

            {/* Weather Panel Toggle Button */}
            <button
              onClick={() => setIsWeatherPanelOpen(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer backdrop-blur-md border ${
                isWeatherPanelOpen
                  ? 'bg-sky-600 text-white border-sky-400'
                  : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700'
              }`}
            >
              <CloudSun className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Weather Context</span>
              {liveWeather && (
                <span className="text-[11px] font-mono text-sky-300 ml-1">
                  {Math.round(liveWeather.temperature)}°C
                </span>
              )}
            </button>

            {/* Zone-Level Boundary Outline Quick Toggle */}
            <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/90 rounded-xl p-0.5 shadow-lg text-[11px] font-bold">
              <span className="hidden lg:flex items-center gap-1 text-slate-400 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Zone Outlines:
              </span>
              <button
                onClick={() => setZoneOutlineMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  zoneOutlineMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show color-coded boundaries for all 10 zones in HRVL & ARVL"
              >
                All (10)
              </button>
              <button
                onClick={() => setZoneOutlineMode('hrvl')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  zoneOutlineMode === 'hrvl'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show HRVL zone boundaries only (East & West Hararghe)"
              >
                HRVL (2)
              </button>
              <button
                onClick={() => setZoneOutlineMode('arvl')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  zoneOutlineMode === 'arvl'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show ARVL zone boundaries only (Arsi, West Arsi, Bale, Shewa, Cities)"
              >
                ARVL (8)
              </button>
              <button
                onClick={() => setZoneOutlineMode('none')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  zoneOutlineMode === 'none'
                    ? 'bg-rose-600/80 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Hide zone boundary outlines"
              >
                Off
              </button>
            </div>

            {/* Zone Palette Legend Toggle */}
            {zoneOutlineMode !== 'none' && (
              <button
                onClick={() => setIsZoneLegendOpen(prev => !prev)}
                className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer backdrop-blur-md border ${
                  isZoneLegendOpen
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700'
                }`}
                title="View Color-Coded Zone Legend"
              >
                <span className="flex items-center -space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-slate-900" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
                </span>
                <span className="hidden xl:inline">Zone Palette</span>
              </button>
            )}

            {/* Search Woreda or Disease Bar */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search woreda or outbreak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 w-36 lg:w-44 xl:w-48 shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Floating Controls (Basemap, Zoom, Fullscreen, Export) */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1 rounded-xl shadow-xl pointer-events-auto shrink-0">
            {/* Basemap Select */}
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as BasemapType)}
              className="bg-transparent text-slate-200 text-xs font-semibold px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="hybrid" className="bg-slate-900">Hybrid Imagery</option>
              <option value="satellite" className="bg-slate-900">Satellite</option>
              <option value="dark" className="bg-slate-900">Dark Matter</option>
              <option value="voyager" className="bg-slate-900">Carto Light</option>
              <option value="topo" className="bg-slate-900">Topographic</option>
            </select>

            <div className="h-4 w-px bg-slate-700" />

            {/* Zoom In */}
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Reset Home Extent */}
            <button
              onClick={handleResetHome}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset to Hararghe Operational View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Full-Screen Toggle */}
            <button
              onClick={() => setIsFullScreen(prev => !prev)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Map"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Snapshot PNG Export */}
            <button
              onClick={handleExportMapImage}
              disabled={isExportingImage}
              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Download Map Snapshot (PNG)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Layer Control Panel (Collapsible) */}
        {isLayerControlOpen && (
          <div className="absolute top-14 left-3 z-30 animate-fade-in">
            <LayerControlPanel
              layers={layerVisibility}
              onToggleLayer={handleToggleLayer}
              onOpenScientificReferences={() => {
                setSelectedDiseaseForReferences('fmd');
                setIsScientificReferencesOpen(true);
              }}
              isOpen={isLayerControlOpen}
              onToggleOpen={() => setIsLayerControlOpen(false)}
              zoneOutlineMode={zoneOutlineMode}
              onSetZoneOutlineMode={setZoneOutlineMode}
            />
          </div>
        )}

        {/* Floating Zone Color Palette Legend Panel (Collapsible) */}
        {isZoneLegendOpen && zoneOutlineMode !== 'none' && (
          <div className="absolute top-14 left-3 sm:left-48 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs text-slate-200 w-80 sm:w-96 animate-fade-in space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-white text-sm">Zone Boundary Outlines</span>
              </div>
              <button
                onClick={() => setIsZoneLegendOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Official COD-AB Shapefile boundaries with distinct zonal color codes. Click any zone to zoom directly to its jurisdiction.
            </p>

            {/* Filter mode chips */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setZoneOutlineMode('all')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  zoneOutlineMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Zones (10)
              </button>
              <button
                onClick={() => setZoneOutlineMode('hrvl')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  zoneOutlineMode === 'hrvl' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                HRVL Catchment (2)
              </button>
              <button
                onClick={() => setZoneOutlineMode('arvl')}
                className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                  zoneOutlineMode === 'arvl' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ARVL Catchment (8)
              </button>
            </div>

            {/* Zone items grid */}
            <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {Object.values(ZONE_COLOR_PALETTE)
                .filter(zone => {
                  if (zoneOutlineMode === 'hrvl') return zone.laboratory === 'hrvl';
                  if (zoneOutlineMode === 'arvl') return zone.laboratory === 'arvl';
                  return true;
                })
                .map((zone) => (
                  <div
                    key={zone.pcode}
                    onClick={() => {
                      // Find feature bounds from COD_AB_ZONES_GEOJSON
                      const feat = (COD_AB_ZONES_GEOJSON as any)?.features?.find(
                        (f: any) => f.properties?.adm2_pcode === zone.pcode
                      );
                      if (feat && mapInstanceRef.current) {
                        const tempLayer = L.geoJSON(feat);
                        mapInstanceRef.current.fitBounds(tempLayer.getBounds(), { padding: [25, 25], maxZoom: 10 });
                      }
                      const targetLayer = zoneLayersByPcodeRef.current[zone.pcode];
                      if (targetLayer && (targetLayer as any).openPopup) {
                        const center = (targetLayer as any).getBounds ? (targetLayer as any).getBounds().getCenter() : undefined;
                        if (center) {
                          (targetLayer as any).openPopup(center);
                        } else {
                          (targetLayer as any).openPopup();
                        }
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-md flex-shrink-0 border-2 shadow-xs transition-transform group-hover:scale-110"
                        style={{ borderColor: zone.strokeColor, backgroundColor: zone.fillColor }}
                      />
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          {zone.displayName}
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                            {zone.shortCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {zone.category} • {zone.operationalUnitsCount} Units
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold group-hover:underline">
                      [{zone.pcode}] ↗
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Source: UN OCHA COD-AB (SHP)</span>
              <span className="text-emerald-400 font-mono font-bold">WGS 84 Projection</span>
            </div>
          </div>
        )}

        {/* Floating Weather Overlay Panel (Collapsible) */}
        {isWeatherPanelOpen && (
          <div className="absolute top-14 left-3 sm:left-auto sm:right-3 z-30 animate-fade-in">
            <WeatherOverlayPanel
              weather={liveWeather}
              isLoading={isWeatherLoading}
              onRefresh={() => {
                if (centerCoords) loadWeatherForCurrentFocus(centerCoords[0], centerCoords[1], 'Current Viewport');
              }}
              isOpen={isWeatherPanelOpen}
              onToggleOpen={() => setIsWeatherPanelOpen(false)}
            />
          </div>
        )}

        {/* Bottom-Left Interactive Disease Legend */}
        <div className="absolute bottom-4 left-3 z-20 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-xs text-slate-200 max-w-[270px] sm:max-w-xs transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center space-x-1.5 font-extrabold text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Surveillance Legend</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-dot-pulse inline-block" />
                <span>LIVE SIGNAL</span>
              </span>
              <button
                onClick={() => setIsLegendExpanded(prev => !prev)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {isLegendExpanded && (
            <div className="space-y-2">
              <div className="space-y-2 text-[11px]">
                {/* Outbreak */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-red-500/20 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white live-signal-core-confirmed relative z-10 flex items-center justify-center text-[8px] font-black text-white">⚠️</div>
                      </div>
                      <span className="font-bold text-red-200">Outbreak</span>
                    </div>
                    <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/40">Red Circle</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                    Disease outbreak / active epidemiological event signal
                  </p>
                </div>

                {/* Hub */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-sky-500/20 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div className="w-3.5 h-3.5 rounded-md bg-slate-900 border border-sky-400 live-signal-core-hub relative z-10 flex items-center justify-center text-[8px] text-sky-300">🏥</div>
                      </div>
                      <span className="font-bold text-sky-200">Hub</span>
                    </div>
                    <span className="text-[9px] font-mono text-sky-400 font-bold bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800/40">Blue Rect</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                    Surveillance / reporting & diagnostic hub (HRVL Hirna)
                  </p>
                </div>

                {/* Mission */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-emerald-500/20 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-300 live-signal-core-mission relative z-10 flex items-center justify-center text-[8px] text-white">📋</div>
                      </div>
                      <span className="font-bold text-emerald-200">Mission</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">Green Square</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                    Field mission / rapid investigation & sample collection
                  </p>
                </div>

                {/* Suspected */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-amber-500/20 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white live-signal-core-suspected relative z-10 flex items-center justify-center text-[8px] text-slate-900">🔬</div>
                      </div>
                      <span className="font-bold text-amber-200">Suspected Signal</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">Amber Circle</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                    Field clinical signal pending lab confirmation
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <button
                  onClick={() => setIsScientificReferencesOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  WOAH/FAO Citations ↗
                </button>
                <span className="text-slate-400 font-mono">36 Woredas Coverage</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom-Right Selected Item Inspector Panel */}
        {(selectedOutbreak || selectedWoreda || isHubSelected) && isInspectorOpen && (
          <div className="absolute bottom-4 right-3 z-20 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs text-slate-200 w-80 sm:w-88 transition-all animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center space-x-1.5 font-extrabold text-white">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>GIS Inspector</span>
              </div>
              <button
                onClick={() => {
                  setSelectedOutbreak(null);
                  setSelectedWoreda(null);
                  setIsHubSelected(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Diagnostic Hub Inspector Card */}
            {isHubSelected && !selectedOutbreak && !selectedWoreda && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center space-x-1 ${
                      selectedHubInfo.id === 'arvl-diagnostic-hub'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full live-dot-pulse inline-block ${
                        selectedHubInfo.id === 'arvl-diagnostic-hub' ? 'bg-emerald-400' : 'bg-indigo-400'
                      }`} />
                      <span>{selectedHubInfo.id === 'arvl-diagnostic-hub' ? 'ARVL DIAGNOSTIC HUB' : 'HRVL DIAGNOSTIC HUB'}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      REFERENCE FACILITY
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1.5">
                    {selectedHubInfo.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {selectedHubInfo.locationName}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    Operational Area: {selectedHubInfo.operationalArea}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Google Maps CID:</span>
                    <span className="font-mono font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40 text-[10px]">
                      {selectedHubInfo.googleMapsCid}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Plus Code:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {selectedHubInfo.plusCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Full OLC:</span>
                    <span className="font-mono text-slate-300 text-[10px]">{selectedHubInfo.fullPlusCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-sky-400">{selectedHubInfo.lat.toFixed(6)}° N, {selectedHubInfo.lng.toFixed(6)}° E</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-[10px]">
                    <span className="text-slate-400">Surveillance Scope:</span>
                    <span className="font-semibold text-slate-200">{selectedHubInfo.operationalArea}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={selectedHubInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${selectedHubInfo.name} on Google Maps`}
                    className={`py-2 px-2.5 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md text-center ${
                      selectedHubInfo.id === 'arvl-diagnostic-hub'
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View on Google Maps ↗</span>
                  </a>
                  <button
                    onClick={() => {
                      mapInstanceRef.current?.flyTo([selectedHubInfo.lat, selectedHubInfo.lng], 14, { duration: 1.0 });
                    }}
                    className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Center Map</span>
                  </button>
                </div>
              </div>
            )}

            {selectedOutbreak && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 live-dot-pulse inline-block" />
                      <span>LIVE SIGNAL</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedOutbreak.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1.5">
                    {selectedOutbreak.disease} — {selectedOutbreak.woreda} ({selectedOutbreak.zone})
                  </h4>
                  <p className="text-[11px] text-slate-400">Outbreak Code: {selectedOutbreak.outbreakCode}</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase font-bold">Cases</span>
                    <p className="text-sm font-black text-sky-400">{selectedOutbreak.cases}</p>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase font-bold">Deaths</span>
                    <p className="text-sm font-black text-rose-400">{selectedOutbreak.deaths}</p>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase font-bold">CFR</span>
                    <p className="text-sm font-black text-amber-400">{selectedOutbreak.cfr}%</p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectedRiskOutbreak(selectedOutbreak)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspect Evidence-Based Risk Zone</span>
                </button>
              </div>
            )}

            {selectedWoreda && !selectedOutbreak && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedWoreda.admType || 'Woreda Territory'}
                    </span>
                    {selectedWoreda.districtCode && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                        {selectedWoreda.districtCode}
                      </span>
                    )}
                    {selectedWoreda.urbanRural && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedWoreda.urbanRural}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white mt-1.5">
                    {selectedWoreda.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Zone: <b className="text-white">{selectedWoreda.zone}</b> • Region: <b className="text-amber-400">Oromia</b>
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    Reference Lab: {selectedWoreda.laboratoryId === 'arvl' || selectedWoreda.zone === 'Arsi' || selectedWoreda.zone === 'West Arsi' || selectedWoreda.zone === 'Bale' || selectedWoreda.zone === 'East Bale' || selectedWoreda.zone === 'East Shewa' || selectedWoreda.zone === 'North Shewa' || selectedWoreda.zone.includes('City') || selectedWoreda.zone.includes('Town') ? 'ARVL Asella' : 'HRVL Hirna'}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated Population:</span>
                    <span className="font-bold text-slate-200">
                      {selectedWoreda.populationEstimate ? selectedWoreda.populationEstimate.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Recorded Cases:</span>
                    <span className={`font-bold ${
                      (woredaCaseMap[selectedWoreda.name.toLowerCase()] || 0) > 0 ? 'text-rose-400' : 'text-sky-400'
                    }`}>
                      {woredaCaseMap[selectedWoreda.name.toLowerCase()] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">GPS Center:</span>
                    <span className="font-mono text-sky-400 text-[10px]">
                      {selectedWoreda.lat.toFixed(4)}°N, {selectedWoreda.lng.toFixed(4)}°E
                    </span>
                  </div>
                  {liveWeather && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">Local Weather:</span>
                      <span className="font-semibold text-amber-300">
                        {liveWeather.temperature}°C • Wind {liveWeather.windSpeed} km/h {liveWeather.windDirection}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      mapInstanceRef.current?.flyTo([selectedWoreda.lat, selectedWoreda.lng], 11, { duration: 1.0 });
                    }}
                    className="py-2 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Center Map</span>
                  </button>
                  <button
                    onClick={() => {
                      loadWeatherForCurrentFocus(selectedWoreda.lat, selectedWoreda.lng, `${selectedWoreda.name} (${selectedWoreda.zone})`);
                    }}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                  >
                    <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fetch Weather</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Risk Zone Detail Modal */}
      {inspectedRiskOutbreak && (
        <RiskZoneDetailModal
          outbreak={inspectedRiskOutbreak}
          weather={liveWeather}
          onClose={() => setInspectedRiskOutbreak(null)}
          onOpenScientificReferences={(diseaseCode) => {
            setSelectedDiseaseForReferences(diseaseCode);
            setIsScientificReferencesOpen(true);
          }}
        />
      )}

      {/* Scientific References Modal */}
      <ScientificReferencesModal
        isOpen={isScientificReferencesOpen}
        onClose={() => setIsScientificReferencesOpen(false)}
        selectedDiseaseCode={selectedDiseaseForReferences}
      />

    </div>
  );
};
