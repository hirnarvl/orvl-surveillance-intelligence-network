import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  PhoneCall, 
  ShieldAlert, 
  AlertOctagon, 
  TrendingUp, 
  X,
  Sparkles
} from 'lucide-react';
import { SurveillanceRecord } from '../types';
import { exportToCSV } from '../utils/export';
import { Locale } from '../types';
import { translations } from '../utils/translations';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { soundEngine } from '../utils/sound';

const shortenDisease = (disease: string) => {
  if (!disease) return '';
  const match = disease.match(/\((.*?)\)/);
  if (match && match[1]) {
    if (match[1] === 'Zero Reporting') return 'None';
    return match[1];
  }
  return disease;
};

export interface AnomalyEvaluation {
  isAnomaly: boolean;
  type: 'data_entry_error' | 'severe_outbreak' | null;
  mortalityRate: number;
  benchmarkRate: number;
  multiplier: number;
  reason: string;
  badgeLabel: string;
  severity: 'critical' | 'warning' | 'normal';
}

interface SurveillanceTableProps {
  locale?: Locale;
  records: SurveillanceRecord[];
  allRecords?: SurveillanceRecord[];
}

export const SurveillanceTable: React.FC<SurveillanceTableProps> = ({ records, allRecords, locale }) => {
  const { locale: i18nLocale, t: i18nT } = useI18n();
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();
  const t = locale ? translations[locale] : i18nT;
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof SurveillanceRecord | 'mortalityRate'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Anomaly Detection State
  const [isAnomalyOnly, setIsAnomalyOnly] = useState(false);
  const [anomalyCategoryFilter, setAnomalyCategoryFilter] = useState<'all' | 'severe_outbreak' | 'data_entry_error'>('all');

  // Distinct zones from records
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => { if (r.zone) set.add(r.zone); });
    return Array.from(set).sort();
  }, [records]);

  // Compute 36-woreda historical average mortality rates & per-disease benchmarks
  const historicalBaseline = useMemo(() => {
    const pool = allRecords && allRecords.length > 0 ? allRecords : records;
    // Prefer baseline records or prior-year data, fallback to all valid non-zero records
    const priorYearRecs = pool.filter(
      r => (r.isBaseline || (r.sourceYear && r.sourceYear < 2026)) && !r.isZeroReport && (r.cases > 0 || r.deaths > 0)
    );
    const baselineSet = priorYearRecs.length >= 6 
      ? priorYearRecs 
      : pool.filter(r => !r.isZeroReport && (r.cases > 0 || r.deaths > 0));

    let totalCases = 0;
    let totalDeaths = 0;
    const diseaseMap: Record<string, { cases: number; deaths: number }> = {};

    baselineSet.forEach(r => {
      const c = Number(r.cases || 0);
      const d = Number(r.deaths || 0);
      totalCases += c;
      totalDeaths += d;

      const shortD = shortenDisease(r.disease);
      if (!diseaseMap[shortD]) {
        diseaseMap[shortD] = { cases: 0, deaths: 0 };
      }
      diseaseMap[shortD].cases += c;
      diseaseMap[shortD].deaths += d;
    });

    const overallAvg = totalCases > 0 ? Number(((totalDeaths / totalCases) * 100).toFixed(1)) : 14.5;

    const diseaseBenchmarks: Record<string, number> = {};
    Object.keys(diseaseMap).forEach(key => {
      const c = diseaseMap[key].cases;
      const d = diseaseMap[key].deaths;
      diseaseBenchmarks[key] = c > 0 ? Number(((d / c) * 100).toFixed(1)) : overallAvg;
    });

    return {
      overallAvg,
      diseaseBenchmarks,
      sampleSize: baselineSet.length
    };
  }, [records, allRecords]);

  // Evaluate each record against the 36-woreda historical average
  const getAnomalyEvaluation = (rec: SurveillanceRecord): AnomalyEvaluation => {
    if (rec.isZeroReport || (rec.cases === 0 && rec.deaths === 0)) {
      return {
        isAnomaly: false,
        type: null,
        mortalityRate: 0,
        benchmarkRate: historicalBaseline.overallAvg,
        multiplier: 0,
        reason: 'Zero Reporting / Non-outbreak observation',
        badgeLabel: 'Zero Report',
        severity: 'normal'
      };
    }

    const cases = Number(rec.cases || 0);
    const deaths = Number(rec.deaths || 0);
    const shortD = shortenDisease(rec.disease);
    const benchmarkRate = historicalBaseline.diseaseBenchmarks[shortD] ?? historicalBaseline.overallAvg;

    // 1. Data Entry Error: fatalities exceed total cases or positive deaths with 0 cases
    if (deaths > cases || (cases === 0 && deaths > 0)) {
      const rate = cases > 0 ? Number(((deaths / cases) * 100).toFixed(1)) : 100;
      return {
        isAnomaly: true,
        type: 'data_entry_error',
        mortalityRate: rate,
        benchmarkRate,
        multiplier: benchmarkRate > 0 ? Number((rate / benchmarkRate).toFixed(1)) : 99,
        reason: `Fatalities (${deaths}) exceed total reported cases (${cases}). High probability of transposition or data entry error.`,
        badgeLabel: 'Data Entry Error: Deaths > Cases',
        severity: 'critical'
      };
    }

    const mortalityRate = Number(((deaths / cases) * 100).toFixed(1));
    const multiplier = benchmarkRate > 0 ? Number((mortalityRate / benchmarkRate).toFixed(1)) : 1;

    // 2. Unusually High Mortality Surge compared to the 36-woreda historical average:
    // Triggers when:
    // a) mortalityRate >= 2.0x 36-woreda benchmark with at least 3 fatalities
    // b) mortalityRate is at least 20 percentage points above benchmark with at least 2 fatalities
    // c) mortalityRate >= 50% for diseases with low normal benchmarks (<= 25%) with at least 2 fatalities
    // d) peracute disease threshold: >= 75% mortality with at least 4 fatalities
    const isSurge = 
      (mortalityRate >= benchmarkRate * 2.0 && mortalityRate >= 20 && deaths >= 3) ||
      (mortalityRate >= benchmarkRate + 20 && deaths >= 2) ||
      (mortalityRate >= 50 && benchmarkRate <= 25 && deaths >= 2) ||
      (mortalityRate >= 75 && deaths >= 4);

    if (isSurge) {
      const isCritical = mortalityRate >= 60 || deaths >= 10 || multiplier >= 3.0;
      return {
        isAnomaly: true,
        type: 'severe_outbreak',
        mortalityRate,
        benchmarkRate,
        multiplier,
        reason: `Mortality rate (${mortalityRate}%) is ${multiplier}x higher than 36-woreda historical average (${benchmarkRate}%). Severe outbreak surge detected.`,
        badgeLabel: `${multiplier}x 36-Woreda Avg (${mortalityRate}%)`,
        severity: isCritical ? 'critical' : 'warning'
      };
    }

    return {
      isAnomaly: false,
      type: null,
      mortalityRate,
      benchmarkRate,
      multiplier,
      reason: 'Within 36-woreda expected historical threshold',
      badgeLabel: `${mortalityRate}%`,
      severity: 'normal'
    };
  };

  // Pre-calculate evaluation map for fast lookup
  const anomalyMap = useMemo(() => {
    const map = new Map<string, AnomalyEvaluation>();
    records.forEach(r => {
      map.set(r.id, getAnomalyEvaluation(r));
    });
    return map;
  }, [records, historicalBaseline]);

  // Total anomaly statistics across active records
  const anomalyStats = useMemo(() => {
    let totalAnomalies = 0;
    let severeOutbreaks = 0;
    let dataEntryErrors = 0;

    records.forEach(r => {
      const evalData = anomalyMap.get(r.id);
      if (evalData?.isAnomaly) {
        totalAnomalies += 1;
        if (evalData.type === 'severe_outbreak') severeOutbreaks += 1;
        if (evalData.type === 'data_entry_error') dataEntryErrors += 1;
      }
    });

    return { totalAnomalies, severeOutbreaks, dataEntryErrors };
  }, [records, anomalyMap]);

  const handleSort = (field: keyof SurveillanceRecord | 'mortalityRate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = records.filter(rec => {
    if (zoneFilter !== 'All' && rec.zone !== zoneFilter) return false;

    const evalData = anomalyMap.get(rec.id);

    // Apply Anomaly Detection filter if toggled
    if (isAnomalyOnly) {
      if (!evalData?.isAnomaly) return false;
      if (anomalyCategoryFilter === 'severe_outbreak' && evalData.type !== 'severe_outbreak') return false;
      if (anomalyCategoryFilter === 'data_entry_error' && evalData.type !== 'data_entry_error') return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      rec.woreda.toLowerCase().includes(term) ||
      rec.disease.toLowerCase().includes(term) ||
      rec.species.toLowerCase().includes(term) ||
      (rec.reporter && rec.reporter.toLowerCase().includes(term)) ||
      (rec.comment && rec.comment.toLowerCase().includes(term)) ||
      (isAnomalyOnly && evalData?.badgeLabel.toLowerCase().includes(term)) ||
      (isAnomalyOnly && evalData?.reason.toLowerCase().includes(term))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'mortalityRate') {
      const rateA = anomalyMap.get(a.id)?.mortalityRate || 0;
      const rateB = anomalyMap.get(b.id)?.mortalityRate || 0;
      return sortAsc ? rateA - rateB : rateB - rateA;
    }
    let valA = a[sortField as keyof SurveillanceRecord];
    let valB = b[sortField as keyof SurveillanceRecord];
    if (typeof valA === 'string') {
      return sortAsc
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortAsc ? Number(valA || 0) - Number(valB || 0) : Number(valB || 0) - Number(valA || 0);
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    soundEngine.playSuccess();
    const exportData = sorted.map(rec => {
      const evalData = anomalyMap.get(rec.id);
      return {
        ID: rec.id,
        Date: rec.date,
        Woreda: rec.woreda,
        Zone: rec.zone,
        Disease: rec.disease,
        Species: rec.species,
        Cases: rec.cases,
        Deaths: rec.deaths,
        Mortality_Rate_Pct: evalData?.mortalityRate ?? (rec.cases > 0 ? Number(((rec.deaths / rec.cases) * 100).toFixed(1)) : 0),
        Historical_36_Woreda_Benchmark_Pct: evalData?.benchmarkRate ?? historicalBaseline.overallAvg,
        Anomaly_Flag: evalData?.isAnomaly ? 'YES' : 'NO',
        Anomaly_Type: evalData?.type || 'None',
        Anomaly_Reason: evalData?.reason || 'Normal baseline threshold',
        Risk_Level: rec.risk,
        Reporter: rec.reporter || '',
        Phone: rec.phone || '',
        Comment: rec.comment || ''
      };
    });
    exportToCSV(isAnomalyOnly ? `${currentLabInfo.shortCode}_Surveillance_Mortality_Anomalies` : `${currentLabInfo.shortCode}_Surveillance_Records`, exportData);
  };

  const tableTitle = getLabHeader('Field Surveillance Records & Arrival Log');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {tableTitle}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              selectedLab === 'arvl' 
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                : selectedLab === 'hrvl'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/60'
            }`}>
              {currentLabInfo.shortCode} ({currentLabInfo.coverageWoredas} Woredas)
            </span>
            {isAnomalyOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                <ShieldAlert className="w-3 h-3" />
                <span>Anomaly Mode</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual telemetry entries logged across {currentLabInfo.coverageWoredas} operational units in {currentLabInfo.fullName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Anomaly Detection Toggle Button */}
          <button
            id="toggle-anomaly-detection"
            type="button"
            onClick={() => {
              const nextState = !isAnomalyOnly;
              setIsAnomalyOnly(nextState);
              setCurrentPage(1);
              if (nextState) {
                soundEngine.playAlert();
              } else {
                soundEngine.playClick();
              }
            }}
            title={`Filter records to display entries with unusually high mortality rates compared to the ${currentLabInfo.shortCode} historical average`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-xs ${
              isAnomalyOnly
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 ring-2 ring-rose-400/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isAnomalyOnly ? 'text-white animate-pulse' : 'text-amber-500'}`} />
            <span>{t.tblAnomalyDetection}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              isAnomalyOnly 
                ? 'bg-rose-800 text-white' 
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
            }`}>
              {anomalyStats.totalAnomalies}
            </span>
          </button>

          {/* Zone Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <select
              aria-label="Table Zone Filter"
              value={zoneFilter}
              onChange={(e) => { setZoneFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="All">All Zones ({availableZones.length})</option>
              {availableZones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search Surveillance Records"
              placeholder={isAnomalyOnly ? "Search anomalies, woreda, disease..." : "Search woreda, disease, species..."}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.tblExportCSV}</span>
          </button>
        </div>
      </div>

      {/* Anomaly Detection Banner (Visible when Anomaly Detection is active) */}
      {isAnomalyOnly && (
        <div 
          id="anomaly-detection-banner"
          className="mt-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/90 dark:bg-rose-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  36-Woreda Mortality Anomaly Detection Active
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900 text-[10px] font-mono font-bold text-rose-900 dark:text-rose-200">
                  {t.tblHistoricalBenchmark}: {historicalBaseline.overallAvg}%
                </span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Filtering telemetry entries with unusually elevated mortality rates compared to the 36-woreda historical average ({historicalBaseline.overallAvg}%) or suspected data entry errors.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Filter by anomaly type chips */}
            <button
              type="button"
              onClick={() => { setAnomalyCategoryFilter('all'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                anomalyCategoryFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-rose-800 dark:text-rose-200 hover:bg-white border border-rose-200 dark:border-rose-800'
              }`}
            >
              All Anomalies ({anomalyStats.totalAnomalies})
            </button>
            <button
              type="button"
              onClick={() => { setAnomalyCategoryFilter('severe_outbreak'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                anomalyCategoryFilter === 'severe_outbreak'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-amber-800 dark:text-amber-200 hover:bg-white border border-amber-200 dark:border-amber-800'
              }`}
            >
              Severe Outbreaks ({anomalyStats.severeOutbreaks})
            </button>
            <button
              type="button"
              onClick={() => { setAnomalyCategoryFilter('data_entry_error'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                anomalyCategoryFilter === 'data_entry_error'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-red-800 dark:text-red-200 hover:bg-white border border-red-200 dark:border-red-800'
              }`}
            >
              Entry Errors ({anomalyStats.dataEntryErrors})
            </button>
            <button
              type="button"
              onClick={() => { setIsAnomalyOnly(false); setCurrentPage(1); soundEngine.playClick(); }}
              className="p-1 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 ml-1 cursor-pointer"
              title="Exit Anomaly Detection View"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Data View */}
      <div className="mt-3">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('date')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.colDate}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('woreda')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.colWoreda}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('zone')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.colZone}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('disease')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Disease / Event</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center font-bold">{t.colSpecies}</th>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('cases')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.colCases}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-center font-bold" onClick={() => handleSort('deaths')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>{t.colDeaths}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                {/* Mortality Rate & Anomaly Status Column */}
                <th 
                  className="py-2.5 px-3 cursor-pointer text-center font-bold" 
                  onClick={() => handleSort('mortalityRate')}
                  title="Sort by mortality rate percentage and compare against 36-woreda historical average"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className={sortField === 'mortalityRate' ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>
                      Mortality Rate
                    </span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center font-bold">{t.colReporter}</th>
                <th className="py-2.5 px-3 text-center font-bold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
                      <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                        {isAnomalyOnly 
                          ? 'No anomalous mortality entries detected for the current filters.' 
                          : 'No records found matching current search/filter criteria.'}
                      </p>
                      {isAnomalyOnly && (
                        <p className="text-[11px] text-slate-400 max-w-md">
                          All logged records align with expected 36-woreda epidemiological parameters (Historical baseline average: {historicalBaseline.overallAvg}%).
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((rec) => {
                  const evalData = anomalyMap.get(rec.id);
                  const isAnomaly = evalData?.isAnomaly;

                  return (
                    <tr 
                      key={rec.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isAnomaly 
                          ? evalData.type === 'data_entry_error'
                            ? 'bg-red-50/50 dark:bg-red-950/25 border-l-4 border-l-red-500'
                            : 'bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-l-amber-500'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {rec.date}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {rec.woreda === 'UNMATCHED_WOREDA' ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-extrabold border border-amber-300 dark:border-amber-800" title="Flagged: Unauthorized woreda outside 36 master operational area">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>UNMATCHED_WOREDA</span>
                          </span>
                        ) : (
                          rec.woreda
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rec.zone === 'E/H'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}>
                          {rec.zone}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {rec.isZeroReport ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Zero Report</span>
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{shortenDisease(rec.disease)}</span>
                            {isAnomaly && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]" title={evalData.reason}>
                                {evalData.reason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {rec.species}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                        {rec.cases}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                        {rec.deaths}
                      </td>
                      
                      {/* Mortality Rate & Anomaly Tag */}
                      <td className="py-2.5 px-3 text-center">
                        {rec.isZeroReport ? (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className={`font-mono font-bold text-xs ${
                              isAnomaly
                                ? evalData.type === 'data_entry_error'
                                  ? 'text-red-600 dark:text-red-400 font-black'
                                  : 'text-amber-600 dark:text-amber-400 font-black'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {evalData?.mortalityRate}%
                            </span>

                            {isAnomaly && (
                              <div className="mt-1">
                                {evalData.type === 'data_entry_error' ? (
                                  <span 
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border border-red-200 dark:border-red-800"
                                    title={evalData.reason}
                                  >
                                    <AlertOctagon className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
                                    <span>Entry Error</span>
                                  </span>
                                ) : (
                                  <span 
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                                    title={evalData.reason}
                                  >
                                    <TrendingUp className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                                    <span>{evalData.multiplier}x 36-W Avg</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        <div className="font-semibold">{rec.reporter || 'Field Agent'}</div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                          <PhoneCall className="w-2.5 h-2.5" />
                          <span>{rec.phone || '*'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          rec.risk === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : rec.risk === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {rec.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden space-y-3">
          {paginated.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                {isAnomalyOnly 
                  ? 'No anomalous mortality entries detected for current filters.' 
                  : 'No records found matching criteria.'}
              </p>
            </div>
          ) : (
            paginated.map((rec) => {
              const evalData = anomalyMap.get(rec.id);
              const isAnomaly = evalData?.isAnomaly;

              return (
                <div 
                  key={rec.id} 
                  className={`p-3.5 rounded-xl border shadow-sm space-y-2.5 transition-colors ${
                    isAnomaly
                      ? evalData.type === 'data_entry_error'
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.zone === 'E/H'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}>
                        {rec.zone}
                      </span>
                      {rec.woreda === 'UNMATCHED_WOREDA' ? (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-extrabold border border-amber-300 dark:border-amber-800" title="Flagged: Unauthorized woreda outside 36 master operational area">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>UNMATCHED_WOREDA</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{rec.woreda}</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{rec.date}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Disease / Event</span>
                      {rec.isZeroReport ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Zero Report</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{shortenDisease(rec.disease)}</span>
                      )}
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">{t.colSpecies}</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">{rec.species}</span>
                    </div>
                  </div>

                  {!rec.isZeroReport && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-bold uppercase">Cases</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">{rec.cases}</span>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-bold uppercase">Deaths</span>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 tabular-nums">{rec.deaths}</span>
                      </div>
                      <div className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                        isAnomaly 
                          ? evalData.type === 'data_entry_error'
                            ? 'bg-red-100/60 dark:bg-red-950/40 border border-red-300 dark:border-red-800'
                            : 'bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Mortality</span>
                        <span className={`text-base font-black tabular-nums ${
                          isAnomaly 
                            ? evalData.type === 'data_entry_error' 
                              ? 'text-red-700 dark:text-red-300' 
                              : 'text-amber-700 dark:text-amber-300' 
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {evalData?.mortalityRate}%
                        </span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Risk</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          rec.risk === 'Critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : rec.risk === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {rec.risk}
                        </span>
                      </div>
                    </div>
                  )}

                  {isAnomaly && (
                    <div className={`flex items-start gap-1.5 p-2 rounded-lg border text-[11px] font-semibold ${
                      evalData.type === 'data_entry_error'
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                    }`}>
                      {evalData.type === 'data_entry_error' ? (
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-red-600 mt-0.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                      )}
                      <span>{evalData.reason}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1 font-medium">
                      <PhoneCall className="w-3 h-3" />
                      <span>{rec.reporter || 'Field Agent'}</span>
                    </div>
                    <span>{rec.phone || '*'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-4">
          <span>{t.tblShowingRecords} {paginated.length} of {sorted.length} records</span>
          <div className="flex items-center space-x-2">
            <span>{t.tblRows}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Prev
          </button>
          
          <div className="flex items-center justify-center space-x-1">
            <span>{t.tblPage}</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span>{t.tblOf} {totalPages}</span>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
