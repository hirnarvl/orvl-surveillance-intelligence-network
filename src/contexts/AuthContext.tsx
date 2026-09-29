import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { UserProfile, UserRole, AccountStatus, ProfessionalDesignation, AppPermission } from '../types';
import { 
  subscribeToUserProfile, 
  createUserProfile, 
  getUserProfile,
  ensureLaboratoriesInFirestore
} from '../services/userService';
import { 
  hasPermission as checkHasPermission, 
  hasAnyPermission as checkHasAnyPermission,
  isUserApproved,
  isUserApprovedForLab,
  getUserApprovedLaboratories,
  isSuperAdmin as checkIsSuperAdmin,
  isLabAdmin as checkIsLabAdmin,
  isBootstrapAdminEmail,
  DEFAULT_ROLE_PERMISSIONS,
  formatLabCode
} from '../utils/rbac';
import { clearCachedRecords } from '../utils/storage';

export interface RegistrationInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  region?: string;
  zone?: string;
  district?: string;
  professionalDesignation?: ProfessionalDesignation | string;
  organization?: string;
  requestedRole?: UserRole;
  intendedLaboratory?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  unverifiedEmail: string | null;
  setUnverifiedEmail: (email: string | null) => void;
  loading: boolean;
  accessToken: string | null;
  setCustomAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
  signInWithGoogle: (intendedLab?: string) => Promise<User | null>;
  connectGoogleDrive: () => Promise<string | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  registerWithEmail: (data: RegistrationInput) => Promise<string>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Status & Privilege Flags
  accountStatus: AccountStatus;
  isApproved: boolean;
  isPendingApproval: boolean;
  isSuspended: boolean;
  isRejected: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLabAdmin: boolean;
  approvedLaboratories: ('HRVL' | 'ARVL')[];
  
  // Granular Permission & Lab Checkers
  hasPermission: (perm: AppPermission) => boolean;
  hasAnyPermission: (perms: AppPermission[]) => boolean;
  isApprovedForLab: (labId: string) => boolean;
  
  // Legacy role flags for backward compatibility
  isRegionalAdmin: boolean;
  isZonalAdmin: boolean;
  isHrvlAdmin: boolean;
  isDistrictFocal: boolean;
  isFieldVet: boolean;
  switchDemoRole?: (role: UserRole | string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unverifiedEmail, setUnverifiedEmailState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('unverified_auth_email') || null;
    } catch {
      return null;
    }
  });

  const setUnverifiedEmail = (email: string | null) => {
    setUnverifiedEmailState(email);
    try {
      if (email) {
        sessionStorage.setItem('unverified_auth_email', email);
      } else {
        sessionStorage.removeItem('unverified_auth_email');
      }
    } catch {
      // ignore
    }
  };

  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('google_drive_access_token') || null;
    } catch {
      return null;
    }
  });

  const updateAccessToken = (token: string | null) => {
    setAccessToken(token);
    try {
      if (token) {
        sessionStorage.setItem('google_drive_access_token', token);
      } else {
        sessionStorage.removeItem('google_drive_access_token');
      }
    } catch {
      // ignore
    }
  };

  // Seed default laboratory documents in Firestore on mount
  useEffect(() => {
    ensureLaboratoriesInFirestore().catch(() => {});
  }, []);

  // Subscribe to real-time user profile in Firestore whenever auth user changes
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const uid = user.uid;

    const unsubscribeProfile = subscribeToUserProfile(uid, async (profile) => {
      if (profile) {
        setUserProfile(profile);
      } else {
        // First-time sign-in handling
        const isBootstrap = isBootstrapAdminEmail(user.email);
        const now = Date.now();
        const initialStatus: AccountStatus = isBootstrap ? 'active' : 'pending';
        const initialRole: UserRole = isBootstrap ? 'SUPER_ADMIN' : 'LABORATORY_USER';
        const initialLabs = isBootstrap ? ['HRVL', 'ARVL'] : ['HRVL'];

        const newProfile: UserProfile = {
          uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Authenticated User',
          fullName: user.displayName || user.email?.split('@')[0] || 'Authenticated User',
          email: user.email || '',
          photoURL: user.photoURL || null,
          phone: user.phoneNumber || '+251 91 000 0000',
          region: 'Oromia',
          zone: 'West Hararghe',
          district: 'Hirna',
          status: isBootstrap ? 'approved' : 'pending',
          accountStatus: initialStatus,
          roles: [initialRole],
          role: initialRole,
          laboratories: initialLabs,
          assignedLaboratory: initialLabs.length > 1 ? 'all' : initialLabs[0].toLowerCase(),
          accessibleLaboratories: initialLabs.map(l => l.toLowerCase()),
          permissions: isBootstrap ? DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN : [],
          professionalDesignation: 'Veterinarian',
          organization: 'Regional Veterinary Laboratory Network',
          emailVerified: user.emailVerified || false,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          approvedAt: isBootstrap ? now : null,
          approvedBy: isBootstrap ? 'system-bootstrap' : null,
          approvedByName: isBootstrap ? 'System Bootstrap' : null
        };

        try {
          await createUserProfile(newProfile);
          setUserProfile(newProfile);
        } catch {
          setUserProfile(newProfile);
        }
      }
    });

    return () => {
      unsubscribeProfile();
    };
  }, [user?.uid]);

  // Auth State Listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // If email/password user is not verified, block access and sign out
          const isGoogleUser = fbUser.providerData.some(p => p.providerId === 'google.com');
          if (!fbUser.emailVerified && !isGoogleUser) {
            setUnverifiedEmail(fbUser.email);
            setUser(null);
            setUserProfile(null);
            updateAccessToken(null);
            try {
              await signOut(auth);
            } catch {
              // ignore
            }
            setLoading(false);
            return;
          }
          setUser(fbUser);
        } else {
          setUser(null);
          setUserProfile(null);
          updateAccessToken(null);
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn('Firebase onAuthStateChanged notice:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    updateAccessToken(null);
    setUnverifiedEmail(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err);
    }
    setUser(null);
    setUserProfile(null);
    // Securely clear cached surveillance records on logout
    clearCachedRecords();
  };

  const pendingPopupRef = useRef<Promise<User | null> | null>(null);

  /**
   * Google Sign-In with standard Firebase Web Auth flow.
   */
  const signInWithGoogle = async (intendedLab?: string): Promise<User | null> => {
    if (pendingPopupRef.current) {
      return pendingPopupRef.current;
    }

    const popupPromise = (async () => {
      try {
        let signedInUser: User | null = null;
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
          const result = await signInWithPopup(auth, provider);
          signedInUser = result.user;
        } catch (popupErr: any) {
          const pMsg = popupErr?.message || String(popupErr);
          const pCode = popupErr?.code || '';

          if (
            pCode === 'auth/popup-closed-by-user' ||
            pCode === 'auth/cancelled-popup-request' ||
            pMsg.includes('popup-closed-by-user') ||
            pMsg.includes('cancelled-popup-request') ||
            pMsg.includes('Pending promise was never set')
          ) {
            console.info('[Google Auth] Sign-in popup cancelled or closed by user.');
            return null;
          }

          if (pCode === 'auth/unauthorized-domain' || pMsg.includes('unauthorized-domain')) {
            throw new Error('This domain is not yet authorized in Firebase Console (Authentication > Settings > Authorized domains). Please add this domain to Authorized domains.');
          }

          if (pCode === 'auth/popup-blocked' || pMsg.includes('popup-blocked')) {
            throw new Error('Authentication popup was blocked by the browser. Please allow popups to sign in.');
          }

          throw popupErr;
        }

        if (!signedInUser) {
          return null;
        }

        setUser(signedInUser);

        // Check if profile exists in Firestore
        const existing = await getUserProfile(signedInUser.uid);
        if (!existing) {
          const isBootstrap = isBootstrapAdminEmail(signedInUser.email);
          const chosenLab = intendedLab ? formatLabCode(intendedLab) : 'HRVL';
          const now = Date.now();

          const newProfile: UserProfile = {
            uid: signedInUser.uid,
            displayName: signedInUser.displayName || signedInUser.email?.split('@')[0] || 'Authenticated User',
            fullName: signedInUser.displayName || 'Authenticated User',
            email: signedInUser.email || '',
            photoURL: signedInUser.photoURL || null,
            phone: signedInUser.phoneNumber || '+251 91 000 0000',
            region: 'Oromia',
            zone: chosenLab === 'ARVL' ? 'Arsi Zone' : 'West Hararghe',
            district: chosenLab === 'ARVL' ? 'Asella' : 'Hirna',
            status: isBootstrap ? 'approved' : 'pending',
            accountStatus: isBootstrap ? 'active' : 'pending',
            roles: isBootstrap ? ['SUPER_ADMIN'] : ['LABORATORY_USER'],
            role: isBootstrap ? 'SUPER_ADMIN' : 'LABORATORY_USER',
            laboratories: isBootstrap ? ['HRVL', 'ARVL'] : [chosenLab],
            assignedLaboratory: isBootstrap ? 'all' : chosenLab.toLowerCase(),
            accessibleLaboratories: isBootstrap ? ['hrvl', 'arvl'] : [chosenLab.toLowerCase()],
            permissions: isBootstrap ? DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN : [],
            professionalDesignation: 'Veterinarian',
            organization: chosenLab === 'ARVL' ? 'Asela Regional Veterinary Laboratory (ARVL)' : 'Hirna Regional Veterinary Laboratory (HRVL)',
            emailVerified: signedInUser.emailVerified || false,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            approvedAt: isBootstrap ? now : null,
            approvedBy: isBootstrap ? 'system-bootstrap' : null,
            approvedByName: isBootstrap ? 'System Bootstrap' : null
          };

          await createUserProfile(newProfile);
          setUserProfile(newProfile);
        } else {
          setUserProfile(existing);
        }

        return signedInUser;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        
        if (
          errMsg.includes('popup-closed-by-user') ||
          errMsg.includes('cancelled-popup-request') ||
          errMsg.includes('popup-blocked')
        ) {
          return null;
        }

        console.warn('[Google Auth] Notice:', errMsg);
        throw new Error(
          errMsg.includes('network-request-failed') || errMsg.includes('auth/network-request-failed')
            ? 'Google authentication network request was interrupted. Please retry or use Institutional Email Sign In.'
            : (errMsg || 'Google authentication could not be completed.')
        );
      } finally {
        pendingPopupRef.current = null;
      }
    })();

    pendingPopupRef.current = popupPromise;
    return popupPromise;
  };

  /**
   * Google Drive authorization request.
   * Invoked ONLY when an authorized user explicitly connects or imports from Google Drive.
   */
  const connectGoogleDrive = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    if (!(window as any).google?.accounts?.oauth2) {
      await new Promise<void>((resolve) => {
        const existing = document.getElementById('google-gsi-client');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          if ((window as any).google?.accounts?.oauth2) return resolve();
          setTimeout(resolve, 1500);
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
        setTimeout(resolve, 2000);
      });
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity Services client is not available in this window');
    }

    const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID || (firebaseConfigJson as any)?.oAuthClientId || '';
    if (!clientId) {
      throw new Error('Google OAuth Client ID is not configured');
    }

    return new Promise<string | null>((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly',
          callback: (resp: any) => {
            if (resp.error) {
              if (resp.error === 'access_denied' || resp.error === 'popup_closed_by_user') {
                resolve(null);
              } else {
                reject(new Error(resp.error_description || resp.error));
              }
              return;
            }
            if (resp.access_token) {
              updateAccessToken(resp.access_token);
              resolve(resp.access_token);
            } else {
              resolve(null);
            }
          },
          error_callback: (err: any) => {
            if (err?.type === 'popup_closed') {
              resolve(null);
            } else {
              reject(err);
            }
          }
        });
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    
    // Check if email is verified
    if (!userCred.user.emailVerified) {
      // Send verification email to the user
      try {
        await sendEmailVerification(userCred.user);
      } catch (e) {
        console.warn('sendEmailVerification rate-limit or notice:', e);
      }
      
      // Block access by signing out immediately
      await signOut(auth);
      setUnverifiedEmail(cleanEmail);
      setUser(null);
      setUserProfile(null);
      
      throw new Error(`UNVERIFIED_EMAIL:${cleanEmail}`);
    }

    // Email is verified
    setUnverifiedEmail(null);
    setUser(userCred.user);
    const profile = await getUserProfile(userCred.user.uid);
    if (profile) {
      setUserProfile(profile);
    }
    return userCred.user;
  };

  const registerWithEmail = async (data: RegistrationInput): Promise<string> => {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // 1. Create user in Firebase Authentication
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    
    // 2. Update display name if provided
    if (data.fullName) {
      try {
        await updateFirebaseProfile(userCred.user, { displayName: data.fullName });
      } catch {
        // ignore
      }
    }

    // 3. Send email verification via Firebase Authentication
    await sendEmailVerification(userCred.user);

    // 4. When a user registers with email/password, do not sign them in automatically.
    await signOut(auth);

    // 5. Update state to show the email verification screen (Firebase Auth only, no database)
    setUnverifiedEmail(cleanEmail);
    setUser(null);
    setUserProfile(null);

    return cleanEmail;
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      const refreshed = await getUserProfile(user.uid);
      if (refreshed) {
        setUserProfile(refreshed);
      }
    }
  };

  // Evaluation of authorization status
  const approved = isUserApproved(userProfile);
  const status: AccountStatus = userProfile?.status || userProfile?.accountStatus || 'pending';
  const isPendingApproval = !approved && status === 'pending';
  const isApproved = approved;
  const isSuspended = status === 'suspended';
  const isRejected = status === 'rejected';

  const isSuperAdminUser = checkIsSuperAdmin(userProfile);
  const isLabAdminUser = checkIsLabAdmin(userProfile);
  const isAdminUser = isSuperAdminUser || isLabAdminUser;

  const approvedLaboratories = getUserApprovedLaboratories(userProfile);

  const hasPermission = (perm: AppPermission): boolean => {
    return checkHasPermission(userProfile, perm);
  };

  const hasAnyPermission = (perms: AppPermission[]): boolean => {
    return checkHasAnyPermission(userProfile, perms);
  };

  const isApprovedForLab = (labId: string): boolean => {
    return isUserApprovedForLab(userProfile, labId);
  };

  // Legacy role flags
  const role = userProfile?.role;
  const isRegionalAdmin = role === 'admin_regional' || isSuperAdminUser;
  const isZonalAdmin = role === 'admin_zonal' || role === 'epidemiologist' || role === 'EPIDEMIOLOGIST';
  const isHrvlAdmin = role === 'admin_hrvl' || role === 'lab_manager' || (isLabAdminUser && isApprovedForLab('hrvl'));
  const isDistrictFocal = role === 'district_focal_person';
  const isFieldVet = role === 'field_veterinarian' || role === 'lab_staff' || role === 'LABORATORY_USER';

  const switchDemoRole = (newRole: UserRole | string) => {
    // Only verified Super Administrators can simulate subordinate authority views
    if (!userProfile || !isSuperAdminUser) {
      console.warn('[Security] Unauthorized role switch blocked: requires active Super Administrator authorization.');
      return;
    }
    setUserProfile((prev) => {
      if (!prev) return prev;
      const typedRole = newRole as UserRole;
      const isSuper = newRole === 'SUPER_ADMIN' || newRole === 'admin_regional' || newRole === 'platform_admin';
      const isHrvl = newRole === 'admin_hrvl' || newRole === 'lab_manager';
      const isZonal = newRole === 'admin_zonal' || newRole === 'epidemiologist';

      return {
        ...prev,
        role: typedRole,
        roles: [typedRole],
        assignedLaboratory: isSuper ? 'all' : (isHrvl ? 'hrvl' : prev.assignedLaboratory),
        accessibleLaboratories: isSuper ? ['hrvl', 'arvl'] : (isHrvl ? ['hrvl'] : ['hrvl', 'arvl']),
        laboratories: isSuper ? ['HRVL', 'ARVL'] : (isHrvl ? ['HRVL'] : ['HRVL', 'ARVL']),
        permissions: (isSuper || isHrvl || isZonal)
          ? DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN
          : prev.permissions
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        unverifiedEmail,
        setUnverifiedEmail,
        loading,
        accessToken,
        setCustomAccessToken: updateAccessToken,
        logout,
        signInWithGoogle,
        connectGoogleDrive,
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        refreshProfile,
        accountStatus: status,
        isApproved,
        isPendingApproval,
        isSuspended,
        isRejected,
        isAdmin: isAdminUser,
        isSuperAdmin: isSuperAdminUser,
        isLabAdmin: isLabAdminUser,
        approvedLaboratories,
        hasPermission,
        hasAnyPermission,
        isApprovedForLab,
        isRegionalAdmin,
        isZonalAdmin,
        isHrvlAdmin,
        isDistrictFocal,
        isFieldVet,
        switchDemoRole
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
