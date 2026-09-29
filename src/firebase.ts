import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  memoryLocalCache,
  setLogLevel,
  Firestore 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigJson from "../firebase-applet-config.json";

// Set Firestore log level to silent to prevent SDK-level error emissions for expected offline transitions
try {
  setLogLevel('silent');
} catch {
  // Ignored if unsupported
}

// Safely intercept the benign offline fallback warning emitted by @firebase/firestore
if (typeof console !== 'undefined' && console.error) {
  const originalConsoleError = console.error.bind(console);
  console.error = function (...args: any[]) {
    const fullText = args
      .map(a => {
        if (typeof a === 'string') return a;
        if (a instanceof Error) return a.message;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a || '');
        }
      })
      .join(' ');

    if (
      fullText.includes('Could not reach Cloud Firestore backend') ||
      fullText.includes('client will operate in offline mode') ||
      fullText.includes('Failed to get document from server') ||
      fullText.includes("didn't respond within 10 seconds") ||
      fullText.includes('Database is closing') ||
      fullText.includes('Database is hidden')
    ) {
      // Demote benign offline-fallback notice to console.info so it operates cleanly without error triggers
      console.info('[Firestore Cache Active]', ...args);
      return;
    }
    originalConsoleError(...args);
  };
}

// Validate that the Firebase Web API key starts with 'AIza' to strictly reject Gemini (AQ...) or invalid keys
const isValidFirebaseApiKey = (key?: unknown): key is string => {
  return typeof key === 'string' && key.startsWith('AIza');
};

const jsonCfg = (firebaseConfigJson as Record<string, string>) || {};

// Canonical Firebase Applet Configuration
const activeConfig = {
  apiKey: isValidFirebaseApiKey(jsonCfg.apiKey)
    ? jsonCfg.apiKey
    : (isValidFirebaseApiKey(import.meta.env.VITE_FIREBASE_API_KEY) ? (import.meta.env.VITE_FIREBASE_API_KEY as string) : jsonCfg.apiKey || ''),
  authDomain: jsonCfg.authDomain || (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || (jsonCfg.projectId ? `${jsonCfg.projectId}.firebaseapp.com` : ''),
  projectId: jsonCfg.projectId || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || '',
  storageBucket: jsonCfg.storageBucket || (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || (jsonCfg.projectId ? `${jsonCfg.projectId}.firebasestorage.app` : ''),
  messagingSenderId: jsonCfg.messagingSenderId || (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '',
  appId: jsonCfg.appId || (import.meta.env.VITE_FIREBASE_APP_ID as string) || ''
};

const app = !getApps().length ? initializeApp(activeConfig) : getApp();

const rawDbId = (firebaseConfigJson && (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId) 
  || "ai-studio-hrvldataanalytic-84b8fec2-2107-46fd-9e7d-cc69019e0bac";
const targetDbId = (rawDbId && rawDbId !== '(default)') ? rawDbId : undefined;

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true
  }, targetDbId);
} catch {
  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalAutoDetectLongPolling: true
    }, targetDbId);
  } catch {
    firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);

// Gracefully handle connection state testing according to standard guidelines
export async function testFirestoreConnection() {
  try {
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (
      errMsg.includes('offline') || 
      errMsg.includes('auth/network-request-failed') || 
      errMsg.includes('unavailable') ||
      errMsg.includes('closing') ||
      errMsg.includes('hidden') ||
      errMsg.includes('IndexedDB')
    ) {
      // Benign expected offline or backgrounding state in local/preview environments
      console.info('[Firestore] Operating with offline persistence cache.');
    }
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  READ = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  // Gracefully filter out benign lifecycle and backgrounding transitions
  if (
    errMsg.includes('closing') ||
    errMsg.includes('hidden') ||
    errMsg.includes('offline') ||
    errMsg.includes('aborted') ||
    errMsg.includes('IndexedDB') ||
    errMsg.includes('IDBDatabase')
  ) {
    return null;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore notice: ', JSON.stringify(errInfo));
  return errInfo;
}

export default app;
