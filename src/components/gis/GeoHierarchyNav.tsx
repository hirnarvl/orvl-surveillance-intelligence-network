import React from 'react';
import { Compass, Globe, MapPin, ChevronRight, Home, Building2, ShieldAlert } from 'lucide-react';
import { GeoLocationExtent } from '../../types/riskMap';
import { 
  ALL_GEO_EXTENTS, 
  NATIONAL_EXTENT, 
  OROMIA_EXTENT, 
  EAST_HARARGHE_EXTENT, 
  WEST_HARARGHE_EXTENT, 
  HARARGHE_REGIONAL_EXTENT, 
  ARSI_REGIONAL_EXTENT,
  ARSI_ZONE_EXTENT,
  WEST_ARSI_ZONE_EXTENT,
  BALE_ZONE_EXTENT,
  EAST_BALE_ZONE_EXTENT,
  EAST_SHEWA_ZONE_EXTENT,
  NORTH_SHEWA_ZONE_EXTENT,
  URBAN_CITIES_EXTENT,
  HRVL_HUB_EXTENT,
  ARVL_HUB_EXTENT
} from '../../data/geoHierarchy';
import { ALL_OPERATIONAL_WOREDAS, HARARGHE_WOREDAS, ARSI_WOREDAS } from '../../data/woredas';
import { useLaboratory } from '../../contexts/LaboratoryContext';

interface GeoHierarchyNavProps {
  currentExtentId: string;
  onSelectExtent: (extent: GeoLocationExtent) => void;
  onResetHome: () => void;
  currentZoom: number;
  centerCoords: [number, number];
  isFullScreen?: boolean;
}

