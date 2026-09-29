import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Syringe, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Layers, 
  Clock, 
  TrendingUp,
  FileText 
} from 'lucide-react';
import { 
  ARVLVaccinationRecord, 
  VaccineDictionaryEntry, 
  EthiopianFiscalMonthKey 
} from '../../types/arvlVaccination';
import { 
  MONTH_ORDER, 
  MONTH_LABELS, 
  FISCAL_QUARTERS, 
  getCurrentFiscalPeriod 
} from '../../data/arvlVaccinationData';

interface DistrictProfileModalProps {
  record: ARVLVaccinationRecord | null;
  dictionary: VaccineDictionaryEntry[];
  canEdit?: boolean;
  onClose: () => void;
  onEdit?: (record: ARVLVaccinationRecord) => void;
  onSelectTarget?: (code: string) => void;
}

export const DistrictProfileModal: React.FC<DistrictProfileModalProps> = ({
  record,
  dictionary,
  canEdit,
  onClose,
  onEdit,
  onSelectTarget
}) => {
  if (!record) return null;

  const currentPeriod = getCurrentFiscalPeriod();

  // Metrics calculation
  let scheduledMonthsCount = 0;
  const targetCounts = new Map<string, number>();
  const monthlyCounts = new Map<EthiopianFiscalMonthKey, number>();

  MONTH_ORDER.forEach(m => {
    const list = record.months[m] || [];
    if (list.length > 0) {
      scheduledMonthsCount++;
      monthlyCounts.set(m, list.length);
      list.forEach(t => {
        targetCounts.set(t, (targetCounts.get(t) || 0) + 1);
      });
    }
  });

  const uniqueTargets = Array.from(targetCounts.keys());

  // Most active month
  let peakMonth: EthiopianFiscalMonthKey | null = null;
  let peakCount = 0;
  monthlyCounts.forEach((count, month) => {
    if (count > peakCount) {
      peakCount = count;
      peakMonth = month;
    }
  });

  // Most frequent target
  let mostFrequentTarget: string | null = null;
  let maxTargetFreq = 0;
  targetCounts.forEach((freq, t) => {
    if (freq > maxTargetFreq) {
      maxTargetFreq = freq;
      mostFrequentTarget = t;
    }
  });

  const getTargetColor = (code: string) => {
    const match = dictionary.find(d => d.code.toUpperCase() === code.toUpperCase());
    return match?.colorClass || 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {record.zone} Zone
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {record.region}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Year: {record.planningYear}
              </span>
              {record.qualityFlags?.includes('NO_SCHEDULE') && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> NO_SCHEDULE
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 pt-1">
              {record.district}
              {record.normalizedDistrict && record.normalizedDistrict !== record.district && (
                <span className="text-sm font-normal text-slate-400">
                  (Canonical: {record.normalizedDistrict})
                </span>
              )}
            </h2>

            {record.districtCode && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                P-Code / District Code: {record.districtCode} 
                {record.lat && record.lng && ` • Coord: ${record.lat.toFixed(3)}, ${record.lng.toFixed(3)}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(record)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Plan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
              <span>Active Months</span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {scheduledMonthsCount} <span className="text-xs font-normal text-slate-400">/ 12</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {Math.round((scheduledMonthsCount / 12) * 100)}% year coverage
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
              <span>Target Diseases</span>
              <Syringe className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {uniqueTargets.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Unique planned targets
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
              <span>Peak Month</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
              {peakMonth && MONTH_LABELS[peakMonth as EthiopianFiscalMonthKey] ? MONTH_LABELS[peakMonth as EthiopianFiscalMonthKey].short : 'None'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {peakCount > 0 ? `${peakCount} scheduled vaccines` : 'No activity'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
              <span>Primary Target</span>
              <Layers className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
              {mostFrequentTarget || 'None'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {maxTargetFreq > 0 ? `In ${maxTargetFreq} months` : 'Unscheduled'}
            </div>
          </div>
        </div>

        {/* 12-Month Schedule arranged by Ethiopian Fiscal Quarters */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Annual Vaccination Schedule (Ethiopian Fiscal Cycle: July – June)
            </h4>
            <span className="text-[11px] text-slate-400">
              Current Period: <strong className="text-emerald-600 dark:text-emerald-400">{currentPeriod.monthName} ({currentPeriod.quarter})</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(quarterKey => {
              const qInfo = FISCAL_QUARTERS[quarterKey];
              const isCurrentQuarter = currentPeriod.quarter === quarterKey;

              return (
                <div 
                  key={quarterKey}
                  className={`p-3.5 rounded-2xl border transition ${
                    isCurrentQuarter 
                      ? 'border-emerald-500/70 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {qInfo.name}
                    </span>
                    {isCurrentQuarter && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {qInfo.months.map(month => {
                      const targets = record.months[month] || [];
                      const raw = record.rawMonths[month];
                      const isCurrentMonth = currentPeriod.monthKey === month;

                      return (
                        <div 
                          key={month}
                          className={`p-2 rounded-xl text-xs transition ${
                            isCurrentMonth 
                              ? 'bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700' 
                              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {MONTH_LABELS[month].full}
                            </span>
                            {isCurrentMonth && (
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                                This Month
                              </span>
                            )}
                          </div>

                          {targets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {targets.map((t, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => onSelectTarget && onSelectTarget(t)}
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition hover:opacity-80 ${getTargetColor(t)}`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No scheduled activities</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks and Quality Notes */}
        <div className="space-y-3">
          {record.remark ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Operational Remarks & Epidemiology Context
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {record.remark}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              No specific administrative remarks recorded for this district.
            </div>
          )}

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-center justify-between">
            <span className="font-semibold">
              Legal Disclaimer: PLANNED / SCHEDULED VACCINATION CALENDAR (SCHEDULED ≠ COMPLETED)
            </span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
              Preserved verbatim from official ARVL master register
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Record ID: <span className="font-mono">{record.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
