import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Edit3, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { UserProfile, UserRole, AccountStatus, ProfessionalDesignation } from '../../types';
import { 
  subscribeToAllUsers, 
  approveUserAccount, 
  rejectUserAccount, 
  suspendUserAccount, 
  reactivateUserAccount, 
  updateUserRoleAndAssignments,
  getRoleDisplayName,
  getRoleBadgeClass,
  getStatusBadgeClass,
  canAdminManageUser,
  hasAdminPrivileges
} from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { soundEngine } from '../../utils/sound';
import { HARARGHE_WOREDAS } from '../../data/woredas';

interface UserManagementTabProps {
  onNavigateToApprovals?: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  onNavigateToApprovals
}) => {
  const { userProfile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');

  // Modals / Action States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'edit' | 'view' | null>(null);

  // Form states for actions
  const [actionRole, setActionRole] = useState<UserRole>('field_veterinarian');
  const [actionZone, setActionZone] = useState('West Hararghe');
  const [actionDistrict, setActionDistrict] = useState('Chiro');
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllUsers((userList) => {
      setUsers(userList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Metrics
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.accountStatus === 'pending').length;
  const activeUsers = users.filter(u => u.accountStatus === 'active').length;
  const suspendedUsers = users.filter(u => u.accountStatus === 'suspended' || u.accountStatus === 'rejected').length;
  const adminUsers = users.filter(u => hasAdminPrivileges(u.role)).length;

  // Filtered list
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      (u.organization && u.organization.toLowerCase().includes(term)) ||
      (u.district && u.district.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || u.accountStatus === statusFilter;
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesZone = zoneFilter === 'All' || (u.zone ? u.zone.toLowerCase().includes(zoneFilter.toLowerCase()) : false);

    return matchesSearch && matchesStatus && matchesRole && matchesZone;
  });

  const openAction = (user: UserProfile, type: 'approve' | 'reject' | 'suspend' | 'edit' | 'view') => {
    if (type !== 'view' && (!currentAdmin || !canAdminManageUser(currentAdmin, user))) {
      alert('Access restricted: You can only administer users within your approved laboratory jurisdiction.');
      return;
    }
    soundEngine.playClick();
    setSelectedUser(user);
    setActionType(type);
    setActionRole(user.role);
    setActionZone(user.zone || 'West Hararghe');
    setActionDistrict(user.district || 'Chiro');
    setActionReason('');
  };

  const closeAction = () => {
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
  };

  const handleApprove = async () => {
    if (!selectedUser || !currentAdmin) return;
    setActionLoading(true);
    try {
      await approveUserAccount(currentAdmin, selectedUser.uid, {
        confirmedRole: actionRole,
        confirmedZone: actionZone,
        confirmedDistrict: actionDistrict
      });
      soundEngine.playSuccess();
      closeAction();
    } catch (err) {
      alert('Failed to approve account: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !currentAdmin) return;
    if (!actionReason.trim()) {
      alert('Please specify a rejection reason for the applicant.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectUserAccount(currentAdmin, selectedUser.uid, actionReason);
      soundEngine.playSuccess();
      closeAction();
    } catch (err) {
      alert('Failed to reject account: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !currentAdmin) return;
    if (!actionReason.trim()) {
      alert('Please specify an administrative reason for suspension.');
      return;
    }
    setActionLoading(true);
    try {
      await suspendUserAccount(currentAdmin, selectedUser.uid, actionReason);
      soundEngine.playSuccess();
      closeAction();
    } catch (err) {
      alert('Failed to suspend account: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (user: UserProfile) => {
    if (!currentAdmin || !canAdminManageUser(currentAdmin, user)) {
      alert('Access restricted: You can only administer users within your approved laboratory jurisdiction.');
      return;
    }
    soundEngine.playClick();
    if (!confirm(`Reactivate access for ${user.fullName}?`)) return;
    try {
      await reactivateUserAccount(currentAdmin, user.uid);
      soundEngine.playSuccess();
    } catch (err) {
      alert('Failed to reactivate: ' + String(err));
    }
  };

  const handleUpdateRoleAndAssignment = async () => {
    if (!selectedUser || !currentAdmin) return;
    setActionLoading(true);
    try {
      await updateUserRoleAndAssignments(currentAdmin, selectedUser.uid, {
        role: actionRole,
        zone: actionZone,
        district: actionDistrict
      });
      soundEngine.playSuccess();
      closeAction();
    } catch (err) {
      alert('Failed to update assignments: ' + String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWoredas = HARARGHE_WOREDAS.filter(w => {
    if (actionZone.includes('West')) return w.zone === 'W/H';
    if (actionZone.includes('East')) return w.zone === 'E/H';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalUsers}</p>
          <span className="text-[11px] text-slate-500">Registered Accounts</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-2">{pendingUsers}</p>
          <span className="text-[11px] text-amber-700 dark:text-amber-400">Awaiting Authorization</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Active</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-2">{activeUsers}</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Approved & Reporting</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-2">{adminUsers}</p>
          <span className="text-[11px] text-purple-700 dark:text-purple-400">Regional / Zonal / HRVL</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">Restricted</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">{suspendedUsers}</p>
          <span className="text-[11px] text-rose-700 dark:text-rose-400">Suspended / Rejected</span>
        </div>
      </div>

      {/* Pending Approval Priority Callout Banner */}
      {pendingUsers > 0 && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {pendingUsers} Registration {pendingUsers === 1 ? 'Application' : 'Applications'} Pending Review
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300">
                Review submitted professional designations and assign verified operational authority.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              if (onNavigateToApprovals) {
                onNavigateToApprovals();
              } else {
                setStatusFilter('pending');
              }
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Open Approvals Queue
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, organization, or district..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick Clear */}
          {(searchTerm || statusFilter !== 'All' || roleFilter !== 'All' || zoneFilter !== 'All') && (
            <button
              onClick={() => {
                soundEngine.playClick();
                setSearchTerm('');
                setStatusFilter('All');
                setRoleFilter('All');
                setZoneFilter('All');
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Account Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active / Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Role Authority
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="All">All Roles</option>
              <option value="admin_regional">Regional Veterinary Administrator</option>
              <option value="admin_zonal">Zonal Veterinary Administrator</option>
              <option value="admin_hrvl">HRVL Laboratory Administrator</option>
              <option value="district_focal_person">District Focal Person</option>
              <option value="field_veterinarian">Field Veterinarian</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Operational Zone
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="All">All Zones</option>
              <option value="West Hararghe">West Hararghe</option>
              <option value="East Hararghe">East Hararghe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional User Directory
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredUsers.length} records
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Real-time RBAC Synchronization
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No users match criteria</p>
            <p className="text-xs text-slate-400">Try adjusting your search keywords or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User & Professional Title</th>
                  <th className="py-3 px-4">Role & Privilege</th>
                  <th className="py-3 px-4">Geographic Assignment</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const canManage = currentAdmin ? canAdminManageUser(currentAdmin, u) : false;
                  return (
                    <tr 
                      key={u.uid} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        u.accountStatus === 'pending' ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {u.fullName}
                            {u.uid === currentAdmin?.uid && (
                              <span className="text-[10px] text-emerald-600 font-semibold">(You)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {u.professionalDesignation}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadgeClass(u.role)}`}>
                          {getRoleDisplayName(u.role)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {u.district || 'Unassigned'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {u.zone}, {u.region}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {u.organization}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(u.accountStatus)}`}>
                          {u.accountStatus.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* If pending and manageable, show prominent APPROVE / REJECT */}
                          {canManage && u.accountStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => openAction(u, 'approve')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                                title="Approve and assign role"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                onClick={() => openAction(u, 'reject')}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="Reject application"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}

                          {/* Active user management - only when manageable */}
                          {canManage && u.accountStatus === 'active' && (
                            <>
                              <button
                                onClick={() => openAction(u, 'edit')}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit role & geographic assignment"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openAction(u, 'suspend')}
                                className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Suspend user"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Suspended/Rejected reactivation - only when manageable */}
                          {canManage && (u.accountStatus === 'suspended' || u.accountStatus === 'rejected') && (
                            <button
                              onClick={() => handleReactivate(u)}
                              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reactivate
                            </button>
                          )}

                          {!canManage && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800" title="Restricted to assigned Lab or Super Admin">
                              Restricted
                            </span>
                          )}

                          <button
                            onClick={() => openAction(u, 'view')}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="View Full User Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTION DIALOG MODALS */}

      {/* 1. APPROVE MODAL */}
      {actionType === 'approve' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Approve User Registration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Authorize institutional access for {selectedUser.fullName}
                  </p>
                </div>
              </div>
              <button onClick={closeAction} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p><strong>Applicant:</strong> {selectedUser.fullName} ({selectedUser.professionalDesignation})</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Organization:</strong> {selectedUser.organization}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirmed Role Authority *
                </label>
                <select
                  value={actionRole}
                  onChange={(e) => setActionRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="field_veterinarian">Field Veterinarian / Reporter</option>
                  <option value="district_focal_person">District / Wereda Focal Person</option>
                  <option value="admin_hrvl">HRVL Laboratory Administrator</option>
                  <option value="admin_zonal">Zonal Veterinary Administrator</option>
                  <option value="admin_regional">Regional Veterinary Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assigned Zone
                  </label>
                  <select
                    value={actionZone}
                    onChange={(e) => setActionZone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="West Hararghe">West Hararghe</option>
                    <option value="East Hararghe">East Hararghe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assigned Woreda
                  </label>
                  <select
                    value={actionDistrict}
                    onChange={(e) => setActionDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {filteredWoredas.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeAction}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT MODAL */}
      {actionType === 'reject' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reject Application
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
                </div>
              </div>
              <button onClick={closeAction} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Feedback / Rejection Reason *
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Specify reason (e.g. Unverified organizational credentials, duplicate registration, or outside operational jurisdiction)..."
                rows={3}
                required
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeAction}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUSPEND MODAL */}
      {actionType === 'suspend' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Suspend User Access
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
                </div>
              </div>
              <button onClick={closeAction} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Administrative Suspension Reason *
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for administrative suspension..."
                rows={3}
                required
                className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeAction}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSuspend}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EDIT ROLE & ASSIGNMENT MODAL */}
      {actionType === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Roles & Assignments
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.fullName}</p>
                </div>
              </div>
              <button onClick={closeAction} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Assigned Role
                </label>
                <select
                  value={actionRole}
                  onChange={(e) => setActionRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="field_veterinarian">Field Veterinarian / Reporter</option>
                  <option value="district_focal_person">District / Wereda Focal Person</option>
                  <option value="admin_hrvl">HRVL Laboratory Administrator</option>
                  <option value="admin_zonal">Zonal Veterinary Administrator</option>
                  <option value="admin_regional">Regional Veterinary Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Operational Zone
                  </label>
                  <select
                    value={actionZone}
                    onChange={(e) => setActionZone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="West Hararghe">West Hararghe</option>
                    <option value="East Hararghe">East Hararghe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assigned Woreda
                  </label>
                  <select
                    value={actionDistrict}
                    onChange={(e) => setActionDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {filteredWoredas.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeAction}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleUpdateRoleAndAssignment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW FULL PROFILE MODAL */}
      {actionType === 'view' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedUser.fullName}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedUser.accountStatus)}`}>
                    {selectedUser.accountStatus.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedUser.professionalDesignation} • {getRoleDisplayName(selectedUser.role)}
                </p>
              </div>
              <button onClick={closeAction} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact</span>
                <p className="font-semibold">{selectedUser.email}</p>
                <p className="text-slate-500">{selectedUser.phone || 'No phone recorded'}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Jurisdiction</span>
                <p className="font-semibold">{selectedUser.district}, {selectedUser.zone}</p>
                <p className="text-slate-500">{selectedUser.region} Regional State</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Institution</span>
                <p className="font-semibold">{selectedUser.organization}</p>
              </div>

              {selectedUser.approvedByName && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-0.5 col-span-2 text-emerald-800 dark:text-emerald-300">
                  <span className="text-[10px] uppercase font-bold">Approved By</span>
                  <p className="font-semibold">{selectedUser.approvedByName} ({new Date(selectedUser.approvedAt || 0).toLocaleDateString()})</p>
                </div>
              )}

              {selectedUser.rejectionReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl space-y-0.5 col-span-2 text-rose-800 dark:text-rose-300">
                  <span className="text-[10px] uppercase font-bold">Rejection Feedback</span>
                  <p>{selectedUser.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={closeAction}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
