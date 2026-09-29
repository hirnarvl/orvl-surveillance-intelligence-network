import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Building2, 
  CheckCircle, 
  LogOut, 
  Send, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { soundEngine } from '../../utils/sound';

export const UnauthorizedLabScreen: React.FC = () => {
  const { userProfile, logout, approvedLaboratories } = useAuth();
  const { selectedLab, setSelectedLab } = useLaboratory();
  const [requestedAccess, setRequestedAccess] = useState(false);

  const currentAttemptedLab = selectedLab === 'arvl' ? 'ARVL (Asela)' : 'HRVL (Hirna)';
  const approvedLabName = approvedLaboratories.length > 0 
    ? approvedLaboratories.map(l => l === 'ARVL' ? 'ARVL (Asela)' : 'HRVL (Hirna)').join(', ')
    : 'None Assigned';

  const handleSwitchToApprovedLab = () => {
    soundEngine.playClick();
    if (approvedLaboratories.length > 0) {
      const target = approvedLaboratories[0].toLowerCase() as 'hrvl' | 'arvl';
      setSelectedLab(target);
    }
  };

  const handleRequestAccess = () => {
    soundEngine.playSuccess();
    setRequestedAccess(true);
  };

  const handleLogout = async () => {
    soundEngine.playClick();
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Laboratory Access Restricted</h1>
            <p className="text-xs text-slate-400">Institutional Multi-Laboratory Isolation Policy</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-lg w-full mx-auto my-10 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Laboratory Boundary Enforced
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            You Are Not Authorized to Access {currentAttemptedLab}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your user profile is active and verified, but your institutional authorization is restricted to your designated regional laboratory.
          </p>
        </div>

        {/* Verification Summary Card */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Active User:</span>
            <span className="font-semibold text-white">{userProfile?.fullName || 'User'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Attempted Context:</span>
            <span className="font-semibold text-rose-400">{currentAttemptedLab}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Your Approved Laboratory:</span>
            <span className="font-bold text-emerald-400">{approvedLabName}</span>
          </div>
        </div>

        {/* Access Request Status */}
        {requestedAccess ? (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Dual-laboratory membership request submitted to administrative oversight. You will be notified once reviewed.
            </span>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {approvedLaboratories.length > 0 && (
            <button
              onClick={handleSwitchToApprovedLab}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Switch to Authorized Laboratory ({approvedLabName})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {!requestedAccess && (
            <button
              onClick={handleRequestAccess}
              className="w-full py-2 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Dual-Laboratory Access Permission</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        Oromia Regional Veterinary Laboratories Network • Institutional Security Policy
      </footer>
    </div>
  );
};
