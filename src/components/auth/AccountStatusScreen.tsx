import React from 'react';
import { 
  Clock, 
  AlertOctagon, 
  XCircle, 
  LogOut, 
  Mail, 
  Phone, 
  Building2, 
  ShieldAlert, 
  RefreshCw,
  HelpCircle,
  Microscope
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { soundEngine } from '../../utils/sound';

export const AccountStatusScreen: React.FC = () => {
  const { 
    user, 
    userProfile, 
    logout, 
    refreshProfile, 
    accountStatus, 
    isPendingApproval, 
    isSuspended, 
    isRejected 
  } = useAuth();

  const handleLogout = async () => {
    soundEngine.playClick();
    await logout();
  };

  const handleRefresh = async () => {
    soundEngine.playClick();
    await refreshProfile();
  };

  const labCode = userProfile?.laboratories?.[0] || 'HRVL';
  const isArvl = labCode.toUpperCase() === 'ARVL';
  const labName = isArvl 
    ? 'Asela Regional Veterinary Laboratory (ARVL)' 
    : 'Hirna Regional Veterinary Laboratory (HRVL)';
  const adminContactEmail = isArvl ? 'arvl.admin@oromia.vet.et' : 'hrvl.admin@oromia.health.et';
  const adminContactPhone = isArvl ? '+251 22 331 1088' : '+251 25 551 0122';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center">
            <img 
              src={isArvl 
                ? 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R' 
                : 'https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom'
              } 
              alt="Lab Emblem" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{labName}</h1>
            <p className="text-xs text-slate-400">Institutional Access Verification System</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Status Container */}
      <main className="max-w-xl w-full mx-auto my-12 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* PENDING STATE */}
        {isPendingApproval && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
                Registration Under Review
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Awaiting Administrator Approval
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Thank you for registering with the Oromia Veterinary Surveillance Network. Your Google identity has been successfully authenticated, and your laboratory membership request is queued for administrative review.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 text-left space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Authenticated Identity:</span>
                <span className="font-semibold text-white">{user?.email || userProfile?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Applicant Name:</span>
                <span className="font-semibold text-white">{userProfile?.fullName || user?.displayName || 'Registered User'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Requested Laboratory:</span>
                <span className="font-semibold text-emerald-400">{labCode} Diagnostic Center</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Status:</span>
                <span className="font-bold text-amber-400 uppercase tracking-wider">Pending Approval</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-left text-xs space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Need expedited clearance?</span>
              </div>
              <p className="text-slate-400">
                Contact your regional laboratory director or focal person to approve your credentials:
              </p>
              <div className="pt-1 text-slate-300 space-y-0.5">
                <p>Email: <a href={`mailto:${adminContactEmail}`} className="text-emerald-400 hover:underline">{adminContactEmail}</a></p>
                <p>Phone: <span className="text-white font-mono">{adminContactPhone}</span></p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Approval Status</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* SUSPENDED STATE */}
        {isSuspended && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 mb-2">
                Account Suspended
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Access Temporarily Suspended
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Your institutional surveillance account has been suspended by the regional veterinary laboratory administration.
              </p>
              {userProfile?.suspensionReason && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                  <strong>Reason:</strong> {userProfile.suspensionReason}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-left space-y-2">
              <p className="text-slate-300">
                To request reactivation or resolve credentials, contact the regional administrative desk:
              </p>
              <p className="text-emerald-400 font-semibold">{adminContactEmail}</p>
              <p className="text-slate-400">Direct Telephone: {adminContactPhone}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* REJECTED STATE */}
        {isRejected && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 mb-2">
                Application Declined
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Laboratory Access Declined
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Your request for membership at {labName} was declined by the laboratory authority.
              </p>
              {userProfile?.rejectionReason && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                  <strong>Notice:</strong> {userProfile.rejectionReason}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        ORVL Surveillance Intelligence Network • Role-Based Access Control
      </footer>
    </div>
  );
};
