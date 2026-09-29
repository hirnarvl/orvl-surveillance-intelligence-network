import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { TrendingDown, Activity, AlertCircle, Clock, Download } from 'lucide-react';
import { Locale } from '../types';
import { translations } from '../utils/translations';
import { 
  HRVL_CFR_TREND_DATA, 
  ARVL_CFR_TREND_DATA, 
  HRVL_CFR_MULTI_YEAR_BENCHMARK, 
  ARVL_CFR_MULTI_YEAR_BENCHMARK 
} from '../data/sampleData';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { exportToCSV } from '../utils/export';
import { soundEngine } from '../utils/sound';

interface CFRTrendChartProps {
  darkMode: boolean;
  locale?: Locale;
  laboratoryId?: 'hrvl' | 'arvl' | 'all' | string;
}

export const CFRTrendChart: React.FC<CFRTrendChartProps> = ({ darkMode, locale, laboratoryId }) => {
  const { locale: i18nLocale, t: i18nT } = useI18n();
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();
  const t = locale ? translations[locale] : i18nT;
  const [viewMode, setViewMode] = useState<'All_Diseases' | 'YoY_Comparative'>('YoY_Comparative');
  const [selectedDisease, setSelectedDisease] = useState<'PPR' | 'FMD' | 'CBPP'>('PPR');

  const activeLab = laboratoryId || selectedLab || 'hrvl';
  const isArvl = activeLab === 'arvl';

  const trendData = isArvl ? ARVL_CFR_TREND_DATA : HRVL_CFR_TREND_DATA;
  const benchmarkData = isArvl ? ARVL_CFR_MULTI_YEAR_BENCHMARK : HRVL_CFR_MULTI_YEAR_BENCHMARK;

  const handleExportCSV = () => {
    soundEngine.playSuccess();
    const todayStr = new Date().toISOString().slice(0, 10);
    
    if (viewMode === 'All_Diseases') {
      const rows = trendData.map(row => ({
        Month: row.month,
        FMD_CFR_Pct: row.FMD,
        LSD_CFR_Pct: row.LSD,
        PPR_CFR_Pct: row.PPR,
        CBPP_CFR_Pct: row.CBPP,
        Anthrax_CFR_Pct: row.Anthrax,
        ...(isArvl && (row as any).Brucellosis !== undefined ? { Brucellosis_CFR_Pct: (row as any).Brucellosis } : {}),
        Critical_Threshold_Pct: 20,
        Laboratory: `${currentLabInfo.fullName} (${currentLabInfo.shortCode})`,
        Operational_Corridor: isArvl ? 'Arsi, West Arsi, Bale, East Bale & East Shewa' : 'East & West Hararghe',
        Export_Date: todayStr
      }));
      exportToCSV(`${currentLabInfo.shortCode}_CFR_Major_Diseases_Trend_${todayStr}`, rows);
    } else {
      const rows = benchmarkData.map(row => ({
        Month: row.month,
        Selected_Focus_Disease: selectedDisease,
        [`${selectedDisease}_2026_Actual_CFR_Pct`]: (row as any)[`${selectedDisease}_2026`],
        [`${selectedDisease}_2025_YoY_Benchmark_CFR_Pct`]: (row as any)[`${selectedDisease}_2025`],
        FMD_2026_Actual: row.FMD_2026,
        FMD_2025_Benchmark: row.FMD_2025,
        PPR_2026_Actual: row.PPR_2026,
        PPR_2025_Benchmark: row.PPR_2025,
        CBPP_2026_Actual: row.CBPP_2026,
        CBPP_2025_Benchmark: row.CBPP_2025,
        Target_CFR_Pct: row.Target,
        Laboratory: `${currentLabInfo.fullName} (${currentLabInfo.shortCode})`,
        Operational_Corridor: isArvl ? 'Arsi, West Arsi, Bale, East Bale & East Shewa' : 'East & West Hararghe',
        Export_Date: todayStr
      }));
      exportToCSV(`${currentLabInfo.shortCode}_CFR_YoY_MultiYear_${selectedDisease}_${todayStr}`, rows);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors flex flex-col justify-between">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {getLabHeader('Case Fatality Rate (CFR %) & Multi-Year Comparative Overlay')}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Multi-year seasonal mortality benchmarks & historical surge anticipation for {currentLabInfo.fullName}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('YoY_Comparative')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'YoY_Comparative' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              YoY Multi-Year Overlay
            </button>
            <button
              onClick={() => setViewMode('All_Diseases')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'All_Diseases' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              5 Major Diseases
            </button>
          </div>

          {/* Download Chart Data CSV Button */}
          <button
            id="download-cfr-chart-data-btn"
            onClick={handleExportCSV}
            title={`Download ${viewMode === 'All_Diseases' ? '5 Major Diseases' : selectedDisease + ' YoY'} CFR Data as CSV`}
            aria-label="Download CFR Chart Data as CSV"
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden xs:inline">Download Data</span>
          </button>
        </div>
      </div>

      {/* Disease selector when in YoY comparative mode */}
      {viewMode === 'YoY_Comparative' && (
        <div className="flex items-center justify-between my-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.cfrSelectFocus}</span>
          </span>
          <div className="flex space-x-1.5 font-semibold">
            {(['PPR', 'FMD', 'CBPP'] as const).map(d => (
              <button
                key={d}
                onClick={() => setSelectedDisease(d)}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  selectedDisease === d
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d} YoY Overlay
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'All_Diseases' ? (
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} domain={[0, 100]} />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical CFR Threshold (20%)', fill: '#ef4444', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#cbd5e1',
                  borderRadius: '0.5rem',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val}%`, 'CFR Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line type="monotone" dataKey="FMD" name="FMD (2026)" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="LSD" name="LSD (2026)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="PPR" name="PPR (2026)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="CBPP" name="CBPP (2026)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              {isArvl && <Line type="monotone" dataKey="Brucellosis" name="Brucellosis (2026)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />}
              <Line type="monotone" dataKey="Anthrax" name="Anthrax (100%)" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <LineChart data={benchmarkData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} domain={[0, 35]} />
              
              <ReferenceLine y={10} stroke="#10b981" strokeDasharray="3 3" label={{ value: `${currentLabInfo.shortCode} 10% CFR Target`, fill: '#10b981', fontSize: 10 }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#cbd5e1',
                  borderRadius: '0.5rem',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val}%`, 'Fatality Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

              {/* Selected Disease 2026 Actual Line */}
              <Line 
                type="monotone" 
                dataKey={`${selectedDisease}_2026`} 
                name={`${selectedDisease} 2026 Actual`} 
                stroke="#dc2626" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#dc2626' }} 
              />

              {/* Selected Disease 2025 YoY Benchmark Line */}
              <Line 
                type="monotone" 
                dataKey={`${selectedDisease}_2025`} 
                name={`${selectedDisease} 2025 YoY Benchmark`} 
                stroke="#a855f7" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={{ r: 3, fill: '#a855f7' }} 
              />

              {/* Lab Target Line */}
              <Line 
                type="monotone" 
                dataKey="Target" 
                name="5-Yr Target (Max 10%)" 
                stroke="#10b981" 
                strokeWidth={1.5} 
                strokeDasharray="2 2" 
                dot={false} 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-1">
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          {isArvl 
            ? '⚠️ ARVL Surge Benchmark: Historical benchmarks show PPR & CBPP CFR surges in Arsi/Bale dry-season transhumance corridors'
            : '⚠️ HRVL Surge Benchmark: Multi-year data indicates PPR & CBPP CFR surges in Hararghe dry-season pasture shortages'}
        </span>
        <span>{t.cfrTargetKeep}</span>
      </div>

    </div>
  );
};
