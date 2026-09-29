import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole, AccountStatus, ProfessionalDesignation, AppPermission, LaboratoryDocument } from '../types';
import { logAuditEvent } from './auditLogger';
import { 
  isBootstrapAdminEmail, 
  DEFAULT_ROLE_PERMISSIONS, 
  isUserApproved, 
  isSuperAdmin as rbacIsSuperAdmin, 
  isLabAdmin as rbacIsLabAdmin,
  isUserApprovedForLab,
  canAdministerTargetUser,
  formatLabCode
} from '../utils/rbac';

const USERS_STORAGE_KEY = 'hrvl_users_directory_cache';

export const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'user-bootstrap-superadmin',
    displayName: 'Platform Lead (Clexhena)',
    fullName: 'Executive System Administrator',
    email: 'clexhena@gmail.com',
    phone: '+251 91 100 9999',
    region: 'Oromia',
    zone: 'Regional HQ',
    district: 'Regional Directorate',
    assignedLaboratory: 'all',
    accessibleLaboratories: ['hrvl', 'arvl'],
    laboratories: ['HRVL', 'ARVL'],
    professionalDesignation: 'Veterinary Epidemiologist',
    organization: 'Oromia Regional Veterinary Laboratories Network',
    role: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now(),
    approvedAt: Date.now() - 86400000 * 60,
    approvedBy: 'system-bootstrap',
    approvedByName: 'Platform Bootstrap Authority',
    lastLoginAt: Date.now()
  },
  {
    uid: 'user-hrvl-admin-01',
    displayName: 'Dr. Henok Abebe T.',
    fullName: 'Dr. Henok Abebe T.',
    email: 'henok.abebe@hrvl.health.et',
    phone: '+251 91 100 0001',
    region: 'Oromia',
    zone: 'West Hararghe',
    district: 'Hirna (Tulgu)',
    assignedLaboratory: 'hrvl',
    accessibleLaboratories: ['hrvl'],
    laboratories: ['HRVL'],
    professionalDesignation: 'Veterinary Epidemiologist',
    organization: 'Hirna Regional Veterinary Laboratory (HRVL)',
    role: 'LAB_ADMIN',
    roles: ['LAB_ADMIN'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.LAB_ADMIN,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 2,
    approvedAt: Date.now() - 86400000 * 45,
    approvedBy: 'system',
    approvedByName: 'Platform Executive Authority',
    lastLoginAt: Date.now()
  },
  {
    uid: 'user-arvl-admin-01',
    displayName: 'Dr. Kassa D.',
    fullName: 'Dr. Kassa D.',
    email: 'kassa.d@asela.vet.et',
    phone: '+251 22 331 1088',
    region: 'Oromia',
    zone: 'Arsi Zone',
    district: 'Asella Town',
    assignedLaboratory: 'arvl',
    accessibleLaboratories: ['arvl'],
    laboratories: ['ARVL'],
    professionalDesignation: 'Laboratory Director',
    organization: 'Asela Regional Veterinary Laboratory (ARVL)',
    role: 'LAB_ADMIN',
    roles: ['LAB_ADMIN'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.LAB_ADMIN,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now() - 86400000 * 3,
    approvedAt: Date.now() - 86400000 * 40,
    approvedBy: 'system',
    approvedByName: 'Platform Executive Authority',
    lastLoginAt: Date.now() - 3600000 * 3
  },
  {
    uid: 'user-reg-admin-01',
    displayName: 'Dr. Belayneh Mengistu',
    fullName: 'Dr. Belayneh Mengistu',
    email: 'belayneh.mengistu@oromia.gov.et',
    phone: '+251 91 222 3344',
    region: 'Oromia',
    zone: 'Regional Surveillance Network',
    district: 'Regional Directorate',
    assignedLaboratory: 'all',
    accessibleLaboratories: ['hrvl', 'arvl'],
    laboratories: ['HRVL', 'ARVL'],
    professionalDesignation: 'Veterinarian',
    organization: 'Oromia Agriculture & Pastoral Bureau',
    role: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
    approvedAt: Date.now() - 86400000 * 30,
    approvedBy: 'user-hrvl-admin-01',
    approvedByName: 'Dr. Henok Abebe',
    lastLoginAt: Date.now() - 3600000 * 4
  },
  {
    uid: 'user-zonal-admin-01',
    displayName: 'Dr. Ahmed Mohammed',
    fullName: 'Dr. Ahmed Mohammed',
    email: 'ahmed.m@westhararghe.gov.et',
    phone: '+251 91 333 4455',
    region: 'Oromia',
    zone: 'West Hararghe',
    district: 'Chiro Zonal Center',
    assignedLaboratory: 'hrvl',
    accessibleLaboratories: ['hrvl'],
    laboratories: ['HRVL'],
    professionalDesignation: 'Veterinary Epidemiologist',
    organization: 'West Hararghe Zonal Livestock Bureau',
    role: 'EPIDEMIOLOGIST',
    roles: ['EPIDEMIOLOGIST'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.EPIDEMIOLOGIST,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 6,
    approvedAt: Date.now() - 86400000 * 25,
    approvedBy: 'user-hrvl-admin-01',
    approvedByName: 'Dr. Henok Abebe',
    lastLoginAt: Date.now() - 86400000 * 1
  },
  {
    uid: 'user-arvl-staff-01',
    displayName: 'Dr. Tesfaye Almaz',
    fullName: 'Dr. Tesfaye Almaz',
    email: 'tesfaye.a@asela.vet.et',
    phone: '+251 92 133 4455',
    region: 'Oromia',
    zone: 'Arsi Zone',
    district: 'Tiyo',
    assignedLaboratory: 'arvl',
    accessibleLaboratories: ['arvl'],
    laboratories: ['ARVL'],
    professionalDesignation: 'Veterinarian',
    organization: 'Asela RVL Surveillance Division',
    role: 'LABORATORY_USER',
    roles: ['LABORATORY_USER'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.LABORATORY_USER,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 2,
    approvedAt: Date.now() - 86400000 * 20,
    approvedBy: 'user-arvl-admin-01',
    approvedByName: 'Dr. Kassa D.',
    lastLoginAt: Date.now() - 3600000 * 5
  },
  {
    uid: 'user-bedeno-01',
    displayName: 'Dr. Fatuma Mohammed',
    fullName: 'Dr. Fatuma Mohammed',
    email: 'fatuma.m@easthararghe.vet.et',
    phone: '+251 93 555 6677',
    region: 'Oromia',
    zone: 'East Hararghe',
    district: 'Bedeno',
    assignedLaboratory: 'hrvl',
    accessibleLaboratories: ['hrvl'],
    laboratories: ['HRVL'],
    professionalDesignation: 'Veterinarian',
    organization: 'Bedeno Woreda Animal Health Post',
    role: 'LABORATORY_USER',
    roles: ['LABORATORY_USER'],
    status: 'approved',
    accountStatus: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.LABORATORY_USER,
    emailVerified: true,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 1,
    approvedAt: Date.now() - 86400000 * 14,
    approvedBy: 'user-hrvl-admin-01',
    approvedByName: 'Dr. Henok Abebe',
    lastLoginAt: Date.now() - 3600000 * 2
  },
  {
    uid: 'user-pending-01',
    displayName: 'Dr. Kassa Girma',
    fullName: 'Dr. Kassa Girma',
    email: 'kassa.girma@gemechis.gov.et',
    phone: '+251 94 666 7788',
    region: 'Oromia',
    zone: 'West Hararghe',
    district: 'Gemechis',
    assignedLaboratory: 'hrvl',
    accessibleLaboratories: ['hrvl'],
    laboratories: ['HRVL'],
    professionalDesignation: 'Animal Health Professional',
    organization: 'Gemechis Woreda Veterinary Clinic',
    role: 'LABORATORY_USER',
    roles: ['LABORATORY_USER'],
    status: 'pending',
    accountStatus: 'pending',
    permissions: [],
    emailVerified: false,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    lastLoginAt: Date.now() - 3600000 * 1
  }
];

export function loadCachedUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_USERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_USERS;
  } catch {
    return INITIAL_DEMO_USERS;
  }
}

export function saveCachedUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

// Permission checking helpers
export function hasAdminPrivileges(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return (
    role === 'platform_admin' ||
    role === 'national_admin' ||
    role === 'lab_manager' ||
    role === 'admin_regional' ||
    role === 'admin_zonal' ||
    role === 'admin_hrvl'
  );
}

export function isPlatformAdmin(role?: UserRole | string | null): boolean {
  return role === 'platform_admin' || role === 'national_admin' || role === 'admin_regional';
}

export function isLabManager(role?: UserRole | string | null): boolean {
  return role === 'lab_manager' || role === 'admin_hrvl';
}

export function isRegionalAdmin(role?: UserRole | string | null): boolean {
  return role === 'admin_regional' || role === 'platform_admin' || role === 'national_admin';
}

export function isZonalAdmin(role?: UserRole | string | null): boolean {
  return role === 'admin_zonal' || role === 'epidemiologist';
}

export function isHrvlAdmin(role?: UserRole | string | null): boolean {
  return role === 'admin_hrvl' || role === 'lab_manager';
}

export function isDistrictFocal(role?: UserRole | string | null): boolean {
  return role === 'district_focal_person';
}

export function isFieldVet(role?: UserRole | string | null): boolean {
  return role === 'field_veterinarian' || role === 'lab_staff';
}

export function canUserAccessLaboratory(user: UserProfile | null | undefined, labId: string): boolean {
  if (!user) return false; // Guest / Unauthenticated users have NO access
  return isUserApprovedForLab(user, labId);
}

export function getRoleDisplayName(role: UserRole | string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Administrator (Multi-Lab)';
    case 'LAB_ADMIN':
      return 'Laboratory Administrator';
    case 'EPIDEMIOLOGIST':
      return 'Veterinary Epidemiologist';
    case 'LABORATORY_USER':
      return 'Laboratory User';
    case 'PARTNER_USER':
      return 'Partner / Public Health Viewer';
    case 'platform_admin':
      return 'Platform / National Administrator';
    case 'national_admin':
      return 'National Veterinary Epidemiologist';
    case 'lab_manager':
      return 'Regional Laboratory Director / Manager';
    case 'lab_staff':
      return 'Laboratory Diagnostic Officer';
    case 'epidemiologist':
      return 'Veterinary Epidemiologist';
    case 'admin_regional':
      return 'Regional Veterinary Administrator';
    case 'admin_zonal':
      return 'Zonal Veterinary Administrator';
    case 'admin_hrvl':
      return 'HRVL Laboratory Administrator';
    case 'district_focal_person':
      return 'District / Wereda Focal Person';
    case 'field_veterinarian':
      return 'Field Veterinarian / Surveillance Reporter';
    case 'viewer':
      return 'Institutional Read-Only Viewer';
    default:
      return String(role);
  }
}

