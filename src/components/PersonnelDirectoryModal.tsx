import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Download
} from 'lucide-react';
import { PersonnelRecord, ZoneName } from '../types';
import { useLaboratory } from '../contexts/LaboratoryContext';

interface PersonnelDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: PersonnelRecord[];
}

export const PersonnelDirectoryModal: React.FC<PersonnelDirectoryModalProps> = ({
  isOpen,
  onClose,
  personnelList
}) => {
  const { currentLabInfo, getLabHeader } = useLaboratory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<'All' | ZoneName>('All');
  const [selectedWoreda, setSelectedWoreda] = useState<string>('All');

  // Distinct woredas in personnel list
  const availableWoredas = useMemo(() => {
    const set = new Set<string>();
    personnelList.forEach(p => {
      if (p.assignedWoreda) set.add(p.assignedWoreda);
    });
    return Array.from(set).sort();
  }, [personnelList]);

  // Filtered personnel
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(p => {
      const matchZone = selectedZone === 'All' || p.assignedZone === selectedZone;
      const matchWoreda = selectedWoreda === 'All' || p.assignedWoreda === selectedWoreda;
      
      const search = searchTerm.toLowerCase();
      const matchSearch = !search || 
        p.name.toLowerCase().includes(search) || 
        p.phone.toLowerCase().includes(search) || 
        p.assignedWoreda.toLowerCase().includes(search) ||
        (p.role && p.role.toLowerCase().includes(search));

      return matchZone && matchWoreda && matchSearch;
    });
  }, [personnelList, selectedZone, selectedWoreda, searchTerm]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = personnelList.length;
    const withNamedPhone = personnelList.filter(p => p.phone !== '*' && p.phone.trim().length > 0).length;
    const withNamedReporter = personnelList.filter(p => p.name !== '*' && p.name.trim().length > 0).length;
    const ehCount = personnelList.filter(p => p.assignedZone === 'E/H').length;
    const whCount = personnelList.filter(p => p.assignedZone === 'W/H').length;
    return { total, withNamedPhone, withNamedReporter, ehCount, whCount };
  }, [personnelList]);

  const handleExportCSV = () => {
    const headers = ['Reporter Name', 'Phone Number', 'Assigned Woreda', 'Zone', 'Role', 'Reports Count', 'First Report Date', 'Last Report Date'];
    const rows = filteredPersonnel.map(p => [
      `"${p.name}"`,
      `"${p.phone}"`,
      `"${p.assignedWoreda}"`,
      `"${p.assignedZone}"`,
      `"${p.role || '*'}"`,
      p.associatedRecordsCount,
      `"${p.firstReportDate}"`,
      `"${p.lastReportDate}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentLabInfo.shortCode}_ADNIS_Personnel_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{getLabHeader('ADNIS Field Personnel & Reporter Directory')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentLabInfo.shortCode} Operational Scope
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified veterinary officers and focal reporters extracted from the 2-year ADNIS historical archive ({currentLabInfo.fullName}).
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Export Personnel to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-950/40 border-b border-slate-800/80">
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-medium">Total Focal Reporters</div>
            <div className="text-xl font-bold text-slate-100 mt-1">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across {currentLabInfo.coverageWoredas} {currentLabInfo.shortCode} Units</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-medium">Named Officers</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats.withNamedReporter}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Explicitly documented</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-medium">Phone Contacts</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{stats.withNamedPhone}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Direct field lines on file</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-medium">Zonal Allocation</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">{stats.ehCount} E/H <span className="text-sm font-normal text-slate-400">|</span> {stats.whCount} W/H</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{currentLabInfo.shortCode === 'ARVL' ? 'Arsi, West Arsi & Bale' : currentLabInfo.shortCode === 'HRVL' ? 'East & West Hararghe' : 'National Integrated Scope'}</div>
          </div>
        </div>

        {/* Data Integrity Notice */}
        <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300 font-semibold">Strict Data-Integrity Protocol:</strong> In accordance with Ethiopian veterinary surveillance data governance, missing names or phone numbers are marked as <span className="font-mono text-amber-300 font-bold px-1 py-0.5 bg-amber-950/60 rounded border border-amber-800/60">*</span> and never fabricated or inferred.
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-6 pb-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by reporter name, phone number, woreda..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value as any)}
              className="px-3 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="All">All Zones (E/H & W/H)</option>
              <option value="E/H">East Hararghe (21 Woredas)</option>
              <option value="W/H">West Hararghe (15 Woredas)</option>
            </select>

            <select
              value={selectedWoreda}
              onChange={e => setSelectedWoreda(e.target.value)}
              className="px-3 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition max-w-[180px]"
            >
              <option value="All">All Woredas</option>
              {availableWoredas.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filteredPersonnel.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-500 mb-3" />
              <div className="text-sm font-medium text-slate-300">No personnel records found</div>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                No reporters match the selected filter criteria. Try adjusting the search query or zone selector.
              </p>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="px-4 py-3">Reporter / Focal Person</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Assigned Location</th>
                    <th className="px-4 py-3">Role / Designation</th>
                    <th className="px-4 py-3 text-center">Reports Filed</th>
                    <th className="px-4 py-3">Reporting Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPersonnel.map((p) => {
                    const isNameMissing = p.name === '*' || !p.name;
                    const isPhoneMissing = p.phone === '*' || !p.phone;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isNameMissing 
                                ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {isNameMissing ? '*' : p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`font-semibold ${isNameMissing ? 'text-amber-400 font-mono' : 'text-slate-200'}`}>
                                {isNameMissing ? 'Name: *' : p.name}
                              </div>
                              <div className="text-[10px] text-slate-400">ID: {p.id.substring(0, 12)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Phone className={`w-3.5 h-3.5 ${isPhoneMissing ? 'text-slate-600' : 'text-emerald-400'}`} />
                            <span className={isPhoneMissing ? 'font-mono text-amber-400 font-semibold' : 'text-slate-300 font-mono'}>
                              {isPhoneMissing ? 'Phone: *' : p.phone}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="font-medium">{p.assignedWoreda}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.assignedZone === 'E/H' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            }`}>
                              {p.assignedZone}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3 text-slate-400">
                          {p.role || 'Veterinary Focal Reporter'}
                        </td>

                        {/* Reports Count */}
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                            {p.associatedRecordsCount}
                          </span>
                        </td>

                        {/* Range */}
                        <td className="px-4 py-3 text-slate-400">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{p.firstReportDate} → {p.lastReportDate}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{filteredPersonnel.length}</strong> of <strong className="text-slate-200">{personnelList.length}</strong> focal records
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
