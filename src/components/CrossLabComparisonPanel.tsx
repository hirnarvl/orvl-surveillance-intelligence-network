import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Activity, 
  Layers, 
  ShieldAlert, 
  TrendingUp, 
  Microscope, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Percent, 
  Stethoscope 
} from 'lucide-react';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { getCrossLaboratoryComparison } from '../data/sampleData';
import { LABORATORIES_REGISTRY } from '../data/laboratories';
import { soundEngine } from '../utils/sound';

export const CrossLabComparisonPanel: React.FC = () => {
  const { selectedLab, setSelectedLab, isMultiLabView } = useLaboratory();
  const labMetrics = getCrossLaboratoryComparison();

  const totalCases = labMetrics.reduce((acc, m) => acc + m.totalCases, 0);
  const totalDeaths = labMetrics.reduce((acc, m) => acc + m.totalDeaths, 0);
  const totalOutbreaks = labMetrics.reduce((acc, m) => acc + m.activeOutbreaks, 0);
  const totalWoredas = labMetrics.reduce((acc, m) => acc + m.totalAuthorizedWoredas, 0);
  const aggregatedCFR = totalCases > 0 ? ((totalDeaths / totalCases) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6" id="cross-lab-comparison-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Multi-RVL Cross-Laboratory Intelligence Engine
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 rounded-full border border-purple-200 dark:border-purple-700">
                Shared Analytical Framework
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative epidemiological metrics, diagnostic capabilities, and surveillance coverage between regional laboratory nodes.
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Platform Aggregate CFR:</span>
          <span className="font-extrabold font-mono text-purple-600 dark:text-purple-400">{aggregatedCFR}%</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{totalWoredas} Woredas</span>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {labMetrics.map((lab) => {
          const isCurrent = selectedLab === lab.laboratoryId;
          const isHrvl = lab.laboratoryId === 'hrvl';
          const regInfo = LABORATORIES_REGISTRY[lab.laboratoryId as 'hrvl' | 'arvl'];

          return (
            <div
              key={lab.laboratoryId}
              id={`cross-lab-card-${lab.laboratoryId}`}
              className={`rounded-xl border p-5 transition-all duration-200 ${
                isCurrent
                  ? isHrvl
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 shadow-md ring-1 ring-blue-400/20'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 shadow-md ring-1 ring-emerald-400/20'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 flex items-center justify-center shrink-0"
                  >
                    {regInfo?.logoUrl && regInfo.logoUrl.trim() !== '' ? (
                      <img 
                        src={regInfo.logoUrl} 
                        alt={`${lab.laboratoryName} Emblem`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain filter drop-shadow-md" 
                      />
                    ) : (
                      <div 
                        className="w-full h-full rounded-lg flex items-center justify-center font-black text-white text-xs"
                        style={{ backgroundColor: lab.color }}
                      >
                        {isHrvl ? 'HRVL' : 'ARVL'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {lab.laboratoryName}
                      </h3>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {regInfo?.location || regInfo?.region} ({regInfo?.zones?.join(', ') || ''})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedLab(lab.laboratoryId as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-default'
                      : isHrvl
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  <span>{isCurrent ? 'Focusing' : 'Switch Focus'}</span>
                  {!isCurrent && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>

              {/* Stats Metrics Row */}
              <div className="grid grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Cases</p>
                  <p className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                    {lab.totalCases.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Deaths</p>
                  <p className="text-sm sm:text-base font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                    {lab.totalDeaths.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">CFR</p>
                  <p className="text-sm sm:text-base font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                    {lab.caseFatalityRate.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Outbreaks</p>
                  <p className="text-sm sm:text-base font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                    {lab.activeOutbreaks}
                  </p>
                </div>
              </div>

              {/* Specific Details */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Microscope className="w-3.5 h-3.5 text-blue-500" />
                    Diagnostic Infrastructure:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                    {lab.diagnosticCapacity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                    Priority Endemic Threats:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {lab.primaryActiveDisease}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    Catchment Woreda Compliance:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {lab.complianceRate}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({lab.reportingWoredas}/{lab.totalAuthorizedWoredas} woredas)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
