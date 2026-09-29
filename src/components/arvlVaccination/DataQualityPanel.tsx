import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  FileWarning, 
  Sparkles, 
  ArrowRight,
  Filter 
} from 'lucide-react';
import { DataQualityReport } from '../../types/arvlVaccination';

interface DataQualityPanelProps {
  report: DataQualityReport;
  onFilterNoSchedule: () => void;
  onFilterTarget: (target: string) => void;
  onSelectDistrictSearch: (district: string) => void;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({
  report,
  onFilterNoSchedule,
  onFilterTarget,
  onSelectDistrictSearch
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            Administrative Data Governance & Quality Audit
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            ARVL Master Dataset Quality & Integrity Verification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated scanning of district nomenclature, unknown target abbreviations, missing schedules, and duplicates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {report.totalValidDistricts} Districts Verified
          </span>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Source Rows</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{report.totalSourceRows}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across {report.totalZones} Zones</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Entries</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{report.totalMonthlyEntries}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{report.totalUniqueTargets} unique targets</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unscheduled Districts</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{report.emptyDistricts.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Flagged NO_SCHEDULE</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unknown Target Codes</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{report.unknownCodes.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Custom abbreviations</div>
        </div>
      </div>

      {/* Flagged Section: NO_SCHEDULE */}
      {report.emptyDistricts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Districts with No Scheduled Activity (Flag: NO_SCHEDULE)
              </h4>
            </div>
            <button
              onClick={onFilterNoSchedule}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Filter in Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            These districts exist in the administrative operational master list but do not currently have any scheduled vaccinations recorded in the master table. As per development guidelines, empty schedules are preserved and flagged without inventing synthetic targets.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.emptyDistricts.map((d, i) => (
              <button
                key={i}
                onClick={() => onSelectDistrictSearch(d.split(' ')[0])}
                className="px-2.5 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-200 transition"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flagged Section: Unknown Codes */}
      {report.unknownCodes.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200">
              Unregistered Target Abbreviations Detected
            </h4>
          </div>
          <p className="text-xs text-purple-800/90 dark:text-purple-300/90">
            The following target codes appear in monthly cells but are not listed in the official Vaccine Dictionary. You can inspect or register them in the Dictionary modal:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {report.unknownCodes.map((item, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/50 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    {item.code}
                  </span>
                  <span className="text-slate-400 text-[10px] ml-1.5">
                    ({item.occurrences} {item.occurrences === 1 ? 'district' : 'districts'})
                  </span>
                </div>
                <button
                  onClick={() => onFilterTarget(item.code)}
                  className="p-1 text-purple-600 hover:text-purple-800 dark:hover:text-purple-200"
                  title="Filter this target"
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gazette Name Variants */}
      {report.nameVariants.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Nomenclature Mapping & Canonical Gazette Linkage
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Original district spellings from the master document have been preserved verbatim, while automatically mapped to standard ARVL GIS gazetteer coordinates:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.nameVariants.slice(0, 10).map((v, i) => (
              <span 
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <strong>{v.original}</strong> → {v.canonical}
              </span>
            ))}
            {report.nameVariants.length > 10 && (
              <span className="text-xs text-slate-400 self-center">
                + {report.nameVariants.length - 10} more mapped
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
