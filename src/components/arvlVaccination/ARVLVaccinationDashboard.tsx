import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Syringe, 
  MapPin, 
  BarChart3, 
  Grid, 
  Layers, 
  Map as MapIcon, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Copy, 
  Info, 
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  ARVLVaccinationRecord, 
  VaccineDictionaryEntry, 
  EthiopianFiscalMonthKey,
  DataQualityReport
} from '../../types/arvlVaccination';
import { 
  MONTH_ORDER, 
  MONTH_LABELS, 
  FISCAL_QUARTERS, 
  getCurrentFiscalPeriod,
  generateDataQualityReport
} from '../../data/arvlVaccinationData';
import { 
  subscribeToARVLCalendar, 
  saveARVLRecord, 
  deleteARVLRecord, 
  getVaccineDictionary, 
  saveVaccineDictionaryEntry,
  copyPlanningYear,
  exportCalendarToCSV,
  exportCalendarToPDF,
  parseCalendarCSV
} from '../../services/arvlVaccinationService';
import { DistrictProfileModal } from './DistrictProfileModal';
import { TargetInfoModal } from './TargetInfoModal';
import { VaccineDictionaryModal } from './VaccineDictionaryModal';
import { CalendarEditModal } from './CalendarEditModal';
import { DataQualityPanel } from './DataQualityPanel';
import { ARVLVaccinationMap } from './ARVLVaccinationMap';
import { ARVLVaccinationAnalytics } from './ARVLVaccinationAnalytics';
import { ARVLVaccinationHeatmap } from './ARVLVaccinationHeatmap';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, isSuperAdmin, isLabAdmin } from '../../utils/rbac';

type CalendarViewMode = 'table' | 'quarterly' | 'heatmap' | 'analytics' | 'map';

