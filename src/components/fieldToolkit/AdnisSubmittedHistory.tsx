import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  MapPin, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  Activity,
  Building2
} from 'lucide-react';
import { AdnisReport, AdnisReportType } from '../../types/adnisReporting';
import { downloadNationalAdnisExport } from '../../services/adnisReportingService';
import { getWoredasForLaboratory } from '../../data/woredas';
import { ZoneName, WoredaInfo } from '../../types';
import { soundEngine } from '../../utils/sound';
import { useLaboratory } from '../../contexts/LaboratoryContext';

interface AdnisSubmittedHistoryProps {
  reports: AdnisReport[];
  onViewReportDetails: (report: AdnisReport) => void;
}

export const AdnisSubmittedHistory: React.FC<AdnisSubmittedHistoryProps> = ({
  reports,
  onViewReportDetails
}) => {
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'All' | AdnisReportType>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [woredaFilter, setWoredaFilter] = useState<string>('All');

  // Master woredas list scoped dynamically to active laboratory
  const labWoredas: WoredaInfo[] = useMemo(() => {
    return getWoredasForLaboratory(selectedLab);
  }, [selectedLab]);

  // Distinct zones dynamically extracted from the active lab's operational woredas
  const availableZones: string[] = useMemo(() => {
    const zonesSet = new Set<string>();
    labWoredas.forEach(w => {
      if (w.zone) {
        zonesSet.add(w.zone);
      }
    });
    return Array.from(zonesSet).sort();
  }, [labWoredas]);

  // Woredas matching the current zone filter
  const availableWoredas = useMemo(() => {
    return labWoredas.filter(w => zoneFilter === 'All' || w.zone === zoneFilter);
  }, [labWoredas, zoneFilter]);

  // Pre-filter reports strictly by active laboratory context (data isolation)
  // When selectedLab !== 'all', only reports matching that laboratoryId (or matching its catchment woredas) are shown
  const labScopedSubmittedReports = useMemo(() => {
    const validWoredaNames = new Set(labWoredas.map(w => w.name.toLowerCase()));
    
    return reports.filter(r => {
      // Exclude unfinished drafts
      if (r.report_status === 'DRAFT') return false;

      // When 'all' network command view is selected, all submitted reports are visible
      if (selectedLab === 'all') return true;

      // Match explicitly by laboratoryId if present
      if (r.laboratoryId) {
        return r.laboratoryId === selectedLab;
      }

      // Fallback: match by woreda in the active laboratory catchment
      return validWoredaNames.has((r.district || '').trim().toLowerCase());
    });
  }, [reports, selectedLab, labWoredas]);

  // Filtered dataset based on user controls
  const filteredReports = useMemo(() => {
    return labScopedSubmittedReports.filter(r => {
      const matchType = typeFilter === 'All' || r.report_type === typeFilter;
      
      // Match zone cleanly across format variations (e.g. 'E/H' vs 'East Hararghe')
      let matchZone = zoneFilter === 'All';
      if (!matchZone) {
        const reportZone = (r.zone || '').toLowerCase();
        const selectedZoneLower = zoneFilter.toLowerCase();
        matchZone = reportZone === selectedZoneLower || 
                    (selectedZoneLower === 'e/h' && (reportZone.includes('east hararghe') || reportZone === 'e/h')) ||
                    (selectedZoneLower === 'w/h' && (reportZone.includes('west hararghe') || reportZone === 'w/h')) ||
                    (selectedZoneLower.includes('east hararghe') && (reportZone === 'e/h' || reportZone.includes('east hararghe'))) ||
                    (selectedZoneLower.includes('west hararghe') && (reportZone === 'w/h' || reportZone.includes('west hararghe')));
      }

      const matchWoreda = woredaFilter === 'All' || r.district.toLowerCase() === woredaFilter.toLowerCase();
      const matchSearch = 
        r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reporting_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tentative_diagnosis && r.tentative_diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchZone && matchWoreda && matchSearch;
    });
  }, [labScopedSubmittedReports, typeFilter, zoneFilter, woredaFilter, searchTerm]);

  const handleExportAll = () => {
    soundEngine.playClick();
    downloadNationalAdnisExport(filteredReports);
  };

  return (
    <div className="space-y-4">
      {/* Header with National Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>{getLabHeader('Submitted Surveillance History')} ({filteredReports.length} / {labScopedSubmittedReports.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified Field and Zero reports active in the {currentLabInfo.fullName} epidemiology and GIS database.
          </p>
        </div>

        <button
          onClick={handleExportAll}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export National Excel (ADNIS)</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search woreda, disease, reporter..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Report Types</option>
            <option value="FIELD_REPORT">Field Outbreak Reports</option>
            <option value="ZERO_REPORT">Zero Reports</option>
          </select>
        </div>

        {/* Dynamic Zone Filter */}
        <div>
          <select
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value);
              setWoredaFilter('All');
            }}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Zones ({availableZones.length})</option>
            {availableZones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Woreda Filter */}
        <div>
          <select
            value={woredaFilter}
            onChange={(e) => setWoredaFilter(e.target.value)}
            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Woredas ({availableWoredas.length})</option>
            {availableWoredas.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table / Card List */}
      {filteredReports.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No submitted reports match your filters for {currentLabInfo.shortName}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Type & Date</th>
                <th className="p-3.5">Administrative Unit</th>
                <th className="p-3.5">Diagnosis / Event</th>
                <th className="p-3.5">Species</th>
                <th className="p-3.5 text-center">Cases</th>
                <th className="p-3.5 text-center">Deaths</th>
                <th className="p-3.5 text-center">Sync Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredReports.map(report => {
                const isZero = report.report_type === 'ZERO_REPORT';
                return (
                  <tr key={report.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase w-fit ${
                          isZero ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isZero ? <ShieldCheck className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                          <span>{isZero ? 'Zero' : 'Field'}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 mt-1">
                          {report.report_date}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-black text-slate-900 dark:text-white">
                        {report.district} {report.zone ? `(${report.zone})` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {report.reporting_unit}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold">
                      {isZero ? (
                        <span className="text-blue-600 dark:text-blue-400">Zero Disease Event</span>
                      ) : (
                        <span className="text-slate-900 dark:text-white">{report.tentative_diagnosis || 'Field Outbreak'}</span>
                      )}
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300">
                      {report.species?.join(', ') || 'None'}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold">
                      {report.cases > 0 ? (
                        <span className="text-amber-600">{report.cases}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold">
                      {report.deaths > 0 ? (
                        <span className="text-rose-600">{report.deaths}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        report.report_status === 'SYNCED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : report.report_status === 'SYNC_ERROR'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {report.report_status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onViewReportDetails(report);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
