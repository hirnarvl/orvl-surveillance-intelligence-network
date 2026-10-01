import { LiveWeatherData } from '../types/riskMap';

const clientWeatherCache = new Map<string, { timestamp: number; data: LiveWeatherData }>();
const CLIENT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes in-memory

const decodeWmoWeatherCode = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy / Haze';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain showers';
  if (code >= 71 && code <= 77) return 'Light mountain snow/hail';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy / Moderate';
};

export async function fetchLiveWeather(
  lat: number,
  lng: number,
  locationName: string = 'Hararghe Region'
): Promise<LiveWeatherData> {
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const now = Date.now();
  const cached = clientWeatherCache.get(cacheKey);

  if (cached && now - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Africa%2FAddis_Ababa&forecast_days=3`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error ${response.status}`);
    }

    const data: any = await response.json();
    const current = data.current || {};
    const weatherCode = current.weather_code ?? 1;

    const weatherPayload: LiveWeatherData = {
      latitude: lat,
      longitude: lng,
      locationName,
      timestamp: new Date().toISOString(),
      temperature: current.temperature_2m ?? 22.4,
      apparentTemperature: current.apparent_temperature ?? 22.0,
      relativeHumidity: current.relative_humidity_2m ?? 58,
      precipitation: current.precipitation ?? 0,
      windSpeed: current.wind_speed_10m ?? 12.5,
      windDirection: current.wind_direction_10m ?? 85,
      windGusts: current.wind_gusts_10m ?? 18.0,
      surfacePressure: current.surface_pressure ?? 820,
      weatherCode,
      weatherCondition: decodeWmoWeatherCode(weatherCode),
      isDay: current.is_day === 1,
      hourlyForecast: data.hourly ? {
        time: data.hourly.time?.slice(0, 24) || [],
        temperature: data.hourly.temperature_2m?.slice(0, 24) || [],
        precipitationProbability: data.hourly.precipitation_probability?.slice(0, 24) || [],
        windSpeed: data.hourly.wind_speed_10m?.slice(0, 24) || [],
        windDirection: data.hourly.wind_direction_10m?.slice(0, 24) || []
      } : undefined,
      dailyForecast: data.daily ? {
        time: data.daily.time || [],
        temperatureMax: data.daily.temperature_2m_max || [],
        temperatureMin: data.daily.temperature_2m_min || [],
        precipitationSum: data.daily.precipitation_sum || [],
        windSpeedMax: data.daily.wind_speed_10m_max || []
      } : undefined,
      source: 'Open-Meteo Meteorological High-Resolution Model',
      isStaleOrOffline: false
    };

    clientWeatherCache.set(cacheKey, { timestamp: now, data: weatherPayload });
    return weatherPayload;
  } catch (error) {
    console.warn(`Could not reach Open-Meteo for [${lat}, ${lng}], serving offline fallback:`, error);
    // Return resilient local fallback
    const isHighland = lat > 9.0 && lng > 41.0;
    const fallback: LiveWeatherData = {
      latitude: lat,
      longitude: lng,
      locationName,
      timestamp: new Date().toISOString(),
      temperature: isHighland ? 21.0 : 26.5,
      apparentTemperature: isHighland ? 20.5 : 27.0,
      relativeHumidity: isHighland ? 60 : 50,
      precipitation: 0.0,
      windSpeed: 12.0,
      windDirection: 80, // East-Northeast
      windGusts: 16.0,
      surfacePressure: isHighland ? 820 : 915,
      weatherCode: 2,
      weatherCondition: 'Partly cloudy (Offline Climatological Mode)',
      isDay: true,
      source: 'HRVL Local Veterinary Climatological Model',
      isStaleOrOffline: true
    };
    return fallback;
  }
}

/**
 * Calculates a wind compass label from degrees
 */
export function getWindCompassDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
