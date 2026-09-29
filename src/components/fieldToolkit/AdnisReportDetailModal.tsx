import React from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Calendar, 
  Building2, 
  User, 
  Phone, 
  Stethoscope, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Globe
} from 'lucide-react';
import { AdnisReport } from '../../types/adnisReporting';
import { soundEngine } from '../../utils/sound';

interface AdnisReportDetailModalProps {
  report: AdnisReport | null;
  onClose: () => void;
}

export const AdnisReportDetailModal: React.FC<AdnisReportDetailModalProps> = ({
  report,
  onClose
}) => {
  if (!report) return null;

  const isZero = report.report_type === 'ZERO_REPORT';

  const handlePrint = () => {
    soundEngine.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className={`p-4 sm:p-6 text-white flex items-start justify-between gap-4 ${
          isZero ? 'bg-gradient-to-r from-blue-700 to-indigo-800' : 'bg-gradient-to-r from-emerald-700 to-teal-800'
        }`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-mono font-bold tracking-wider uppercase border border-white/30 flex items-center gap-1">
                {isZero ? <ShieldCheck className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                <span>{isZero ? 'ADNIS Zero Report' : 'ADNIS Field Outbreak Report'}</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-mono font-bold">
                Status: {report.report_status}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              {isZero ? 'Zero Disease Surveillance Submission' : (report.tentative_diagnosis || 'Field Outbreak')}
            </h3>

            <p className="text-xs text-white/80 mt-0.5 font-mono">
              ID: {report.id} • GUID: {report.client_report_id}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Administrative Location & Reporter Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Administrative Location
              </span>
              <p className="font-black text-sm text-slate-900 dark:text-white">
                {report.district} Woreda ({report.zone})
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Unit / Kebele: <strong>{report.reporting_unit}</strong> {report.village ? `• Village: ${report.village}` : ''}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Region: {report.region} • Operational Zone: {report.zone}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Reporter & Facility
              </span>
              <p className="font-black text-sm text-slate-900 dark:text-white">
                {report.reporter_name}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Organization: <strong>{report.organization || 'District Vet Clinic'}</strong>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Phone: {report.reporter_phone} • Role: {report.reporter_role || 'Field Vet'}
              </p>
            </div>
          </div>

          {/* Epidemiological Summary (For Field Reports) */}
          {!isZero && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Epidemiological Counts & Rates
              </span>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Animals at Risk</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{report.at_risk}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Reported Cases</span>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{report.cases}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-rose-500 font-bold uppercase">Reported Deaths</span>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">{report.deaths}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <div>Morbidity: <strong>{report.morbidity_rate || (report.at_risk > 0 ? ((report.cases / report.at_risk) * 100).toFixed(2) : 0)}%</strong></div>
                <div>Mortality: <strong>{report.mortality_rate || (report.at_risk > 0 ? ((report.deaths / report.at_risk) * 100).toFixed(2) : 0)}%</strong></div>
                <div>CFR: <strong>{report.case_fatality_rate || (report.cases > 0 ? ((report.deaths / report.cases) * 100).toFixed(2) : 0)}%</strong></div>
              </div>
            </div>
          )}

          {/* Species & Geopoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Monitored / Affected Species
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {report.species?.join(', ') || 'None'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                GPS Geopoint Coordinates
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {report.latitude}° N, {report.longitude}° E {report.altitude ? `• ${report.altitude}m` : ''}
              </p>
              <p className="text-[10px] text-slate-400">
                Source: {report.gps_source} (Accuracy: ±{report.gps_accuracy || 5}m)
              </p>
            </div>
          </div>

          {/* Symptoms List (For Field Reports) */}
          {!isZero && report.symptoms && report.symptoms.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Recorded Clinical Signs & Symptoms ({report.symptoms.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {report.symptoms.map((sym, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                    {sym}
                  </span>
                ))}
              </div>
              {report.symptom_notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                  Note: {report.symptom_notes}
                </p>
              )}
            </div>
          )}

          {/* Comments & Control Measures */}
          {report.comments && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Field Investigator Comments & Notes
              </span>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {report.comments}
              </p>
            </div>
          )}

          {/* Audit & Provenance Footer */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
            <p>Created: {new Date(report.created_at).toLocaleString()} • Device ID: {report.device_id}</p>
            {report.finalized_at && <p>Finalized: {new Date(report.finalized_at).toLocaleString()}</p>}
            {report.synced_at && <p>Cloud Synced: {new Date(report.synced_at).toLocaleString()}</p>}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
