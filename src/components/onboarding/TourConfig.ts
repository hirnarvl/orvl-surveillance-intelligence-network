/**
 * HRVL Digital Disease Surveillance & Analytics Platform
 * Multilingual Voice-Guided Onboarding System Configuration
 *
 * Implements 10 comprehensive tour steps with exact, culturally authentic, and
 * epidemiologically precise trilingual narrations:
 * - English (en)
 * - Amharic (am / አማርኛ)
 * - Afaan Oromo (om / Afaan Oromoo)
 */

import { Locale } from '../../types';

export interface MultilingualText {
  en: string;
  am: string;
  om: string;
}

export interface MultilingualList {
  en: string[];
  am: string[];
  om: string[];
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: MultilingualText;
  subtitle?: MultilingualText;
  purpose: MultilingualText;
  features: MultilingualList;
  narration: MultilingualText;
  targetDataTour: string;
  activeTab: 'Dashboard' | 'Map' | 'Tables' | 'VaccineCalendar' | 'FieldToolkit' | 'FAST';
  fastSubTab?: 'diseases' | 'resources' | 'field-tools' | 'laboratory' | 'one-health' | 'training';
  requiresAdmin?: boolean;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isVisionStep?: boolean;
}

export const TOUR_WELCOME_CONTENT: {
  title: MultilingualText;
  subtitle: MultilingualText;
  description: MultilingualText;
  narration: MultilingualText;
  startTourButton: MultilingualText;
  watchOverviewButton: MultilingualText;
  exploreFreelyButton: MultilingualText;
  dontShowAgain: MultilingualText;
  voiceToggle: MultilingualText;
  pillars: {
    title: MultilingualText;
    desc: MultilingualText;
  }[];
} = {
  title: {
    en: 'Welcome to the HRVL Digital Disease Surveillance and Analytics Platform',
    am: 'እንኳን ወደ ሂርና ቀጠናዊ እንስሳት ላቦራቶሪ (HRVL) የዲጂታል በሽታ ክትትልና ትንተና መድረክ በደህና መጡ',
    om: 'Baga Gara Waltajjii Dijitaalaa Hordoffii Dhukkubaa fi Xiinxala Daataa HRVL Hirnaatti Nagaan Dhuftan'
  },
  subtitle: {
    en: 'Hirna Regional Veterinary Laboratory (HRVL) • East & West Hararghe Surveillance Network',
    am: 'የሂርና ቀጠናዊ እንስሳት ጤና ላቦራቶሪ (HRVL) • የምስራቅ እና ምዕራብ ሐረርጌ የተቀናጀ የበሽታ ክትትል አውታር',
    om: 'Laaboraatoorii Fayyaa Beeyladaa Naannoo Hirnaa (HRVL) • Sarara Hordoffii Dhibee Harargee Bahaa fi Dhihaa'
  },
  description: {
    en: 'This platform brings disease surveillance, laboratory evidence, spatial intelligence, data analytics, and reporting together in one integrated environment. Let’s take a guided tour.',
    am: 'ይህ መድረክ የመስክ በሽታ ክትትልን፣ የላቦራቶሪ ምርመራ ማስረጃን፣ የጂኦስፓሻል ካርታ መረጃን፣ የስታቲስቲክስ ትንተናን እና ይፋዊ ሪፖርቶችን በአንድ የተቀናጀ አሰራር ያገናኛል። አጭር የድምፅ መመሪያ ጉብኝት አብረን እናድርግ።',
    om: 'Waltajjiin kun hordoffii dhibee dirree, ragaa qorannoo laaboraatoorii, odeeffannoo kaartaa GIS, xiinxala daataa fi gabaasa seeraa waltajjii tokko keessatti qindeessa. Mee daawwannaa qajeelfamaa sagaleedhaan deeggarame waliin haa taasisnu.'
  },
  narration: {
    en: 'Welcome to the HRVL Digital Disease Surveillance and Analytics Platform. This platform brings disease surveillance, laboratory evidence, spatial intelligence, data analytics, and reporting together in one integrated environment. Let’s take a guided tour.',
    am: 'እንኳን ወደ ሂርና ቀጠናዊ እንስሳት ላቦራቶሪ የዲጂታል በሽታ ክትትልና የመረጃ ትንተና መድረክ በደህና መጡ። ይህ መድረክ የመስክ በሽታ ክትትልን፣ የላቦራቶሪ ማስረጃን፣ የጂኦስፓሻል ካርታ መረጃን፣ የስታቲስቲክስ ትንተናን እና ይፋዊ ሪፖርቶችን በአንድ ላይ ያቀናጃል። አጭር የጉብኝት መመሪያ አብረን እንጀምር።',
    om: 'Baga gara Waltajjii Dijitaalaa Hordoffii Dhukkubaa fi Xiinxala Daataa HRVL Hirnaatti nagaan dhuftan. Waltajjiin kun hordoffii dhibee dirree, ragaa laaboraatoorii, odeeffannoo kaartaa GIS, xiinxala daataa fi gabaasa seeraa waltajjii tokko keessatti qindeessa. Mee daawwannaa qajeelfamaa sagaleedhaan deeggarame waliin haa jalqabnu.'
  },
  startTourButton: {
    en: 'Start Guided Tour',
    am: 'የመመሪያ ጉብኝቱን ጀምር',
    om: 'Daawwannaa Qajeelfamaa Jalqabi'
  },
  watchOverviewButton: {
    en: 'Watch Overview',
    am: 'አጠቃላይ እይታን ይመልከቱ',
    om: 'Ilaalcha Waliigalaa Daawwadhu'
  },
  exploreFreelyButton: {
    en: 'Explore Freely',
    am: 'በነጻነት ያስሱ',
    om: 'Bilisummaan Sakatta’i'
  },
  dontShowAgain: {
    en: 'Don’t show this welcome tour automatically again',
    am: 'ይህንን የመግቢያ መመሪያ በድጋሚ በራሱ አታሳይ',
    om: 'Qajeelfama simannaa kana lammata ofumaan hin agarsiisin'
  },
  voiceToggle: {
    en: 'Voice Narration',
    am: 'የድምፅ መመሪያ',
    om: 'Sagalee Qajeelchaa'
  },
  pillars: [
    {
      title: { en: 'Field Surveillance', am: 'የመስክ ክትትል', om: 'Hordoffii Dirree' },
      desc: { 
        en: 'Systematic zero-reporting and outbreak investigations across 36 woredas.',
        am: 'በ36ቱ የሐረርጌ ወረዳዎች ስልታዊ የዜሮ-በሽታ ክትትል እና የወረርሽኝ ምርመራዎች።',
        om: 'Gabaasa sirnaawaa dhibee-malee fi qorannoo weeraraa aanoolee 36 Harargee keessatti.'
      }
    },
    {
      title: { en: 'Laboratory Evidence', am: 'የላቦራቶሪ ማስረጃ', om: 'Ragaa Laaboraatoorii' },
      desc: { 
        en: 'Confirmatory serology, molecular diagnostics, and pathogen monitoring at HRVL.',
        am: 'በHRVL የማረጋገጫ ሴሮሎጂ፣ ሞለኪውላር ምርመራ እና የበሽታ አምጪ ተህዋስያን ክትትል።',
        om: 'Qorannoo seeroologii mirkaneessaa, molakiyuulaaraa fi hordoffii paatojeenotaa HRVL keessatti.'
      }
    },
    {
      title: { en: 'Spatial GIS & One Health', am: 'የካርታ መረጃና አንድ ጤና', om: 'GIS fi Fayyaa Tokko' },
      desc: { 
        en: 'Geospatial risk mapping and zoonotic cross-sector intelligence for rapid action.',
        am: 'ለፈጣን እርምጃ የጂኦስፓሻል አደጋ ካርታ ስራ እና የዞኦኖቲክ ዘርፈ-ብዙ መረጃ።',
        om: 'Kaartaa balaa teessuma lafaa fi odeeffannoo dhibee beeylada irraa namaatti darbuu.'
      }
    }
  ]
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    title: {
      en: 'Dashboard',
      am: 'ዳሽቦርድ',
      om: 'Daashboordii'
    },
    subtitle: {
      en: 'Operational Situational Picture',
      am: 'የስራ እንቅስቃሴ አጠቃላይ ሁኔታ',
      om: 'Ilaalcha Hojii fi Haala Yeroo'
    },
    purpose: {
      en: 'Start with the operational picture. The dashboard brings the most important surveillance indicators and system summaries together for rapid situational awareness.',
      am: 'የስራ እንቅስቃሴውን አጠቃላይ ሁኔታ በመመልከት ይጀምሩ። ዳሽቦርዱ ዋና ዋና የበሽታ ክትትል አመልካቾችን፣ የወረርሽኝ ሁኔታዎችን እና የላቦራቶሪ ማጠቃለያዎችን ለፈጣን ውሳኔ አሰጣጥ በአንድ ገጽ ላይ ያቀርባል።',
      om: 'Ilaalcha hojii fi haala yeroo qabatamaatiin jalqabaa. Daashboordiin kun agarsiistota hordoffii dhibee ijoo, haala weeraraa fi cuunfaa laaboraatoorii hubannoo fi murtee saffisaaf walitti qaba.'
    },
    narration: {
      en: 'This is Oromia Regional Veterinary Laboratory Surveillance Intelligence Network dashboard. It provides a high-level operational view of disease surveillance activities, laboratory information, disease trends, alerts, and key performance indicators. Use the dashboard to understand the current situation at a glance.',
      am: 'ይህ የሂርና ቀጠናዊ እንስሳት ላቦራቶሪ ዳሽቦርድ ነው። ስለ መስክ ክትትል፣ የላቦራቶሪ ውጤቶች፣ የበሽታ አዝማሚያዎች፣ አስቸኳይ ማስጠንቀቂያዎች እና ዋና የስራ አፈጻጸም መመዘኛዎች አጠቃላይ እይታን ይሰጣል። ወቅታዊውን ሁኔታ በአንክሮ ለመረዳት ዳሽቦርዱን ይጠቀሙ።',
      om: 'Kun Daashboordii HRVL dha. Hojiilee hordoffii dirree, odeeffannoo laaboraatoorii, amala tamsa\'ina dhibee, akeekkachiisaa fi agarsiistuuwwan raawwii hojii gurguddoo irratti hubannoo waligalaa kenna. Haala yeroo ammaa hatattamaan hubachuuf daashboordii kana fayyadamaa.'
    },
    features: {
      en: [
        'WOAH/WAHO animal health surveillance indicators & metrics',
        'Real-time total case, death, and Case Fatality Rate (CFR) counts',
        'Zero-reporting compliance tracking across 36 Hararghe woredas',
        'Epidemic alerts, outbreak signals, and rapid field logs',
        'Operational zone toggles between East & West Hararghe'
      ],
      am: [
        'ዓለም አቀፍና ቀጠናዊ (WOAH/WAHO) የእንስሳት ጤና ክትትል መመዘኛዎች',
        'የታማሚ እንስሳት፣ የሞትና የሞት ምጣኔ (CFR) ቅጽበታዊ ስሌቶች',
        'በ36ቱ የሐረርጌ ወረዳዎች የዜሮ-በሽታ ክትትል ሪፖርት (Zero-reporting) ተገዢነት',
        'ፈጣን የወረርሽኝ ማስጠንቀቂያዎች፣ የህመም ምልክቶች እና የመስክ መዝገቦች',
        'በምስራቅ (21) እና በምዕራብ (15) ሐረርጌ ዞኖች መካከል የመቀያየሪያ አመልካች'
      ],
      om: [
        'Safartuuwwan fi agarsiistota hordoffii fayyaa beeyladaa WOAH/WAHO',
        'Lakkoofsa beeylada dhukkubsatanii, du’anii fi reeshoo du’aa (CFR) yeroo qabatamaa',
        'Hordoffii dhiyeessa gabaasa dhibee-malee (Zero-reporting) aanoolee 36 Harargee',
        'Akeekkachiisa weerara hatattamaa, mallattoolee dhibee fi galmee dirree',
        'Qoodiinsa Godinaalee Harargee Bahaa (21) fi Harargee Dhihaa (15)'
      ]
    },
    targetDataTour: 'dashboard',
    activeTab: 'Dashboard',
    preferredPlacement: 'right'
  },
  {
    id: 'disease-surveillance',
    stepNumber: 2,
    title: {
      en: 'Disease Surveillance',
      am: 'የበሽታ ክትትል',
      om: 'Hordoffii Dhukkubaa'
    },
    subtitle: {
      en: 'Field Case Records & Zero-Reporting',
      am: 'የመስክ የህመም መዝገቦችና ዜሮ-ሪፖርት',
      om: 'Galmee Dhukkubaa Dirree fi Gabaasa Dhibee-Malee'
    },
    purpose: {
      en: 'Disease Surveillance brings field reports and disease information together for systematic monitoring. Track cases, identify trends, monitor alerts, and support early detection and response.',
      am: 'የበሽታ ክትትል ሞጁል የመስክ ሪፖርቶችን እና የበሽታ መረጃዎችን ለስልታዊ ቁጥጥር ያደራጃል። አዳዲስ ህመሞችን ይከታተሉ፣ የስርጭት አዝማሚያዎችን ይለዩ፣ የወረርሽኝ ምልክቶችን በንቃት ይቆጣጠሩ እና ፈጣን የመስክ ምላሽ ይስጡ።',
      om: 'Hordoffiin Dhibee gabaasaalee dirree fi odeeffannoo dhibee hordoffii sirnaawaaf walitti fida. Dhimmoota haaraa hordofaa, amala tamsa\'ina dhibee adda baasaa, akeekkachiisa weeraraa to\'adhaa fi deebii hatattamaa kennaa.'
    },
    narration: {
      en: 'Disease Surveillance brings field reports and disease information together for systematic monitoring. Track cases, identify trends, monitor alerts, and support early detection and response.',
      am: 'የበሽታ ክትትል ሞጁል የመስክ ሪፖርቶችን እና የበሽታ መረጃዎችን ለስልታዊ ቁጥጥር ያደራጃል። አዳዲስ ህመሞችን ይከታተሉ፣ የስርጭት አዝማሚያዎችን ይለዩ፣ የወረርሽኝ ምልክቶችን በንቃት ይቆጣጠሩ እና ፈጣን የመስክ ምላሽ ይስጡ።',
      om: 'Hordoffiin Dhibee gabaasaalee dirree fi odeeffannoo dhibee hordoffii sirnaawaaf walitti fida. Dhimmoota haaraa hordofaa, amala tamsa\'ina dhibee adda baasaa, akeekkachiisa weeraraa to\'adhaa fi deebii hatattamaa kennaa.'
    },
    features: {
      en: [
        'Complete field surveillance record registry with multi-column filtering',
        'Disease occurrence categorization (FMD, PPR, LSD, CBPP, Anthrax, Newcastle)',
        'Active outbreak status tracking and woreda submission timelines',
        'Detailed livestock case, mortality, and at-risk population numbers',
        'Excel, CSV, and printable report export capabilities'
      ],
      am: [
        'የመስክ ክትትል መረጃዎች ሙሉ መዝገብ ከበርካታ ማጣሪያዎች ጋር',
        'የበሽታዎች ምደባ (የአፍ እና እግር፣ ፒ.ፒ.አር፣ ቆዳ እባጭ፣ ጎንደር፣ አንትራክስ፣ ፈንግል)',
        'ንቁ የወረርሽኝ ሁኔታ ክትትል እና የወረዳዎች ሪፖርት አቀራረብ የጊዜ ሰሌዳ',
        'ዝርዝር የእንስሳት ህመም፣ የሞትና ለአደጋ የተጋለጡ እንስሳት ቁጥር',
        'የኤክሴል፣ የCSV እና የታተመ ሪፖርት ማውጣት የሚያስችል ስርዓት'
      ],
      om: [
        'Galmee guutuu hordoffii dirree calaltuu adda addaa waliin',
        'Ramaddii dhibeewwanii (Masaana, PPR, Dhullaa Gogaa, Sombaa, Abbaa Saangaa, Fantoolee)',
        'Hordoffii weerara dhibee jiru fi yeroo gabaasa aanoolee',
        'Lakkoofsa beeylada dhukkubsatee, du’ee fi balaaf saaxilamee bal’inaan',
        'Dandeettii gabaasa Excel, CSV fi maxxansaa baasuu'
      ]
    },
    targetDataTour: 'disease-surveillance',
    activeTab: 'Tables',
    preferredPlacement: 'right'
  },
  {
    id: 'laboratory-analytics',
    stepNumber: 3,
    title: {
      en: 'Laboratory Analytics',
      am: 'የላቦራቶሪ ትንተና',
      om: 'Analitiksii Laaboraatoorii'
    },
    subtitle: {
      en: 'Diagnostic Evidence & Sample Testing',
      am: 'የምርመራ ማስረጃና የናሙና ፍተሻ',
      om: 'Ragaa Qorannoo fi Qorannoo Saamudaa'
    },
    purpose: {
      en: 'Laboratory Analytics connects surveillance with laboratory evidence. Explore test results, positivity patterns, specimen information, and diagnostic trends to strengthen evidence-based decision-making.',
      am: 'የላቦራቶሪ ትንተና የመስክ ክትትልን ከሳይንሳዊ ምርመራ ማስረጃዎች ጋር ያገናኛል። የሴሮሎጂ እና ሞለኪውላር የፍተሻ ውጤቶችን፣ የበሽታ አምጪ ተህዋስያን ፖዘቲቪቲ ምጣኔን እና የናሙና ጥራትን በመገምገም በማስረጃ ላይ የተመሰረተ ውሳኔ ይስጡ።',
      om: 'Analitiksiin Laaboraatoorii hordoffii dirree ragaa qorannoo saayinsawaa waliin walitti hidha. Bu\'aa qorannoo seeroologii fi molakiyuulaaraa, reeshoo poozatiivii paatojeenotaa fi qulqullina saamudaa sakatta\'uun murtee ragaa qabatamaa irratti hundaa\'e kennaa.'
    },
    narration: {
      en: 'Laboratory Analytics connects surveillance with laboratory evidence. Explore test results, positivity patterns, specimen information, and diagnostic trends to strengthen evidence-based decision-making.',
      am: 'የላቦራቶሪ ትንተና የመስክ ክትትልን ከሳይንሳዊ ምርመራ ማስረጃዎች ጋር ያገናኛል። የሴሮሎጂ እና ሞለኪውላር የፍተሻ ውጤቶችን፣ የበሽታ አምጪ ተህዋስያን ፖዘቲቪቲ ምጣኔን እና የናሙና ጥራትን በመገምገም በማስረጃ ላይ የተመሰረተ ውሳኔ ይስጡ።',
      om: 'Analitiksiin Laaboraatoorii hordoffii dirree ragaa qorannoo saayinsawaa waliin walitti hidha. Bu\'aa qorannoo seeroologii fi molakiyuulaaraa, reeshoo poozatiivii paatojeenotaa fi qulqullina saamudaa sakatta\'uun murtee ragaa qabatamaa irratti hundaa\'e kennaa.'
    },
    features: {
      en: [
        'Diagnostic test tracking across Serology (ELISA), Molecular (PCR), and Microbiology',
        'Sample collection logs, preservation status, and cold-chain integrity',
        'Hirna Regional Veterinary Laboratory (HRVL) confirmation benchmarks',
        'Pathogen positivity rate calculations by species and geographic zone',
        'Diagnostic turnaround timelines and confirmatory test verification'
      ],
      am: [
        'የላቦራቶሪ ምርመራ ክትትል በሴሮሎጂ (ELISA)፣ ሞለኪውላር (PCR) እና ማይክሮባዮሎጂ',
        'የናሙና አሰባሰብ መዝገቦች፣ የጥበቃ ሁኔታ እና የቀዝቃዛ ሰንሰለት ጥራት',
        'የሂርና ቀጠናዊ እንስሳት ላቦራቶሪ (HRVL) የማረጋገጫ መመዘኛዎች',
        'የበሽታ አምጪ ተህዋስያን ፖዘቲቪቲ ምጣኔ በእንስሳት ዝርያና በዞን',
        'የምርመራ ማጠናቀቂያ የጊዜ ገደቦችና የማረጋገጫ ውጤቶች'
      ],
      om: [
        'Hordoffii qorannoo Seeroologii (ELISA), Molakiyuulaara (PCR) fi Maaykiroobaayoloojii',
        'Galmee saamudaa, eegumsa qulqullinaa fi qabbana eeguu',
        'Sadarkaa mirkaneessaa Laaboraatoorii Fayyaa Beeyladaa Hirnaa (HRVL)',
        'Herrega reeshoo poozatiivii sanyii beeyladaa fi godinaan',
        'Yeroo xumura qorannoo fi mirkaneessa bu’aa'
      ]
    },
    targetDataTour: 'laboratory-analytics',
    activeTab: 'FAST',
    fastSubTab: 'laboratory',
    preferredPlacement: 'right'
  },
  {
    id: 'gis-intelligence',
    stepNumber: 4,
    title: {
      en: 'GIS Intelligence',
      am: 'የጂአይኤስ ካርታ መረጃ',
      om: 'GIS Intelligence fi Kaartaa'
    },
    subtitle: {
      en: 'Geospatial Outbreak Mapping & Risk Zones',
      am: 'የወረርሽኝ ካርታ ስራና የአደጋ ቀጠናዎች',
      om: 'Kaartaa Dhibee fi Naannoo Balaa'
    },
    purpose: {
      en: 'GIS Intelligence adds the geographic dimension to disease surveillance. Visualize disease distribution, identify spatial patterns and hotspots, and understand where interventions may be needed.',
      am: 'የጂኦስፓሻል መረጃ (GIS) የበሽታ ክትትልን በካርታ መልክ ያሳያል። የበሽታዎችን ጂኦግራፊያዊ ስርጭት ይመልከቱ፣ ከፍተኛ አደጋ ያለባቸውን አካባቢዎች (Hotspots) ይለዩ እና የታለሙ የእንስሳት ህክምና እርምጃዎችን ያቅዱ።',
      om: 'GIS Intelligence hordoffii dhibeetiif sadarkaa teessuma lafaa dabala. Tamsa\'ina dhibee kaartaa irratti ilaalaa, bakkeewwan balaa olaanaa qaban (Hotspots) adda baasaa fi tarkaanfii yaala beeyladaa xiyyeeffannoo qabu karoorsaa.'
    },
    narration: {
      en: 'GIS Intelligence adds the geographic dimension to disease surveillance. Visualize disease distribution, identify spatial patterns and hotspots, and understand where interventions may be needed.',
      am: 'የጂኦስፓሻል መረጃ የበሽታ ክትትልን በካርታ መልክ ያሳያል። የበሽታዎችን ጂኦግራፊያዊ ስርጭት ይመልከቱ፣ ከፍተኛ አደጋ ያለባቸውን አካባቢዎች ይለዩ እና የታለሙ የእንስሳት ህክምና እርምጃዎችን ያቅዱ።',
      om: 'GIS Intelligence hordoffii dhibeetiif sadarkaa teessuma lafaa dabala. Tamsa\'ina dhibee kaartaa irratti ilaalaa, bakkeewwan balaa olaanaa qaban adda baasaa fi tarkaanfii yaala beeyladaa xiyyeeffannoo qabu karoorsaa.'
    },
    features: {
      en: [
        'Interactive Leaflet disease distribution map with coordinate mapping',
        'Hardware-accelerated pulse rings indicating active vs. suspected clusters',
        'Woreda boundary overlays and cross-border fracture line visualization',
        'Environmental weather integration (temperature, humidity, precipitation)',
        'High-resolution PNG map export for operational briefings'
      ],
      am: [
        'የበሽታ ስርጭትን በዝርዝር የሚያሳይ በይነተገናኝ የካርታ ስርዓት',
        'ንቁ እና የተጠረጠሩ የበሽታ ስብስቦችን የሚያሳዩ አንጸባራቂ ቀለበቶች',
        'የወረዳ ወሰኖችና የአካባቢ ድንበሮች ምስላዊ እይታ',
        'የአካባቢ የአየር ንብረት መረጃ (የሙቀት መጠን፣ እርጥበት፣ ዝናብ)',
        'ለስራ ገለጻ የሚሆን ከፍተኛ ጥራት ያለው የካርታ ምስል ማውጫ'
      ],
      om: [
        'Kaartaa wal-qunnamtii raabsa dhibee qindoomina iddoo waliin',
        'Qubeelaawwan calaqqisan kanneen weerara jiru fi shakkame agarsiisan',
        'Daangaa aanoolee fi naannolee kaartaa irratti ilaaluu',
        'Odeeffannoo qilleensaa (hoo’a, jiidhinsa, rooba)',
        'Kaartaa qulqullina olaanaa qabu waltajjii mariif baasuu'
      ]
    },
    targetDataTour: 'gis-intelligence',
    activeTab: 'Map',
    preferredPlacement: 'right'
  },
  {
    id: 'data-analytics',
    stepNumber: 5,
    title: {
      en: 'Data Analytics',
      am: 'የመረጃ ትንተና',
      om: 'Xiinxala Daataa'
    },
    subtitle: {
      en: 'Epidemiological Trends & Patterns',
      am: 'የኤፒዲሚዮሎጂ አዝማሚያዎችና ቅጦች',
      om: 'Jijjiirama fi Amala Dhibee'
    },
    purpose: {
      en: 'Data Analytics transforms surveillance data into meaningful insights. Compare indicators, examine trends, explore relationships, and generate evidence that supports epidemiological analysis and planning.',
      am: 'የመረጃ ትንተና የመስክ መረጃዎችን ወደ ጠቃሚ ተግባራዊ ግንዛቤ ይቀይራል። የኤፒዲሚዮሎጂ አዝማሚያዎችን ይመርምሩ፣ የእንስሳት ዝርያዎችን ስርጭት ያወዳድሩ እና ለቀጠናዊ እቅድ የሚረዱ ሳይንሳዊ ማስረጃዎችን ያመንጩ።',
      om: 'Xiinxalli Daataa ragaa hordoffii gara hubannoo hojiitti jijjiira. Sarara jijjiirama dhibee yeroon qoradhaa, qoodiinsa sanyii beeyladaa walbira qabaa fi ragaa qabatamaa karoora naannoof gargaaru maddisiisaa.'
    },
    narration: {
      en: 'Data Analytics transforms surveillance data into meaningful insights. Compare indicators, examine trends, explore relationships, and generate evidence that supports epidemiological analysis and planning.',
      am: 'የመረጃ ትንተና የመስክ መረጃዎችን ወደ ጠቃሚ ተግባራዊ ግንዛቤ ይቀይራል። የኤፒዲሚዮሎጂ አዝማሚያዎችን ይመርምሩ፣ የእንስሳት ዝርያዎችን ስርጭት ያወዳድሩ እና ለቀጠናዊ እቅድ የሚረዱ ሳይንሳዊ ማስረጃዎችን ያመንጩ።',
      om: 'Xiinxalli Daataa ragaa hordoffii gara hubannoo hojiitti jijjiira. Sarara jijjiirama dhibee yeroon qoradhaa, qoodiinsa sanyii beeyladaa walbira qabaa fi ragaa qabatamaa karoora naannoof gargaaru maddisiisaa.'
    },
    features: {
      en: [
        'Multi-month epidemic trend curves with cubic spline interpolation',
        'Livestock species distribution charts (Bovine, Ovine, Caprine, Equine, Poultry)',
        'Longitudinal Case Fatality Rate (CFR) trend monitoring',
        'Year-over-Year (YoY) comparative surveillance analysis',
        'Data-driven risk stratification for targeted veterinary intervention'
      ],
      am: [
        'የበርካታ ወራት የወረርሽኝ አዝማሚያ የሚያሳዩ የግራፍ መስመሮች',
        'የእንስሳት ዝርያ ስርጭት ቻርቶች (ከብቶች፣ በጎች፣ ፍየሎች፣ አህዮችና ፈረሶች፣ ዶሮዎች)',
        'የረጅም ጊዜ የታማሚዎች የሞት ምጣኔ (CFR) አዝማሚያ ክትትል',
        'ከዓመት ወደ ዓመት የሚደረግ የንጽጽር ክትትል ትንተና (YoY)',
        'ለታለመ የእንስሳት ህክምና ጣልቃ ገብነት በመረጃ የተደገፈ የአደጋ ደረጃ ምደባ'
      ],
      om: [
        'Sarraara jijjiirama weerara dhibee ji’oota hedduu',
        'Chaartii raabsa sanyii beeyladaa (Loon, Hoolaa, Re’ee, Farda, Harree, Lukkuu)',
        'Hordoffii reeshoo du’aa (CFR) yeroo dheeraa',
        'Xiinxala walbira qabaa waggaa-waggaatti (YoY)',
        'Tarkaanfii fayyaa beeyladaa qabatamaa taasisuu'
      ]
    },
    targetDataTour: 'data-analytics',
    activeTab: 'Dashboard',
    preferredPlacement: 'right'
  },
  {
    id: 'reports',
    stepNumber: 6,
    title: {
      en: 'Reports',
      am: 'ይፋዊ ሪፖርቶች',
      om: 'Moojulii Gabaasaa'
    },
    subtitle: {
      en: 'Official SitReps & Communication Outputs',
      am: 'ይፋዊ መግለጫዎችና የውሳኔ አሰጣጥ ውጤቶች',
      om: 'Gabaasa Hojii fi Odeeffannoo Seeraa'
    },
    purpose: {
      en: 'The Reports module turns analyzed information into structured outputs for communication and decision-making. Generate, review, and share surveillance and analytical reports efficiently.',
      am: 'የሪፖርቶች ሞጁል የተተነተኑ መረጃዎችን ወደ ይፋዊ መግለጫዎች እና የውሳኔ አሰጣጥ ሰነዶች ይቀይራል። ወቅታዊ የወረርሽኝ መግለጫዎችን (SitReps)፣ የስታቲስቲክስ ሰንጠረዦችን እና የህትመት ሪፖርቶችን በቅጽበት ያዘጋጁ።',
      om: 'Moojuliin Gabaasaa odeeffannoo xiinxalame gara gabaasa seeraa fi waraqaa murteetti jijjiira. Gabaasa haala yeroo dhibee (SitRep), gabateewwan daataa fi gabaasa maxxansaa saffisaan qopheessaa.'
    },
    narration: {
      en: 'The Reports module turns analyzed information into structured outputs for communication and decision-making. Generate, review, and share surveillance and analytical reports efficiently.',
      am: 'የሪፖርቶች ሞጁል የተተነተኑ መረጃዎችን ወደ ይፋዊ መግለጫዎች እና የውሳኔ አሰጣጥ ሰነዶች ይቀይራል። ወቅታዊ የወረርሽኝ መግለጫዎችን፣ የስታቲስቲክስ ሰንጠረዦችን እና የህትመት ሪፖርቶችን በቅጽበት ያዘጋጁ።',
      om: 'Moojuliin Gabaasaa odeeffannoo xiinxalame gara gabaasa seeraa fi waraqaa murteetti jijjiira. Gabaasa haala yeroo dhibee, gabateewwan daataa fi gabaasa maxxansaa saffisaan qopheessaa.'
    },
    features: {
      en: [
        'Automated AI Epidemiological Situation Report (SitRep) generator',
        'Printable official surveillance bulletins formatted for regional leadership',
        'Structured Excel and CSV data export pipelines',
        'Woreda zero-reporting compliance scorecards and verification audits',
        'Standardized epidemiological summaries for One Health partners'
      ],
      am: [
        'በAI የታገዘ የኤፒዲሚዮሎጂ ወቅታዊ ሁኔታ ሪፖርት (SitRep) አዘጋጅ',
        'ለቀጠናው አመራሮች የተዘጋጀ የሚታተም ይፋዊ የክትትል ቡሌቲን',
        'የተደራጁ የኤክሴልና CSV የመረጃ ማስተላለፊያ መንገዶች',
        'የወረዳዎች ዜሮ-ሪፖርት ተገዢነት የውጤት ካርድና የማረጋገጫ ኦዲት',
        'ለOne Health አጋሮች የተዘጋጁ ደረጃቸውን የጠበቁ ማጠቃለያዎች'
      ],
      om: [
        'Mootora AI gabaasa haala weeraraa (SitRep) ofumaan qopheessu',
        'Maxxansa gabaasa hordoffii hooggana naannoof qophaa’e',
        'Karaa daataa Excel fi CSV gabaasaaf qindaa’e',
        'Kaardii qabxii gabaasa dhibee-malee aanoolee fi odiitii mirkaneessaa',
        'Cuunfaa sirnaawaa hirmaattota One Health tiif qophaa’e'
      ]
    },
    targetDataTour: 'reports',
    activeTab: 'Dashboard',
    preferredPlacement: 'right'
  },
  {
    id: 'digital-toolbox',
    stepNumber: 7,
    title: {
      en: 'Digital Toolbox',
      am: 'የመስክ መሣሪያዎች',
      om: 'Meeshaalee Hojii Dirree'
    },
    subtitle: {
      en: 'Practical Field Epidemiology Tools',
      am: 'ተግባራዊ የመስክ ኤፒዲሚዮሎጂ መሣሪያዎች',
      om: 'Meeshaalee Hojii Dirree Qabatamaa'
    },
    purpose: {
      en: 'The Digital Toolbox provides practical resources for surveillance, analysis, field operations, and public-health work. Access tools, templates, reference materials, and other resources from one place.',
      am: 'ዲጂታል መሣሪያዎች ለመስክ ኤፒዲሚዮሎጂስቶች እና ለእንስሳት ጤና ባለሙያዎች ተግባራዊ እገዛን ይሰጣሉ። የወረርሽኝ ምርመራ ቅጾችን፣ የናሙና አሰባሰብ መመሪያዎችን፣ የክትባት መርሃ-ግብርን እና ያለ ኢንተርኔት የሚሰራውን የመስክ ማመሳሰያ ይጠቀሙ።',
      om: 'Meeshaaleen Dijitaalaa ogeeyyii fayyaa beeyladaa fi qorattoota dirreetiif deeggarsa qabatamaa kennu. Unkaalee qorannoo weeraraa, qajeelfama saamuda funaanuu, kaalaandarii talaallii fi qindoomina toora-malee hojjetu (FieldSync) fayyadamaa.'
    },
    narration: {
      en: 'The Digital Toolbox provides practical resources for surveillance, analysis, field operations, and public-health work. Access tools, templates, reference materials, and other resources from one place.',
      am: 'ዲጂታል መሣሪያዎች ለመስክ ኤፒዲሚዮሎጂስቶች እና ለእንስሳት ጤና ባለሙያዎች ተግባራዊ እገዛን ይሰጣሉ። የወረርሽኝ ምርመራ ቅጾችን፣ የናሙና አሰባሰብ መመሪያዎችን፣ የክትባት መርሃ-ግብርን እና የመስክ ማመሳሰያዎችን በአንድ ቦታ ያግኙ።',
      om: 'Meeshaaleen Dijitaalaa ogeeyyii fayyaa beeyladaa fi qorattoota dirreetiif deeggarsa qabatamaa kennu. Unkaalee qorannoo weeraraa, qajeelfama saamuda funaanuu, kaalaandarii talaallii fi qindoomina toora-malee hojjetu bakka tokkotti argadhaa.'
    },
    features: {
      en: [
        'Digital field outbreak investigation workflow and structured forms',
        'Sample collection protocols, tube labeling, and shipment manifests',
        'FieldSync offline resilience with automatic sync when reconnected',
        'Vaccination campaign calendar and coverage tracking by woreda',
        'One Health zoonotic cross-sector risk screening calculators'
      ],
      am: [
        'የዲጂታል የመስክ ወረርሽኝ ምርመራ ሂደትና የተደራጁ ቅጾች',
        'የናሙና አሰባሰብ መመሪያዎች፣ የቱቦ መለያ ስያሜና የጭነት ሰነዶች',
        'ኢንተርኔት በሌለበት ጊዜ የሚሰራ እና ሲገናኝ በራሱ የሚያመሳስል ስርዓት (FieldSync)',
        'የእንስሳት ክትባት ዘመቻ የቀን መቁጠሪያና የወረዳዎች የሽፋን ክትትል',
        'የOne Health የዞኦኖቲክ አደጋ መገምገሚያ ስሌቶች'
      ],
      om: [
        'Adeemsa qorannoo weerara dirree fi unkaalee qindaa’an',
        'Qajeelfama saamuda funaanuu, asxaa gochuu fi erguu',
        'FieldSync toora interneetii malee hojjetu fi yeroo wal-qunnamtii ofumaan qindeessu',
        'Kaalaandarii duula talaallii fi hordoffii haguuggaa aanaatiin',
        'Shallaggii balaa dhibee beeylada irraa namaatti darbuu (One Health)'
      ]
    },
    targetDataTour: 'digital-toolbox',
    activeTab: 'FieldToolkit',
    preferredPlacement: 'right'
  },
  {
    id: 'learning-centre',
    stepNumber: 8,
    title: {
      en: 'Learning Centre',
      am: 'የስልጠና ማዕከል',
      om: 'Giddugala Barumsaa'
    },
    subtitle: {
      en: 'Training, Guidelines & SOPs',
      am: 'ስልጠና፣ መመሪያዎችና የላቦራቶሪ አሰራሮች (SOPs)',
      om: 'Leenjii, Qajeelfama fi SOPs'
    },
    purpose: {
      en: 'The Learning Centre supports continuous learning and professional development. Explore training materials, epidemiological resources, analytical guidance, and practical learning content.',
      am: 'የስልጠና ማዕከሉ የባለሙያዎችን አቅም ለመገንባት የተዘጋጀ ነው። የFAST በሽታዎች አካዳሚን፣ መደበኛ የህመም መለያ ትርጓሜዎችን (Case definitions)፣ የባዮሴፍቲ እና የላቦራቶሪ ስራ መመሪያዎችን (SOPs) ያግኙ።',
      om: 'Giddugalli Barumsaa guddina dandeettii ogeessummaatiif qophaa\'e. Akaadaamii dhibee FAST, hiika mallattoolee yaalaa (Case definitions), qajeelfama eegumsa baayoo fi adeemsa hojii laaboraatoorii (SOPs) argadhaa.'
    },
    narration: {
      en: 'The Learning Centre supports continuous learning and professional development. Explore training materials, epidemiological resources, analytical guidance, and practical learning content.',
      am: 'የስልጠና ማዕከሉ የባለሙያዎችን አቅም ለመገንባት የተዘጋጀ ነው። የFAST በሽታዎች አካዳሚን፣ መደበኛ የህመም መለያ ትርጓሜዎችን፣ የባዮሴፍቲ እና የላቦራቶሪ ስራ መመሪያዎችን ያግኙ።',
      om: 'Giddugalli Barumsaa guddina dandeettii ogeessummaatiif qophaa\'e. Akaadaamii dhibee FAST, hiika mallattoolee yaalaa, qajeelfama eegumsa baayoo fi adeemsa hojii laaboraatoorii argadhaa.'
    },
    features: {
      en: [
        'FAST Disease Surveillance Academy with interactive clinical training modules',
        'Standardized clinical case definitions aligned with FAO and WOAH protocols',
        'Biosafety, biosecurity, and cold-chain transport standard operating procedures',
        'Veterinary field guidelines and syndromic surveillance rubrics',
        'Curated repository of scientific references and epidemiological manuals'
      ],
      am: [
        'የFAST በሽታ ክትትል አካዳሚ ከበይነተገናኝ የህክምና ስልጠና ክፍሎች ጋር',
        'ከFAO እና WOAH ፕሮቶኮሎች ጋር የተጣጣሙ መደበኛ የህመም ትርጓሜዎች',
        'የባዮሴፍቲ፣ ባዮሴኪዩሪቲና የቀዝቃዛ ሰንሰለት መደበኛ የሥራ ሂደቶች (SOPs)',
        'የእንስሳት ህክምና የመስክ መመሪያዎችና የበሽታ ምልክቶች ክትትል ሰነዶች',
        'የተመረጡ የሳይንሳዊ ማጣቀሻዎችና የኤፒዲሚዮሎጂ መመሪያዎች ማከማቻ'
      ],
      om: [
        'Akaadaamii Hordoffii FAST leenjii yaalaa qindaa’aa waliin',
        'Hiika dhibee yaalaa idil-addunyaa FAO fi WOAH waliin walsimu',
        'Qajeelfama eegumsa baayoo (Biosafety) fi geejjiba qabbanaa (SOPs)',
        'Qajeelfama dirree yaala beeyladaa fi hordoffii mallattoolee',
        'Galmee qorannoo saayinsii fi kitaabolee epidemiology'
      ]
    },
    targetDataTour: 'learning-centre',
    activeTab: 'FAST',
    fastSubTab: 'training',
    preferredPlacement: 'right'
  },
  {
    id: 'administration',
    stepNumber: 9,
    title: {
      en: 'Administration',
      am: 'የስርዓት አስተዳደር',
      om: 'Bulchiinsa Sirnichaa'
    },
    subtitle: {
      en: 'System Governance & Configuration',
      am: 'የስርዓት አስተዳደርና ውቅረት',
      om: 'Bulchiinsa Sirnaa fi Qindaa’ina'
    },
    purpose: {
      en: 'Administration provides authorized users with tools to manage the platform, users, permissions, configurations, and operational settings. Access to administrative functions depends on your assigned role.',
      am: 'የአስተዳደር ክፍሉ የስርዓቱን ቅንብሮች፣ የተጠቃሚ ሚናዎችን፣ የቋንቋ ምርጫዎችን እና ደህንነትን ለመቆጣጠር ያገለግላል። የአስተዳደር መብቶች በተሰጠዎት የስራ ድርሻ መሰረት ይወሰናሉ።',
      om: 'Kutaan Bulchiinsaa qindaa\'ina sirnichaa, gahee fayyadamtootaa, filannoo afaanii fi nageenya to\'achuuf tajaajila. Mirgi bulchiinsaa gahee hojii isiniif kenname irratti hundaa\'a.'
    },
    narration: {
      en: 'Administration provides authorized users with tools to manage the platform, users, permissions, configurations, and operational settings. Access to administrative functions depends on your assigned role.',
      am: 'የአስተዳደር ክፍሉ የስርዓቱን ቅንብሮች፣ የተጠቃሚ ሚናዎችን፣ የቋንቋ ምርጫዎችን እና ደህንነትን ለመቆጣጠር ያገለግላል። የአስተዳደር መብቶች በተሰጠዎት የስራ ድርሻ መሰረት ይወሰናሉ።',
      om: 'Kutaan Bulchiinsaa qindaa\'ina sirnichaa, gahee fayyadamtootaa, filannoo afaanii fi nageenya to\'achuuf tajaajila. Mirgi bulchiinsaa gahee hojii isiniif kenname irratti hundaa\'a.'
    },
    features: {
      en: [
        'Role-based access control (Veterinary Officers, Epidemiologists, Laboratory Analysts, Administrators)',
        'Multi-language localization (English, Afaan Oromoo, Amharic)',
        'Accessible display themes with high-contrast day and night palettes',
        'Acoustic telemetry audio feedback settings for field entry confirmation',
        'Progressive Web App (PWA) offline installation management'
      ],
      am: [
        'በሚና ላይ የተመሰረተ የተጠቃሚ ፈቃድ (የእንስሳት ሐኪሞች፣ ኤፒዲሚዮሎጂስቶች፣ የላቦራቶሪ ባለሙያዎች፣ አስተዳዳሪዎች)',
        'ባለብዙ ቋንቋ አጠቃቀም (እንግሊዝኛ፣ አፋን ኦሮሞ፣ አማርኛ)',
        'ከፍተኛ ንፅፅር ያላቸው የቀንና የሌሊት የቀለም ገጽታዎች',
        'ለመስክ መረጃ መግቢያ ማረጋገጫ የሚያገለግሉ የድምፅ ቅንብሮች',
        'ከመስመር ውጭ የሚሰራ የPWA መተግበሪያ ጭነት አስተዳደር'
      ],
      om: [
        'Hayyama fayyadamaa gahee irratti hundaa’e (Ogeeyyii Fayyaa, Epidemiologists, Ogeeyyii Laaboraatorii, Bulchitoota)',
        'Afaanota hedduu (Ingiliffa, Afaan Oromoo, Amaariffa)',
        'Haala ifa guyyaa fi dukkana halkan ifa ta’e',
        'Qindaa’ina sagalee mirkaneessa galmee dirree',
        'Bulchiinsa fe’iinsa PWA kan toora malee hojjetu'
      ]
    },
    targetDataTour: 'administration',
    activeTab: 'Dashboard',
    requiresAdmin: true,
    preferredPlacement: 'right'
  },
  {
    id: 'vision',
    stepNumber: 10,
    title: {
      en: 'Vision',
      am: 'ራዕይ',
      om: 'Mul’ata'
    },
    subtitle: {
      en: 'From Data to Intelligence. From Intelligence to Action.',
      am: 'ከመረጃ ወደ ግንዛቤ። ከግንዛቤ ወደ ፈጣን እርምጃ።',
      om: 'Daataa irraa gara Hubannootti. Hubannoo irraa gara Tarkaanfiitti.'
    },
    purpose: {
      en: 'HRVL is building a connected pathway from data to intelligence, and from intelligence to action. By integrating surveillance, laboratory evidence, analytics, GIS, reporting, and learning, the platform supports stronger One Health decision-making. One Platform. One Health. One Mission.',
      am: 'የሂርና ቀጠናዊ ላቦራቶሪ (HRVL) ከመስክ መረጃ ወደ ሳይንሳዊ ግንዛቤ፣ ከግንዛቤ ደግሞ ወደ ፈጣን እርምጃ የሚወስድ ዘመናዊ አሰራር እየገነባ ነው። የመስክ ክትትልን፣ የላቦራቶሪ ማስረጃን፣ ጂአይኤስን እና ስልጠናን በማቀናጀት የ"አንድ ጤና" (One Health) አሰራርን ያጠናክራል። አንድ መድረክ • አንድ ጤና • አንድ ተልዕኮ።',
      om: 'Laaboraatooriin Naannoo Hirnaa (HRVL) daataa dirree irraa gara hubannoo saayinsawaatti, hubannoo irraa immoo gara tarkaanfii saffisaatti karaa ceesisu ijaaraa jira. Hordoffii dirree, ragaa laaboraatoorii, GIS fi leenjii walitti qindeessuun yaada "Fayyaa Tokko" (One Health) ni cimsa. Waltajjii Tokko • Fayyaa Tokko • Ergama Tokko.'
    },
    narration: {
      en: 'HRVL is building a connected pathway from data to intelligence, and from intelligence to action. By integrating surveillance, laboratory evidence, analytics, GIS, reporting, and learning, the platform supports stronger One Health decision-making. One Platform. One Health. One Mission.',
      am: 'የሂርና ቀጠናዊ ላቦራቶሪ ከመስክ መረጃ ወደ ሳይንሳዊ ግንዛቤ፣ ከግንዛቤ ደግሞ ወደ ፈጣን እርምጃ የሚወስድ ዘመናዊ አሰራር እየገነባ ነው። የመስክ ክትትልን፣ የላቦራቶሪ ማስረጃን፣ ጂአይኤስን እና ስልጠናን በማቀናጀት የ"አንድ ጤና" አሰራርን ያጠናክራል። አንድ መድረክ • አንድ ጤና • አንድ ተልዕኮ።',
      om: 'Laaboraatooriin Naannoo Hirnaa daataa dirree irraa gara hubannoo saayinsawaatti, hubannoo irraa immoo gara tarkaanfii saffisaatti karaa ceesisu ijaaraa jira. Hordoffii dirree, ragaa laaboraatoorii, GIS fi leenjii walitti qindeessuun yaada Fayyaa Tokko ni cimsa. Waltajjii Tokko • Fayyaa Tokko • Ergama Tokko.'
    },
    features: {
      en: [
        'Integrated surveillance connecting frontline animal health posts to regional reference laboratories',
        'Evidence-informed decision-making for timely quarantine and ring vaccination',
        'Digital transformation modernizing paper registries into real-time surveillance',
        'One Health collaboration protecting pastoral livestock and human public health',
        'Regional scalability safeguarding livestock value chains across Hararghe and beyond'
      ],
      am: [
        'የፊት መስመር የእንስሳት ጤና ኬላዎችን ከቀጠናው ማዕከላዊ ላቦራቶሪ የሚያገናኝ የተቀናጀ ክትትል',
        'ወቅታዊ የኳረንቲንና የዙሪያ ክትባት ውሳኔዎችን ለመስጠት በማስረጃ የተደገፈ ስርዓት',
        'የወረቀት መዝገቦችን ወደ ቅጽበታዊ ዲጂታል ክትትል የቀየረ ዘመናዊ አሰራር',
        'የአርብቶ አደሩን እንስሳትና የህብረተሰብ ጤና የሚጠብቅ የOne Health ትብብር',
        'በሐረርጌና አካባቢው የእንስሳት ሀብት እሴት ሰንሰለትን የሚጠብቅ ተደራሽ ስርዓት'
      ],
      om: [
        'Hordoffii qindaa’aa buufataalee fayyaa beeyladaa dirree laaboraatoorii olaanaa waliin walitti hidhu',
        'Murtii ragaa irratti hundaa’e yeroon talaallii marsaa fi tursiisa (quarantine) kennuuf',
        'Jijjiirama dijitaalaa galmee waraqaa gara hordoffii yeroo qabatamaatti jijjiire',
        'Walta’iinsa One Health beeylada horsiisee bultootaa fi fayyaa uummataa eegu',
        'Guddina naannoo Harargee fi isaa olii eegumsa bu’aa beeyladaa mirkaneessu'
      ]
    },
    targetDataTour: 'vision',
    activeTab: 'Dashboard',
    preferredPlacement: 'center',
    isVisionStep: true
  }
];