export function getRoleBadgeClass(role: UserRole | string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'LAB_ADMIN':
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'EPIDEMIOLOGIST':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'LABORATORY_USER':
      return 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    case 'PARTNER_USER':
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'platform_admin':
    case 'national_admin':
    case 'admin_regional':
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'lab_manager':
    case 'admin_hrvl':
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'epidemiologist':
    case 'admin_zonal':
      return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'lab_staff':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'district_focal_person':
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'field_veterinarian':
      return 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export function getStatusBadgeClass(status?: AccountStatus | string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'suspended':
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'rejected':
      return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

export function canAdminManageUser(actor?: UserProfile | null, target?: UserProfile | null): boolean {
  return canAdministerTargetUser(actor, target);
}

// Ensure laboratory documents exist in Firestore
export async function ensureLaboratoriesInFirestore(): Promise<void> {
  const labs: LaboratoryDocument[] = [
    {
      id: 'HRVL',
      name: 'Hirna Regional Veterinary Laboratory',
      shortName: 'HRVL',
      logo: 'https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom',
      region: 'Oromia',
      status: 'active',
      description: 'HRVL Animal Disease Surveillance & Analytics (36 Operational Woredas)',
      woredasCount: 36,
      updatedAt: Date.now()
    },
    {
      id: 'ARVL',
      name: 'Asela Regional Veterinary Laboratory',
      shortName: 'ARVL',
      logo: 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R',
      region: 'Oromia',
      status: 'active',
      description: 'ARVL Animal Disease Surveillance & Analytics (122 Operational Woredas)',
      woredasCount: 122,
      updatedAt: Date.now()
    }
  ];

  for (const lab of labs) {
    try {
      const ref = doc(db, 'laboratories', lab.id);
      await setDoc(ref, lab, { merge: true });
    } catch {
      // Non-blocking if offline or permission denied
    }
  }
}

// User CRUD with Firestore and local fallback
export async function createUserProfile(profile: UserProfile): Promise<void> {
  const isBootstrap = isBootstrapAdminEmail(profile.email);
  const now = Date.now();

  const sanitizedProfile: UserProfile = {
    ...profile,
    status: isBootstrap ? 'approved' : (profile.status || 'pending'),
    accountStatus: isBootstrap ? 'active' : (profile.accountStatus || 'pending'),
    roles: isBootstrap ? ['SUPER_ADMIN'] : (profile.roles && profile.roles.length > 0 ? profile.roles : ['LABORATORY_USER']),
    role: isBootstrap ? 'SUPER_ADMIN' : (profile.role || 'LABORATORY_USER'),
    laboratories: isBootstrap ? ['HRVL', 'ARVL'] : (profile.laboratories && profile.laboratories.length > 0 ? profile.laboratories : [profile.assignedLaboratory ? formatLabCode(profile.assignedLaboratory) : 'HRVL']),
    permissions: isBootstrap ? DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN : (profile.permissions || []),
    approvedAt: isBootstrap ? now : (profile.approvedAt || null),
    approvedBy: isBootstrap ? 'system-bootstrap' : (profile.approvedBy || null),
    approvedByName: isBootstrap ? 'Bootstrap Authority' : (profile.approvedByName || null),
    createdAt: profile.createdAt || now,
    lastLoginAt: now,
    updatedAt: now
  };

  const users = loadCachedUsers();
  const existingIdx = users.findIndex(u => u.uid === sanitizedProfile.uid || u.email === sanitizedProfile.email);
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...sanitizedProfile };
  } else {
    users.push(sanitizedProfile);
  }
  saveCachedUsers(users);

  try {
    const userDocRef = doc(db, 'users', sanitizedProfile.uid);
    await setDoc(userDocRef, sanitizedProfile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const users = loadCachedUsers();
  const cached = users.find(u => u.uid === uid);

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Sync local cache
      if (cached) {
        const idx = users.findIndex(u => u.uid === uid);
        users[idx] = data;
      } else {
        users.push(data);
      }
      saveCachedUsers(users);
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.READ, 'users');
  }

  return cached || null;
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
  const userDocRef = doc(db, 'users', uid);
  const unsubscribe = onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        const cached = loadCachedUsers().find(u => u.uid === uid);
        callback(cached || null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.READ, 'users');
      const cached = loadCachedUsers().find(u => u.uid === uid);
      callback(cached || null);
    }
  );
  return unsubscribe;
}

