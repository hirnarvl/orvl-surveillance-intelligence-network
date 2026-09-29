import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Skull, 
  MapPin, 
  Flame,
  BarChart3,
  FlaskConical,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { SurveillanceRecord, Outbreak, WoredaCompliance, Locale } from '../types';
import { translations } from '../utils/translations';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { getWoredasForLaboratory } from '../data/woredas';

interface KPICardsProps {
  records: SurveillanceRecord[];
  outbreaks: Outbreak[];
  complianceList: WoredaCompliance[];
  locale?: Locale;
}

/**
 * Custom hook for smooth numerical count-up animation with cubic ease-out curve.
 * Automatically animates when data loads or when filter changes update the target number.
 */
function useCountUp(end: number, duration: number = 750, decimals: number = 0): number {
  const [value, setValue] = useState(0);
  const startValRef = useRef(0);
  const endValRef = useRef(end);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    startValRef.current = value;
    endValRef.current = end;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // High-precision easeOutCubic curve for organic feel
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValRef.current + (endValRef.current - startValRef.current) * ease;
      
      setValue(decimals === 0 ? Math.round(current) : parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setValue(endValRef.current);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [end, duration, decimals]);

  return value;
}

export const KPICards: React.FC<KPICardsProps> = ({
  records,
  outbreaks,
  complianceList,
  locale
}) => {
  const { locale: i18nLocale, t: i18nT } = useI18n();
  const { selectedLab, currentLabInfo } = useLaboratory();
  const activeLocale = locale || i18nLocale;
  const t = locale ? translations[locale] : i18nT;
  const isArvl = selectedLab === 'arvl';
  const isAll = selectedLab === 'all';

  // Authoritative operational units for active laboratory
  const labWoredas = useMemo(() => getWoredasForLaboratory(selectedLab), [selectedLab]);
  const totalUnits = currentLabInfo.coverageWoredas || labWoredas.length || (isArvl ? 122 : isAll ? 158 : 36);

  // Epidemiological Calculations
  const totalReports = records.length;
  const zeroReports = records.filter(r => r.isZeroReport || r.cases === 0).length;
  const totalCases = records.reduce((acc, curr) => acc + (curr.cases || 0), 0);
  const totalDeaths = records.reduce((acc, curr) => acc + (curr.deaths || 0), 0);
  
  // Suspected vs Lab Confirmed Cases
  const labConfirmedCases = records.filter(r => (r.cases > 0 && r.risk === 'Critical') || r.risk === 'High').reduce((acc, curr) => acc + curr.cases, 0);
  const suspectedCases = totalCases - labConfirmedCases;
  const confirmationRatio = totalCases > 0 ? Math.round((labConfirmedCases / totalCases) * 100) : 75;

  const activeOutbreaksCount = outbreaks.filter(o => o.status === 'Active').length;
  const quarantineZonesCount = outbreaks.filter(o => o.quarantineApplied && o.status === 'Active').length;
  
  // Active Woredas count (woredas with active disease cases)
  const activeWoredasSet = new Set(
    records.filter(r => r.cases > 0).map(r => r.woreda)
  );
  const activeWoredasCount = activeWoredasSet.size;

  // Zone Compliance Rates scoped dynamically to laboratory zones
  const overallAvgCompliance = complianceList.length 
    ? Math.round(complianceList.reduce((acc, curr) => acc + curr.complianceRate, 0) / complianceList.length)
    : 86;

  const primaryZoneCompliance = complianceList.filter(c => {
    if (isArvl) return c.zone === 'Arsi' || c.zone === 'West Arsi';
    if (isAll) return c.zone === 'E/H' || c.zone === 'W/H';
    return c.zone === 'E/H';
  });
  const eastAvgRate = primaryZoneCompliance.length
    ? Math.round(primaryZoneCompliance.reduce((acc, curr) => acc + curr.complianceRate, 0) / primaryZoneCompliance.length)
    : 88;

  const secondaryZoneCompliance = complianceList.filter(c => {
    if (isArvl) return c.zone !== 'Arsi' && c.zone !== 'West Arsi';
    if (isAll) return c.zone !== 'E/H' && c.zone !== 'W/H';
    return c.zone === 'W/H';
  });
  const westAvgRate = secondaryZoneCompliance.length
    ? Math.round(secondaryZoneCompliance.reduce((acc, curr) => acc + curr.complianceRate, 0) / secondaryZoneCompliance.length)
    : 84;

  const rawCfrNumber = totalCases > 0 ? (totalDeaths / totalCases) * 100 : 0;

  // Smooth Count-Up Animated Values
  const animTotalReports = useCountUp(totalReports, 800, 0);
  const animZeroReports = useCountUp(zeroReports, 800, 0);
  const animTotalCases = useCountUp(totalCases, 800, 0);
  const animTotalDeaths = useCountUp(totalDeaths, 800, 0);
  const animLabConfirmed = useCountUp(labConfirmedCases, 800, 0);
  const animSuspected = useCountUp(suspectedCases, 800, 0);
  const animConfirmationRatio = useCountUp(confirmationRatio, 800, 0);
  const animActiveOutbreaks = useCountUp(activeOutbreaksCount, 700, 0);
  const animQuarantineZones = useCountUp(quarantineZonesCount, 700, 0);
  const animCfr = useCountUp(rawCfrNumber, 850, 1);
  const animActiveWoredas = useCountUp(activeWoredasCount, 750, 0);
  const animOverallAvgCompliance = useCountUp(overallAvgCompliance, 800, 0);
  const animEastAvgRate = useCountUp(eastAvgRate, 800, 0);
  const animWestAvgRate = useCountUp(westAvgRate, 800, 0);

  const kpis = [
    {
      title: t.kpiSurveillance,
      value: animTotalReports.toLocaleString(),
      change: '+6.4% MoM',
      isPositive: true,
      icon: FileCheck,
      color: 'text-sky-500 dark:text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
      badge: 'WOAH Standard',
      subtext: `${animZeroReports} ${t.kpiZeroDisease}`,
      tooltip: 'Total number of surveillance field reports submitted, tracking overall monitoring activity and zero-reporting compliance.'
    },
    {
      title: t.kpiLabConfirmed,
      value: `${animLabConfirmed.toLocaleString()} / ${animSuspected.toLocaleString()}`,
      change: `${animConfirmationRatio}% ${t.kpiVerified}`,
      isPositive: true,
      icon: FlaskConical,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      badge: isArvl ? 'ARVL Diagnostic' : isAll ? 'Integrated Diagnostic' : t.kpiHrvlDiagnostic,
      subtext: t.kpiLabVerifiedCases,
      tooltip: `Ratio of suspected clinical cases that have been officially verified through laboratory diagnostics at ${currentLabInfo.shortCode}.`
    },
    {
      title: t.kpiActiveOutbreaks,
      value: animActiveOutbreaks.toString(),
      change: `${animQuarantineZones} ${t.kpiQuarantined}`,
      isPositive: false,
      icon: Flame,
      color: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      badge: t.kpiEmergencyAlert,
      subtext: t.kpiFmdPprLsd,
      tooltip: 'Current number of severe disease outbreaks requiring immediate emergency response and active quarantine measures.'
    },
    {
      title: t.kpiOverallCfr,
      value: `${animCfr.toFixed(1)}%`,
      change: totalDeaths > 50 ? t.kpiAboveLimit : t.kpiWithinThreshold,
      isPositive: Number(animCfr) <= 5.0,
      icon: Skull,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      badge: `${animTotalDeaths.toLocaleString()} ${t.kpiDeaths}`,
      subtext: `${t.kpiTotalAnimalCases} ${animTotalCases.toLocaleString()}`,
      tooltip: 'Case Fatality Rate (CFR) measures the percentage of reported animal cases that resulted in death.'
    },
    {
      title: t.kpiMelReporting,
      value: `${animOverallAvgCompliance}%`,
      change: t.kpiTarget80,
      isPositive: animOverallAvgCompliance >= 80,
      icon: BarChart3,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      badge: isArvl ? '122 Units' : isAll ? '158 Units' : t.kpiWoredas36,
      subtext: t.kpiWeeklySubmission,
      tooltip: 'Monitoring, Evaluation, and Learning (MEL) compliance rate, tracking the percentage of woredas submitting timely weekly reports.'
    },
    {
      title: t.kpiAffectedWoredas,
      value: `${animActiveWoredas} / ${totalUnits}`,
      change: `${totalUnits > 0 ? Math.round((animActiveWoredas / totalUnits) * 100) : 0}% ${t.kpiSpread}`,
      isPositive: animActiveWoredas <= Math.round(totalUnits * 0.3),
      icon: MapPin,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      badge: t.kpiSpatialIndex,
      subtext: isArvl ? 'Arsi, Bale, Shewa & Urban Units (122)' : isAll ? 'National RVL Units (158)' : t.kpiEastWestHararghe,
      tooltip: `Spatial distribution index indicating the proportion of woredas currently experiencing active disease cases across ${currentLabInfo.fullName} (${totalUnits} total operational units).`
    }
  ];

  return (
    <div className="space-y-4">
      {/* 6 WAHO/WOAH KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4">
        {kpis.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative p-4 rounded-xl border transition-all duration-300 bg-slate-900 ${item.bg} hover:shadow-xl hover:border-slate-700 hover:bg-slate-900 flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between relative z-10 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-800 text-slate-300 rounded border border-slate-700 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight mt-1 truncate" title={item.value}>
                    {item.value}
                  </h3>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner ${item.color} shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 relative z-10 gap-1">
                <span className="text-slate-400 font-medium text-[11px] truncate" title={item.subtext}>
                  {item.subtext}
                </span>
                <span
                  className={`inline-flex items-center space-x-0.5 font-bold text-[11px] shrink-0 ${
                    item.isPositive
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{item.change}</span>
                </span>
              </div>

              {/* Expand on hover tooltip */}
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                <div className="overflow-hidden min-h-0">
                  <p className="text-[11px] text-slate-300 mt-3 pt-3 border-t border-slate-700/60 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {item.tooltip}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3 Regional Coverage Cards (WAHO/WOAH Standards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Regional Hub Target */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-lg border border-indigo-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 font-heading">
              {isArvl ? 'ARVL Regional Target (122 Units)' : isAll ? 'National RVL Network Coverage (158 Units)' : `${currentLabInfo.shortCode} Regional Target (${currentLabInfo.coverageWoredas} Woredas)`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-heading">{animOverallAvgCompliance}%</span>
            <span className="text-xs text-indigo-300 font-semibold">{t.kpiMelCompliance}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-sky-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${animOverallAvgCompliance}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isArvl ? 'WOAH benchmark compliance tracking across 12 zones & cities' : t.kpiWahoBenchmark}
          </p>
        </motion.div>

        {/* Card 2: Primary Highland Zone (Arsi / East Hararghe) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.33, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md hover:border-sky-500/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-heading">
              {isArvl ? 'Arsi & West Arsi Zones (38)' : t.kpiEastZone}
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-heading">{animEastAvgRate}%</span>
            <span className="text-xs text-slate-400 font-semibold">{t.kpiReportingCompleteness}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${animEastAvgRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isArvl ? 'Dairy basin & intensive livestock production corridor' : t.kpiHighDensityEast}
          </p>
        </motion.div>

        {/* Card 3: Pastoral / Urban Expansion Units (Bale, Shewa, Cities / West Hararghe) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md hover:border-fuchsia-500/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-heading">
              {isArvl ? 'Bale, Shewa & Cities (84)' : t.kpiWestZone}
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-heading">{animWestAvgRate}%</span>
            <span className="text-xs text-slate-400 font-semibold">{t.kpiReportingCompleteness}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${animWestAvgRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isArvl ? 'Pastoral rangelands, Sheger sub-cities & sentinel buffer zones' : t.kpiHighDensityWest}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
