import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Building2, 
  FileSpreadsheet, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SurveillanceRecord, WoredaCompliance } from '../../types';
import { HARARGHE_WOREDAS } from '../../data/woredas';

interface SurveillanceOversightTabProps {
  records: SurveillanceRecord[];
  complianceList?: WoredaCompliance[];
  onFilterWoreda?: (woreda: string) => void;
}

export const SurveillanceOversightTab: React.FC<SurveillanceOversightTabProps> = ({
  records,
  complianceList = [],
  onFilterWoreda
}) => {
  // Aggregate reporting coverage per woreda
  const woredaStats = useMemo(() => {
    return HARARGHE_WOREDAS.map(w => {
      const woredaRecords = records.filter(r => r.woreda.toLowerCase() === w.name.toLowerCase());
      const totalCases = woredaRecords.reduce((acc, r) => acc + (r.cases || 0), 0);
      const totalDeaths = woredaRecords.reduce((acc, r) => acc + (r.deaths || 0), 0);
      const zeroReports = woredaRecords.filter(r => r.isZeroReport || r.cases === 0).length;
      const lastRecord = woredaRecords.length > 0 
        ? woredaRecords.sort((a, b) => b.timestamp - a.timestamp)[0] 
        : null;

      const hasReported = woredaRecords.length > 0;
      const zeroReportingCompliant = zeroReports > 0;

      return {
        ...w,
        recordCount: woredaRecords.length,
        totalCases,
        totalDeaths,
        zeroReports,
        hasReported,
        zeroReportingCompliant,
        lastReportDate: lastRecord ? lastRecord.date : 'Never'
      };
    });
  }, [records]);

  const totalWoredas = HARARGHE_WOREDAS.length;
  const activeReporting = woredaStats.filter(w => w.hasReported).length;
  const zeroReportingCount = woredaStats.filter(w => w.zeroReportingCompliant).length;
  const missingReportingCount = totalWoredas - activeReporting;
  const coveragePercentage = Math.round((activeReporting / totalWoredas) * 100);

  const westHarargheStats = woredaStats.filter(w => w.zone === 'W/H');
  const eastHarargheStats = woredaStats.filter(w => w.zone === 'E/H');

  return (
    <div className="space-y-6">
      {/* Top Oversight Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Woredas</span>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalWoredas}</p>
          <span className="text-[11px] text-slate-500">15 W/H + 21 E/H</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Reporting Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-2">{coveragePercentage}%</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">{activeReporting} of {totalWoredas} Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">Zero Reporting</span>
            <ShieldAlert className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-900 dark:text-teal-200 mt-2">{zeroReportingCount}</p>
          <span className="text-[11px] text-teal-700 dark:text-teal-400">Verified Absence Reports</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">Silent / Missing</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">{missingReportingCount}</p>
          <span className="text-[11px] text-rose-700 dark:text-rose-400">Needs Focal Follow-up</span>
        </div>
      </div>

      {/* Woredas Matrix by Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* West Hararghe (15 Woredas) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                West Hararghe Zone (15 Woredas)
              </h3>
              <p className="text-xs text-slate-500">Hirna Laboratory Primary Catchment</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {westHarargheStats.filter(w => w.hasReported).length} / 15 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {westHarargheStats.map(w => (
              <div
                key={w.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  w.hasReported
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{w.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {w.recordCount} reports • {w.totalCases} cases
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    w.hasReported
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  }`}>
                    {w.hasReported ? 'Active' : 'Silent'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">{w.lastReportDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* East Hararghe (21 Woredas) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                East Hararghe Zone (21 Woredas)
              </h3>
              <p className="text-xs text-slate-500">Border & Pastoral Surveillance Coverage</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {eastHarargheStats.filter(w => w.hasReported).length} / 21 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-[380px] overflow-y-auto pr-1">
            {eastHarargheStats.map(w => (
              <div
                key={w.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  w.hasReported
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{w.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {w.recordCount} reports • {w.totalCases} cases
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    w.hasReported
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  }`}>
                    {w.hasReported ? 'Active' : 'Silent'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">{w.lastReportDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
