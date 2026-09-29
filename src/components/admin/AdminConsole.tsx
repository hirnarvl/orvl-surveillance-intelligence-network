import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Layers, 
  BarChart3, 
  FileCheck2, 
  Sparkles, 
  ArrowRight,
  Shield,
  HelpCircle,
  Clock,
  UserCheck,
  UserX,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { soundEngine } from '../../utils/sound';
import { UserManagementTab } from './UserManagementTab';
import { AuditTrailTab } from './AuditTrailTab';
import { SurveillanceOversightTab } from './SurveillanceOversightTab';
import { LaboratoryIsolationVerifier } from './LaboratoryIsolationVerifier';
import { SurveillanceRecord, WoredaCompliance, UserProfile, UserRole } from '../../types';
import { 
  getRoleDisplayName, 
  getRoleBadgeClass, 
  loadCachedUsers, 
  saveCachedUsers, 
  approveUserAccount, 
  rejectUserAccount 
} from '../../services/userService';
import { logAuditEvent } from '../../services/auditLogger';

interface AdminConsoleProps {
  records: SurveillanceRecord[];
  rawRecords?: SurveillanceRecord[];
  complianceList?: WoredaCompliance[];
  onOpenReportModal?: () => void;
  onOpenAdnisArchive?: () => void;
}

