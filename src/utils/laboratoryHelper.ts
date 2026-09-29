import { LaboratoryInfo } from '../data/laboratories';

/**
 * Dynamically prefixes a dashboard section or modal header with the active laboratory (e.g. HRVL, ARVL, or Integrated).
 * Automatically strips any hard-coded legacy laboratory prefixes to prevent duplicate naming.
 *
 * @param title - The raw section or modal title (e.g., "Historical Archive & Ingestion", "Surveillance Records")
 * @param labInfo - The active LaboratoryInfo object from useLaboratory()
 * @returns Formatted header string (e.g., "ARVL Historical Archive & Ingestion", "HRVL Surveillance Records")
 */
export function formatLabHeader(
  title: string,
  labInfo?: Partial<LaboratoryInfo> | { shortCode?: string; name?: string; shortName?: string; id?: string } | null
): string {
  if (!title) return '';
  if (!labInfo) return title;

  let labPrefix = labInfo.shortCode || labInfo.name || '';
  if (labInfo.id === 'all' || labPrefix.toLowerCase().includes('all') || labPrefix.toLowerCase().includes('integrated')) {
    labPrefix = 'Integrated';
  }

  // Remove existing redundant prefixes if present in title
  const cleanedTitle = title
    .replace(/^(HRVL|ARVL|ALL-RVL|Multi-RVL|Integrated|All Laboratories)\s*[-•:]*\s*/i, '')
    .trim();

  return `${labPrefix} ${cleanedTitle}`;
}
