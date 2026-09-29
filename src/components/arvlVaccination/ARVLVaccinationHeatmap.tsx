import React, { useState } from 'react';
import { ARVLVaccinationRecord, VaccineDictionaryEntry, EthiopianFiscalMonthKey } from '../../types/arvlVaccination';
import { MONTH_ORDER, MONTH_LABELS, getCurrentFiscalPeriod } from '../../data/arvlVaccinationData';
import { Calendar, ChevronDown, ChevronRight, Info } from 'lucide-react';

interface ARVLVaccinationHeatmapProps {
  records: ARVLVaccinationRecord[];
  dictionary: VaccineDictionaryEntry[];
  onSelectDistrict: (record: ARVLVaccinationRecord) => void;
  onSelectTarget: (target: string) => void;
}

export const ARVLVaccinationHeatmap: React.FC<ARVLVaccinationHeatmapProps> = ({
  records,
  dictionary,
  onSelectDistrict,
  onSelectTarget
}) => {
  const currentPeriod = getCurrentFiscalPeriod();

  // Group records by Zone
  const zoneMap = new Map<string, ARVLVaccinationRecord[]>();
  records.forEach(r => {
    const list = zoneMap.get(r.zone) || [];
    list.push(r);
    zoneMap.set(r.zone, list);
  });

  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Array.from(zoneMap.keys()).forEach(z => {
      init[z] = true;
    });
    return init;
  });

  const toggleZone = (z: string) => {
    setExpandedZones(prev => ({
      ...prev,
      [z]: !prev[z]
    }));
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-700';
    if (count === 1) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold';
    if (count === 2) return 'bg-emerald-300 text-emerald-950 dark:bg-emerald-800 dark:text-emerald-100 font-bold';
    if (count === 3) return 'bg-emerald-500 text-white font-extrabold';
    return 'bg-emerald-700 text-white font-black';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Seasonal Vaccination Intensity Heatmap (District × Ethiopian Fiscal Month)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualizing multi-target vaccination density across all 12 fiscal months.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px] mr-1">Intensity:</span>
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400">0</span>
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-emerald-100 text-emerald-800">1</span>
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-emerald-300 text-emerald-950">2</span>
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-emerald-500 text-white">3</span>
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-emerald-700 text-white font-bold">4+</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 w-44">Administrative Unit</th>
              {MONTH_ORDER.map(m => {
                const isCurrent = currentPeriod.monthKey === m;
                return (
                  <th 
                    key={m}
                    className={`py-2 px-1 text-center font-bold text-[11px] w-12 ${
                      isCurrent 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {MONTH_LABELS[m].short}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {Array.from(zoneMap.entries()).map(([zoneName, zoneDistricts]) => {
              const isExpanded = expandedZones[zoneName] !== false;

              return (
                <React.Fragment key={zoneName}>
                  {/* Zone Group Header */}
                  <tr 
                    onClick={() => toggleZone(zoneName)}
                    className="bg-slate-100/70 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                  >
                    <td colSpan={13} className="py-2 px-3 font-black text-slate-800 dark:text-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          {zoneName} Zone ({zoneDistricts.length} districts)
                        </span>
                        <span className="text-[10px] font-normal text-slate-500">
                          Click to {isExpanded ? 'collapse' : 'expand'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* District Rows */}
                  {isExpanded && zoneDistricts.map(record => (
                    <tr 
                      key={record.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td 
                        onClick={() => onSelectDistrict(record)}
                        className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer group-hover:text-emerald-600 truncate max-w-[170px]"
                        title={record.district}
                      >
                        {record.district}
                      </td>

                      {MONTH_ORDER.map(m => {
                        const targets = record.months[m] || [];
                        const count = targets.length;
                        const isCurrent = currentPeriod.monthKey === m;

                        return (
                          <td 
                            key={m} 
                            className={`p-0.5 text-center ${isCurrent ? 'ring-1 ring-emerald-400/40' : ''}`}
                            title={targets.length > 0 ? `${record.district} in ${MONTH_LABELS[m].full}: ${targets.join(', ')}` : undefined}
                          >
                            <div 
                              onClick={() => {
                                if (targets.length === 1) {
                                  onSelectTarget(targets[0]);
                                } else {
                                  onSelectDistrict(record);
                                }
                              }}
                              className={`h-7 rounded flex items-center justify-center transition cursor-pointer hover:scale-105 ${getIntensityClass(count)}`}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
