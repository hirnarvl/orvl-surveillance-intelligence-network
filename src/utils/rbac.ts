import { UserProfile, UserRole, AppPermission, StandardRole } from '../types';

export const ALL_PERMISSIONS: AppPermission[] = [
  'dashboard.view',
  'analytics.view',
  'surveillance.view',
  'laboratory.view',
  'reports.view',
  'reports.create',
  'reports.edit',
  'reports.delete',
  'data.import',
  'data.export',
  'data.manage',
  'users.view',
  'users.approve',
  'users.suspend',
  'users.manage',
  'settings.manage'
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, AppPermission[]> = {
  SUPER_ADMIN: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'reports.delete',
    'data.import',
    'data.export',
    'data.manage',
    'users.view',
    'users.approve',
    'users.suspend',
    'users.manage',
    'settings.manage'
  ],
  LAB_ADMIN: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'reports.delete',
    'data.import',
    'data.export',
    'data.manage',
    'users.view',
    'users.approve',
    'users.suspend',
    'users.manage'
  ],
  EPIDEMIOLOGIST: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'data.export'
  ],
  LABORATORY_USER: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'data.export'
  ],
  PARTNER_USER: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'reports.view'
  ],
  // Legacy aliases
  platform_admin: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'reports.delete',
    'data.import',
    'data.export',
    'data.manage',
    'users.view',
    'users.approve',
    'users.suspend',
    'users.manage',
    'settings.manage'
  ],
  lab_manager: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'reports.delete',
    'data.import',
    'data.export',
    'data.manage',
    'users.view',
    'users.approve',
    'users.suspend',
    'users.manage'
  ],
  admin_hrvl: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'reports.delete',
    'data.import',
    'data.export',
    'data.manage',
    'users.view',
    'users.approve',
    'users.suspend',
    'users.manage'
  ],
  admin_regional: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'data.export',
    'users.view'
  ],
  admin_zonal: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'data.export',
    'users.view'
  ],
  epidemiologist: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'reports.edit',
    'data.export'
  ],
  field_veterinarian: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'laboratory.view',
    'reports.view',
    'reports.create',
    'data.export'
  ],
  viewer: [
    'dashboard.view',
    'analytics.view',
    'surveillance.view',
    'reports.view'
  ]
};

export const BOOTSTRAP_ADMIN_EMAILS = [
  'clexhena@gmail.com',
  'henok.abebe@hrvl.health.et'
];

export function isBootstrapAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return BOOTSTRAP_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function normalizeLabId(labId?: string | null): string {
  if (!labId) return 'hrvl';
  return labId.toLowerCase().trim();
}

export function formatLabCode(labId?: string | null): 'HRVL' | 'ARVL' {
  const norm = normalizeLabId(labId);
  return norm === 'arvl' ? 'ARVL' : 'HRVL';
}

export function isUserApproved(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (isBootstrapAdminEmail(profile.email)) return true;
  const status = profile.status || profile.accountStatus;
  return status === 'approved' || status === 'active';
}

export function isSuperAdmin(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (isBootstrapAdminEmail(profile.email)) return true;
  const roles = profile.roles || (profile.role ? [profile.role] : []);
  return roles.includes('SUPER_ADMIN') || roles.includes('platform_admin');
}

export function isLabAdmin(profile?: UserProfile | null, targetLabId?: string): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  const roles = profile.roles || (profile.role ? [profile.role] : []);
  const hasAdminRole = roles.includes('LAB_ADMIN') || roles.includes('lab_manager') || roles.includes('admin_hrvl');
  if (!hasAdminRole) return false;
  if (!targetLabId) return true;
  return isUserApprovedForLab(profile, targetLabId);
}

export function getUserApprovedLaboratories(profile?: UserProfile | null): ('HRVL' | 'ARVL')[] {
  if (!profile) return [];
  if (isSuperAdmin(profile)) return ['HRVL', 'ARVL'];
  if (!isUserApproved(profile)) return [];

  const rawLabs = [
    ...(profile.laboratories || []),
    ...(profile.accessibleLaboratories || []),
    ...(profile.assignedLaboratory ? [profile.assignedLaboratory] : [])
  ].map(l => l.toLowerCase().trim());

  const result: ('HRVL' | 'ARVL')[] = [];
  if (rawLabs.includes('hrvl') || rawLabs.includes('all')) {
    result.push('HRVL');
  }
  if (rawLabs.includes('arvl') || rawLabs.includes('all')) {
    result.push('ARVL');
  }
  return result;
}

export function isUserApprovedForLab(profile?: UserProfile | null, labId?: string | null): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile)) return true;
  if (!isUserApproved(profile)) return false;

  const target = normalizeLabId(labId);
  if (target === 'all') {
    return getUserApprovedLaboratories(profile).length > 1;
  }

  const approvedLabs = getUserApprovedLaboratories(profile).map(l => l.toLowerCase());
  return approvedLabs.includes(target);
}

export function hasPermission(profile: UserProfile | null | undefined, permission: AppPermission): boolean {
  if (!profile) return false;
  if (!isUserApproved(profile)) return false;
  if (isSuperAdmin(profile)) return true;

  // Check explicit assigned permissions array
  if (profile.permissions && profile.permissions.includes(permission)) {
    return true;
  }

  // Check roles default permissions
  const roles = profile.roles || (profile.role ? [profile.role] : []);
  for (const role of roles) {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role];
    if (defaults && defaults.includes(permission)) {
      return true;
    }
  }

  return false;
}

export function hasAnyPermission(profile: UserProfile | null | undefined, permissions: AppPermission[]): boolean {
  return permissions.some(perm => hasPermission(profile, perm));
}

export function canAdministerTargetUser(actor: UserProfile | null | undefined, target: UserProfile | null | undefined): boolean {
  if (!actor || !target) return false;
  if (actor.uid === target.uid) return false; // Prevent self-elevation/demotion
  if (isSuperAdmin(actor)) return true;

  // LAB_ADMIN can only manage users within their own approved laboratory
  if (isLabAdmin(actor)) {
    // Cannot manage SUPER_ADMINs
    if (isSuperAdmin(target)) return false;

    const actorLabs = getUserApprovedLaboratories(actor);
    const targetLabs = getUserApprovedLaboratories(target);

    // If target has no approved labs yet (pending), check their requested laboratories
    const requestedTargetLabs = (target.laboratories || [target.assignedLaboratory || 'HRVL']).map(formatLabCode);
    const labsToCheck = targetLabs.length > 0 ? targetLabs : requestedTargetLabs;

    // Must share at least one laboratory, and actor cannot manage a user who belongs to a lab actor is not in
    return labsToCheck.some(lab => actorLabs.includes(lab));
  }

  return false;
}