export const GeoHierarchyNav: React.FC<GeoHierarchyNavProps> = ({
  currentExtentId,
  onSelectExtent,
  onResetHome,
  currentZoom,
  centerCoords,
  isFullScreen = false,
}) => {
  const { selectedLab } = useLaboratory();
  const selectedExtent = ALL_GEO_EXTENTS.find(e => e.id === currentExtentId) || (selectedLab === 'arvl' ? ARSI_REGIONAL_EXTENT : HARARGHE_REGIONAL_EXTENT);
  const isArvl = selectedLab === 'arvl';
  const isAll = selectedLab === 'all';
  const isHrvl = selectedLab === 'hrvl';

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-700/70 text-slate-200 rounded-xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
      
      {/* Quick Extent Jump Buttons */}
      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <button
          onClick={onResetHome}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedExtent.id === 'hararghe_all' || selectedExtent.id === 'arsi_all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Zoom to Operational Focus Area"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{isArvl ? 'ARVL Area' : isAll ? 'All RVLs' : 'Hararghe Area'}</span>
        </button>

        <button
          onClick={() => onSelectExtent(NATIONAL_EXTENT)}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedExtent.id === 'ethiopia'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Level 1: Ethiopia National Extent"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Ethiopia</span>
        </button>

        <button
          onClick={() => onSelectExtent(OROMIA_EXTENT)}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedExtent.id === 'oromia'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Level 2: Oromia Regional State"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Oromia</span>
        </button>

        {/* HRVL Specific Zone Jumps */}
        {(isHrvl || isAll) && (
          <>
            <button
              onClick={() => onSelectExtent(EAST_HARARGHE_EXTENT)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'east_hararghe'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: East Hararghe Zone (21 Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>E. Hararghe</span>
            </button>

            <button
              onClick={() => onSelectExtent(WEST_HARARGHE_EXTENT)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'west_hararghe'
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: West Hararghe Zone (15 Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
              <span>W. Hararghe</span>
            </button>

            <button
              onClick={() => onSelectExtent(HRVL_HUB_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'hrvl_hub'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300'
              }`}
              title="Level 5: Hirna Regional Diagnostic Laboratory Hub"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>HRVL Hub</span>
            </button>
          </>
        )}

        {/* ARVL Specific Zone Jumps */}
        {(isArvl || isAll) && (
          <>
            <button
              onClick={() => onSelectExtent(ARSI_ZONE_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'arsi_zone'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: Arsi Zone (25 Rural Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Arsi (25)</span>
            </button>

            <button
              onClick={() => onSelectExtent(WEST_ARSI_ZONE_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'west_arsi_zone'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: West Arsi Zone (13 Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>W. Arsi (13)</span>
            </button>

            <button
              onClick={() => onSelectExtent(BALE_ZONE_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'bale_zone' || selectedExtent.id === 'east_bale_zone'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: Bale & East Bale Zones (17 Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Bale (17)</span>
            </button>

            <button
              onClick={() => onSelectExtent(EAST_SHEWA_ZONE_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'east_shewa_zone' || selectedExtent.id === 'north_shewa_zone'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: East & North Shewa Zones (27 Woredas)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Shewa (27)</span>
            </button>

            <button
              onClick={() => onSelectExtent(URBAN_CITIES_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'urban_cities'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Level 3: Sheger & Major Cities (23 Sub-cities & 7 Towns)"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Cities (30)</span>
            </button>

            <button
              onClick={() => onSelectExtent(ARVL_HUB_EXTENT)}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedExtent.id === 'arvl_hub'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
              }`}
              title="Level 5: Asella Regional Diagnostic Laboratory Hub (7.9356° N, 39.11467° E)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>ARVL Hub</span>
            </button>
          </>
        )}
      </div>

      {/* Woreda & City Selector Dropdown (Level 4) */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <select
            value={selectedExtent.id.startsWith('woreda_') ? selectedExtent.id : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const found = ALL_GEO_EXTENTS.find(ext => ext.id === val);
                if (found) onSelectExtent(found);
              }
            }}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer max-w-[150px] sm:max-w-[210px]"
          >
            <option value="" className="bg-slate-900 text-slate-400">
              {isArvl ? 'Select ARVL Zone/Unit (122)...' : isAll ? 'Select Woreda/City (158)...' : 'Select HRVL Woreda (36)...'}
            </option>
            
            {/* HRVL Optgroups */}
            {(isHrvl || isAll) && (
              <>
                <optgroup label="── HRVL Catchment (36) ──" className="bg-slate-900 text-sky-400 font-extrabold" />
                <optgroup label="East Hararghe (21 Woredas)" className="bg-slate-900 text-sky-300 font-bold">
                  {HARARGHE_WOREDAS.filter(w => w.zone === 'E/H').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      {w.name} [{w.districtCode || 'E/H'}]
                    </option>
                  ))}
                </optgroup>
                <optgroup label="West Hararghe (15 Woredas)" className="bg-slate-900 text-fuchsia-300 font-bold">
                  {HARARGHE_WOREDAS.filter(w => w.zone === 'W/H').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      {w.name} [{w.districtCode || 'W/H'}]
                    </option>
                  ))}
                </optgroup>
              </>
            )}

            {/* ARVL Optgroups */}
            {(isArvl || isAll) && (
              <>
                <optgroup label="── ARVL Catchment (122 Units) ──" className="bg-slate-900 text-emerald-400 font-extrabold" />
                
                <optgroup label="Arsi Zone (25 Rural Woredas)" className="bg-slate-900 text-emerald-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Arsi').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🌾 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="West Arsi Zone (13 Rural Woredas)" className="bg-slate-900 text-teal-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'West Arsi').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🌲 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Bale Zone (10 Rural Woredas)" className="bg-slate-900 text-cyan-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Bale').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🏔️ {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="East Bale Zone (7 Rural Woredas)" className="bg-slate-900 text-blue-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'East Bale').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🐪 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="East Shewa Zone (11 Rural Woredas)" className="bg-slate-900 text-amber-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'East Shewa').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🚜 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="North Shewa Zone (16 Rural Woredas)" className="bg-slate-900 text-indigo-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'North Shewa').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      ⛰️ {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Sheger City (12 Sub-cities)" className="bg-slate-900 text-purple-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Sheger City').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🏢 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Adama City (4 Sub-cities)" className="bg-slate-900 text-violet-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Adama City').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🏙️ {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Shashamane City (4 Sub-cities)" className="bg-slate-900 text-fuchsia-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Shashamane City').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🚦 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Bishoftu City (3 Sub-cities)" className="bg-slate-900 text-pink-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Bishoftu City').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🧪 {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Town Units (7 Urban Municipalities)" className="bg-slate-900 text-orange-300 font-bold">
                  {ARSI_WOREDAS.filter(w => w.zone === 'Town-level operational units').map(w => (
                    <option key={w.id} value={`woreda_${w.id}`} className="bg-slate-900 text-slate-200">
                      🏘️ {w.name} [{w.districtCode}]
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
        </div>

        {/* Live Coordinate, P-Code & Zoom Telemetry */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <Compass className="w-3 h-3 text-indigo-400 animate-spin-slow" />
          <span>{centerCoords[0].toFixed(3)}°N, {centerCoords[1].toFixed(3)}°E</span>
          {selectedExtent.pcode && (
            <>
              <span className="text-slate-600">|</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/50 text-[10px]" title="Official UN OCHA COD-AB P-Code">
                P-Code: {selectedExtent.pcode}
              </span>
            </>
          )}
          <span className="text-slate-600">|</span>
          <span>Zoom: <b className="text-indigo-300">{currentZoom}</b></span>
        </div>
      </div>
    </div>
  );
};

