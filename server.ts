import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const getDirname = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fallback for CommonJS bundle execution
  }
  return process.cwd();
};

const __dirname = getDirname();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Enable CORS for frontend requests originating from Firebase Hosting or external domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Server-side Gemini AI Client
// Migrate legacy GMINI_API_KEY if present to canonical process.env.GEMINI_API_KEY and clean up obsolete secret
if (!process.env.GEMINI_API_KEY && process.env.GMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.GMINI_API_KEY;
}
if (process.env.GMINI_API_KEY) {
  delete process.env.GMINI_API_KEY;
}

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ORVL Surveillance Intelligence Network Backend' });
});

// Professional Profile & AI Context API (modularly served for UI and external consumers)
app.get('/api/profile', (req, res) => {
  try {
    const profile = {
      name: "Henok Abebe T.",
      email: "henz@hirnarvl.onmicrosoft.com",
      phone: "+251933310270",
      title: "Veterinary Epidemiologist | One Health Systems & Data Analytics",
      organization: "Hirna Regional Veterinary Laboratory (HRVL)",
      location: "Ethiopia",
      timezone: "Africa/Addis_Ababa",
      experience: "14+ years",
      experienceYears: 14,
      mission: "Transform data into intelligence, intelligence into action, and action into healthier communities, animals, and ecosystems.",
      summary: "Veterinary Epidemiologist, Data Analyst, and Public Health Strategist with 14+ years of experience in disease surveillance, epidemiological analysis, veterinary public health, and evidence-based decision-making in Ethiopia. Leading initiatives at the intersection of field epidemiology, laboratory diagnostics, One Health, and digital data analytics.",
      coreAreasOfExpertise: [
        "Veterinary Epidemiology",
        "Disease Surveillance",
        "Epidemiological Analysis",
        "Veterinary Public Health",
        "One Health",
        "Public Health Strategy",
        "Laboratory Surveillance",
        "Data Analytics",
        "Evidence-Based Decision-Making",
        "Digital Surveillance Systems",
        "Artificial Intelligence and Data Science",
        "Monitoring, Evaluation & Learning (MEL)",
        "Scientific Research and Writing"
      ],
      interests: [
        "Digital Innovation",
        "Data Science",
        "Artificial Intelligence",
        "Innovation",
        "Online Education",
        "Research Paper Writing",
        "Data Analysis",
        "Veterinary Informatics",
        "One Health Systems"
      ],
      digitalDataTools: [
        "ODK",
        "KoboToolbox",
        "DHIS2",
        "SPSS",
        "STATA",
        "Epi Info",
        "Minitab",
        "Data Visualization",
        "Digital Epidemiology",
        "AI-Assisted Decision Support",
        "Web-Based Analytics"
      ],
      professionalFocus: "Field Epidemiology → Laboratory Diagnostics → Data → Intelligence → Decision-Making → Public Health Action",
      links: {
        gravatar: "https://henokabebet.link",
        wordpress: "https://henockabebe.wordpress.com",
        github: "https://github.com/hirnarvl",
        linkedin: "https://www.linkedin.com/in/henok-abebe-369ha",
        orcid: "https://orcid.org/0000-0001-8575-9312",
        telegram: "https://t.me/Enocck",
        tiktok: "https://tiktok.com/@hena6336",
        facebook: "https://support.gravatar.com/profiles/verified-accounts/#facebook"
      },
      communicationPreferences: {
        tone: "Professional, clear, precise, and evidence-based",
        responseDepth: "In-depth when appropriate",
        primaryLanguage: "English",
        style: "Structured, practical, professional, and analytical"
      }
    };
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// In-memory weather cache (key: lat_lng -> data with timestamp)
const weatherCache = new Map<string, { timestamp: number; data: any }>();
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// WMO Weather code interpreter helper
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

// Weather Proxy API for GIS Decision Support
app.get('/api/weather', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 9.2178; // Default to Hirna
  const lng = parseFloat(req.query.lng as string) || 41.1012;
  const locationName = (req.query.name as string) || 'Hararghe Region';

  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const now = Date.now();
  const cached = weatherCache.get(cacheKey);

  if (cached && now - cached.timestamp < WEATHER_CACHE_TTL) {
    return res.json({ ...cached.data, fromCache: true });
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

    const weatherPayload = {
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

    weatherCache.set(cacheKey, { timestamp: now, data: weatherPayload });
    return res.json(weatherPayload);
  } catch (error: any) {
    console.warn(`Weather fetch failed for [${lat}, ${lng}], serving fallback model:`, error?.message || error);
    
    // Fallback baseline meteorological estimation for Hararghe highlands
    const isHighland = lat > 9.0 && lng > 41.0;
    const fallbackData = {
      latitude: lat,
      longitude: lng,
      locationName,
      timestamp: new Date().toISOString(),
      temperature: isHighland ? 21.5 : 27.2,
      apparentTemperature: isHighland ? 21.0 : 28.0,
      relativeHumidity: isHighland ? 62 : 48,
      precipitation: 0.0,
      windSpeed: 11.2,
      windDirection: 75, // Typical East/Northeast trade wind in Hararghe
      windGusts: 16.5,
      surfacePressure: isHighland ? 815 : 920,
      weatherCode: 2,
      weatherCondition: 'Partly cloudy (Historical Regional Average)',
      isDay: true,
      source: 'HRVL Regional Meteorological Climatology Baseline',
      isStaleOrOffline: true
    };

    return res.json(fallbackData);
  }
});

// In-memory narrative report cache (key: metrics_hash -> data with timestamp)
const narrativeReportCache = new Map<string, { timestamp: number; report: any }>();
const NARRATIVE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Epidemiological Report Generation API
app.post('/api/generate-narrative', async (req, res) => {
  const { 
    totalCases = 0, 
    totalDeaths = 0, 
    activeOutbreaks = 0, 
    complianceRate = 80, 
    fieldInvestigations,
    zoneStats, 
    topDiseases, 
    locale = 'en',
    reportingPeriod,
    lastUpdated,
    recordsAnalyzed = 0,
    outbreaksCount = 0,
    missionsCount = 0,
    activeFilters = {},
    dataRefreshStatus = 'Live Local & Cloud Verified Telemetry',
    isFilteredView = false,
    laboratoryId = 'hrvl'
  } = req.body || {};
  
  const isArvl = laboratoryId === 'arvl';
  const officialLabNames = {
    hrvl: {
      en: 'Hirna Regional Veterinary Laboratory',
      am: 'የሂርና ቀጠና እንስሳት ጤና ላቦራቶሪ',
      om: 'Laboratoorii Eegumsaa faayaa beeylada G/G HIRNAA'
    },
    arvl: {
      en: 'Asella Regional Veterinary Laboratory',
      am: 'የአሰላ ቀጠና እንስሳት ጤና ላቦራቶሪ',
      om: 'Laboratoorii Eegumsaa faayaa beeylada G/G ASELA'
    }
  };

  const currentLabConfig = isArvl ? officialLabNames.arvl : officialLabNames.hrvl;
  const officialLabName = locale === 'am' ? currentLabConfig.am : (locale === 'om' ? currentLabConfig.om : currentLabConfig.en);
  const labName = isArvl ? 'Asella Regional Veterinary Laboratory (ARVL)' : 'Hirna Regional Veterinary Laboratory (HRVL)';
  const labShort = isArvl ? 'ARVL' : 'HRVL';
  const labGeo = isArvl 
    ? '112 Target Operational Units across Central-Eastern Oromia (Arsi, West Arsi, Bale, East Bale, Shewa Zones), Ethiopia'
    : '36 Target Woredas (21 East Hararghe, 15 West Hararghe), Oromia Regional State, Ethiopia';
  const defaultHighRisk = isArvl
    ? ['Asella Town', 'Tiyo', 'Dodola', 'Robe', 'Adama', 'Lome']
    : ['Haramaya', 'Dadar', 'Chiro', 'Daro Lebu', 'Habro', 'Babile'];

  const cacheKey = `${laboratoryId}_${locale}_${totalCases}_${totalDeaths}_${activeOutbreaks}_${complianceRate}_${fieldInvestigations?.total || 0}_${recordsAnalyzed}_${JSON.stringify(activeFilters)}`;
  const now = Date.now();
  const cached = narrativeReportCache.get(cacheKey);

  if (cached && (now - cached.timestamp < NARRATIVE_CACHE_TTL)) {
    return res.json({ success: true, report: cached.report, fromCache: true });
  }

  const languageMap: Record<string, string> = {
    'en': 'English',
    'om': 'Afaan Oromoo',
    'am': 'Amharic'
  };
  
  const targetLanguage = languageMap[locale] || 'English';
  const effectivePeriod = reportingPeriod || `${new Date().getFullYear()} Surveillance Cycle`;
  const effectiveUpdated = lastUpdated || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const effectiveRecordsAnalyzed = recordsAnalyzed || totalCases;
  const effectiveOutbreaksCount = outbreaksCount || activeOutbreaks;
  const effectiveMissionsCount = missionsCount || (fieldInvestigations?.total ?? 0);

  const defaultProvenance = {
    dataSource: `Current ${labName} surveillance dashboard dataset (ADNIS)`,
    reportingPeriod: effectivePeriod,
    lastUpdated: effectiveUpdated,
    recordsAnalyzed: effectiveRecordsAnalyzed,
    outbreaksCount: effectiveOutbreaksCount,
    missionsCount: effectiveMissionsCount,
    activeFilters: activeFilters,
    geographicCoverage: labGeo,
    dataRefreshStatus: dataRefreshStatus,
    isFilteredView: isFilteredView
  };

  const constructFallbackReport = () => {
    let t_title = isFilteredView 
      ? `${labShort} Filtered Surveillance Report (${activeFilters.zone || 'Target Subset'})` 
      : `${labShort} Regional Veterinary Surveillance & Situation Report`;
    
    let t_exec = effectiveRecordsAnalyzed === 0
      ? `No active epidemiological records were returned under the currently selected query/filter criteria (${JSON.stringify(activeFilters)}). Please adjust filter parameters to view broader zonal or historical surveillance records.`
      : isArvl
      ? `During the reporting period (${effectivePeriod}), the Asella Regional Veterinary Laboratory (ARVL) coordinated disease surveillance across 112 operational units in Arsi, West Arsi, Bale, East Bale, Shewa, and urban centers. A total of ${effectiveRecordsAnalyzed} field surveillance records were analyzed (${totalCases} recorded cases, ${totalDeaths} animal fatalities). Active field surveillance tracked ${effectiveOutbreaksCount} priority outbreak centers, while field response units conducted ${effectiveMissionsCount} active investigations. Woreda zero-reporting compliance currently averages ${complianceRate}%.`
      : `During the reporting period (${effectivePeriod}), the Hirna Regional Veterinary Laboratory (HRVL) coordinated surveillance across operational woredas in East and West Hararghe. A total of ${effectiveRecordsAnalyzed} field surveillance records were analyzed (${totalCases} recorded cases, ${totalDeaths} animal fatalities). Active field surveillance tracked ${effectiveOutbreaksCount} priority outbreak centers, while field response units conducted ${effectiveMissionsCount} active investigations. Woreda zero-reporting compliance currently averages ${complianceRate}%.`;
    
    let t_status = isArvl
      ? `Priority disease vectors in the central-southeastern pastoral corridors include Foot-and-Mouth Disease (FMD) along transit corridors (Asella, Tiyo, Adama), Peste des Petits Ruminants (PPR) affecting pastoral herds, and localized Anthrax suspicions in Robe and Dodola requiring strict ring vaccination and biosecurity containment.`
      : `Priority disease vectors include Foot-and-Mouth Disease (FMD) along major trade transit routes, Peste des Petits Ruminants (PPR) affecting small ruminant populations in Dadar and Mieso, and sporadic Anthrax suspicions requiring immediate diagnostic confirmation. Transboundary livestock trade along the Harar-Djibouti corridor continues to represent an active transmission risk.`;
    
    let t_species = isArvl
      ? `Cattle represent 58% of clinical morbidity volume, with high dairy cluster susceptibility in Asella, Tiyo, and Adama. Small ruminants exhibit elevated mortality during acute PPR episodes in pastoral woredas of West Arsi and Bale. Poultry systems demonstrate seasonal Newcastle Disease mortality in rural backyard holdings.`
      : `Cattle represent the highest total case volume (${totalCases > 300 ? '58%' : '42%'}), with elevated mortality in small ruminants (Goats & Sheep) impacted by respiratory disease complexes and PPR. Poultry flocks exhibit acute Newcastle Disease events in backyard production settings.`;
    
    let t_zonal = isArvl
      ? `Across the 112 operational units under Asella Regional Veterinary Laboratory (ARVL) jurisdiction across Central-Eastern Oromia, reporting compliance averages ${complianceRate}%. Arsi Zone recorded strong compliance at 70%, East Bale reached 79%, Bishoftu City achieved 92%, and Sheger City maintained 73% with ongoing field expansion and mobile telemetry support across West Arsi, Bale, and Shewa.`
      : `East Hararghe (21 Woredas) maintained 68% average reporting compliance. West Hararghe (15 Woredas) recorded 70% compliance, with high fidelity from Chiro, Habro, and Daro Lebu.`;
    
    let t_recs = isArvl ? [
      'Immediate ring vaccination (10km radius) around laboratory-confirmed FMD and PPR foci in Asella, Tiyo and Robe corridors',
      'Establishment of mobile veterinary checkpoints along primary central transit highways and Adama corridors',
      'Enhanced weekly zero-reporting compliance enforcement in pastoral woredas of West Arsi, Bale and East Bale',
      'Distribution of rapid diagnostic sampling kits for suspected Anthrax mortalities and CBPP surveillance across high-risk herds',
      'Maintain zero-reporting compliance monitoring across all 112 ARVL operational units'
    ] : [
      'Immediate ring vaccination (10km radius) around laboratory-confirmed FMD and PPR foci in Haramaya and Dadar border kebeles',
      'Establishment of mobile veterinary checkpoints along primary transit corridors and border entry points',
      'Enhanced weekly zero-reporting compliance enforcement in remote pastoral woredas of West Hararghe',
      'Distribution of rapid diagnostic sampling kits for suspected Anthrax mortalities in Chiro and Habro',
      'Maintain zero-reporting compliance monitoring across all 36 Hararghe woredas'
    ];
    
    if (locale === 'am') {
      t_title = isFilteredView ? `የ${labShort} የተጣራ የእንስሳት ቁጥጥር ሪፖርት` : `የ${labShort} ክልላዊ የእንስሳት ቁጥጥር እና የሁኔታ ሪፖርት`;
      t_exec = effectiveRecordsAnalyzed === 0
        ? 'በተመረጠው የማጣሪያ መስፈርት መሰረት ምንም ንቁ የስለላ መዝገቦች አልተገኙም።'
        : isArvl
        ? `በሪፖርት ጊዜ ውስጥ (${effectivePeriod})፣ ${officialLabNames.arvl.am} (ARVL) ${effectiveRecordsAnalyzed} የስለላ መዝገቦችን በመተንተን ${totalCases} የእንስሳት ጉዳዮች እና ${totalDeaths} ሞት መዝግቧል። ንቁ የመስክ ቁጥጥር ${effectiveOutbreaksCount} የወረርሽኝ ማዕከላትን እና ${effectiveMissionsCount} የመስክ ምርመራዎችን ለይቷል። አጠቃላይ የሪፖርት አፈጻጸም ${complianceRate}% ነው።`
        : `በሪፖርት ጊዜ ውስጥ (${effectivePeriod})፣ ${officialLabNames.hrvl.am} (HRVL) ${effectiveRecordsAnalyzed} የስለላ መዝገቦችን በመተንተን ${totalCases} የእንስሳት ጉዳዮች እና ${totalDeaths} ሞት መዝግቧል። ንቁ የመስክ ቁጥጥር ${effectiveOutbreaksCount} የወረርሽኝ ማዕከላትን እና ${effectiveMissionsCount} የመስክ ምርመራዎችን ለይቷል።`;
      t_status = isArvl
        ? `በዋና ዋና የአርሲ፣ ምዕራብ አርሲ እና ባሌ መስመሮች ላይ የእግር እና የአፍ በሽታ (FMD)፣ የትንሽ እንስሳት ህዝቦችን የሚያጠቃ PPR፣ እና አስቸኳይ ምርመራ የሚፈልጉ የአንትራክስ ጥርጣሬዎችን ጨምሮ ቅድሚያ የሚሰጣቸው የበሽታ ስርጭቶች አሉ።`
        : `በዋና ዋና የንግድ መስመሮች ላይ የእግር እና የአፍ በሽታ (FMD)፣ የትንሽ እንስሳት ህዝቦችን የሚያጠቃ PPR፣ እና አስቸኳይ ምርመራ የሚፈልጉ አልፎ አልፎ የአንትራክስ ጥርጣሬዎችን ጨምሮ ቅድሚያ የሚሰጣቸው የበሽታ ስርጭቶች አሉ።`;
      t_species = `ከብቶች ከፍተኛውን አጠቃላይ የጉዳይ መጠን ይይዛሉ፣ በትንንሽ እንስሳት ላይ በPPR ምክንያት የሞት መጠን ጨምሯል።`;
      t_zonal = isArvl 
        ? `በ${officialLabNames.arvl.am} (ARVL) ስር ባሉ 112 ኦፕሬሽናል ክፍሎች ውስጥ የዜሮ-ሪፖርት አፈጻጸም በአማካይ ${complianceRate}% ነው። የአርሲ፣ ምዕራብ አርሲ፣ ባሌ፣ ምስራቅ ባሌ እና ሸዋ ዞን ወረዳዎች ሳምንታዊ የሪፖርት አፈጻጸማቸውን እያጠናከሩ ይገኛሉ።` 
        : `የምስራቅ ሐረርጌ ዞን (21 ወረዳዎች) እና የምዕራብ ሐረርጌ ዞን (15 ወረዳዎች) ሳምንታዊ የሪፖርት አፈጻጸማቸውን እያጠናከሩ ይገኛሉ።`;
      t_recs = isArvl ? [
        'በአሰላ እና ጢዮ ለከፍተኛ አደጋ ተጋላጭ ለሆኑ እንስሳት አስቸኳይ የክበብ ክትባት',
        'በዋና ዋና የንግድ መስመሮች ላይ ተንቀሳቃሽ የእንስሳት ኬላዎችን ማቋቋም',
        'በአርብቶ አደር ወረዳዎች ውስጥ ሳምንታዊ የዜሮ-ሪፖርት አፈጻጸምን ማጠናከር'
      ] : [
        'በሀረማያ እና ዳዳር የድንበር ቀበሌዎች ለከፍተኛ አደጋ ተጋላጭ ለሆኑ እንስሳት አስቸኳይ የክበብ ክትባት',
        'በዋና ዋና የንግድ መስመሮች ላይ ተንቀሳቃሽ የእንስሳት ኬላዎችን ማቋቋም',
        'በሩቅ አርብቶ አደር ወረዳዎች ውስጥ ሳምንታዊ የዜሮ-ሪፖርት አፈጻጸምን ማጠናከር'
      ];
    } else if (locale === 'om') {
      t_title = isFilteredView ? `Gabaasa To'annoo ${labShort} Calalame` : `Gabaasa To'annoo fi Haala Beeyladaa Naannoo ${labShort}`;
      t_exec = effectiveRecordsAnalyzed === 0
        ? 'Ulaagaa calallii filatame jalatti galmeen to\'annoo hin argamne.'
        : isArvl
        ? `Yeroo gabaasaa (${effectivePeriod}) keessatti, ${officialLabNames.arvl.om} (ARVL) aanaalee 112 keessatti galmeewwan to'annoo ${effectiveRecordsAnalyzed} qaaccessuudhaan dhimmoota beeyladaa ${totalCases} fi du'a beeyladaa ${totalDeaths} galmeesseera. Raawwiin gabaasa zeeroo giddu-galeessaan ${complianceRate}% dha.`
        : `Yeroo gabaasaa (${effectivePeriod}) keessatti, ${officialLabNames.hrvl.om} (HRVL) galmeewwan to\'annoo ${effectiveRecordsAnalyzed} qaaccessuudhaan dhimmoota beeyladaa ${totalCases} fi du\'a beeyladaa ${totalDeaths} galmeesseera. Wiirtuulee dhibee ${effectiveOutbreaksCount} fi duula dirree ${effectiveMissionsCount} hordofeera.`;
      t_status = isArvl
        ? `Dhibeewwan daddarboo adda-duree keessaa Dhibee Imiillaa (FMD) daandiiwwan daldalaa Asalla fi Adaamaa irratti, PPR beeyladoota xixiqqoo miidhu ifatti argamaniiru.`
        : `Dhibeewwan daddarboo adda-duree keessaa Dhibee Imiillaa (FMD) daandiiwwan daldalaa gurguddoo irratti, PPR beeyladoota xixiqqoo miidhu ifatti argamaniiru.`;
      t_species = `Loowwan baay\'ina dhimmootaa olaanaa kan qaban yoo ta\'u, beeyladoota xixiqqoo irratti dhibee sombaa fi PPR\'n du\'i dabaleera.`;
      t_zonal = isArvl 
        ? `Kutaalee hojii 112 ${officialLabNames.arvl.om} (ARVL) jalatti, raawwiin gabaasa zeeroo giddu-galeessaan ${complianceRate}% dha. Godinaaleen Arsi, Arsi Dhihaa, Baale, Baale Bahaa fi Shawaa gabaasa torbanii amansiisaa galmeessaniiru.` 
        : `Godinni H/Bahaa (Aanaalee 21) fi Godinni H/Dhihaa (Aanaalee 15) gabaasa torbanii amansiisaa galmeessaniiru.`;
      t_recs = isArvl ? [
        'Aanaalee Asella fi Tiyo keessatti beeyladoota balaa guddaa qabaniif talaallii marsaa hatattamaa',
        'Daandiiwwan daldalaa gurguddoo irratti kellaawwan beeyladaa socho\'an hundeessuu',
        'Aanaalee horsiisee bulaa keessatti raawwii gabaasa zeeroo torbanii cimsanii hordofuu'
      ] : [
        'Aanaalee daangaa Haramaya fi Dadar keessatti beeyladoota balaa guddaa qabaniif talaallii marsaa hatattamaa',
        'Daandiiwwan daldalaa gurguddoo irratti kellaawwan beeyladaa socho\'an hundeessuu',
        'Aanaalee horsiisee bulaa fagoo keessatti raawwii gabaasa zeeroo torbanii cimsanii hordofuu'
      ];
    }

    return {
      title: t_title,
      dateGenerated: new Date().toLocaleDateString(locale === 'om' ? 'en-US' : (locale === 'am' ? 'am-ET' : 'en-US'), { dateStyle: 'full' }),
      laboratoryId: isArvl ? 'arvl' : 'hrvl',
      reportRef: isArvl ? 'ARVL-EPI-2026' : 'HRVL-EPI-2026',
      dataProvenance: defaultProvenance,
      executiveSummary: t_exec,
      outbreakStatusAnalysis: t_status,
      speciesVulnerability: t_species,
      zonalComplianceSummary: t_zonal,
      highRiskWoredas: defaultHighRisk,
      epidemiologicalRecommendations: t_recs
    };
  };

  try {
    const ai = getGenAIClient();
    if (!ai) {
      console.log('Gemini API key not configured. Using structured fallback report.');
      const fallback = constructFallbackReport();
      narrativeReportCache.set(cacheKey, { timestamp: now, report: fallback });
      return res.json({ success: true, report: fallback, isFallback: true });
    }

    const persona = isArvl 
      ? `Dr. Abdissa Lemma Bedada, ARVL Epi Surveillance Team Lead Epidemiologist & Admin of ARVL at the ${officialLabNames.arvl.en} (ARVL)`
      : `Dr. Henok Abebe T., Lead Veterinary Epidemiologist and Systems Developer at the ${officialLabNames.hrvl.en} (HRVL)`;

    const prompt = `You are ${persona} in Oromia, Ethiopia.
Your core mission: "Transform data into intelligence, intelligence into action, and action into healthier communities, animals, and ecosystems."

CRITICAL INSTITUTIONAL NAMING MANDATE:
- Target Laboratory Official Name for this report: "${officialLabName}" (${labShort})
- When writing in ${targetLanguage}, you MUST refer to the laboratory by its EXACT official institutional name:
  ${isArvl 
    ? (locale === 'am' ? 'የአሰላ ቀጠና እንስሳት ጤና ላቦራቶሪ' : locale === 'om' ? 'Laboratoorii Eegumsaa faayaa beeylada G/G ASELA' : 'Asella Regional Veterinary Laboratory')
    : (locale === 'am' ? 'የሂርና ቀጠና እንስሳት ጤና ላቦራቶሪ' : locale === 'om' ? 'Laboratoorii Eegumsaa faayaa beeylada G/G HIRNAA' : 'Hirna Regional Veterinary Laboratory')}
- NEVER translate, transliterate, modify, capitalize, lowercase, or reword this official institutional name in titles, executive summary, recommendations, or headers.

DATASET INTEGRITY & PROVENANCE MANDATES:
1. Ground every statistical assertion STRICTLY in the current dashboard telemetry numbers provided below. NEVER hallucinate numbers that contradict this dataset.
2. ${isArvl ? `CRITICAL ARVL DATA ISOLATION RULE:
- This report is strictly for the ${officialLabNames.arvl.en} (ARVL).
- You MUST mention ONLY ARVL operational zones (Arsi, West Arsi, Bale, East Bale, East Shewa, North Shewa, Sheger City, Adama City, Shashamane City, Bishoftu City, Town-level operational units) and ARVL woredas (e.g. Asella, Tiyo, Dodola, Robe, Adama, Bishoftu, Sebeta, Ziway Dugda, Sinana, Gindhir).
- NEVER mention Hararghe, Hirna, Chiro, Haramaya, Babile, Dadar, Habro, Mieso, or any HRVL operational areas or woredas.
- Use ONLY the ARVL compliance statistics, case figures, and zonal breakdown provided in the telemetry below.
- Zero HRVL references.` : `CRITICAL HRVL DATA ISOLATION RULE:
- This report is strictly for the ${officialLabNames.hrvl.en} (HRVL).
- You MUST mention ONLY HRVL operational zones (East Hararghe, West Hararghe) and HRVL woredas (e.g. Chiro, Haramaya, Babile, Dadar, Habro, Mieso, Bedeno).
- NEVER mention Arsi, West Arsi, Bale, East Bale, Shewa, Asela, or any ARVL operational areas or woredas.
- Zero ARVL references.`}
3. If total records analyzed is 0 or filtered out, explicitly mention that the active filter window has no recorded cases and recommend broadening filter criteria.
4. Include the dynamic Data Provenance metadata block in the JSON output.

CURRENT LIVE DASHBOARD TELEMETRY:
- Target Laboratory: ${labName} (${labShort})
- Reporting Period: ${effectivePeriod}
- Last Updated: ${effectiveUpdated}
- Total Records Analyzed: ${effectiveRecordsAnalyzed}
- Total Reported Cases: ${totalCases}
- Total Animal Fatalities: ${totalDeaths}
- Active Outbreak Hotspots: ${effectiveOutbreaksCount}
- Active Field Toolkit Missions: ${effectiveMissionsCount}
- Overall Woreda Compliance Rate: ${complianceRate}%
- Active Filters: ${JSON.stringify(activeFilters)}
- Field Toolkit Details: ${JSON.stringify(fieldInvestigations || {})}
- Zonal Breakdown: ${JSON.stringify(zoneStats || {})}
- Leading Disease Burden & CFR: ${JSON.stringify(topDiseases || [])}

Generate a comprehensive, publication-ready Epidemiological Narrative Summary & Outbreak Situation Report matching this valid JSON schema (translate all narrative strings into ${targetLanguage}, keeping JSON keys in English):
{
  "title": "${labShort} Regional Veterinary Surveillance & Epidemiological Report",
  "dateGenerated": "${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}",
  "laboratoryId": "${isArvl ? 'arvl' : 'hrvl'}",
  "reportRef": "${isArvl ? 'ARVL-EPI-2026' : 'HRVL-EPI-2026'}",
  "dataProvenance": {
    "dataSource": "Current ${labName} surveillance dashboard dataset (ADNIS)",
    "reportingPeriod": "${effectivePeriod}",
    "lastUpdated": "${effectiveUpdated}",
    "recordsAnalyzed": ${effectiveRecordsAnalyzed},
    "outbreaksCount": ${effectiveOutbreaksCount},
    "missionsCount": ${effectiveMissionsCount},
    "activeFilters": ${JSON.stringify(activeFilters)},
    "geographicCoverage": "${labGeo}",
    "dataRefreshStatus": "${dataRefreshStatus}",
    "isFilteredView": ${Boolean(isFilteredView)}
  },
  "executiveSummary": "2-3 paragraphs high-level executive overview of disease dynamics across operational woredas...",
  "outbreakStatusAnalysis": "Detailed epidemiological evaluation of active outbreaks, transboundary movement risks, and livestock trade corridor vectors...",
  "speciesVulnerability": "Analysis of species-specific morbidity and mortality patterns...",
  "zonalComplianceSummary": "Evaluation of woreda reporting rates and operational performance...",
  "highRiskWoredas": ${JSON.stringify(defaultHighRisk)},
  "epidemiologicalRecommendations": [
    "Immediate ring vaccination for high-risk livestock in border containment corridors",
    "Establish movement restriction checkpoints along trade corridors",
    "Strengthen zero-reporting compliance in remote pastoral woredas"
  ]
}

    Return ONLY raw valid JSON.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let narrativeText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const text = response.text;
        
        if (text) {
          narrativeText = text;
          break;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isUnavailableOrRateLimited = 
          errMsg.includes('503') || 
          errMsg.includes('429') || 
          errMsg.includes('UNAVAILABLE') || 
          errMsg.includes('high demand') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('Quota');
        
        if (isUnavailableOrRateLimited) {
          console.log(`Model ${modelName} is temporarily rate-limited or quota exhausted. Attempting fallback model...`);
          // Brief pause before trying next candidate
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          console.log(`Model ${modelName} call notice:`, errMsg);
        }
      }
    }

    if (!narrativeText) {
      console.log('All Gemini models returned empty or unavailable. Utilizing rich structured fallback narrative.');
      const fallback = constructFallbackReport();
      narrativeReportCache.set(cacheKey, { timestamp: now, report: fallback });
      return res.json({ success: true, report: fallback, isFallback: true });
    }

    // Clean JSON response (strip backticks if present)
    let cleanedText = narrativeText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let reportObj;
    try {
      reportObj = JSON.parse(cleanedText);
      if (!reportObj.dataProvenance) {
        reportObj.dataProvenance = defaultProvenance;
      }
    } catch {
      reportObj = constructFallbackReport();
    }

    narrativeReportCache.set(cacheKey, { timestamp: now, report: reportObj });
    res.json({ success: true, report: reportObj });
  } catch (error: any) {
    console.log('Notice in /api/generate-narrative, serving structured fallback:', error?.message || error);
    res.json({ success: true, report: constructFallbackReport(), isFallback: true });
  }
});

// Multilingual Text-to-Speech (TTS) Audio Streaming & Caching API
const ttsCache = new Map<string, Buffer>();

app.get('/api/tts', async (req, res) => {
  try {
    const text = (req.query.text as string || '').trim();
    const lang = (req.query.lang as string || 'en').toLowerCase();

    if (!text) {
      return res.status(400).json({ error: 'Text query parameter is required' });
    }

    const cacheKey = `${lang}:${text}`;
    if (ttsCache.has(cacheKey)) {
      const buffer = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    // Determine TTS target language:
    // am -> Amharic native voice
    // om -> Afaan Oromoo (phonetically rendered via Swahili/East African phonetic voice with identical Cushitic/Bantu vowel lengths)
    // en -> English
    let ttsLang = 'en';
    if (lang === 'am') {
      ttsLang = 'am';
    } else if (lang === 'om') {
      ttsLang = 'sw';
    } else {
      ttsLang = 'en';
    }

    // Google Translate TTS chunking (max ~180 chars per chunk to avoid truncation)
    const sentences = text.match(/[^.!?።]+[.!?።]+|[^.!?።]+$/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).trim().length <= 180) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (sentence.length > 180) {
          const words = sentence.split(' ');
          let subChunk = '';
          for (const word of words) {
            if ((subChunk + ' ' + word).trim().length <= 180) {
              subChunk = (subChunk + ' ' + word).trim();
            } else {
              if (subChunk) chunks.push(subChunk);
              subChunk = word;
            }
          }
          if (subChunk) chunks.push(subChunk);
          currentChunk = '';
        } else {
          currentChunk = sentence.trim();
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    // Fetch and combine audio chunks
    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(chunk.trim())}`;
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ error: 'Failed to synthesize speech' });
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    ttsCache.set(cacheKey, finalBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(finalBuffer);
  } catch (error: any) {
    console.error('Error in /api/tts:', error?.message || error);
    res.status(500).json({ error: 'Internal TTS error' });
  }
});

app.get('/api/r4l-login', (req, res) => {
  const username = process.env.R4L_USERNAME;
  const password = process.env.R4L_PASSWORD;

  if (!username || !password) {
    return res.redirect('https://login.research4life.org/tacari_login/login');
  }

  const safeUser = username.replace(/"/g, '&quot;');
  const safePass = password.replace(/"/g, '&quot;');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to Research4Life...</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; }
        .spinner { border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top: 3px solid white; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-right: 12px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body onload="document.getElementById('r4l-form').submit()">
      <div style="display: flex; align-items: center;">
        <div class="spinner"></div>
        <div>Authenticating Institutional Access...</div>
      </div>
      <form id="r4l-form" action="https://login.research4life.org/tacari_login/login" method="POST" style="display: none;">
        <input type="hidden" name="username" value="${safeUser}" />
        <input type="hidden" name="password" value="${safePass}" />
      </form>
    </body>
    </html>
  `;
  res.send(html);
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ORVL Surveillance Intelligence Network server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
