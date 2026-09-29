/**
 * Date filtering and formatting utilities for print-friendly snapshots
 * and surveillance analytics.
 */

export const normalizeDateToIso = (dateVal: string | number | undefined): string => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    return dateVal.substring(0, 10);
  }
  if (typeof dateVal === 'number' && !isNaN(dateVal)) {
    try {
      return new Date(dateVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    return '';
  }
  return '';
};

export const isRecordInDateRange = (
  dateVal: string | number | undefined,
  dateFrom?: string,
  dateTo?: string
): boolean => {
  if (!dateFrom && !dateTo) return true;
  const iso = normalizeDateToIso(dateVal);
  if (!iso) return true;

  if (dateFrom && iso < dateFrom) return false;
  if (dateTo && iso > dateTo) return false;
  return true;
};

export const formatDateDisplay = (isoDateStr?: string): string => {
  if (!isoDateStr) return '';
  try {
    const parts = isoDateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return isoDateStr;
};

export const formatDateRangeDisplay = (dateFrom?: string, dateTo?: string): string => {
  if (!dateFrom && !dateTo) {
    return 'All Available Surveillance Dates';
  }
  if (dateFrom && dateTo) {
    return `${formatDateDisplay(dateFrom)} – ${formatDateDisplay(dateTo)}`;
  }
  if (dateFrom) {
    return `From ${formatDateDisplay(dateFrom)} onwards`;
  }
  if (dateTo) {
    return `Up to ${formatDateDisplay(dateTo)}`;
  }
  return 'All Available Surveillance Dates';
};