type AdminSubTab = 'users' | 'approvals' | 'audit' | 'surveillance' | 'verifier';

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  records,
  rawRecords,
  complianceList = [],
  onOpenReportModal,
  onOpenAdnisArchive
}) => {
  const { currentLabInfo, selectedLab, getLabHeader } = useLaboratory();
  const [subTab, setSubTab] = useState<AdminSubTab>('users');
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pendingLoading, setPendingLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectionModalUser, setRejectionModalUser] = useState<UserProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { 
    userProfile, 
    isAdmin, 
    isRegionalAdmin, 
    isZonalAdmin, 
    isHrvlAdmin, 
    isSuperAdmin,
    switchDemoRole 
  } = useAuth();

  // Real-time Firestore Query for users where accountStatus == 'pending'
  useEffect(() => {
    setPendingLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('accountStatus', '==', 'pending')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as UserProfile;
            list.push({ ...data, uid: d.id });
          });

          if (list.length > 0) {
            setPendingUsers(list);
          } else {
            // Check fallback from local cache if offline/empty mock initial data
            const cached = loadCachedUsers();
            const pendingCached = cached.filter(u => u.accountStatus === 'pending');
            setPendingUsers(pendingCached);
          }
          setPendingLoading(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
          const cached = loadCachedUsers();
          setPendingUsers(cached.filter(u => u.accountStatus === 'pending'));
          setPendingLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore query fallback:', err);
      const cached = loadCachedUsers();
      setPendingUsers(cached.filter(u => u.accountStatus === 'pending'));
      setPendingLoading(false);
    }
  }, []);

  const handleTabChange = (t: AdminSubTab) => {
    soundEngine.playClick();
    setSubTab(t);
  };

  // Firestore update: Approve user account
  const handleApproveUser = async (user: UserProfile) => {
    soundEngine.playClick();
    setActionLoadingId(user.uid);
    try {
      const actor: UserProfile = userProfile || ({
        uid: 'admin-sys',
        fullName: 'Administrator',
        role: 'platform_admin'
      } as UserProfile);

      const targetLabs = user.laboratories && user.laboratories.length > 0 
        ? user.laboratories 
        : [user.assignedLaboratory || 'HRVL'];

      await approveUserAccount(actor, user.uid, {
        confirmedRole: user.role,
        assignedLaboratory: targetLabs.length > 1 ? 'all' : targetLabs[0].toLowerCase(),
        confirmedZone: user.zone,
        confirmedDistrict: user.district
      });

      setPendingUsers(prev => prev.filter(u => u.uid !== user.uid));
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Failed to approve user:', err);
      alert('Error approving user: ' + String(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Firestore update: Reject user account
  const handleConfirmReject = async () => {
    if (!rejectionModalUser) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    soundEngine.playClick();
    setActionLoadingId(rejectionModalUser.uid);
    try {
      const actor: UserProfile = userProfile || ({
        uid: 'admin-sys',
        fullName: 'Administrator',
        role: 'platform_admin'
      } as UserProfile);

      await rejectUserAccount(actor, rejectionModalUser.uid, rejectionReason.trim());
      setPendingUsers(prev => prev.filter(u => u.uid !== rejectionModalUser.uid));
      soundEngine.playSuccess();
      setRejectionModalUser(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject user:', err);
      alert('Error rejecting user: ' + String(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered pending users by search
  const filteredPending = pendingUsers.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      (u.organization && u.organization.toLowerCase().includes(term)) ||
      (u.district && u.district.toLowerCase().includes(term)) ||
      (u.zone && u.zone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Admin Console Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 p-2 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {getLabHeader('Administration & Role-Based Access Control')}
                </h2>
                {userProfile && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeClass(userProfile.role)}`}>
                    {getRoleDisplayName(userProfile.role)}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-teal-200/80 max-w-3xl leading-relaxed">
                Supervise authorized veterinary professionals across Regional, Zonal ({selectedLab === 'arvl' ? 'Arsi, West Arsi, Bale & Shewa' : selectedLab === 'hrvl' ? 'East & West Hararghe' : 'All Operational Laboratory Zones'}), and District administrations. Review user registrations, audit authorization changes, and monitor surveillance quality.
              </p>
              <div className="pt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('verifier')}
                  className="px-3 py-1 bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-400/40 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-300" />
                  <span>Run Automated Lab Isolation Verification</span>
                </button>
              </div>
            </div>
          </div>

          {/* Authority View Switcher - Strictly restricted to Super Administrators */}
          {isSuperAdmin && (
            <div className="p-3 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/15 shrink-0 space-y-2 w-full lg:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                Authority View Switcher (Super Admin):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => switchDemoRole?.('admin_hrvl')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isHrvlAdmin ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  HRVL Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoRole?.('admin_regional')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isRegionalAdmin ? 'bg-purple-500 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  Regional Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoRole?.('admin_zonal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isZonalAdmin ? 'bg-blue-500 text-white shadow-sm' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  Zonal Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'users'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory & Accounts</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer relative ${
              subTab === 'approvals'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <Clock className={`w-4 h-4 ${pendingUsers.length > 0 ? 'text-amber-300 animate-pulse' : ''}`} />
            <span>Pending Approvals</span>
            {pendingUsers.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                subTab === 'approvals'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'bg-amber-500 text-white shadow-xs'
              }`}>
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'audit'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail & Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('surveillance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'surveillance'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Surveillance Quality Oversight</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('verifier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              subTab === 'verifier'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-purple-200'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-purple-300" />
            <span>Isolation Verifier & Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {subTab === 'users' && <UserManagementTab onNavigateToApprovals={() => handleTabChange('approvals')} />}
          
          {/* Dedicated Pending Approvals Tab */}
          {subTab === 'approvals' && (
            <div className="space-y-6">
              {/* Queue Overview Banner */}
              <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-300/80 dark:border-amber-700/60 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100">
                          Pending Approvals Queue
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                          {pendingUsers.length} Pending
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-200/80 max-w-2xl">
                        Applicants from the Firestore <code className="px-1.5 py-0.5 bg-amber-200/60 dark:bg-amber-900/40 rounded font-mono font-bold text-amber-900 dark:text-amber-200">users</code> collection awaiting authorization. Approving or rejecting updates the specific user document directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search pending applicants by name, email, woreda, zone, or organization..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Pending User Cards */}
              {pendingLoading ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Querying Firestore for pending user accounts...
                  </p>
                </div>
              ) : filteredPending.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      No Pending Approvals in Queue
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All applicant documents in Firestore with <code className="font-mono">accountStatus: 'pending'</code> have been approved or processed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('users')}
                    className="mt-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5"
                  >
                    <span>Go to User Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPending.map((user) => {
                    const isActing = actionLoadingId === user.uid;
                    return (
                      <div 
                        key={user.uid}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600" />

                        <div className="space-y-4">
                          {/* Top: Name, Designation & Role Badge */}
                          <div className="flex items-start justify-between gap-2 pt-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-slate-900 dark:text-white">
                                  {user.fullName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                  PENDING
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {user.professionalDesignation}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 ${getRoleBadgeClass(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>

                          {/* Contact and Jurisdiction Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 text-slate-500">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center space-x-1.5 text-slate-500">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.district}, {user.zone}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-500">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{user.organization}</span>
                              </div>
                            </div>
                          </div>

                          {/* Applied Date */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Applied: {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">UID: {user.uid.slice(0, 8)}...</span>
                          </div>
                        </div>

                        {/* Action Buttons: Reject & Approve */}
                        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => {
                              soundEngine.playClick();
                              setRejectionModalUser(user);
                              setRejectionReason('');
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleApproveUser(user)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isActing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {subTab === 'audit' && <AuditTrailTab />}
          {subTab === 'surveillance' && (
            <SurveillanceOversightTab
              records={records}
              complianceList={complianceList}
            />
          )}
          {subTab === 'verifier' && (
            <LaboratoryIsolationVerifier
              records={records}
              rawRecords={rawRecords}
              complianceList={complianceList}
              onOpenReportModal={onOpenReportModal}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reject Modal */}
      {rejectionModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reject User Application
                  </h3>
                  <p className="text-xs text-slate-500">{rejectionModalUser.fullName}</p>
                </div>
              </div>
              <button 
                onClick={() => setRejectionModalUser(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Rejection Rationale *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State reason (e.g. Unverified organizational affiliation, outside operational district, duplicate request)..."
                rows={3}
                required
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectionModalUser(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === rejectionModalUser.uid}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === rejectionModalUser.uid ? 'Updating...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

