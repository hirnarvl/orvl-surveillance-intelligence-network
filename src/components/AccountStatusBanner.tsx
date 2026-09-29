import React from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { soundEngine } from '../utils/sound';
import { getRoleDisplayName } from '../services/userService';

interface AccountStatusBannerProps {
  onOpenAdminConsole?: () => void;
  onOpenAuthModal?: () => void;
}

export const AccountStatusBanner: React.FC<AccountStatusBannerProps> = ({
  onOpenAdminConsole,
  onOpenAuthModal
}) => {
  const { 
    userProfile, 
    accountStatus, 
    isPendingApproval, 
    isSuspended, 
    isRejected, 
    refreshProfile 
  } = useAuth();

  if (!userProfile) return null;
  if (accountStatus === 'active') return null;

  return (
    <div className="w-full mb-6">
      {/* PENDING APPROVAL STATE */}
      {isPendingApproval && (
        <div className="bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/50 dark:via-amber-950/30 dark:to-transparent border border-amber-300 dark:border-amber-700/70 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                    Institutional Registration Pending Administrative Review
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    Status: PENDING
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300 leading-relaxed">
                  Welcome, <strong>{userProfile.fullName}</strong>. Your application as a <strong>{userProfile.professionalDesignation}</strong> ({getRoleDisplayName(userProfile.role)}) for <strong>{userProfile.zone} ({userProfile.district})</strong> is currently in the verification queue.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-amber-700 dark:text-amber-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {userProfile.organization}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {userProfile.district}, {userProfile.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {userProfile.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  refreshProfile();
                }}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                title="Check if an administrator has approved your account"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTED STATE */}
      {isRejected && (
        <div className="bg-linear-to-r from-rose-500/15 via-rose-500/10 to-transparent border border-rose-300 dark:border-rose-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                    Registration Application Not Approved
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                    Status: REJECTED
                  </span>
                </div>
                <p className="text-xs text-rose-800/90 dark:text-rose-300 leading-relaxed">
                  Reason provided: <em>"{userProfile.rejectionReason || 'Institutional credentials could not be verified by Regional Administration.'}"</em>
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  Please contact the HRVL Directorate or submit a revised registration with your official credentials.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              <span>Re-register / Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* SUSPENDED STATE */}
      {isSuspended && (
        <div className="bg-linear-to-r from-slate-600/15 via-slate-600/10 to-transparent border border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-slate-700 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Account Access Suspended
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    Status: SUSPENDED
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Notice: {userProfile.suspensionReason || 'This account has been temporarily restricted by Zonal/Regional Administrative order.'}
                </p>
              </div>
            </div>

            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Switch Account
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
