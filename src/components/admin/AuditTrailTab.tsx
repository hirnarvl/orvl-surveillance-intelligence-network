import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  User, 
  Search, 
  Download, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AuditLogEntry, AuditLogAction } from '../../types';
import { subscribeToAuditLogs, loadCachedAuditLogs } from '../../services/auditLogger';
import { soundEngine } from '../../utils/sound';

export const AuditTrailTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => loadCachedAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((updatedLogs) => {
      setLogs(updatedLogs);
    }, 100);
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(l => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      l.actorName.toLowerCase().includes(term) ||
      (l.targetUserName && l.targetUserName.toLowerCase().includes(term)) ||
      (l.details && l.details.toLowerCase().includes(term)) ||
      (l.organizationLevel && l.organizationLevel.toLowerCase().includes(term));

    const matchesAction = actionFilter === 'All' || l.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditLogAction) => {
    switch (action) {
      case 'USER_APPROVE':
      case 'USER_REACTIVATE':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'USER_REJECT':
      case 'USER_SUSPEND':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'ROLE_CHANGE':
      case 'ASSIGNMENT_CHANGE':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'USER_REGISTER':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SYSTEM_CONFIG':
      case 'ADMIN_ACTION':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleExportCSV = () => {
    soundEngine.playClick();
    setIsExporting(true);

    const headers = ['Log ID', 'Timestamp', 'Date', 'Action', 'Actor Name', 'Actor Role', 'Target User', 'Organization Level', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      new Date(l.timestamp).toISOString(),
      l.action,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.actorRole,
      `"${(l.targetUserName || '').replace(/"/g, '""')}"`,
      `"${(l.organizationLevel || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HRVL_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    soundEngine.playSuccess();
    setIsExporting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Security & Administrative Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Immutable audit record of user registrations, role changes, and authorization decisions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor name, target user, or detail descriptions..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="All">All Actions ({logs.length})</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
            <option value="USER_APPROVE">USER_APPROVE</option>
            <option value="USER_REJECT">USER_REJECT</option>
            <option value="USER_SUSPEND">USER_SUSPEND</option>
            <option value="USER_REACTIVATE">USER_REACTIVATE</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="ASSIGNMENT_CHANGE">ASSIGNMENT_CHANGE</option>
            <option value="ADMIN_ACTION">ADMIN_ACTION</option>
            <option value="SYSTEM_CONFIG">SYSTEM_CONFIG</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Chronological Activity Stream ({filteredLogs.length} events)
          </span>
          <span className="text-[11px] text-slate-400">
            Source: Cloud Firestore /auditLogs
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No audit events found matching the search criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors space-y-1.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(l.action)}`}>
                      {l.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {l.actorName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({l.actorRole})
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(l.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {l.details || 'Administrative system operation.'}
                </p>

                {(l.targetUserName || l.organizationLevel) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    {l.targetUserName && (
                      <span><strong>Target User:</strong> {l.targetUserName}</span>
                    )}
                    {l.organizationLevel && (
                      <span><strong>Scope:</strong> {l.organizationLevel}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
