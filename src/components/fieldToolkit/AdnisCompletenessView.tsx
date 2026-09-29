import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Search, 
  Building2, 
  ShieldCheck, 
  Flame, 
  BarChart3,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { AdnisReport, WoredaReportingCompleteness } from '../../types/adnisReporting';
import { calculateReportingCompleteness } from '../../services/adnisReportingService';
import { ZoneName } from '../../types';
import { soundEngine } from '../../utils/sound';
import { useLaboratory } from '../../contexts/LaboratoryContext';

interface AdnisCompletenessViewProps {
  reports: AdnisReport[];
  onStartZeroReportForWoreda?: (woredaName: string, zone: ZoneName) => void;
  onStartFieldReportForWoreda?: (woredaName: string, zone: ZoneName) => void;
}

export const AdnisCompletenessView: React.FC<AdnisCompletenessViewProps> = ({
  reports,
  onStartZeroReportForWoreda,
  onStartFieldReportForWoreda
}) => {
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'COMPLETE' | 'MISSING' | 'LATE'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate completeness dynamically scoped to the selected laboratory
  const completenessList: WoredaReportingCompleteness[] = useMemo(() => {
    return calculateReportingCompleteness(reports, selectedPeriod, selectedLab);
  }, [reports, selectedPeriod, selectedLab]);

  // Extract distinct zones present in this completeness list
  const availableZones: string[] = useMemo(() => {
    const set = new Set<string>();
    completenessList.forEach(item => {
      if (item.zone) set.add(item.zone);
    });
    return Array.from(set).sort();
  }, [completenessList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return completenessList.filter(item => {
      const matchZone = zoneFilter === 'All' || item.zone === zoneFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchSearch = item.woredaName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchZone && matchStatus && matchSearch;
    });
  }, [completenessList, zoneFilter, statusFilter, searchTerm]);

  // Aggregate metrics
  const totalExpected = completenessList.length;
  const totalReceived = completenessList.reduce((acc, c) => acc + c.totalReceived, 0);
  const totalZero = completenessList.reduce((acc, c) => acc + c.receivedZeroReports, 0);
  const totalField = completenessList.reduce((acc, c) => acc + c.receivedFieldReports, 0);
  const completeCount = completenessList.filter(c => c.status === 'COMPLETE').length;
  const lateCount = completenessList.filter(c => c.status === 'LATE').length;
  const missingCount = completenessList.filter(c => c.status === 'MISSING').length;
  const completenessPct = totalExpected > 0 ? Math.round(((completeCount + lateCount) / totalExpected) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>{getLabHeader('Surveillance Completeness & Zero Reporting Scorecard')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring reporting compliance across {currentLabInfo.fullName} operational catchment ({totalExpected} woredas).
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="2026-08">August 2026 (Current Period)</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Catchment Compliance
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {completenessPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {completeCount + lateCount} / {totalExpected} woredas reporting
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Zero Reports Attested
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {totalZero}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Confirmed absence of disease
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Field Outbreak Reports
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {totalField}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active investigation submissions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Missing / Overdue Woredas
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {missingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Action required before period close
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search woreda name..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Zone and Status pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Zones ({availableZones.length})</option>
            {availableZones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Statuses</option>
            <option value="COMPLETE">Complete / On-Time</option>
            <option value="LATE">Late</option>
            <option value="MISSING">Missing Report</option>
          </select>
        </div>
      </div>

      {/* Woredas Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Woreda / District</th>
              <th className="p-3.5">Zone</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Field Reports</th>
              <th className="p-3.5 text-center">Zero Reports</th>
              <th className="p-3.5">Last Submission</th>
              <th className="p-3.5 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {filteredList.map(item => (
              <tr key={item.woredaId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-black text-slate-900 dark:text-white">
                  {item.woredaName}
                </td>
                <td className="p-3.5">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.zone}
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                    item.status === 'COMPLETE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : item.status === 'LATE'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  }`}>
                    {item.status === 'COMPLETE' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {item.status === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                    {item.status === 'MISSING' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                    <span>{item.status}</span>
                  </span>
                </td>
                <td className="p-3.5 text-center font-bold">
                  {item.receivedFieldReports > 0 ? (
                    <span className="text-purple-600 dark:text-purple-400">{item.receivedFieldReports}</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="p-3.5 text-center font-bold">
                  {item.receivedZeroReports > 0 ? (
                    <span className="text-blue-600 dark:text-blue-400">{item.receivedZeroReports}</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                  {item.lastSubmissionDate ? (
                    <span>{item.lastSubmissionDate} ({item.lastReporterName?.split(' ')[0] || 'Field Vet'})</span>
                  ) : (
                    <span className="text-rose-400 italic">No submission</span>
                  )}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onStartZeroReportForWoreda && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onStartZeroReportForWoreda(item.woredaName, item.zone);
                        }}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Submit Zero Report for this woreda"
                      >
                        + Zero
                      </button>
                    )}
                    {onStartFieldReportForWoreda && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onStartFieldReportForWoreda(item.woredaName, item.zone);
                        }}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Submit Field Report for this woreda"
                      >
                        + Field
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
