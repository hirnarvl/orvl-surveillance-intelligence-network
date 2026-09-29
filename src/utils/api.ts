/**
 * ORVL Surveillance Intelligence Network - API Path Helper
 *
 * Uses same-origin relative API routes (/api/...) because the React frontend
 * and Express backend are served from the same Cloud Run origin.
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return cleanEndpoint;
};
