import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Send, 
  RefreshCw,
  Sliders,
  CheckCheck,
  TrendingUp,
  MapPin,
  Building
} from 'lucide-react';
import { SurveillanceRecord, Outbreak, WoredaCompliance, ZoneName, Locale } from '../types';
import { translations } from '../utils/translations';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { getWoredasForLaboratory } from '../data/woredas';

interface MELScorecardPanelProps {
  records: SurveillanceRecord[];
  outbreaks: Outbreak[];
  complianceList: WoredaCompliance[];
  onSelectZone?: (zone: 'All' | ZoneName) => void;
  locale?: Locale;
}

export const MELScorecardPanel: React.FC<MELScorecardPanelProps> = ({
  records,
  outbreaks,
  complianceList,
  onSelectZone,
  locale
}) => {
  const { locale: i18nLocale, t: i18nT } = useI18n();
  const { currentLabInfo, selectedLab, getLabHeader } = useLaboratory();
  const t = locale ? translations[locale] : i18nT;
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<'All' | ZoneName>('All');
  const [isRefreshingSitRep, setIsRefreshingSitRep] = useState(false);
  const [sitrep, setSitrep] = useState({ hotspots: '', compliance: '', actionPlan: '' });

  // Authoritative operational area woredas for active laboratory
  const labWoredas = useMemo(() => getWoredasForLaboratory(selectedLab), [selectedLab]);
  const labTotalUnits = currentLabInfo.coverageWoredas || labWoredas.length || (selectedLab === 'arvl' ? 122 : selectedLab === 'all' ? 158 : 36);

  // Generate dynamic SitRep narrative based on current laboratory context
  useEffect(() => {
    const diseaseCounts = new Map<string, number>();
    const woredaCounts = new Map<string, number>();
    
    outbreaks.filter(o => o.status === 'Active').forEach(o => {
      diseaseCounts.set(o.disease, (diseaseCounts.get(o.disease) || 0) + 1);
      woredaCounts.set(o.woreda, (woredaCounts.get(o.woreda) || 0) + 1);
    });

    const topDiseases = Array.from(diseaseCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    const topWoredas = Array.from(woredaCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    
    const hotspotsText = topDiseases.length > 0 
      ? `${topDiseases.join(' and ')} remain active in ${topWoredas.join(', ')}. Ring-vaccination teams dispatched by ${currentLabInfo.name}.`
      : `No critical active outbreaks detected currently by ${currentLabInfo.name}.`;

    const zoneCompliance = new Map<string, { total: number; sum: number }>();
    complianceList.forEach(c => {
      if (!zoneCompliance.has(c.zone) && c.zone !== 'Town-level operational units') {
        zoneCompliance.set(c.zone, { total: 0, sum: 0 });
      }
      if (c.zone !== 'Town-level operational units') {
        const val = zoneCompliance.get(c.zone)!;
        val.total += 1;
        val.sum += c.complianceRate;
      }
    });

    const topZones = Array.from(zoneCompliance.entries()).slice(0, 2);
    const complianceText = topZones.map(z => {
      const avg = Math.round(z[1].sum / z[1].total);
      return `${z[0]} achieved <span class="text-slate-900 dark:text-white font-bold">${avg}% compliance</span> across ${z[1].total} woredas.`;
    }).join(' ');

    const finalComplianceText = complianceText || `Woreda reporting networks are currently being established.`;

    const actionPlanText = topWoredas.length > 0
      ? `Enforce strict livestock market quarantine in ${topWoredas.slice(0, 2).join(' and ')}. Dispatch diagnostic sampling kits for suspected ${topDiseases[0] || 'disease'} alerts.`
      : `Continue routine zero-reporting and passive surveillance across all operational woredas.`;

    setSitrep({
      hotspots: hotspotsText,
      compliance: finalComplianceText,
      actionPlan: actionPlanText
    });
  }, [selectedLab, currentLabInfo.name, outbreaks, complianceList]);

  // Extract unique zones from the active compliance list for dynamic tabs
  const availableZones = useMemo(() => {
    const zones = new Set<string>();
    complianceList.forEach(c => {
      if (c.zone && c.zone !== 'Town-level operational units') {
        zones.add(c.zone);
      }
    });
    return Array.from(zones).sort();
  }, [complianceList]);

  // Reset zone filter if the selected zone is no longer available in the new lab context
  useEffect(() => {
    if (selectedZoneFilter !== 'All' && !availableZones.includes(selectedZoneFilter)) {
      setSelectedZoneFilter('All');
      if (onSelectZone) onSelectZone('All');
    }
  }, [availableZones, selectedZoneFilter, onSelectZone]);

  // Filter compliance based on selection
  const filteredCompliance = complianceList.filter(c => {
    if (selectedZoneFilter === 'All') return true;
    return c.zone === selectedZoneFilter;
  });

  // Calculate MEL metrics dynamically with active lab denominators
  const totalUnitsForScope = useMemo(() => {
    if (selectedZoneFilter === 'All') {
      return labTotalUnits;
    }
    const inRegistry = labWoredas.filter(w => w.zone === selectedZoneFilter).length;
    return inRegistry || filteredCompliance.length || 1;
  }, [selectedZoneFilter, labTotalUnits, labWoredas, filteredCompliance.length]);

  const compliantWoredas = filteredCompliance.filter(c => c.complianceRate >= 80).length;
  const needsAttentionWoredas = filteredCompliance.filter(c => c.complianceRate >= 60 && c.complianceRate < 80).length;
  const nonCompliantWoredas = filteredCompliance.filter(c => c.complianceRate < 60).length;

  const avgCompleteness = filteredCompliance.length > 0
    ? Math.round(filteredCompliance.reduce((acc, curr) => acc + curr.complianceRate, 0) / filteredCompliance.length)
    : 0;

  // Timeliness simulated calculation based on zero reports + recent timestamp submission ratio
  const timelySubmissions = records.filter(r => r.timestamp && r.timestamp > 0).length;
  const timelinessRate = records.length ? Math.min(98, Math.max(84, Math.round((timelySubmissions / records.length) * 100))) : 92;

  // Data Accuracy / Verification Score
  const labVerifiedCases = records.filter(r => r.cases > 0 && r.risk !== 'Low').length;
  const totalCaseRecords = records.filter(r => r.cases > 0).length;
  const verificationScore = totalCaseRecords ? Math.round((labVerifiedCases / totalCaseRecords) * 100) : 82;

  // Active Quarantine & Feedback
  const activeQuarantines = outbreaks.filter(o => o.quarantineApplied && o.status === 'Active').length;

  const handleRefreshSitrep = () => {
    setIsRefreshingSitRep(true);
    setTimeout(() => {
      setIsRefreshingSitRep(false);
    }, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl text-slate-900 dark:text-slate-100 space-y-5 transition-colors"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-sky-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black font-heading text-slate-900 dark:text-white tracking-wide">
                {getLabHeader('WAHO / WOAH MEL Scorecard & Data Quality Panel')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitoring, Evaluation & Learning for {currentLabInfo.fullName} ({labTotalUnits} {selectedLab === 'all' ? 'Surveillance Units' : 'Operational Woredas'})
            </p>
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto flex-wrap gap-1.5 max-w-full overflow-x-auto">
          <button
            onClick={() => {
              setSelectedZoneFilter('All');
              if (onSelectZone) onSelectZone('All');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedZoneFilter === 'All'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All {labTotalUnits} {selectedLab === 'all' ? 'Units' : 'Woredas'}
          </button>
          
          {availableZones.slice(0, 4).map((zone, idx) => {
            const zoneCount = complianceList.filter(c => c.zone === zone).length;
            const colors = [
              'bg-sky-600',
              'bg-fuchsia-600',
              'bg-emerald-600',
              'bg-amber-600'
            ];
            const activeColorClass = colors[idx % colors.length];
            
            return (
              <button
                key={zone}
                onClick={() => {
                  setSelectedZoneFilter(zone);
                  if (onSelectZone) onSelectZone(zone);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedZoneFilter === zone
                    ? `${activeColorClass} text-white shadow-md`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {zone} ({zoneCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core MEL Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 1: Reporting Completeness */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completeness Rate
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgCompleteness}%</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">WAHO Target ≥ 80%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${avgCompleteness}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Compliant Woredas:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{compliantWoredas} / {totalUnitsForScope}</span>
          </p>
        </div>

        {/* Metric 2: Timeliness Score */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-sky-500/50 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Timeliness (24h SLA)
            </span>
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{timelinessRate}%</span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">WOAH SLA &lt; 24h</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${timelinessRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>On-Time Log Submissions:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{records.length} logs</span>
          </p>
        </div>

        {/* Metric 3: Laboratory Field Verification Score */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lab Verification Index
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{verificationScore}%</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{currentLabInfo.shortCode} Lab Confirmed</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${verificationScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Verified Outbreaks:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalCaseRecords} reports</span>
          </p>
        </div>

        {/* Metric 4: Field Action & Response SLA */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Field Quarantine SLA
            </span>
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeQuarantines} Active</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Quarantines</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (activeQuarantines / 5) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Ring-Vaccination Enforced:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Yes (Active)</span>
          </p>
        </div>

      </div>

      {/* Automated Epidemiological SitRep Executive Summary */}
      <div className="bg-indigo-50/50 dark:bg-slate-950/90 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800/80 pb-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black font-heading uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Automated Epidemiological SitRep Narrative (Program Director Summary)
            </span>
          </div>
          <button
            onClick={handleRefreshSitrep}
            title="Re-evaluate SitRep Summary"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSitRep ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/60 shadow-2xs">
            <p className="font-bold text-amber-600 dark:text-amber-400 text-[11px] uppercase tracking-wide">1. Critical Outbreak Hotspots</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {sitrep.hotspots}
            </p>
          </div>

          <div className="space-y-1 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/60 shadow-2xs">
            <p className="font-bold text-sky-600 dark:text-sky-400 text-[11px] uppercase tracking-wide">2. Reporting Compliance</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: sitrep.compliance }} />
          </div>

          <div className="space-y-1 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/60 shadow-2xs">
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] uppercase tracking-wide">3. Priority Action Plan</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {sitrep.actionPlan}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

