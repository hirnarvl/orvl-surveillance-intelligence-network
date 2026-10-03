import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LaboratoryId, LaboratoryInfo, LABORATORIES_REGISTRY, PLATFORM_ALL_LABS_INFO, getAllLaboratoriesList, getOfficialLabName, OFFICIAL_LABORATORY_NAMES } from '../data/laboratories';
import { useAuth } from './AuthContext';
import { useI18n } from './I18nContext';
import { Locale } from '../types';
import { isUserApprovedForLab, getUserApprovedLaboratories, isSuperAdmin } from '../utils/rbac';
import { formatLabHeader } from '../utils/laboratoryHelper';

export { formatLabHeader, getOfficialLabName, OFFICIAL_LABORATORY_NAMES };

interface LaboratoryContextType {
  selectedLab: LaboratoryId;
  setSelectedLab: (labId: LaboratoryId) => boolean;
  currentLabInfo: LaboratoryInfo;
  availableLaboratories: { id: string; name: string; shortName: string; code: string; color: string }[];
  canAccessLaboratory: (labId: string) => boolean;
  isMultiLabView: boolean;
  isLabLocked: boolean; // True if user is restricted to a single lab and cannot switch
  getLabHeader: (title: string) => string;
  getLocalizedLabName: (labId?: string, overrideLocale?: Locale) => string;
}

const LaboratoryContext = createContext<LaboratoryContextType | undefined>(undefined);

const STORAGE_KEY = 'hrvl_selected_laboratory';

export const LaboratoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { locale } = useI18n();

  // Helper to determine allowed labs for the current user
  const canAccessLaboratory = useCallback((labId: string): boolean => {
    if (!userProfile) return false; // Guest / Unauthenticated users have NO laboratory access
    return isUserApprovedForLab(userProfile, labId);
  }, [userProfile]);

  // Initial state resolution
  const [selectedLab, setSelectedLabState] = useState<LaboratoryId>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && (cached === 'all' || cached === 'hrvl' || cached === 'arvl')) {
      return cached;
    }
    return 'hrvl';
  });

  // Sync state if user's laboratory assignment requires locking or initialization
  useEffect(() => {
    if (!userProfile) return;

    const approvedLabs = getUserApprovedLaboratories(userProfile);
    if (approvedLabs.length === 1) {
      const soleLab = approvedLabs[0].toLowerCase() as LaboratoryId;
      if (selectedLab !== soleLab) {
        setSelectedLabState(soleLab);
        localStorage.setItem(STORAGE_KEY, soleLab);
      }
    } else if (approvedLabs.length > 1) {
      if (!canAccessLaboratory(selectedLab)) {
        const fallback = approvedLabs[0].toLowerCase() as LaboratoryId;
        setSelectedLabState(fallback);
        localStorage.setItem(STORAGE_KEY, fallback);
      }
    }
  }, [userProfile, selectedLab, canAccessLaboratory]);

  const setSelectedLab = useCallback((labId: LaboratoryId): boolean => {
    if (!canAccessLaboratory(labId)) {
      console.warn(`[LaboratoryContext] Access Denied: User ${user?.email || 'Anonymous'} is not authorized for laboratory: ${labId}`);
      return false;
    }

    setSelectedLabState(labId);
    localStorage.setItem(STORAGE_KEY, labId);
    return true;
  }, [canAccessLaboratory, user]);

  const getLocalizedLabName = useCallback((labId?: string, overrideLocale?: Locale): string => {
    return getOfficialLabName(labId || selectedLab, overrideLocale || locale);
  }, [selectedLab, locale]);

  const currentLabInfo = useMemo<LaboratoryInfo>(() => {
    let baseLab: LaboratoryInfo;
    if (selectedLab === 'arvl') {
      baseLab = LABORATORIES_REGISTRY.arvl;
    } else if (selectedLab === 'hrvl') {
      baseLab = LABORATORIES_REGISTRY.hrvl;
    } else {
      baseLab = PLATFORM_ALL_LABS_INFO as unknown as LaboratoryInfo;
    }
    const localizedName = getOfficialLabName(selectedLab, locale);
    return {
      ...baseLab,
      name: localizedName,
      fullName: localizedName,
    };
  }, [selectedLab, locale]);

  const availableLaboratories = useMemo(() => {
    const list: { id: string; name: string; shortName: string; code: string; color: string }[] = [];
    
    if (canAccessLaboratory('all')) {
      list.push({
        id: 'all',
        name: locale === 'am'
          ? 'የኦሮሚያ ቀጠናዊ የእንስሳት ላቦራቶሪ የበሽታዎች ቅኝትና የመረጃ መረብ'
          : locale === 'om'
          ? 'Netwoorkii Qorannoo fi Odeeffannoo Dhibee Beeyladaa Naannoo Oromiyaa'
          : 'ORVL Surveillance Intelligence Network',
        shortName: 'All Laboratories',
        code: 'ALL-RVL',
        color: '#7c3aed'
      });
    }

    if (canAccessLaboratory('hrvl')) {
      list.push({
        id: 'hrvl',
        name: getOfficialLabName('hrvl', locale),
        shortName: LABORATORIES_REGISTRY.hrvl.shortName,
        code: LABORATORIES_REGISTRY.hrvl.code,
        color: LABORATORIES_REGISTRY.hrvl.color
      });
    }

    if (canAccessLaboratory('arvl')) {
      list.push({
        id: 'arvl',
        name: getOfficialLabName('arvl', locale),
        shortName: LABORATORIES_REGISTRY.arvl.shortName,
        code: LABORATORIES_REGISTRY.arvl.code,
        color: LABORATORIES_REGISTRY.arvl.color
      });
    }

    return list;
  }, [canAccessLaboratory, locale]);

  const isLabLocked = useMemo(() => {
    if (!userProfile) return true;
    if (isSuperAdmin(userProfile)) return false;
    const approved = getUserApprovedLaboratories(userProfile);
    return approved.length <= 1;
  }, [userProfile]);

  const isMultiLabView = selectedLab === 'all';

  const getLabHeader = useCallback((title: string): string => {
    return formatLabHeader(title, currentLabInfo);
  }, [currentLabInfo]);

  return (
    <LaboratoryContext.Provider
      value={{
        selectedLab,
        setSelectedLab,
        currentLabInfo,
        availableLaboratories,
        canAccessLaboratory,
        isMultiLabView,
        isLabLocked,
        getLabHeader,
        getLocalizedLabName
      }}
    >
      {children}
    </LaboratoryContext.Provider>
  );
};

export const useLaboratory = (): LaboratoryContextType => {
  const context = useContext(LaboratoryContext);
  if (!context) {
    throw new Error('useLaboratory must be used within a LaboratoryProvider');
  }
  return context;
};
