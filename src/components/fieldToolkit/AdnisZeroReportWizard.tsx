import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Save, 
  X, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  RotateCcw, 
  Compass, 
  Check, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  CheckCircle2,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { 
  AdnisReport, 
  AdnisLivestockSpecies,
  AdnisGpsStatus,
  AdnisGpsSource
} from '../../types/adnisReporting';
import { ADNIS_SPECIES_OPTIONS } from '../../data/adnisMetadata';
import { HARARGHE_WOREDAS, validateWoreda } from '../../data/woredas';
import { ZoneName, UserProfile } from '../../types';
import { soundEngine } from '../../utils/sound';
import { getOrCreateDeviceId } from '../../services/adnisReportingService';

interface AdnisZeroReportWizardProps {
  initialReport?: AdnisReport | null;
  userProfile?: UserProfile | null;
  isOnline: boolean;
  onSaveDraft: (report: AdnisReport) => void;
  onFinalizeSubmit: (report: AdnisReport) => Promise<void>;
  onCancel: () => void;
}

export const AdnisZeroReportWizard: React.FC<AdnisZeroReportWizardProps> = ({
  initialReport,
  userProfile,
  isOnline,
  onSaveDraft,
  onFinalizeSubmit,
  onCancel
}) => {
  // IDs
  const [reportId] = useState<string>(initialReport?.id || `adnis-zero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const [clientReportId] = useState<string>(initialReport?.client_report_id || `guid-zero-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [deviceId] = useState<string>(initialReport?.device_id || getOrCreateDeviceId());

  // Period & Metadata
  const [reportDate, setReportDate] = useState<string>(initialReport?.report_date || new Date().toISOString().split('T')[0]);
  const [periodStart, setPeriodStart] = useState<string>(initialReport?.reporting_period_start || `${new Date().toISOString().substring(0, 7)}-01`);
  const [periodEnd, setPeriodEnd] = useState<string>(initialReport?.reporting_period_end || new Date().toISOString().split('T')[0]);
  
  // Reporter
  const [reporterName, setReporterName] = useState<string>(initialReport?.reporter_name || userProfile?.fullName || 'District Focal Person');
  const [reporterPhone, setReporterPhone] = useState<string>(initialReport?.reporter_phone || userProfile?.phone || '+251 9');
  const [reporterEmail, setReporterEmail] = useState<string>(initialReport?.reporter_email || userProfile?.email || '');
  const [reporterRole, setReporterRole] = useState<string>(initialReport?.reporter_role || userProfile?.role || 'district_focal_person');
  const [organization, setOrganization] = useState<string>(initialReport?.organization || userProfile?.organization || 'District Animal Health Bureau');

  // Administrative Location
  const [region] = useState<string>('Oromia');
  const [zone, setZone] = useState<ZoneName>(
    (initialReport?.zone as ZoneName) || (userProfile?.zone?.includes('West') ? 'W/H' : 'E/H')
  );
  const [district, setDistrict] = useState<string>(initialReport?.district || userProfile?.district || 'Chiro');
  const [reportingUnit, setReportingUnit] = useState<string>(initialReport?.reporting_unit || 'District Central Veterinary Post');

  // Monitored Species
  const [monitoredSpecies, setMonitoredSpecies] = useState<AdnisLivestockSpecies[]>(
    initialReport?.species || ['Bovine', 'Ovine', 'Caprine', 'Equine', 'Avian']
  );

  // GPS (Strict Integrity — Coordinates are null unless captured via device GPS)
  const [gpsStatus, setGpsStatus] = useState<AdnisGpsStatus>(
    initialReport?.gps_status || (initialReport?.latitude !== null && initialReport?.latitude !== undefined ? 'GPS_ACQUIRED' : 'GPS_UNAVAILABLE')
  );
  const [latitude, setLatitude] = useState<number | null>(initialReport?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initialReport?.longitude ?? null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(initialReport?.gps_accuracy ?? null);
  const [gpsSource, setGpsSource] = useState<AdnisGpsSource>(
    initialReport?.gps_source || (initialReport?.latitude !== null && initialReport?.latitude !== undefined ? 'device_gps' : 'none')
  );
  const [isCapturingGPS, setIsCapturingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Remarks & Confirmation
  const [comments, setComments] = useState<string>(
    initialReport?.comments || 'Active livestock surveillance conducted across district kebeles during reporting period. Zero reportable disease outbreaks or unusual mortalities detected.'
  );
  const [confirmedZero, setConfirmedZero] = useState<boolean>(true);

  // Feedback & Validation
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveDraftFeedback, setSaveDraftFeedback] = useState<boolean>(false);

  // Sync zone on woreda change
  useEffect(() => {
    const matched = HARARGHE_WOREDAS.find(w => w.name.toLowerCase() === district.toLowerCase());
    if (matched) {
      setZone(matched.zone);
    }
  }, [district]);

  // Build Zero Report object
  const buildZeroReportObject = (status: AdnisReport['report_status']): AdnisReport => {
    const woredaValidation = validateWoreda(district);
    return {
      id: reportId,
      client_report_id: clientReportId,
      device_id: deviceId,
      report_type: 'ZERO_REPORT',
      report_status: status,
      reporter_id: userProfile?.uid || 'user-zero-active',
      reporter_name: reporterName,
      reporter_phone: reporterPhone,
      reporter_email: reporterEmail,
      reporter_role: reporterRole,
      organization,
      region,
      zone: (woredaValidation.isValid ? woredaValidation.zone : zone) === 'E/H' ? 'East Hararghe' : 'West Hararghe',
      district: woredaValidation.isValid ? woredaValidation.woredaName : 'UNMATCHED_WOREDA',
      reporting_unit: reportingUnit,
      reporting_period_start: periodStart,
      reporting_period_end: periodEnd,
      report_date: reportDate,
      species: monitoredSpecies,
      gps_status: gpsStatus,
      latitude,
      longitude,
      gps_accuracy: gpsAccuracy,
      gps_source: gpsSource,
      gps_captured_offline: !isOnline,
      at_risk: 0,
      cases: 0,
      deaths: 0,
      morbidity_rate: 0,
      mortality_rate: 0,
      case_fatality_rate: 0,
      symptoms: [],
      tentative_diagnosis: 'None (Zero Reporting)',
      diagnosis_code: 'ZERO_REPORT',
      comments,
      created_at: initialReport?.created_at || Date.now(),
      updated_at: Date.now(),
      finalized_at: initialReport?.finalized_at || null,
      submitted_at: initialReport?.submitted_at || null,
      synced_at: initialReport?.synced_at || null
    };
  };

  const handleCaptureGPS = () => {
    soundEngine.playClick();
    setIsCapturingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsStatus('GPS_UNAVAILABLE');
      setLatitude(null);
      setLongitude(null);
      setGpsAccuracy(null);
      setGpsSource('none');
      setGpsError('Geolocation is not supported by your device browser. Coordinates remain null.');
      setIsCapturingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('GPS_ACQUIRED');
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        setGpsAccuracy(parseFloat(pos.coords.accuracy.toFixed(1)));
        setGpsSource('device_gps');
        setIsCapturingGPS(false);
        soundEngine.playSuccess();
      },
      (err) => {
        console.warn('GPS capture error in zero report:', err);
        setGpsStatus('GPS_UNAVAILABLE');
        setLatitude(null);
        setLongitude(null);
        setGpsAccuracy(null);
        setGpsSource('none');
        setGpsError(`Unable to acquire GPS point (${err.message}). Coordinates remain null.`);
        setIsCapturingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearGPS = () => {
    soundEngine.playClick();
    setGpsStatus('GPS_UNAVAILABLE');
    setLatitude(null);
    setLongitude(null);
    setGpsAccuracy(null);
    setGpsSource('none');
    setGpsError(null);
  };

  const toggleSpecies = (specId: AdnisLivestockSpecies) => {
    soundEngine.playClick();
    setMonitoredSpecies(prev => 
      prev.includes(specId) ? prev.filter(s => s !== specId) : [...prev, specId]
    );
  };

  const handleManualDraft = () => {
    soundEngine.playClick();
    const draft = buildZeroReportObject('DRAFT');
    onSaveDraft(draft);
    setSaveDraftFeedback(true);
    setTimeout(() => setSaveDraftFeedback(false), 3000);
  };

  const handleSubmit = async () => {
    setErrorBanner(null);

    if (!district) {
      setErrorBanner('Please select a district (Woreda).');
      soundEngine.playAlert();
      return;
    }
    const woredaValidation = validateWoreda(district);
    if (!woredaValidation.isValid) {
      setErrorBanner(`District '${district}' is not authorized. Must be one of the 36 HRVL operational woredas.`);
      soundEngine.playAlert();
      return;
    }
    if (!reportingUnit.trim()) {
      setErrorBanner('Please enter a reporting unit / kebele.');
      soundEngine.playAlert();
      return;
    }
    if (monitoredSpecies.length === 0) {
      setErrorBanner('Please select at least one monitored livestock species.');
      soundEngine.playAlert();
      return;
    }
    if (!confirmedZero) {
      setErrorBanner('Please confirm that zero disease events occurred.');
      soundEngine.playAlert();
      return;
    }

    soundEngine.playClick();
    setIsSubmitting(true);
    try {
      const finalReport = buildZeroReportObject(isOnline ? 'SYNCED' : 'SYNC_PENDING');
      await onFinalizeSubmit(finalReport);
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Zero report submission error:', err);
      setErrorBanner('Failed to submit Zero Report: ' + String(err));
      setIsSubmitting(false);
    }
  };

  const availableWoredas = HARARGHE_WOREDAS.filter(w => w.zone === zone);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/40 text-blue-100 text-[11px] font-mono font-bold tracking-wider uppercase border border-blue-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>ADNIS Zero Reporting</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-200 font-semibold">
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-300">Offline Queue</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Connected</span>
                </>
              )}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
            New Zero Report (No Outbreak Observed)
          </h2>
          <p className="text-xs text-blue-100/90 mt-0.5">
            Confirms active surveillance with zero reportable disease events for compliance scorecard.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleManualDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveDraftFeedback ? 'Draft Saved!' : 'Save Draft'}</span>
          </button>
          
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conceptual Definition Banner */}
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-medium flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold">Official Zero Report Surveillance Protocol:</span>
          <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
            A Zero Report certifies that active veterinary surveillance was conducted during the designated period and no reportable disease/outbreak event was observed. It contributes directly to woreda completeness and timeliness metrics without creating false case/mortality statistics.
          </p>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errorBanner && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Form Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Section 1: Administrative Location & Reporting Period */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. Reporting Unit & Period</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Report Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Period Month / Start
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={zone}
                onChange={(e) => {
                  const newZone = e.target.value as ZoneName;
                  setZone(newZone);
                  const firstW = HARARGHE_WOREDAS.find(w => w.zone === newZone);
                  if (firstW) setDistrict(firstW.name);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="E/H">East Hararghe (21 Woredas)</option>
                <option value="W/H">West Hararghe (15 Woredas)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Woreda / District <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                {availableWoredas.map(w => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Unit / Kebele Animal Health Post <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reportingUnit}
                onChange={(e) => setReportingUnit(e.target.value)}
                placeholder="e.g. Chiro Central Veterinary Clinic"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reporter Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reporter Phone
              </label>
              <input
                type="text"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Monitored Livestock Species */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>2. Livestock Species Actively Monitored During Period</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {ADNIS_SPECIES_OPTIONS.map(speciesItem => {
              const isSelected = monitoredSpecies.includes(speciesItem.id);
              return (
                <button
                  key={speciesItem.id}
                  type="button"
                  onClick={() => toggleSpecies(speciesItem.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/40 font-bold'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{speciesItem.id}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Geopoint (Optional Live GPS Capture — No Centroid Fallback) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Surveillance Geopoint: {gpsStatus === 'GPS_ACQUIRED' && latitude !== null && longitude !== null ? `${latitude}° N, ${longitude}° E (±${gpsAccuracy}m)` : <span className="text-slate-500 font-normal italic">GPS Unavailable (Coordinates: null)</span>}</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Status: <span className="font-mono font-bold">{gpsStatus}</span> • Admin Unit: {district} Woreda
            </p>
            {gpsError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                {gpsError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCaptureGPS}
              disabled={isCapturingGPS}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCapturingGPS ? 'animate-spin' : ''}`} />
              <span>{isCapturingGPS ? 'Locating...' : gpsStatus === 'GPS_ACQUIRED' ? 'Re-acquire Live GPS' : 'Acquire Live GPS'}</span>
            </button>

            {gpsStatus === 'GPS_ACQUIRED' && (
              <button
                type="button"
                onClick={handleClearGPS}
                className="px-2.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Clear GPS
              </button>
            )}
          </div>
        </div>

        {/* Section 4: Mandatory Confirmation & Remarks */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Surveillance Observations / Kebele Coverage Notes
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Attestation Checkbox */}
          <label className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedZero}
              onChange={(e) => setConfirmedZero(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs text-emerald-950 dark:text-emerald-100 font-medium">
              <span className="font-extrabold">Official Zero Outbreak Attestation:</span>
              <p className="mt-0.5 text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
                I officially confirm that active livestock surveillance was conducted across this reporting unit during the designated period and zero reportable disease outbreaks, abnormal mortalities, or emergency syndromes were observed.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
            isSubmitting
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-600/30'
          }`}
        >
          <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          <span>{isSubmitting ? 'Submitting Zero Report...' : 'Submit Zero Report'}</span>
        </button>
      </div>
    </div>
  );
};