export function subscribeToAllUsers(callback: (users: UserProfile[]) => void): () => void {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const list: UserProfile[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data() as UserProfile);
      });
      if (list.length > 0) {
        saveCachedUsers(list);
        callback(list);
      } else {
        callback(loadCachedUsers());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.READ, 'users');
      callback(loadCachedUsers());
    }
  );

  return unsubscribe;
}

export function subscribeToPendingUsers(callback: (pendingUsers: UserProfile[]) => void): () => void {
  return subscribeToAllUsers((allUsers: UserProfile[]) => {
    const pending = allUsers.filter(u => u.accountStatus === 'pending');
    callback(pending);
  });
}

export async function approveUserAccount(
  param1: string | UserProfile, 
  param2: string | UserProfile, 
  param3?: UserRole | { confirmedRole?: UserRole; confirmedZone?: string; confirmedDistrict?: string; assignedLaboratory?: string },
  param4?: string
): Promise<void> {
  const actorUser: UserProfile = typeof param1 === 'object' ? param1 : (typeof param2 === 'object' ? param2 : { uid: 'system', fullName: 'System Administrator', role: 'platform_admin' } as UserProfile);
  const targetUserId: string = typeof param1 === 'string' ? param1 : (typeof param2 === 'string' ? param2 : '');

  let assignedRole: UserRole | undefined;
  let assignedLaboratory: string | undefined;
  let confirmedDistrict: string | undefined;
  let confirmedZone: string | undefined;

  if (typeof param3 === 'string') {
    assignedRole = param3;
    assignedLaboratory = param4;
  } else if (typeof param3 === 'object' && param3 !== null) {
    assignedRole = param3.confirmedRole;
    assignedLaboratory = param3.assignedLaboratory;
    confirmedDistrict = param3.confirmedDistrict;
    confirmedZone = param3.confirmedZone;
  }

  const users = loadCachedUsers();
  const idx = users.findIndex(u => u.uid === targetUserId);
  const now = Date.now();

  const effectiveRole = assignedRole || (idx >= 0 ? users[idx].role : 'LABORATORY_USER');
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[effectiveRole] || DEFAULT_ROLE_PERMISSIONS.LABORATORY_USER;

  const targetLabs: string[] = assignedLaboratory 
    ? (assignedLaboratory === 'all' ? ['HRVL', 'ARVL'] : [formatLabCode(assignedLaboratory)])
    : (idx >= 0 && users[idx].laboratories ? users[idx].laboratories : ['HRVL']);

  const updatePayload: Partial<UserProfile> = {
    status: 'approved',
    accountStatus: 'active',
    approvedAt: now,
    approvedBy: actorUser.uid,
    approvedByName: actorUser.fullName,
    updatedAt: now,
    role: effectiveRole,
    roles: [effectiveRole],
    laboratories: targetLabs,
    accessibleLaboratories: targetLabs.map(l => l.toLowerCase()),
    assignedLaboratory: targetLabs.length > 1 ? 'all' : targetLabs[0].toLowerCase(),
    permissions: rolePermissions,
    ...(confirmedDistrict ? { district: confirmedDistrict } : {}),
    ...(confirmedZone ? { zone: confirmedZone } : {})
  };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatePayload };
    saveCachedUsers(users);
  }

  try {
    const docRef = doc(db, 'users', targetUserId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }

  await logAuditEvent({
    actorUserId: actorUser.uid,
    actorName: actorUser.fullName,
    actorRole: actorUser.role,
    action: 'USER_APPROVE',
    targetUserId,
    targetUserName: idx >= 0 ? users[idx].fullName : undefined,
    organizationLevel: actorUser.assignedLaboratory || actorUser.organization,
    details: `Approved user account and assigned role: ${assignedRole || (idx >= 0 ? users[idx].role : 'unknown')}`
  });
}