export const TOUR_COMPLETION_CONTENT = {
  title: {
    en: 'Tour Complete',
    am: 'የመመሪያ ጉብኝቱ ተጠናቋል',
    om: 'Daawwannaan Qajeelfamaa Xumurameera'
  },
  subtitle: {
    en: 'You are now ready to explore the HRVL platform.',
    am: 'አሁን የHRVL ዲጂታል መድረክን ለመጠቀም ዝግጁ ነዎት።',
    om: 'Amma waltajjii dijitaalaa HRVL fayyadamuuf qophooftaniittu.'
  },
  mottoTitle: {
    en: 'One Platform • One Health • One Mission',
    am: 'አንድ መድረክ • አንድ ጤና • አንድ ተልዕኮ',
    om: 'Waltajjii Tokko • Fayyaa Tokko • Ergama Tokko'
  },
  mottoDesc: {
    en: 'From Field Data to Spatial Intelligence. From Intelligence to Rapid One Health Action.',
    am: 'ከመስክ መረጃ ወደ ጂኦስፓሻል ግንዛቤ። ከግንዛቤ ወደ ፈጣን የ"አንድ ጤና" እርምጃ።',
    om: 'Daataa Dirree irraa gara Hubannoo GIS tti. Hubannoo irraa gara Tarkaanfii Fayyaa Tokko Saffisaatti.'
  },
  exploreButton: {
    en: 'Explore Platform',
    am: 'መድረኩን ያስሱ',
    om: 'Waltajjii Sakatta’i'
  },
  replayButton: {
    en: 'Take Tour Again',
    am: 'ጉብኝቱን በድጋሚ ይውሰዱ',
    om: 'Imala Lammata Fudhadhu'
  }
};

export const ONBOARDING_STORAGE_KEY = 'hrvl_onboarding_completed';
export const ONBOARDING_DONT_SHOW_KEY = 'hrvl_onboarding_dont_show_again';
