import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send, 
  MapPin, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Activity, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  Building2, 
  Calendar, 
  Phone, 
  User, 
  X,
  Compass,
  Check,
  Flame,
  HelpCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  AdnisReport, 
  AdnisLivestockSpecies, 
  AdnisReportType,
  AdnisGpsStatus,
  AdnisGpsSource
} from '../../types/adnisReporting';
import { 
  ADNIS_SPECIES_OPTIONS, 
  ADNIS_SYMPTOMS_CATALOG, 
  ADNIS_DIAGNOSES_CATALOG 
} from '../../data/adnisMetadata';
import { ALL_OPERATIONAL_WOREDAS, HARARGHE_WOREDAS, validateWoreda } from '../../data/woredas';
import { ZoneName, UserProfile } from '../../types';
import { soundEngine } from '../../utils/sound';
import { getOrCreateDeviceId } from '../../services/adnisReportingService';
import { useLaboratory } from '../../contexts/LaboratoryContext';

interface AdnisFieldReportWizardProps {
  initialReport?: AdnisReport | null;
  userProfile?: UserProfile | null;
  isOnline: boolean;
  onSaveDraft: (report: AdnisReport) => void;
  onFinalizeSubmit: (report: AdnisReport) => Promise<void>;
  onCancel: () => void;
}