export async function rejectUserAccount(
  param1: string | UserProfile, 
  param2: string | UserProfile, 
  reasonParam?: string
): Promise<void> {
  const actorUser: UserProfile = typeof param1 === 'object' ? param1 : (typeof param2 === 'object' ? param2 : { uid: 'system', fullName: 'System Administrator', role: 'platform_admin' } as UserProfile);
  const targetUserId: string = typeof param1 === 'string' ? param1 : (typeof param2 === 'string' ? param2 : '');
  const reason: string = reasonParam || 'Application rejected by administrator';

  const users = loadCachedUsers();
  const idx = users.findIndex(u => u.uid === targetUserId);
  const now = Date.now();

  const updatePayload: Partial<UserProfile> = {
    status: 'rejected',
    accountStatus: 'rejected',
    rejectionReason: reason,
    updatedAt: now
  };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatePayload };
    saveCachedUsers(users);
  }

  try {
    const docRef = doc(db, 'users', targetUserId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }

  await logAuditEvent({
    actorUserId: actorUser.uid,
    actorName: actorUser.fullName,
    actorRole: actorUser.role,
    action: 'USER_REJECT',
    targetUserId,
    targetUserName: idx >= 0 ? users[idx].fullName : undefined,
    organizationLevel: actorUser.assignedLaboratory || actorUser.organization,
    details: `Rejected user registration. Reason: ${reason}`
  });
}