export const ARVLVaccinationDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Permission checks
  const canEdit = isSuperAdmin(userProfile) || isLabAdmin(userProfile) || hasPermission(userProfile, 'reports.edit' as any);
  const canExport = isSuperAdmin(userProfile) || isLabAdmin(userProfile) || hasPermission(userProfile, 'data.export' as any) || true;

  // Calendar records & Dictionary state
  const [records, setRecords] = useState<ARVLVaccinationRecord[]>([]);
  const [dictionary, setDictionary] = useState<VaccineDictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<CalendarViewMode>('table');

  // Filters state
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('2026/27');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedTarget, setSelectedTarget] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterNoScheduleOnly, setFilterNoScheduleOnly] = useState<boolean>(false);

  // Modals state
  const [selectedDistrictProfile, setSelectedDistrictProfile] = useState<ARVLVaccinationRecord | null>(null);
  const [selectedTargetCode, setSelectedTargetCode] = useState<string | null>(null);
  const [showDictionaryModal, setShowDictionaryModal] = useState<boolean>(false);
  const [showDataQualityPanel, setShowDataQualityPanel] = useState<boolean>(false);
  const [editModalRecord, setEditModalRecord] = useState<ARVLVaccinationRecord | null | undefined>(undefined); // undefined = closed, null = new
  const [showRollForwardModal, setShowRollForwardModal] = useState<boolean>(false);
  const [rollTargetYear, setRollTargetYear] = useState<string>('2027/28');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importCSVText, setImportCSVText] = useState<string>('');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Current fiscal period
  const currentPeriod = useMemo(() => getCurrentFiscalPeriod(), []);

  // 1. Subscribe to Firestore / Local Storage
  useEffect(() => {
    setDictionary(getVaccineDictionary());
    const unsub = subscribeToARVLCalendar((data) => {
      setRecords(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Compute available filter options
  const regionsList = useMemo(() => {
    return Array.from(new Set(records.map(r => r.region).filter(Boolean))).sort();
  }, [records]);

  const zonesList = useMemo(() => {
    const subset = selectedRegion === 'All' ? records : records.filter(r => r.region === selectedRegion);
    return Array.from(new Set(subset.map(r => r.zone).filter(Boolean))).sort();
  }, [records, selectedRegion]);

  const districtsList = useMemo(() => {
    let subset = records;
    if (selectedRegion !== 'All') subset = subset.filter(r => r.region === selectedRegion);
    if (selectedZone !== 'All') subset = subset.filter(r => r.zone === selectedZone);
    return Array.from(new Set(subset.map(r => r.district).filter(Boolean))).sort();
  }, [records, selectedRegion, selectedZone]);

  const yearsList = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.planningYear).filter(Boolean))).sort().reverse();
    if (!list.includes('2026/27')) list.unshift('2026/27');
    return list;
  }, [records]);

  const allVaccineCodes = useMemo(() => {
    const codes = new Set<string>();
    records.forEach(r => {
      Object.values(r.months).forEach((monthTargets) => {
        ((monthTargets || []) as string[]).forEach((t: string) => codes.add(t));
      });
    });
    dictionary.forEach(d => codes.add(d.code));
    return Array.from(codes).sort();
  }, [records, dictionary]);

  // 3. Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedRegion !== 'All' && r.region !== selectedRegion) return false;
      if (selectedZone !== 'All' && r.zone !== selectedZone) return false;
      if (selectedDistrict !== 'All' && r.district !== selectedDistrict) return false;
      if (selectedYear !== 'All' && r.planningYear !== selectedYear) return false;

      // Filter by Quarter
      if (selectedQuarter !== 'All') {
        const qMonths = FISCAL_QUARTERS[selectedQuarter as keyof typeof FISCAL_QUARTERS]?.months || [];
        const hasQuarterActivity = qMonths.some(m => (r.months[m] || []).length > 0);
        if (!hasQuarterActivity) return false;
      }

      // Filter by Month
      if (selectedMonth !== 'All') {
        const mKey = selectedMonth.toLowerCase() as EthiopianFiscalMonthKey;
        const targetsInMonth = r.months[mKey] || [];
        if (targetsInMonth.length === 0) return false;
      }

      // Filter by Target
      if (selectedTarget !== 'All') {
        let targetFound = false;
        if (selectedMonth !== 'All') {
          const mKey = selectedMonth.toLowerCase() as EthiopianFiscalMonthKey;
          targetFound = (r.months[mKey] || []).some(t => t.toUpperCase() === selectedTarget.toUpperCase());
        } else if (selectedQuarter !== 'All') {
          const qMonths = FISCAL_QUARTERS[selectedQuarter as keyof typeof FISCAL_QUARTERS]?.months || [];
          targetFound = qMonths.some(m => (r.months[m] || []).some((t: string) => t.toUpperCase() === selectedTarget.toUpperCase()));
        } else {
          targetFound = Object.values(r.months).some(arr => ((arr || []) as string[]).some((t: string) => t.toUpperCase() === selectedTarget.toUpperCase()));
        }
        if (!targetFound) return false;
      }

      // Filter NO_SCHEDULE only
      if (filterNoScheduleOnly) {
        const hasAnyTarget = Object.values(r.months).some(arr => (arr || []).length > 0);
        if (hasAnyTarget) return false;
      }

      // Global Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inDistrict = r.district.toLowerCase().includes(query);
        const inZone = r.zone.toLowerCase().includes(query);
        const inRemark = (r.remark || '').toLowerCase().includes(query);
        const inTargets = Object.values(r.months).some(arr => ((arr || []) as string[]).some((t: string) => t.toLowerCase().includes(query)));
        if (!inDistrict && !inZone && !inRemark && !inTargets) return false;
      }

      return true;
    });
  }, [
    records, 
    selectedRegion, 
    selectedZone, 
    selectedDistrict, 
    selectedYear, 
    selectedQuarter, 
    selectedMonth, 
    selectedTarget, 
    filterNoScheduleOnly, 
    searchQuery
  ]);

  // 4. Quality Report
  const dataQualityReport: DataQualityReport = useMemo(() => {
    return generateDataQualityReport(records, dictionary);
  }, [records, dictionary]);

  // 5. Reset Filters
  const handleResetFilters = () => {
    setSelectedRegion('All');
    setSelectedZone('All');
    setSelectedDistrict('All');
    setSelectedYear('2026/27');
    setSelectedQuarter('All');
    setSelectedMonth('All');
    setSelectedTarget('All');
    setSearchQuery('');
    setFilterNoScheduleOnly(false);
  };

  // 6. Target color helper
  const getTargetColor = (code: string) => {
    const match = dictionary.find(d => d.code.toUpperCase() === code.toUpperCase());
    return match?.colorClass || 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200';
  };

  // 7. Save Handlers
  const handleSaveRecord = async (record: ARVLVaccinationRecord) => {
    await saveARVLRecord(record, { uid: userProfile?.uid, name: userProfile?.displayName || userProfile?.email });
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteARVLRecord(id, { uid: userProfile?.uid, name: userProfile?.displayName || userProfile?.email });
  };

  const handleSaveDictionaryEntry = async (entry: VaccineDictionaryEntry) => {
    await saveVaccineDictionaryEntry(entry, { uid: userProfile?.uid, name: userProfile?.displayName || userProfile?.email });
    setDictionary(getVaccineDictionary());
  };

  // 8. Roll Forward
  const handleRollForward = async () => {
    if (!rollTargetYear) return;
    const count = await copyPlanningYear(selectedYear !== 'All' ? selectedYear : '2026/27', rollTargetYear, {
      uid: userProfile?.uid,
      name: userProfile?.displayName || userProfile?.email
    });
    alert(`Successfully generated ${count} vaccination district schedules for year ${rollTargetYear}.`);
    setShowRollForwardModal(false);
    setSelectedYear(rollTargetYear);
  };

  // 9. CSV Import
  const handleProcessCSVImport = async () => {
    if (!importCSVText.trim()) return;
    try {
      const parsed = parseCalendarCSV(importCSVText);
      if (parsed.length === 0) {
        setImportStatusMessage('No valid district rows found in CSV. Please verify formatting.');
        return;
      }
      let count = 0;
      for (const p of parsed) {
        if (p.district && p.zone) {
          await saveARVLRecord(p as ARVLVaccinationRecord, {
            uid: userProfile?.uid,
            name: userProfile?.displayName || userProfile?.email
          });
          count++;
        }
      }
      setImportStatusMessage(`Successfully imported ${count} district records!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportCSVText('');
        setImportStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setImportStatusMessage(`Import error: ${err?.message || 'Failed to process CSV'}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Identity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ARVL VACCINATION CALENDAR
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                PLANNED / SCHEDULED VACCINATION ACTIVITIES (SCHEDULED ≠ COMPLETED)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Ethiopian Fiscal Year: July – June
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Annual Livestock Vaccination Planning & Monitoring
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Digitized operational vaccination schedule for Asela Regional Veterinary Laboratory (ARVL) network. Facilitates veterinary disease prevention planning, resource allocation, and epidemiology coordination across 122 operational units.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDictionaryModal(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="View & Search Disease Acronym Dictionary"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Dictionary ({dictionary.length})
            </button>

            <button
              onClick={() => setShowDataQualityPanel(!showDataQualityPanel)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                showDataQualityPanel
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Inspect Master Data Quality and Unscheduled Units"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Audit {dataQualityReport.emptyDistricts.length > 0 && `(${dataQualityReport.emptyDistricts.length})`}
            </button>

            {canExport && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportCalendarToCSV(filteredRecords, `ARVL_Vaccination_Calendar_${selectedYear}.csv`)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Download CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  CSV
                </button>

                <button
                  onClick={() => exportCalendarToPDF(filteredRecords, {
                    planningYear: selectedYear,
                    filterZone: selectedZone,
                    filterQuarter: selectedQuarter,
                    filterTarget: selectedTarget
                  })}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Generate Official Landscape PDF Report"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  PDF
                </button>
              </div>
            )}

            {canEdit && (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Import CSV Dataset"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  Import
                </button>

                <button
                  onClick={() => setShowRollForwardModal(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Roll forward plan into next fiscal year"
                >
                  <Copy className="w-4 h-4 text-indigo-600" />
                  Copy Year
                </button>

                <button
                  onClick={() => setEditModalRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Collapsible Data Quality Panel */}
      {showDataQualityPanel && (
        <DataQualityPanel
          report={dataQualityReport}
          onFilterNoSchedule={() => {
            setFilterNoScheduleOnly(true);
            setShowDataQualityPanel(false);
          }}
          onFilterTarget={(target) => {
            setSelectedTarget(target);
            setShowDataQualityPanel(false);
          }}
          onSelectDistrictSearch={(districtName) => {
            setSearchQuery(districtName);
            setShowDataQualityPanel(false);
          }}
        />
      )}

      {/* 3. 8 Dynamic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Regions</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{regionsList.length || 1}</div>
          <div className="text-[10px] text-slate-500 truncate">Oromia ARVL</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Zones</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{dataQualityReport.totalZones}</div>
          <div className="text-[10px] text-slate-500">Admin zones</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Districts</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{filteredRecords.length}</div>
          <div className="text-[10px] text-slate-500 font-mono">of {records.length} units</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Targets</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {filteredRecords.reduce((acc, r) => acc + Object.values(r.months).reduce((sum, arr) => sum + (arr?.length || 0), 0), 0)}
          </div>
          <div className="text-[10px] text-slate-500">Planned campaigns</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Units</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {filteredRecords.filter(r => Object.values(r.months).some(arr => (arr || []).length > 0)).length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">With scheduled activities</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No Schedule</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {filteredRecords.filter(r => !Object.values(r.months).some(arr => (arr || []).length > 0)).length}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium">Flagged NO_SCHEDULE</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fiscal Quarter</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{currentPeriod.quarter}</div>
          <div className="text-[10px] text-slate-500 truncate">{FISCAL_QUARTERS[currentPeriod.quarter].name}</div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Month</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{currentPeriod.monthName}</div>
          <div className="text-[10px] text-slate-500 font-mono">Month {MONTH_ORDER.indexOf(currentPeriod.monthKey) + 1}/12</div>
        </div>
      </div>

      {/* 4. Multi-Parameter Filter Bar & View Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Row 1: Search & View Modes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, zone, target (e.g. LSD, FMD), or remark..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Table
            </button>

            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'quarterly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Quarterly
            </button>

            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'heatmap'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Heatmap
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> GIS Map
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Region */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Regions</option>
              {regionsList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                setSelectedDistrict('All');
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Zones ({zonesList.length})</option>
              {zonesList.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Districts ({districtsList.length})</option>
              {districtsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value="All">All Years</option>
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Quarter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Quarters</option>
              <option value="Q1">1st Quarter (Jul–Sep)</option>
              <option value="Q2">2nd Quarter (Oct–Dec)</option>
              <option value="Q3">3rd Quarter (Jan–Mar)</option>
              <option value="Q4">4th Quarter (Apr–Jun)</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Months (12)</option>
              {MONTH_ORDER.map(m => (
                <option key={m} value={m}>
                  {MONTH_LABELS[m].full} ({MONTH_LABELS[m].quarter})
                </option>
              ))}
            </select>
          </div>

          {/* Target Vaccine Multi-Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vaccine Target</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value="All">All Targets ({allVaccineCodes.length})</option>
              {allVaccineCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Quick Chips & Reset */}
        <div className="flex items-center justify-between gap-2 pt-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px]">Active Filters:</span>
            {selectedZone !== 'All' && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                Zone: {selectedZone}
              </span>
            )}
            {selectedDistrict !== 'All' && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                District: {selectedDistrict}
              </span>
            )}
            {selectedQuarter !== 'All' && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
                Quarter: {selectedQuarter}
              </span>
            )}
            {selectedMonth !== 'All' && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                Month: {MONTH_LABELS[selectedMonth.toLowerCase() as EthiopianFiscalMonthKey]?.full}
              </span>
            )}
            {selectedTarget !== 'All' && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                Target: {selectedTarget}
              </span>
            )}
            {filterNoScheduleOnly && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                Only Unscheduled Units
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Filters
          </button>
        </div>
      </div>

      {/* 5. Main Views Content */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Showing {filteredRecords.length} Operational Units
            </div>
            <div className="text-slate-400 text-[11px]">
              Current Fiscal Month: <strong className="text-emerald-600 dark:text-emerald-400">{currentPeriod.monthName} ({currentPeriod.quarter})</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 w-28">Zone</th>
                  <th className="py-3 px-3 w-36">District</th>
                  {MONTH_ORDER.map(m => {
                    const isCurrent = currentPeriod.monthKey === m;
                    return (
                      <th 
                        key={m} 
                        className={`py-3 px-2 text-center w-20 ${
                          isCurrent 
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black' 
                            : ''
                        }`}
                      >
                        {MONTH_LABELS[m].short}
                        <div className="text-[8px] font-normal text-slate-400">{MONTH_LABELS[m].quarter}</div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-3 w-48">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((r) => {
                  const isUnscheduled = !Object.values(r.months).some(arr => (arr || []).length > 0);

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isUnscheduled ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.zone}
                      </td>

                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDistrictProfile(r)}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition flex items-center gap-1 group"
                        >
                          <span>{r.district}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                        {isUnscheduled && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                            NO_SCHEDULE
                          </span>
                        )}
                      </td>

                      {/* 12 Months */}
                      {MONTH_ORDER.map(m => {
                        const targets = r.months[m] || [];
                        const isCurrent = currentPeriod.monthKey === m;

                        return (
                          <td 
                            key={m} 
                            className={`py-2 px-1 text-center align-top ${
                              isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                            }`}
                          >
                            {targets.length > 0 ? (
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                {targets.map((t, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedTargetCode(t)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition hover:opacity-80 ${getTargetColor(t)}`}
                                    title={`Click for ${t} info`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                        {r.remark ? (
                          <span title={r.remark} className="line-clamp-2">
                            {r.remark}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400 text-xs">
                      No vaccination records match the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quarterly View */}
      {viewMode === 'quarterly' && (
        <div className="space-y-6">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(qKey => {
            const q = FISCAL_QUARTERS[qKey];
            const isCurrentQuarter = currentPeriod.quarter === qKey;

            return (
              <div 
                key={qKey}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm ${
                  isCurrentQuarter 
                    ? 'border-emerald-400 dark:border-emerald-800 ring-1 ring-emerald-400/30' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black flex items-center justify-center text-sm">
                      {qKey}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {q.name}
                        {isCurrentQuarter && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            CURRENT
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Months: {q.months.map(m => MONTH_LABELS[m].full).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {q.months.map(mKey => {
                    const activeInMonth = filteredRecords.filter(r => (r.months[mKey] || []).length > 0);
                    const isCurrentMonth = currentPeriod.monthKey === mKey;

                    return (
                      <div 
                        key={mKey}
                        className={`p-4 rounded-2xl border ${
                          isCurrentMonth 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {MONTH_LABELS[mKey].full}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {activeInMonth.length} active districts
                          </span>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {activeInMonth.map(r => (
                            <div 
                              key={r.id}
                              onClick={() => setSelectedDistrictProfile(r)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  {r.district}
                                </span>
                                <span className="text-[10px] text-slate-400">{r.zone}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                                {(r.months[mKey] || []).map((t, i) => (
                                  <span key={i} className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${getTargetColor(t)}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}

                          {activeInMonth.length === 0 && (
                            <div className="py-8 text-center text-slate-400 text-xs italic">
                              No districts have scheduled activities in {MONTH_LABELS[mKey].full}.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <ARVLVaccinationHeatmap
          records={filteredRecords}
          dictionary={dictionary}
          onSelectDistrict={(r) => setSelectedDistrictProfile(r)}
          onSelectTarget={(t) => setSelectedTargetCode(t)}
        />
      )}

      {/* Analytics & Charts View */}
      {viewMode === 'analytics' && (
        <ARVLVaccinationAnalytics
          records={filteredRecords}
          dictionary={dictionary}
          onSelectTarget={(target) => {
            setSelectedTarget(target);
            setViewMode('table');
          }}
        />
      )}

      {/* GIS Map View */}
      {viewMode === 'map' && (
        <ARVLVaccinationMap
          records={filteredRecords}
          dictionary={dictionary}
          selectedTargetFilter={selectedTarget}
          selectedMonthFilter={selectedMonth}
          selectedQuarterFilter={selectedQuarter}
          onSelectDistrict={(r) => setSelectedDistrictProfile(r)}
        />
      )}

      {/* 6. All Modals */}
      {/* District Profile Modal */}
      {selectedDistrictProfile && (
        <DistrictProfileModal
          record={selectedDistrictProfile}
          dictionary={dictionary}
          canEdit={canEdit}
          onClose={() => setSelectedDistrictProfile(null)}
          onEdit={(r) => {
            setSelectedDistrictProfile(null);
            setEditModalRecord(r);
          }}
          onSelectTarget={(t) => setSelectedTargetCode(t)}
        />
      )}

      {/* Target Info Modal */}
      {selectedTargetCode && (
        <TargetInfoModal
          targetCode={selectedTargetCode}
          target={dictionary.find(d => d.code.toUpperCase() === selectedTargetCode.toUpperCase()) || null}
          onClose={() => setSelectedTargetCode(null)}
        />
      )}

      {/* Vaccine Dictionary Modal */}
      {showDictionaryModal && (
        <VaccineDictionaryModal
          dictionary={dictionary}
          canEdit={canEdit}
          onClose={() => setShowDictionaryModal(false)}
          onSaveEntry={handleSaveDictionaryEntry}
        />
      )}

      {/* Calendar Edit / Create Modal */}
      {editModalRecord !== undefined && (
        <CalendarEditModal
          initialRecord={editModalRecord}
          onClose={() => setEditModalRecord(undefined)}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* Roll Forward Planning Year Modal */}
      {showRollForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Roll Forward Planning Year
                </h3>
                <p className="text-xs text-slate-500">
                  Duplicate schedules from {selectedYear !== 'All' ? selectedYear : '2026/27'} into a new fiscal year.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Planning Year
              </label>
              <input
                type="text"
                value={rollTargetYear}
                onChange={(e) => setRollTargetYear(e.target.value)}
                placeholder="e.g. 2027/28"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              This will create copies of all district schedules for the new planning year while preserving audit history.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRollForwardModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRollForward}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Generate Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Import ARVL Vaccination Calendar CSV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste raw CSV content or upload file with Region, Zone, District, Month columns.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      setImportCSVText(evt.target?.result as string || '');
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950 dark:file:text-purple-300 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>

            <textarea
              rows={8}
              value={importCSVText}
              onChange={(e) => setImportCSVText(e.target.value)}
              placeholder="Region,Zone,District,Planning Year,July,August,September,October,November,December,January,February,March,April,May,June,Remark..."
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />

            {importStatusMessage && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                {importStatusMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessCSVImport}
                disabled={!importCSVText.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