export const AdnisFieldReportWizard: React.FC<AdnisFieldReportWizardProps> = ({
  initialReport,
  userProfile,
  isOnline,
  onSaveDraft,
  onFinalizeSubmit,
  onCancel
}) => {
  const { currentLabInfo, selectedLab } = useLaboratory();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 9;

  // Initialize draft / report state
  const [reportId] = useState<string>(initialReport?.id || `adnis-rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const [clientReportId] = useState<string>(initialReport?.client_report_id || `guid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [deviceId] = useState<string>(initialReport?.device_id || getOrCreateDeviceId());

  // Step 1: Report Info
  const [reportDate, setReportDate] = useState<string>(initialReport?.report_date || new Date().toISOString().split('T')[0]);
  const [periodStart, setPeriodStart] = useState<string>(initialReport?.reporting_period_start || `${new Date().toISOString().substring(0, 7)}-01`);
  const [periodEnd, setPeriodEnd] = useState<string>(initialReport?.reporting_period_end || new Date().toISOString().split('T')[0]);
  const [reporterName, setReporterName] = useState<string>(initialReport?.reporter_name || userProfile?.fullName || 'Field Veterinarian');
  const [reporterPhone, setReporterPhone] = useState<string>(initialReport?.reporter_phone || userProfile?.phone || '+251 9');
  const [reporterEmail, setReporterEmail] = useState<string>(initialReport?.reporter_email || userProfile?.email || '');
  const [reporterRole, setReporterRole] = useState<string>(initialReport?.reporter_role || userProfile?.role || 'field_veterinarian');
  const [organization, setOrganization] = useState<string>(initialReport?.organization || userProfile?.organization || 'District Veterinary Clinic');
  const [region] = useState<string>('Oromia');
  const [zone, setZone] = useState<ZoneName>(
    (initialReport?.zone as ZoneName) || (userProfile?.zone?.includes('West') ? 'W/H' : 'E/H')
  );
  const [district, setDistrict] = useState<string>(initialReport?.district || userProfile?.district || 'Haramaya');
  const [reportingUnit, setReportingUnit] = useState<string>(initialReport?.reporting_unit || 'Central Veterinary Clinic');
  const [village, setVillage] = useState<string>(initialReport?.village || '');

  // Step 2: Species
  const [selectedSpecies, setSelectedSpecies] = useState<AdnisLivestockSpecies[]>(
    initialReport?.species || ['Bovine']
  );

  // Step 3: Location / GPS (Strict Integrity — No Centroid Fallback)
  const [gpsStatus, setGpsStatus] = useState<AdnisGpsStatus>(
    initialReport?.gps_status || (initialReport?.latitude !== null && initialReport?.latitude !== undefined ? 'GPS_ACQUIRED' : 'GPS_UNAVAILABLE')
  );
  const [latitude, setLatitude] = useState<number | null>(
    initialReport?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialReport?.longitude ?? null
  );
  const [altitude, setAltitude] = useState<number | null>(
    initialReport?.altitude ?? null
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(
    initialReport?.gps_accuracy ?? null
  );
  const [gpsSource, setGpsSource] = useState<AdnisGpsSource>(
    initialReport?.gps_source || (initialReport?.latitude !== null && initialReport?.latitude !== undefined ? 'device_gps' : 'none')
  );
  const [isCapturingGPS, setIsCapturingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Step 4: Epidemiological Counts
  const [atRisk, setAtRisk] = useState<number>(initialReport?.at_risk || 100);
  const [cases, setCases] = useState<number>(initialReport?.cases || 10);
  const [deaths, setDeaths] = useState<number>(initialReport?.deaths || 1);

  // Step 5: Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialReport?.symptoms || []);
  const [symptomNotes, setSymptomNotes] = useState<string>(initialReport?.symptom_notes || '');

  // Step 6: Tentative Diagnosis
  const [tentativeDiagnosis, setTentativeDiagnosis] = useState<string>(
    initialReport?.tentative_diagnosis || 'Foot-and-Mouth Disease (FMD)'
  );
  const [diagnosisCertainty, setDiagnosisCertainty] = useState<'Suspected' | 'Probable' | 'Laboratory Confirmed'>(
    initialReport?.diagnosis_certainty || 'Suspected'
  );
  const [possibleSource, setPossibleSource] = useState<string>(
    initialReport?.possible_source || 'Introduction of livestock from trade route / local market'
  );
  const [controlMeasures, setControlMeasures] = useState<string[]>(
    initialReport?.control_measures_applied || ['Isolation of affected animals', 'Movement restriction advisory']
  );

  // Step 7: Comments
  const [comments, setComments] = useState<string>(initialReport?.comments || '');

  // UI feedback & submission state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveDraftFeedback, setSaveDraftFeedback] = useState<boolean>(false);

  // Keep zone in sync when woreda changes (without modifying GPS coordinates)
  useEffect(() => {
    const matchedWoreda = ALL_OPERATIONAL_WOREDAS.find(w => w.name.toLowerCase() === district.toLowerCase());
    if (matchedWoreda) {
      setZone(matchedWoreda.zone as ZoneName);
    }
  }, [district]);

  // Derived calculations
  const morbidityRate = atRisk > 0 ? parseFloat(((cases / atRisk) * 100).toFixed(2)) : 0;
  const mortalityRate = atRisk > 0 ? parseFloat(((deaths / atRisk) * 100).toFixed(2)) : 0;
  const caseFatalityRate = cases > 0 ? parseFloat(((deaths / cases) * 100).toFixed(2)) : 0;

  // Build the complete AdnisReport object
  const buildCurrentReportObject = (status: AdnisReport['report_status']): AdnisReport => {
    const woredaValidation = validateWoreda(district);
    const resolvedZone = woredaValidation.isValid ? woredaValidation.zone : zone;
    const formattedZone = resolvedZone === 'E/H' ? 'East Hararghe' : resolvedZone === 'W/H' ? 'West Hararghe' : resolvedZone;
    return {
      id: reportId,
      client_report_id: clientReportId,
      device_id: deviceId,
      report_type: 'FIELD_REPORT',
      report_status: status,
      reporter_id: userProfile?.uid || 'user-field-active',
      reporter_name: reporterName,
      reporter_phone: reporterPhone,
      reporter_email: reporterEmail,
      reporter_role: reporterRole,
      organization: organization,
      region,
      zone: formattedZone,
      district: woredaValidation.isValid ? woredaValidation.woredaName : (district || 'UNMATCHED_WOREDA'),
      reporting_unit: reportingUnit,
      village,
      reporting_period_start: periodStart,
      reporting_period_end: periodEnd,
      report_date: reportDate,
      species: selectedSpecies,
      gps_status: gpsStatus,
      latitude,
      longitude,
      altitude,
      gps_accuracy: gpsAccuracy,
      gps_source: gpsSource,
      gps_captured_offline: !isOnline,
      at_risk: Number(atRisk),
      cases: Number(cases),
      deaths: Number(deaths),
      morbidity_rate: morbidityRate,
      mortality_rate: mortalityRate,
      case_fatality_rate: caseFatalityRate,
      symptoms: selectedSymptoms,
      symptom_notes: symptomNotes,
      tentative_diagnosis: tentativeDiagnosis,
      diagnosis_code: ADNIS_DIAGNOSES_CATALOG.find(d => d.name === tentativeDiagnosis)?.code || 'FAST_OUTBREAK',
      diagnosis_certainty: diagnosisCertainty,
      possible_source: possibleSource,
      control_measures_applied: controlMeasures,
      comments,
      created_at: initialReport?.created_at || Date.now(),
      updated_at: Date.now(),
      finalized_at: initialReport?.finalized_at || null,
      submitted_at: initialReport?.submitted_at || null,
      synced_at: initialReport?.synced_at || null
    };
  };

  // GPS Acquisition Handler - Captures live device coordinates or marks unavailable
  const handleCaptureGPS = () => {
    soundEngine.playClick();
    setIsCapturingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsStatus('GPS_UNAVAILABLE');
      setLatitude(null);
      setLongitude(null);
      setAltitude(null);
      setGpsAccuracy(null);
      setGpsSource('none');
      setGpsError('Geolocation is not supported by your device or browser. Coordinates remain null; administrative location (' + district + ' Woreda) is retained.');
      setIsCapturingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsStatus('GPS_ACQUIRED');
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        if (pos.coords.altitude !== null && !isNaN(pos.coords.altitude)) {
          setAltitude(Math.round(pos.coords.altitude));
        } else {
          setAltitude(null);
        }
        setGpsAccuracy(parseFloat(pos.coords.accuracy.toFixed(1)));
        setGpsSource('device_gps');
        setIsCapturingGPS(false);
        soundEngine.playSuccess();
      },
      (err) => {
        console.warn('GPS capture notice:', err);
        setGpsStatus('GPS_UNAVAILABLE');
        setLatitude(null);
        setLongitude(null);
        setAltitude(null);
        setGpsAccuracy(null);
        setGpsSource('none');
        setGpsError(`Unable to retrieve live device GPS (${err.message}). Coordinates remain null. Administrative location (${district} Woreda) is preserved.`);
        setIsCapturingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  const handleClearGPS = () => {
    soundEngine.playClick();
    setGpsStatus('GPS_UNAVAILABLE');
    setLatitude(null);
    setLongitude(null);
    setAltitude(null);
    setGpsAccuracy(null);
    setGpsSource('none');
    setGpsError(null);
  };

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    setValidationError(null);

    if (step === 1) {
      if (!district) {
        setValidationError('Please select an administrative district (Woreda).');
        return false;
      }
      const woredaValidation = validateWoreda(district);
      if (!woredaValidation.isValid) {
        setValidationError(`District '${district}' is not authorized. Must be one of the 36 HRVL operational woredas.`);
        return false;
      }
      if (!reportingUnit.trim()) {
        setValidationError('Please enter a reporting unit / kebele or facility name.');
        return false;
      }
      if (!reporterName.trim()) {
        setValidationError('Please provide the reporter name.');
        return false;
      }
    }

    if (step === 2) {
      if (selectedSpecies.length === 0) {
        setValidationError('Please select at least one livestock species.');
        return false;
      }
    }

    if (step === 3) {
      if (gpsStatus === 'GPS_ACQUIRED') {
        if (latitude === null || longitude === null) {
          setValidationError('GPS is marked as acquired but coordinates are missing. Please re-acquire or mark GPS as unavailable.');
          return false;
        }
      }
    }

    if (step === 4) {
      const numAtRisk = Number(atRisk);
      const numCases = Number(cases);
      const numDeaths = Number(deaths);

      if (isNaN(numAtRisk) || isNaN(numCases) || isNaN(numDeaths)) {
        setValidationError('All epidemiological counts must be valid numbers.');
        return false;
      }

      if (numAtRisk < 0 || numCases < 0 || numDeaths < 0) {
        setValidationError('Epidemiological counts cannot be negative.');
        return false;
      }

      if (numCases > numAtRisk) {
        setValidationError(`Cases (${numCases}) cannot exceed the number of animals at risk (${numAtRisk}).`);
        return false;
      }

      if (numDeaths > numCases) {
        setValidationError(`Deaths (${numDeaths}) cannot exceed the number of reported cases (${numCases}).`);
        return false;
      }

      if (numCases < 1) {
        setValidationError('A Field / Outbreak Report requires at least 1 case. If no disease cases occurred, please submit an ADNIS Zero Report instead.');
        return false;
      }
    }

    if (step === 5) {
      if (selectedSymptoms.length === 0) {
        setValidationError('You need to select at least one clinical sign / symptom for this outbreak report.');
        return false;
      }
    }

    if (step === 6) {
      if (!tentativeDiagnosis) {
        setValidationError('Please select a tentative disease diagnosis.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      soundEngine.playAlert();
      return;
    }
    soundEngine.playClick();
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    soundEngine.playClick();
    setValidationError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSaveDraft = () => {
    soundEngine.playClick();
    const draft = buildCurrentReportObject('DRAFT');
    onSaveDraft(draft);
    setSaveDraftFeedback(true);
    setTimeout(() => setSaveDraftFeedback(false), 3000);
  };

  const handleFinalSubmit = async () => {
    // Validate all critical steps
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        soundEngine.playAlert();
        return;
      }
    }

    soundEngine.playClick();
    setIsSubmitting(true);
    try {
      const finalReport = buildCurrentReportObject(isOnline ? 'SYNCED' : 'SYNC_PENDING');
      await onFinalizeSubmit(finalReport);
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Submission failed:', err);
      setValidationError('Failed to submit report: ' + String(err));
      setIsSubmitting(false);
    }
  };

  // Toggle species helper
  const toggleSpecies = (specId: AdnisLivestockSpecies) => {
    soundEngine.playClick();
    setSelectedSpecies(prev => 
      prev.includes(specId) ? prev.filter(s => s !== specId) : [...prev, specId]
    );
  };

  // Toggle symptom helper
  const toggleSymptom = (symptomLabel: string) => {
    soundEngine.playClick();
    setSelectedSymptoms(prev => 
      prev.includes(symptomLabel) ? prev.filter(s => s !== symptomLabel) : [...prev, symptomLabel]
    );
  };

  // Filtered woredas for current zone
  const availableWoredas = HARARGHE_WOREDAS.filter(w => w.zone === zone);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Wizard Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/40 text-emerald-100 text-[11px] font-mono font-bold tracking-wider uppercase border border-emerald-400/30">
              National ADNIS Protocol
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-200 font-semibold">
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-300">Offline Mode Active</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Online (Instant Sync)</span>
                </>
              )}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
            New Field / Outbreak Report
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            {currentLabInfo.fullName} ({currentLabInfo.shortCode}) • {selectedLab === 'arvl' ? 'Arsi, West Arsi, Bale & Shewa Surveillance Stream' : selectedLab === 'hrvl' ? 'East & West Hararghe Surveillance Stream' : 'National Integrated Surveillance Stream'}
          </p>
        </div>

        {/* Wizard Progress & Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleManualSaveDraft}
            title="Save your progress locally"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveDraftFeedback ? 'Draft Saved!' : 'Save Draft'}</span>
          </button>
          
          <button
            onClick={onCancel}
            title="Close form"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Stepper Progress Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
          <span>Step {currentStep} of {totalSteps}: {
            currentStep === 1 ? 'Report Information' :
            currentStep === 2 ? 'Species Selection' :
            currentStep === 3 ? 'Location & GPS' :
            currentStep === 4 ? 'Epidemiological Counts' :
            currentStep === 5 ? 'Symptoms & Clinical Signs' :
            currentStep === 6 ? 'Tentative Diagnosis' :
            currentStep === 7 ? 'Field Comments' :
            currentStep === 8 ? 'Review Summary' :
            'Finalize & Submit'
          }</span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
            {Math.round((currentStep / totalSteps) * 100)}% Completed
          </span>
        </div>

        {/* Progress bar visual */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full transition-all duration-300 border-r border-white/40 dark:border-slate-800/40 last:border-0 ${
                idx + 1 < currentStep
                  ? 'bg-emerald-600'
                  : idx + 1 === currentStep
                  ? 'bg-teal-500'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Wizard Content Body */}
      <div className="p-4 sm:p-6 min-h-[420px]">
        {/* =========================================================================
            STEP 1: Report Information & Administrative Location
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Step 1 — Report Information & Administrative Location</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verify reporting period and authorized administrative boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Report Date */}
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

              {/* Period Start */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Surveillance Period Start
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Period End */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Surveillance Period End
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Region (Fixed Oromia) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={region}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold"
                />
              </div>

              {/* Zone Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Operational Zone <span className="text-rose-500">*</span>
                </label>
                <select
                  value={zone}
                  onChange={(e) => {
                    const newZone = e.target.value as ZoneName;
                    setZone(newZone);
                    const firstWoredaInZone = HARARGHE_WOREDAS.find(w => w.zone === newZone);
                    if (firstWoredaInZone) setDistrict(firstWoredaInZone.name);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="E/H">East Hararghe (21 Woredas)</option>
                  <option value="W/H">West Hararghe (15 Woredas)</option>
                </select>
              </div>

              {/* Woreda Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District / Woreda <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {availableWoredas.map(w => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.zone === 'E/H' ? 'East Hararghe' : 'West Hararghe'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporting Unit / Kebele */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Unit / Kebele Post <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportingUnit}
                  onChange={(e) => setReportingUnit(e.target.value)}
                  placeholder="e.g. Bate Kebele Post / Central Vet Clinic"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Village / Ganda */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Village / Ganda (Optional)
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Ganda Gafarsa"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Reporter Name */}
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

              {/* Reporter Phone */}
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

              {/* Organization / Post */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Clinic
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Species Selection
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>Step 2 — Monitored / Affected Livestock Species</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select one or multiple species affected in this outbreak event. (At least 1 required).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ADNIS_SPECIES_OPTIONS.map(speciesItem => {
                const isSelected = selectedSpecies.includes(speciesItem.id);
                return (
                  <button
                    key={speciesItem.id}
                    type="button"
                    onClick={() => toggleSpecies(speciesItem.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/50 shadow-md'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-black">{speciesItem.label}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                          {speciesItem.scientificGroup}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                      {speciesItem.commonExamples}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedSpecies.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Selected Species ({selectedSpecies.length}):
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-mono">
                  {selectedSpecies.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 3: Location / GPS Acquisition
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Step 3 — Outbreak Geolocation & GPS Point Capture</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Capture high-accuracy live device GPS or mark GPS as unavailable. Centroid fallback is strictly avoided to preserve data integrity.
              </p>
            </div>

            {/* GPS Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800/80 dark:to-emerald-950/30 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className={`w-4 h-4 text-emerald-600 ${isCapturingGPS ? 'animate-spin' : ''}`} />
                    <span>Live GPS Coordinate Acquisition</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Target Administrative Unit: <strong className="text-slate-800 dark:text-slate-200">{district} Woreda</strong> ({zone === 'E/H' ? 'East Hararghe' : 'West Hararghe'}) • Kebele: <strong className="text-slate-800 dark:text-slate-200">{reportingUnit || 'Not specified'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    disabled={isCapturingGPS}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                      isCapturingGPS 
                        ? 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300 cursor-not-allowed'
                        : gpsStatus === 'GPS_ACQUIRED'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                    }`}
                  >
                    <RotateCcw className={`w-4 h-4 ${isCapturingGPS ? 'animate-spin' : ''}`} />
                    <span>{gpsStatus === 'GPS_ACQUIRED' ? 'Re-acquire Live GPS' : 'Acquire Live GPS'}</span>
                  </button>

                  {gpsStatus === 'GPS_ACQUIRED' && (
                    <button
                      type="button"
                      onClick={handleClearGPS}
                      className="px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                    >
                      Clear GPS
                    </button>
                  )}
                </div>
              </div>

              {gpsError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-semibold">
                  {gpsError}
                </div>
              )}

              {/* Status Banner */}
              {gpsStatus === 'GPS_ACQUIRED' && latitude !== null && longitude !== null ? (
                <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/70 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GPS Acquired via Live Device Sensor</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono text-[11px] font-bold">
                    GPS_ACQUIRED
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>GPS Unavailable — Coordinates set to null. Administrative location ({district} Woreda) is strictly preserved.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                    GPS_UNAVAILABLE
                  </span>
                </div>
              )}

              {/* Coordinates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latitude</span>
                  <p className="text-sm font-mono font-black text-slate-800 dark:text-slate-100 mt-1">
                    {latitude !== null ? `${latitude}° N` : <span className="text-slate-400 italic">null</span>}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Longitude</span>
                  <p className="text-sm font-mono font-black text-slate-800 dark:text-slate-100 mt-1">
                    {longitude !== null ? `${longitude}° E` : <span className="text-slate-400 italic">null</span>}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Altitude</span>
                  <p className="text-sm font-mono font-black text-slate-800 dark:text-slate-100 mt-1">
                    {altitude !== null ? `${altitude} m` : 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
                  <p className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {gpsAccuracy !== null ? `±${gpsAccuracy} m` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Source: <strong>{gpsStatus === 'GPS_ACQUIRED' ? 'Live Device GPS (High Precision)' : 'None (GPS Unavailable)'}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: Epidemiological Counts & Mortality Validation
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>Step 4 — Epidemiological Counts & Impact</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enforce strict mathematical validation: <strong>0 ≤ Deaths ≤ Cases ≤ At Risk</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Animals at Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Animals at Risk (Susceptible Population) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={atRisk}
                  onChange={(e) => setAtRisk(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-lg font-black text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">Total herd / flock in exposed perimeter</p>
              </div>

              {/* Reported Cases */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                  2. Clinically Affected Cases (Morbidity) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={cases}
                  onChange={(e) => setCases(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-lg font-black text-amber-900 dark:text-amber-200"
                />
                <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-1">Animals showing clinical signs</p>
              </div>

              {/* Reported Deaths */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                <label className="block text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">
                  3. Fatalities / Deaths (Mortality) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={deaths}
                  onChange={(e) => setDeaths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-3 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-lg font-black text-rose-900 dark:text-rose-200"
                />
                <p className="text-[10px] text-rose-700/80 dark:text-rose-300/80 mt-1">Fatalities attributable to outbreak</p>
              </div>
            </div>

            {/* Calculated Rates Banner */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Morbidity Rate</span>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {morbidityRate}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono">(Cases / At Risk)</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mortality Rate</span>
                <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {mortalityRate}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono">(Deaths / At Risk)</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Case Fatality (CFR)</span>
                <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {caseFatalityRate}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono">(Deaths / Cases)</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: Symptoms & Clinical Signs
        ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                <span>Step 5 — Clinical Symptoms & Manifestations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select observed clinical signs. Structured symptom data feeds automated syndrome detection. (At least 1 required).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADNIS_SYMPTOMS_CATALOG.map(symptom => {
                const isSelected = selectedSymptoms.includes(symptom.label);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/40 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {symptom.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-1.5">{symptom.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {symptom.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Clinical Observations / Lesion Age Details
              </label>
              <textarea
                rows={2}
                value={symptomNotes}
                onChange={(e) => setSymptomNotes(e.target.value)}
                placeholder="e.g. Fresh ruptured vesicular lesions estimated at 3-4 days old. Animals unable to graze..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 6: Tentative Diagnosis
        ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                <span>Step 6 — Tentative Diagnosis & Source Investigation</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select clinical provisional diagnosis and epidemiological certainty level.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Disease Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tentative Diagnosis <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tentativeDiagnosis}
                  onChange={(e) => setTentativeDiagnosis(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {ADNIS_DIAGNOSES_CATALOG.map(diag => (
                    <option key={diag.id} value={diag.name}>
                      {diag.name} {diag.isPriorityFAST ? '★ (FAST Priority)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                  {ADNIS_DIAGNOSES_CATALOG.find(d => d.name === tentativeDiagnosis)?.description}
                </p>
              </div>

              {/* Diagnosis Certainty */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnostic Certainty Level
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['Suspected', 'Probable', 'Laboratory Confirmed'] as const).map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => setDiagnosisCertainty(cert)}
                      className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        diagnosisCertainty === cert
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              {/* Possible Source */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suspected Origin / Transmission Source
                </label>
                <input
                  type="text"
                  value={possibleSource}
                  onChange={(e) => setPossibleSource(e.target.value)}
                  placeholder="e.g. Unrestricted trade movement from Harar transit route, communal watering trough..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 7: Comments
        ========================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Step 7 — Comments & Field Recommendations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Record laboratory sample collection plans, veterinary actions taken, and local context.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Investigator Comments & Response Measures Taken
              </label>
              <textarea
                rows={5}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter detailed field remarks: e.g. 2 vesicular epithelium tissue vials sampled for HRVL PCR verification. Community advised on milk boiling and strict cattle herd segregation. Ring vaccination requested..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 8: Review Screen
        ========================================================================= */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Step 8 — Review Field / Outbreak Report Summary</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Carefully verify all epidemiological entries before finalization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Box 1: Location & Reporter */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Administrative Location
                </span>
                <p className="font-black text-sm text-slate-900 dark:text-white">
                  {district} Woreda ({zone === 'E/H' ? 'East Hararghe' : 'West Hararghe'})
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Unit / Kebele: <strong>{reportingUnit}</strong> {village ? `• Village: ${village}` : ''}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Reporter: {reporterName} ({reporterPhone})
                </p>
              </div>

              {/* Box 2: Disease & Species */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Diagnosis & Species
                </span>
                <p className="font-black text-sm text-slate-900 dark:text-white">
                  {tentativeDiagnosis}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Certainty: <strong>{diagnosisCertainty}</strong>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Species: {selectedSpecies.join(', ')}
                </p>
              </div>

              {/* Box 3: Epidemiological Impact */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Morbidity & Mortality
                </span>
                <div className="flex items-center justify-between">
                  <span>At Risk: <strong>{atRisk}</strong></span>
                  <span>Cases: <strong className="text-amber-600">{cases}</strong></span>
                  <span>Deaths: <strong className="text-rose-600">{deaths}</strong></span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Morbidity: {morbidityRate}% • Mortality: {mortalityRate}% • CFR: {caseFatalityRate}%
                </p>
              </div>

              {/* Box 4: GPS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  GPS Geopoint
                </span>
                {gpsStatus === 'GPS_ACQUIRED' && latitude !== null && longitude !== null ? (
                  <>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {latitude}° N, {longitude}° E {altitude ? `• ${altitude}m` : ''}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Accuracy: ±{gpsAccuracy}m (Live Device GPS)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 italic">
                      GPS Unavailable (Coordinates: null)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Admin: {district} Woreda
                    </p>
                  </>
                )}
              </div>

              {/* Box 5: Symptoms */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 sm:col-span-2">
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Symptoms ({selectedSymptoms.length})
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedSymptoms.join('; ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 9: Finalize & Submit
        ========================================================================= */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Step 9 — Finalize & Transmit to Surveillance Stream</span>
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 space-y-3">
              <div className="flex items-center space-x-2 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Mandatory Finalization Notice</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">
                After finalizing, this report cannot be edited by the field user. Please review all information carefully before submitting.
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                Upon finalization, this report will immediately enter the local synchronization queue and feed the {currentLabInfo.fullName} active surveillance stream, Dashboard KPIs, GIS maps, and national reporting exports.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200">Current Network Status:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isOnline 
                    ? 'Connected — Submission will synchronize to Cloud Firestore immediately.'
                    : 'Offline — Submission will be saved safely on device and automatically synchronized upon reconnecting.'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE QUEUED'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isSubmitting 
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Finalizing & Transmitting...' : 'Finalize & Submit Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
