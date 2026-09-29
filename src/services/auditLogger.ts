import { collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AuditLogEntry, AuditLogAction, UserRole } from '../types';

const AUDIT_STORAGE_KEY = 'hrvl_audit_logs_cache';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-sys-001',
    actorUserId: 'sys-hrvl-admin',
    actorName: 'Dr. Henok Abebe (HRVL Admin)',
    actorRole: 'admin_hrvl',
    action: 'SYSTEM_CONFIG',
    timestamp: Date.now() - 86400000 * 5,
    organizationLevel: 'Hirna Regional Veterinary Laboratory (HRVL)',
    details: 'Institutional RBAC and security schema initialized for East & West Hararghe zones.',
    metadata: { initialCoverage: '36 Woredas' }
  },
  {
    id: 'audit-sys-002',
    actorUserId: 'sys-hrvl-admin',
    actorName: 'Dr. Henok Abebe (HRVL Admin)',
    actorRole: 'admin_hrvl',
    action: 'USER_APPROVE',
    targetUserId: 'user-chiro-01',
    targetUserName: 'Dr. Tadesse Bekele (Woreda Focal Person)',
    timestamp: Date.now() - 86400000 * 3,
    organizationLevel: 'West Hararghe - Chiro Woreda',
    details: 'Approved Woreda Focal Person credential for Chiro district surveillance stream.',
    metadata: { assignedZone: 'West Hararghe', assignedWoreda: 'Chiro' }
  },
  {
    id: 'audit-sys-003',
    actorUserId: 'sys-reg-admin',
    actorName: 'Regional Vet Bureau Admin',
    actorRole: 'admin_regional',
    action: 'USER_APPROVE',
    targetUserId: 'user-bedeno-01',
    targetUserName: 'Dr. Fatuma Mohammed (Field Vet)',
    timestamp: Date.now() - 86400000 * 2,
    organizationLevel: 'East Hararghe - Bedeno Woreda',
    details: 'Approved Field Veterinarian account with active mobile reporting privileges.',
    metadata: { assignedZone: 'East Hararghe', assignedWoreda: 'Bedeno' }
  }
];

export function loadCachedAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return INITIAL_AUDIT_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveCachedAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 150)));
  } catch {
    // ignore local storage quota issues
  }
}

export async function logAuditEvent(params: {
  actorUserId: string;
  actorName: string;
  actorRole: UserRole | string;
  action: AuditLogAction;
  targetUserId?: string;
  targetUserName?: string;
  organizationLevel?: string;
  details?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const logId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry: AuditLogEntry = {
    id: logId,
    actorUserId: params.actorUserId || 'anonymous',
    actorName: params.actorName || 'System User',
    actorRole: params.actorRole || 'field_veterinarian',
    action: params.action,
    targetUserId: params.targetUserId,
    targetUserName: params.targetUserName,
    timestamp: Date.now(),
    organizationLevel: params.organizationLevel,
    details: params.details,
    metadata: params.metadata || {}
  };

  // 1. Immediately cache locally
  const current = loadCachedAuditLogs();
  const updated = [entry, ...current];
  saveCachedAuditLogs(updated);

  // 2. Persist to Firestore
  try {
    const logDoc = doc(db, 'auditLogs', logId);
    await setDoc(logDoc, entry);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `auditLogs/${logId}`);
  }
}

export function subscribeToAuditLogs(
  onUpdate: (logs: AuditLogEntry[]) => void,
  limitCount: number = 80
): () => void {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AuditLogEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AuditLogEntry;
            list.push({ ...data, id: docSnap.id });
          });
          saveCachedAuditLogs(list);
          onUpdate(list);
        } else {
          onUpdate(loadCachedAuditLogs());
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'auditLogs');
        onUpdate(loadCachedAuditLogs());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Audit logs listener fallback to local cache:', err);
    onUpdate(loadCachedAuditLogs());
    return () => {};
  }
}
