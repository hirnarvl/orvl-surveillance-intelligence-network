import React, { useState, useEffect, useMemo } from 'react';
import { X, PlusCircle, AlertCircle, Building2, MapPin, Calendar, Activity, Database, CheckCircle2, Navigation } from 'lucide-react';
import { HARARGHE_WOREDAS, ARSI_WOREDAS, validateWoreda } from '../data/woredas';
import { DiseaseName, LivestockSpecies, RiskLevel, SurveillanceRecord, WoredaInfo, ZoneName } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';

interface NewArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (rec: SurveillanceRecord) => boolean | void;
}

const ARVL_ZONES = [
  'Arsi',
  'West Arsi',
  'Bale',
  'East Bale',
  'East Shewa',
  'North Shewa',
  'Sheger City',
  'Adama City',
  'Shashamane City',
  'Bishoftu City',
  'Town-level operational units'
] as const;

const HRVL_DISEASES = [
  'Foot-and-Mouth Disease (FMD)',
  'Lumpy Skin Disease (LSD)',
  'Peste des Petits Ruminants (PPR)',
  'Contagious Bovine Pleuropneumonia (CBPP)',
  'African Horse Sickness (AHS)',
  'Anthrax',
  'Rabies',
  'Newcastle Disease (ND)'
];

const ARVL_DISEASES = [
  'Bovine Brucellosis',
  'Foot-and-Mouth Disease (FMD)',
  'Contagious Bovine Pleuropneumonia (CBPP)',
  'Peste des Petits Ruminants (PPR)',
  'Lumpy Skin Disease (LSD)',
  'Rabies',
  'Anthrax',
  'Newcastle Disease (ND)',
  'Bovine Trypanosomiasis',
  'African Horse Sickness (AHS)'
];

