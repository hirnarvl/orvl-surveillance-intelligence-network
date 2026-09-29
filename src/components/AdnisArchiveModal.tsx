import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  ShieldCheck, 
  RefreshCw,
  FolderOpen,
  Layers,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  Building2
} from 'lucide-react';
import { DatasetMetadata, ImportBatchRecord } from '../types';
import { ADNIS_ARCHIVE_FOLDER_ID } from '../utils/adnisImporter';
import { useLaboratory } from '../contexts/LaboratoryContext';

interface AdnisArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DatasetMetadata | null;
  importBatches: ImportBatchRecord[];
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
}

export const AdnisArchiveModal: React.FC<AdnisArchiveModalProps> = ({
  isOpen,
  onClose,
  metadata,
  importBatches,
  onTriggerSync,
  isSyncing
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'batches' | 'filtering'>('overview');
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  {getLabHeader('Historical ADNIS Archive & Ingestion')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Authoritative Baseline
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  selectedLab === 'arvl' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Context: {currentLabInfo.shortCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedLab === 'arvl'
                  ? 'Authoritative 2-Year ADNIS Archive filtered to ARVL operational area (112 units across Arsi, West Arsi, Bale, and Shewa).'
                  : selectedLab === 'hrvl'
                  ? 'Authoritative 2-Year ADNIS Archive filtered to HRVL operational area (East & West Hararghe, 36 woredas).'
                  : 'Authoritative 2-Year ADNIS Archive partitioned across HRVL (36 woredas) and ARVL (112 operational units).'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href="https://drive.google.com/drive/folders/1PqTNHiMRTuMxwbMy9qPpjGoLzeny4o36"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
              title="Open 2025 Data Folder"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>2025 Data</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://drive.google.com/drive/folders/15P2NgBhbC29NlGQ_LCJsEKydw-G1HHcJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
              title="Open 2026 Data Folder"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>2026 Data</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dataset Overview & Multi-Lab Provenance
          </button>
          <button
            onClick={() => setActiveSubTab('batches')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'batches'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import Batches & Dual-Lab Audit Logs ({importBatches.length})
          </button>
          <button
            onClick={() => setActiveSubTab('filtering')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'filtering'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Geographic Routing Rules ({currentLabInfo.shortCode})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeSubTab === 'overview' && (
            <>
              {/* Provenance Card */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-100">Authoritative Dataset Synchronization Status</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {metadata?.validationStatus || 'HEALTHY_AND_VERIFIED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-medium">Reporting Window</div>
                    <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{metadata?.reportingPeriodStart || '2024-01-01'} → {metadata?.reportingPeriodEnd || '2026-03-01'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-medium">Dataset Version</div>
                    <div className="text-sm font-bold text-slate-200 mt-1 font-mono">
                      {metadata?.datasetVersion || 'v2.1.0-authoritative-unified-adnis'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-medium">Active Laboratory Scope</div>
                    <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentLabInfo.fullName} ({currentLabInfo.coverageWoredas} Units)</span>
                    </div>
                  </div>
                </div>

                {/* Dual-Lab Partition Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">HRVL Operational Area</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-900/50 text-emerald-300 rounded">36 Woredas</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">East Hararghe (21) & West Hararghe (15). Isolated to Hirna Regional Lab credentials.</p>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">ARVL Operational Area</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-900/50 text-amber-300 rounded">112 Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Arsi (27), West Arsi (13), East Shewa (12), Bale (10), East Bale (7), North Shewa (13) + municipal woredas/sub-cities.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Google Drive Source Archive ID</div>
                    <div className="text-xs font-mono text-slate-400">{ADNIS_ARCHIVE_FOLDER_ID}</div>
                  </div>
                  <button
                    onClick={onTriggerSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? `Synchronizing ${currentLabInfo.shortCode} Archive...` : `Sync ${currentLabInfo.shortCode} ADNIS Archive`}</span>
                  </button>
                </div>
              </div>

              {/* Data Integrity Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Single Authoritative Historical Database</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The existing 2-Year ADNIS Historical Archive serves as the single source of truth. No secondary database is created. Records are classified into <code className="text-slate-300 font-mono">hrvl</code> or <code className="text-slate-300 font-mono">arvl</code> and partitioned dynamically.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Quarantine & Strict Non-Destructive Isolation</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Records that do not map to either HRVL (36) or ARVL (112) operational units are flagged as <span className="font-mono text-amber-300 font-bold">UNMATCHED_OPERATIONAL_AREA</span> and safely quarantined without data loss.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeSubTab === 'batches' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Audit trail of historical spreadsheet batch ingestions processed into Firebase Firestore.
              </div>

              {importBatches.length === 0 ? (
                <div className="p-8 border border-slate-800 rounded-xl text-center bg-slate-900/40">
                  <FileSpreadsheet className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-300">No import batches logged yet</div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Trigger synchronization from Google Drive or import an ADNIS spreadsheet to populate the batch audit ledger.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-medium">
                        <th className="px-4 py-3">Batch ID</th>
                        <th className="px-4 py-3">Source File</th>
                        <th className="px-4 py-3 text-center">Total Rows</th>
                        <th className="px-4 py-3 text-center">HRVL (36)</th>
                        <th className="px-4 py-3 text-center">ARVL (112)</th>
                        <th className="px-4 py-3 text-center">Quarantined</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {importBatches.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-mono text-slate-300">{b.id}</td>
                          <td className="px-4 py-3 text-slate-200">{b.sourceFileName}</td>
                          <td className="px-4 py-3 text-center text-slate-300">{b.totalRawRowsProcessed}</td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-400">{b.recordsAcceptedHRVL}</td>
                          <td className="px-4 py-3 text-center font-bold text-amber-400">{b.recordsAcceptedARVL || 0}</td>
                          <td className="px-4 py-3 text-center text-rose-400">{b.recordsQuarantinedUnmatched || b.recordsQuarantinedNonHRVL || 0}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.processingStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {b.processingStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'filtering' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Authoritative Multi-Laboratory Routing Protocol</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The automatic classification engine inspects Region → Zone → Woreda hierarchy on all raw ADNIS historical records, strictly isolating records by laboratory operational mandates:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-emerald-400 mb-1">HRVL Coverage (36 Woredas)</div>
                    <div className="text-[11px] text-slate-300 font-medium mb-1">East Hararghe (21) & West Hararghe (15)</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      Babile, Badeno, Chinaksen, Dadar, Fedis, Girawa, Gola Oda, Goro Gutu, Gursum, Haramaya, Jarso, Kersa, Kombolcha, Kurfa Chele, Malka Balo, Meyu Muluke, Meta, Midega Tola, Kumbi, Goro Muti, Makanisa Oromoo; Boke, Oda Bultum, Chiro, Daro Lebu, Doba, Habro, Gamachis, Guba Koricha, Mesela, Mieso, Tulo, Gumbi Bordode, Burqa Dhintu, Anchar, Hawwi Gudina.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-amber-400 mb-1">ARVL Coverage (112 Operational Units)</div>
                    <div className="text-[11px] text-slate-300 font-medium mb-1">Arsi, West Arsi, East Shewa, Bale, East Bale, North Shewa</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      Tiyo, Asella Town, Hetosa, Digelu & Tijo, Lemu & Bilbilo, Shirka, Robe, Munessa, Gedeb Hasasa, Dodota, Sire, Merti, Ziway Dugda, Shashemene, Bishoftu, Adama, Batu, Ginir, Goba, and all 112 validated pastoral & dairy woredas.
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl">
                  <div className="text-xs font-bold text-rose-400 mb-1">UNMATCHED_OPERATIONAL_AREA Quarantine Protocol</div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Records from outside Oromia or from non-operational zones (e.g. Somali, Amhara, Tigray, Afar, Sidama) are rejected from active dashboard surveillance and logged with quarantine reason <code className="text-rose-300 font-mono">UNMATCHED_OPERATIONAL_AREA</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Database: <code className="text-slate-300 font-mono">ai-studio-hrvldataanalytic-...</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition"
          >
            Close Archive View
          </button>
        </div>

      </div>
    </div>
  );
};