export async function suspendUserAccount(
  param1: string | UserProfile, 
  param2: string | UserProfile, 
  reasonParam?: string
): Promise<void> {
  const actorUser: UserProfile = typeof param1 === 'object' ? param1 : (typeof param2 === 'object' ? param2 : { uid: 'system', fullName: 'System Administrator', role: 'platform_admin' } as UserProfile);
  const targetUserId: string = typeof param1 === 'string' ? param1 : (typeof param2 === 'string' ? param2 : '');
  const reason: string = reasonParam || 'Account suspended by administrator';

  const users = loadCachedUsers();
  const idx = users.findIndex(u => u.uid === targetUserId);
  const now = Date.now();

  const updatePayload: Partial<UserProfile> = {
    status: 'suspended',
    accountStatus: 'suspended',
    suspensionReason: reason,
    updatedAt: now
  };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatePayload };
    saveCachedUsers(users);
  }

  try {
    const docRef = doc(db, 'users', targetUserId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }

  await logAuditEvent({
    actorUserId: actorUser.uid,
    actorName: actorUser.fullName,
    actorRole: actorUser.role,
    action: 'USER_SUSPEND',
    targetUserId,
    targetUserName: idx >= 0 ? users[idx].fullName : undefined,
    organizationLevel: actorUser.assignedLaboratory || actorUser.organization,
    details: `Suspended user account. Reason: ${reason}`
  });
}