export const NewArrivalModal: React.FC<NewArrivalModalProps> = ({
  isOpen,
  onClose,
  onAddRecord
}) => {
  const { t } = useI18n();
  const { selectedLab, currentLabInfo } = useLaboratory();

  // Active laboratory context for the modal
  const [activeModalLab, setActiveModalLab] = useState<'hrvl' | 'arvl'>('hrvl');

  // HRVL zone filter
  const [hrvlZoneFilter, setHrvlZoneFilter] = useState<'All' | 'E/H' | 'W/H'>('All');

  // ARVL zone filter (all 12 zones)
  const [arvlZoneFilter, setArvlZoneFilter] = useState<string>('All');

  // Woreda ID and Name
  const [woredaId, setWoredaId] = useState<string>('eh-10');
  const [woredaName, setWoredaName] = useState<string>('Haramaya');

  // Clinical & Event Details
  const [disease, setDisease] = useState<string>('Foot-and-Mouth Disease (FMD)');
  const [species, setSpecies] = useState<string>('Cattle');
  const [cases, setCases] = useState<number>(10);
  const [deaths, setDeaths] = useState<number>(1);
  const [risk, setRisk] = useState<RiskLevel>('High');
  const [isZeroReport, setIsZeroReport] = useState<boolean>(false);
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reporter, setReporter] = useState<string>('Vet Tech Mohammed');
  const [phone, setPhone] = useState<string>('+251915443322');
  const [comment, setComment] = useState<string>('Field arrival entry logged at Hirna Regional Lab.');

  // Synchronize modal state with global laboratory context when opened
  useEffect(() => {
    if (isOpen) {
      const initialLab: 'hrvl' | 'arvl' = selectedLab === 'arvl' ? 'arvl' : 'hrvl';
      setActiveModalLab(initialLab);

      if (initialLab === 'arvl') {
        const defaultArvl = ARSI_WOREDAS.find(w => w.id === 'arvl-tw-005') || ARSI_WOREDAS[0]; // Asella
        setWoredaId(defaultArvl.id);
        setWoredaName(defaultArvl.name);
        setArvlZoneFilter('All');
        setDisease('Bovine Brucellosis');
        setReporter('Dr. Kassa (ARVL Epidemiologist)');
        setPhone('+251223311088');
        setComment('Field arrival entry logged at Asela Regional Veterinary Laboratory (ARVL).');
      } else {
        const defaultHrvl = HARARGHE_WOREDAS.find(w => w.id === 'eh-10') || HARARGHE_WOREDAS[0]; // Haramaya
        setWoredaId(defaultHrvl.id);
        setWoredaName(defaultHrvl.name);
        setHrvlZoneFilter('All');
        setDisease('Foot-and-Mouth Disease (FMD)');
        setReporter('Vet Tech Mohammed');
        setPhone('+251915443322');
        setComment('Field arrival entry logged at Hirna Regional Veterinary Laboratory (HRVL).');
      }
    }
  }, [isOpen, selectedLab]);

  // Handle switching active laboratory context directly within the modal
  const handleSwitchLab = (newLab: 'hrvl' | 'arvl') => {
    if (newLab === activeModalLab) return;
    setActiveModalLab(newLab);

    if (newLab === 'arvl') {
      const defaultArvl = ARSI_WOREDAS.find(w => w.id === 'arvl-tw-005') || ARSI_WOREDAS[0];
      setWoredaId(defaultArvl.id);
      setWoredaName(defaultArvl.name);
      setArvlZoneFilter('All');
      setDisease('Bovine Brucellosis');
      setReporter('Dr. Kassa (ARVL Epidemiologist)');
      setPhone('+251223311088');
      setComment('Field arrival entry logged at Asela Regional Veterinary Laboratory (ARVL).');
    } else {
      const defaultHrvl = HARARGHE_WOREDAS.find(w => w.id === 'eh-10') || HARARGHE_WOREDAS[0];
      setWoredaId(defaultHrvl.id);
      setWoredaName(defaultHrvl.name);
      setHrvlZoneFilter('All');
      setDisease('Foot-and-Mouth Disease (FMD)');
      setReporter('Vet Tech Mohammed');
      setPhone('+251915443322');
      setComment('Field arrival entry logged at Hirna Regional Veterinary Laboratory (HRVL).');
    }
  };

  // Active woredas pool based on activeModalLab
  const activeWoredasPool = useMemo<WoredaInfo[]>(() => {
    return activeModalLab === 'arvl' ? ARSI_WOREDAS : HARARGHE_WOREDAS;
  }, [activeModalLab]);

  // Currently selected woreda object
  const selectedWoredaObj = useMemo<WoredaInfo>(() => {
    return (
      activeWoredasPool.find(w => w.id === woredaId) ||
      activeWoredasPool.find(w => w.name.toLowerCase() === woredaName.toLowerCase()) ||
      activeWoredasPool[0]
    );
  }, [activeWoredasPool, woredaId, woredaName]);

  const detectedZone: ZoneName = selectedWoredaObj.zone;

  const handleWoredaChange = (selectedId: string) => {
    const matched = activeWoredasPool.find(w => w.id === selectedId);
    if (matched) {
      setWoredaId(matched.id);
      setWoredaName(matched.name);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const woredaValidation = validateWoreda(woredaName, activeModalLab);
    const validWoredaName = woredaValidation.isValid ? woredaValidation.woredaName : selectedWoredaObj.name;
    const validZone = woredaValidation.isValid ? woredaValidation.zone : detectedZone;

    const newRec: SurveillanceRecord = {
      id: `SR-${activeModalLab.toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      laboratoryId: activeModalLab,
      laboratoryName: activeModalLab === 'arvl' ? 'Asela Regional Veterinary Laboratory' : 'Hirna Regional Veterinary Laboratory',
      region: 'Oromia',
      date: dateStr,
      timestamp: new Date(dateStr).getTime(),
      woreda: validWoredaName,
      zone: validZone,
      lat: woredaValidation.matchedWoreda ? woredaValidation.matchedWoreda.lat : selectedWoredaObj.lat,
      lng: woredaValidation.matchedWoreda ? woredaValidation.matchedWoreda.lng : selectedWoredaObj.lng,
      disease: isZeroReport ? 'None (Zero Reporting)' : disease,
      species: isZeroReport ? 'None' : species,
      cases: isZeroReport ? 0 : Number(cases),
      deaths: isZeroReport ? 0 : Number(deaths),
      risk: isZeroReport ? 'Low' : risk,
      comment,
      reporter,
      phone,
      isZeroReport,
      dataQualityStatus: woredaValidation.status
    };

    const result = onAddRecord(newRec);
    if (result !== false) {
      onClose();
    }
  };

  const diseaseOptions = activeModalLab === 'arvl' ? ARVL_DISEASES : HRVL_DISEASES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 relative transition-colors">
        
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className={`p-2.5 rounded-xl ${
            activeModalLab === 'arvl'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
              : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
          }`}>
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Log Field Arrival / Surveillance Record
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                activeModalLab === 'arvl'
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
              }`}>
                {activeModalLab.toUpperCase()}-ET
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeModalLab === 'arvl'
                ? 'Asela Regional Veterinary Laboratory (ARVL) • 122 Operational Area Units (112 Master + 10 Buffer)'
                : 'Hirna Regional Veterinary Laboratory (HRVL) • 36 Hararghe Baseline Woredas (E/H & W/H)'}
            </p>
          </div>
        </div>

        {/* Laboratory Context Switcher (Shown if in multi-lab view or allows lab toggling) */}
        {selectedLab === 'all' && (
          <div className="mt-4 flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Target Laboratory Catchment:
            </span>
            <div className="inline-flex rounded-lg p-1 bg-slate-200 dark:bg-slate-900 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSwitchLab('hrvl')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeModalLab === 'hrvl'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                HRVL (Hirna • 36)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLab('arvl')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeModalLab === 'arvl'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ARVL (Asela • 122)
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Zero Report Checkbox */}
          <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
            <input
              type="checkbox"
              id="zeroReportCheck"
              checked={isZeroReport}
              onChange={e => setIsZeroReport(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="zeroReportCheck" className="font-bold cursor-pointer">
              Log as Zero Reporting Submission (No Outbreak / 0 Cases in Woreda)
            </label>
          </div>

          {/* ========================================================================= */}
          {/* CONDITIONAL GEOGRAPHIC SELECTION INPUTS BASED ON LABORATORY CONFIGURATION */}
          {/* ========================================================================= */}

          {activeModalLab === 'hrvl' ? (
            /* HRVL GEOGRAPHIC SELECTION INPUTS (Hararghe 36 Woredas: E/H & W/H) */
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/25 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    HRVL Hararghe Geographic Hierarchy (36 Woredas)
                  </span>
                </div>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                  East Hararghe (21) & West Hararghe (15)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Zone Filter */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Zone Selection / Filter
                  </label>
                  <select
                    value={hrvlZoneFilter}
                    onChange={e => {
                      const val = e.target.value as 'All' | 'E/H' | 'W/H';
                      setHrvlZoneFilter(val);
                      if (val !== 'All') {
                        const firstInZone = HARARGHE_WOREDAS.find(w => w.zone === val);
                        if (firstInZone) {
                          setWoredaId(firstInZone.id);
                          setWoredaName(firstInZone.name);
                        }
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Hararghe Zones (36 Woredas)</option>
                    <option value="E/H">East Hararghe (E/H — 21 Woredas)</option>
                    <option value="W/H">West Hararghe (W/H — 15 Woredas)</option>
                  </select>
                </div>

                {/* Woreda Dropdown */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Woreda / District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={woredaId}
                    onChange={e => handleWoredaChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {(hrvlZoneFilter === 'All' || hrvlZoneFilter === 'E/H') && (
                      <optgroup label="East Hararghe (E/H — 21 Woredas)">
                        {HARARGHE_WOREDAS.filter(w => w.zone === 'E/H').map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.districtCode || 'EH'} • Rural Woreda)
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {(hrvlZoneFilter === 'All' || hrvlZoneFilter === 'W/H') && (
                      <optgroup label="West Hararghe (W/H — 15 Woredas)">
                        {HARARGHE_WOREDAS.filter(w => w.zone === 'W/H').map(w => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.districtCode || 'WH'} • Rural Woreda)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              {/* Geographic Verification Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Detected Zone: <strong>{detectedZone === 'E/H' ? 'East Hararghe (E/H)' : 'West Hararghe (W/H)'}</strong>
                </span>
                {selectedWoredaObj.districtCode && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    District Code: <strong>{selectedWoredaObj.districtCode}</strong>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  Coordinates: <strong>{selectedWoredaObj.lat.toFixed(4)}° N, {selectedWoredaObj.lng.toFixed(4)}° E</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  Pop. Est: <strong>{selectedWoredaObj.populationEstimate.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          ) : (
            /* ARVL GEOGRAPHIC SELECTION INPUTS (Asela Catchment 122 Operational Area Units) */
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/25 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ARVL Geographic Hierarchy (122 Operational Area Units)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                  112 Master + 10 Buffer Units
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ARVL Administrative Zone / City Selector */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Administrative Zone / Municipality
                  </label>
                  <select
                    value={arvlZoneFilter}
                    onChange={e => {
                      const val = e.target.value;
                      setArvlZoneFilter(val);
                      if (val !== 'All') {
                        const firstInZone = ARSI_WOREDAS.find(w => w.zone === val);
                        if (firstInZone) {
                          setWoredaId(firstInZone.id);
                          setWoredaName(firstInZone.name);
                        }
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="All">All ARVL Catchment (122 Operational Units)</option>
                    <option value="Arsi">Arsi Zone (25 Rural Woredas)</option>
                    <option value="West Arsi">West Arsi Zone (13 Rural Woredas)</option>
                    <option value="Bale">Bale Zone (10 Rural Woredas)</option>
                    <option value="East Bale">East Bale Zone (7 Rural Woredas)</option>
                    <option value="East Shewa">East Shewa Zone (11 Rural Woredas)</option>
                    <option value="North Shewa">North Shewa Zone (16 Rural Woredas)</option>
                    <option value="Sheger City">Sheger City (12 Sub-cities)</option>
                    <option value="Adama City">Adama City (4 Sub-cities)</option>
                    <option value="Shashamane City">Shashamane City (4 Sub-cities)</option>
                    <option value="Bishoftu City">Bishoftu City (3 Sub-cities)</option>
                    <option value="Town-level operational units">Town-level Units (7 Municipal Towns)</option>
                  </select>
                </div>

                {/* ARVL Operational Unit Dropdown */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Area / Woreda <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={woredaId}
                    onChange={e => handleWoredaChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {arvlZoneFilter === 'All' ? (
                      ARVL_ZONES.map(z => {
                        const zoneUnits = ARSI_WOREDAS.filter(w => w.zone === z);
                        if (zoneUnits.length === 0) return null;
                        return (
                          <optgroup key={z} label={`${z} (${zoneUnits.length} Units)`}>
                            {zoneUnits.map(w => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.districtCode || ''} • {w.admType || 'Woreda'})
                              </option>
                            ))}
                          </optgroup>
                        );
                      })
                    ) : (
                      ARSI_WOREDAS.filter(w => w.zone === arvlZoneFilter).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.districtCode || ''} • {w.admType || 'Woreda'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Geographic Verification Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 font-semibold">
                  Detected Zone: <strong>{detectedZone}</strong>
                </span>
                {selectedWoredaObj.admType && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    Type: <strong>{selectedWoredaObj.admType}</strong>
                  </span>
                )}
                {selectedWoredaObj.districtCode && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    Code: <strong>{selectedWoredaObj.districtCode}</strong>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  Coordinates: <strong>{selectedWoredaObj.lat.toFixed(4)}° N, {selectedWoredaObj.lng.toFixed(4)}° E</strong>
                </span>
                {selectedWoredaObj.isExpansionUnit && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium">
                    Expansion Corridor
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Clinical Surveillance Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Observation Date */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Observation Date
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Epidemiological Risk
              </label>
              <select
                disabled={isZeroReport}
                value={risk}
                onChange={e => setRisk(e.target.value as RiskLevel)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>

            {/* Target Disease */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Disease
              </label>
              <select
                disabled={isZeroReport}
                value={disease}
                onChange={e => setDisease(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {diseaseOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Affected Species */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Affected Species
              </label>
              <select
                disabled={isZeroReport}
                value={species}
                onChange={e => setSpecies(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Cattle">Cattle</option>
                <option value="Goats">Goats</option>
                <option value="Sheep">Sheep</option>
                <option value="Poultry">Poultry</option>
                <option value="Equines">Equines</option>
                <option value="Camels">Camels</option>
                <option value="Swine / Others">Swine / Others</option>
              </select>
            </div>

            {/* Number of Cases */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Number of Cases
              </label>
              <input
                type="number"
                disabled={isZeroReport}
                min={0}
                value={isZeroReport ? 0 : cases}
                onChange={e => setCases(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Number of Fatalities */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Number of Fatalities
              </label>
              <input
                type="number"
                disabled={isZeroReport}
                min={0}
                value={isZeroReport ? 0 : deaths}
                onChange={e => setDeaths(Number(e.target.value))}
                className={`w-full p-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none disabled:opacity-50 ${
                  !isZeroReport && deaths > cases
                    ? 'border-rose-500 text-rose-600 ring-2 ring-rose-500/20'
                    : 'border-slate-300 dark:border-slate-700 text-rose-600'
                }`}
              />
              {!isZeroReport && deaths > cases && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                  Fatalities cannot exceed reported cases ({cases}).
                </p>
              )}
              {!isZeroReport && cases > 0 && deaths > 0 && deaths <= cases && (deaths / cases) >= 0.40 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                  ⚠️ Unusually high mortality ({((deaths / cases) * 100).toFixed(1)}% CFR) — will be flagged as Critical.
                </p>
              )}
            </div>

          </div>

          {/* Reporter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Reporter Name
              </label>
              <input
                type="text"
                value={reporter}
                onChange={e => setReporter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Field Observations & Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Field Observations & Diagnostic Notes
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-white font-bold shadow-md cursor-pointer transition-colors ${
                activeModalLab === 'arvl'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Submit Field Record ({activeModalLab.toUpperCase()})
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

