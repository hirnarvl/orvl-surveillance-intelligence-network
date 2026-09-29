import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  FileSpreadsheet, 
  Microscope, 
  Activity, 
  LogIn, 
  UserPlus, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { AuthModal } from '../AuthModal';
import { soundEngine } from '../../utils/sound';

export const WelcomeLabPortal: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedLabForModal, setSelectedLabForModal] = useState<'hrvl' | 'arvl'>('hrvl');

  const openAuth = (lab: 'hrvl' | 'arvl') => {
    soundEngine.playClick();
    setSelectedLabForModal(lab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Banner / System Notice */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-md border border-slate-700/60 flex items-center justify-center shrink-0">
              <img 
                src="/orvl-emblem.png" 
                alt="ORVL Network Emblem" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Oromia Regional Veterinary Laboratories Network
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ORVL Network RBAC
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Official Animal Disease Surveillance, Diagnostics & Field Epidemiology Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex items-center space-x-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Lab Access Control</span>
            </div>
            <button
              onClick={() => openAuth('hrvl')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Institutional Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dual-Laboratory Entry Portal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center">
        {/* Portal Hero Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dual-Center Integrated Surveillance Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Select Your Regional Laboratory
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to the Oromia Veterinary Surveillance Network. Access to diagnostic records, ODK submissions, outbreak alerts, and epidemiological data requires institutional authentication and approved laboratory authorization.
          </p>
        </div>

        {/* Dual Cards: HRVL & ARVL */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          
          {/* CARD 1: HRVL */}
          <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            
            <div>
              {/* Header with Emblem */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2.5 shadow-lg border border-slate-600/40 flex items-center justify-center shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom" 
                    alt="HRVL Emblem" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-xs" 
                  />
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                    HRVL Center
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Eastern Zone Hub</p>
                </div>
              </div>

              {/* Title & Scope */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Hirna Regional Veterinary Laboratory
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                Primary surveillance center for animal health, transboundary animal disease diagnosis, and outbreak investigation across the Hararghe livestock corridors.
              </p>

              {/* Coverage & Mandate Highlights */}
              <div className="space-y-3 mb-8 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Catchment Area:</strong> West Hararghe & East Hararghe</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Operational Woredas:</strong> 36 Districts</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Diagnostic Capabilities:</strong> Serology, Parasitology, Pathology, Microbiology</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-700/50">
              <button
                onClick={() => openAuth('hrvl')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Enter HRVL Diagnostic Portal</span>
              </button>
              <button
                onClick={() => openAuth('hrvl')}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>New Staff? Request HRVL Access</span>
              </button>
            </div>
          </div>

          {/* CARD 2: ARVL */}
          <div className="bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            
            <div>
              {/* Header with Emblem */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2.5 shadow-lg border border-slate-600/40 flex items-center justify-center shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R" 
                    alt="ARVL Emblem" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-xs" 
                  />
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    ARVL Center
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Central Rift Valley Hub</p>
                </div>
              </div>

              {/* Title & Scope */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Asela Regional Veterinary Laboratory
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                Central regional diagnostic institute providing laboratory surveillance, confirmatory assays, and disease monitoring across central Oromia livestock zones.
              </p>

              {/* Coverage & Mandate Highlights */}
              <div className="space-y-3 mb-8 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Catchment Area:</strong> Arsi, West Arsi & Adjoining Zones</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Operational Woredas:</strong> 122 Districts</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Diagnostic Capabilities:</strong> Molecular Diagnostics, Serology, Bacteriology, Parasitology</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-700/50">
              <button
                onClick={() => openAuth('arvl')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Enter ARVL Diagnostic Portal</span>
              </button>
              <button
                onClick={() => openAuth('arvl')}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-blue-300 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>New Staff? Request ARVL Access</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security / Architecture Badge */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-xl space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Role-Based Access Control (RBAC) Architecture</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Authentication verifies identity via Google or Institutional accounts. Dashboard permissions and laboratory membership are strictly governed by Firestore authorization rules.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          Federal Democratic Republic of Ethiopia • Oromia Regional Government • Agriculture & Livestock Bureau
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Hirna RVL (Tulgu/Hirna) • Asela RVL (Asella Town) • ORVL Surveillance Intelligence Network
        </p>
      </footer>

      {/* Embedded Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultLab={selectedLabForModal}
      />
    </div>
  );
};