export async function reactivateUserAccount(
  param1: string | UserProfile, 
  param2?: string | UserProfile
): Promise<void> {
  const actorUser: UserProfile = typeof param1 === 'object' ? param1 : (typeof param2 === 'object' ? param2 : { uid: 'system', fullName: 'System Administrator', role: 'platform_admin' } as UserProfile);
  const targetUserId: string = typeof param1 === 'string' ? param1 : (typeof param2 === 'string' ? param2 : '');

  const users = loadCachedUsers();
  const idx = users.findIndex(u => u.uid === targetUserId);
  const now = Date.now();

  const updatePayload: Partial<UserProfile> = {
    status: 'approved',
    accountStatus: 'active',
    suspensionReason: null,
    updatedAt: now
  };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatePayload };
    saveCachedUsers(users);
  }

  try {
    const docRef = doc(db, 'users', targetUserId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }

  await logAuditEvent({
    actorUserId: actorUser.uid,
    actorName: actorUser.fullName,
    actorRole: actorUser.role,
    action: 'USER_REACTIVATE',
    targetUserId,
    targetUserName: idx >= 0 ? users[idx].fullName : undefined,
    organizationLevel: actorUser.assignedLaboratory || actorUser.organization,
    details: `Reactivated suspended user account`
  });
}

export async function updateUserRoleAndAssignments(
  param1: string | UserProfile,
  param2: string | UserProfile,
  options?: { 
    role?: UserRole; 
    roles?: (UserRole | string)[];
    permissions?: (AppPermission | string)[];
    laboratories?: string[];
    zone?: string; 
    district?: string; 
    assignedLaboratory?: string;
  }
): Promise<void> {
  const actorUser: UserProfile = typeof param1 === 'object' ? param1 : (typeof param2 === 'object' ? param2 : { uid: 'system', fullName: 'System Administrator', role: 'platform_admin' } as UserProfile);
  const targetUserId: string = typeof param1 === 'string' ? param1 : (typeof param2 === 'string' ? param2 : '');

  const users = loadCachedUsers();
  const idx = users.findIndex(u => u.uid === targetUserId);
  const now = Date.now();

  const effectiveRole = options?.role || (idx >= 0 ? users[idx].role : undefined);
  const effectiveRoles = options?.roles || (effectiveRole ? [effectiveRole] : undefined);
  const effectivePerms = options?.permissions || (effectiveRole ? (DEFAULT_ROLE_PERMISSIONS[effectiveRole] || []) : undefined);
  const targetLabs = options?.laboratories || (options?.assignedLaboratory ? (options.assignedLaboratory === 'all' ? ['HRVL', 'ARVL'] : [formatLabCode(options.assignedLaboratory)]) : undefined);

  const updatePayload: Partial<UserProfile> = {
    updatedAt: now,
    ...(effectiveRole ? { role: effectiveRole } : {}),
    ...(effectiveRoles ? { roles: effectiveRoles } : {}),
    ...(effectivePerms ? { permissions: effectivePerms } : {}),
    ...(targetLabs ? { 
      laboratories: targetLabs,
      accessibleLaboratories: targetLabs.map(l => l.toLowerCase()),
      assignedLaboratory: targetLabs.length > 1 ? 'all' : targetLabs[0].toLowerCase()
    } : {}),
    ...(options?.zone ? { zone: options.zone } : {}),
    ...(options?.district ? { district: options.district } : {})
  };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updatePayload };
    saveCachedUsers(users);
  }

  try {
    const docRef = doc(db, 'users', targetUserId);
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
  }

  await logAuditEvent({
    actorUserId: actorUser.uid,
    actorName: actorUser.fullName,
    actorRole: actorUser.role,
    action: 'ROLE_CHANGE',
    targetUserId,
    targetUserName: idx >= 0 ? users[idx].fullName : undefined,
    organizationLevel: actorUser.assignedLaboratory || actorUser.organization,
    details: `Updated role & assignments to role=${options?.role || 'unchanged'}, district=${options?.district || 'unchanged'}`
  });
}

export async function updateUserRoleAndScope(
  targetUserId: string,
  actorUser: UserProfile,
  newRole: UserRole,
  assignedLaboratory?: string,
  newDistrict?: string
): Promise<void> {
  return updateUserRoleAndAssignments(actorUser, targetUserId, {
    role: newRole,
    assignedLaboratory,
    district: newDistrict
  });
}
