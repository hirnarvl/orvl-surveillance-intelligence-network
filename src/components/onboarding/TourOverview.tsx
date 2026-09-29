import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  CheckCircle2, 
  FlaskConical, 
  TrendingUp, 
  MapPin, 
  FileText, 
  BrainCircuit, 
  ShieldCheck, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { Locale } from '../../types';
import { MultilingualText, MultilingualList } from './TourConfig';
import { TourLanguageSelector } from './TourLanguageSelector';
import { TourVoiceControls } from './TourVoiceControls';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { voiceService, SpeechState } from '../../services/voiceService';
import { soundEngine } from '../../utils/sound';

interface TourOverviewProps {
  isOpen: boolean;
  locale: Locale;
  voiceEnabled: boolean;
  onSelectLocale: (locale: Locale) => void;
  onToggleVoice: (enabled: boolean) => void;
  onClose: () => void;
  onStartTour: () => void;
}

interface OverviewStage {
  id: string;
  stageNumber: number;
  title: MultilingualText;
  category: MultilingualText;
  description: MultilingualText;
  narration: MultilingualText;
  highlights: MultilingualList;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  statLabel: MultilingualText;
  statValue: MultilingualText;
}

const WORKFLOW_STAGES: OverviewStage[] = [
  {
    id: 'field-surveillance',
    stageNumber: 1,
    title: {
      en: 'Field Surveillance',
      am: 'የመስክ ክትትል',
      om: 'Hordoffii Dirree'
    },
    category: {
      en: 'Signal Ingestion',
      am: 'የመረጃ ቅበላ',
      om: 'Odeeffannoo Funaanuu'
    },
    description: {
      en: 'Frontline animal health posts and woreda veterinary clinics capture clinical observations and outbreak signals across East and West Hararghe.',
      am: 'የእንስሳት ጤና ኬላዎች እና የወረዳ የእንስሳት ክሊኒኮች በምስራቅና ምዕራብ ሐረርጌ የህመም ምልክቶችን እና የወረርሽኝ መረጃዎችን ይሰበስባሉ።',
      om: 'Buufataaleen fayyaa beeyladaa fi kiliniikonni aanaa mallattoolee dhibee fi weerara Harargee Bahaa fi Dhihaa keessatti funaanu.'
    },
    narration: {
      en: 'Field Surveillance captures frontline veterinary observations and zero-reporting across 36 Hararghe woredas for early signal detection.',
      am: 'የመስክ ክትትል በ36 የሐረርጌ ወረዳዎች ውስጥ የመጀመሪያ ደረጃ የእንስሳት ህክምና ምልከታዎችንና ዜሮ-ሪፖርቶችን ለቅድመ ማስጠንቀቂያ ይሰበስባል።',
      om: 'Hordoffii dirree mallattoolee fayyaa beeyladaa fi gabaasa-zeeroo aanoolee Harargee 36 keessatti saffisaan adda baasuuf funaana.'
    },
    highlights: {
      en: [
        'Syndromic disease detection (FMD, PPR, LSD, CBPP, Anthrax, Newcastle)',
        'Digital field investigation reports with mobile-first collection',
        'Zero-reporting compliance verification from 36 woredas'
      ],
      am: [
        'የበሽታ ምልክቶች ልየታ (FMD, PPR, LSD, CBPP, Anthrax, Newcastle)',
        'በሞባይል የተደገፈ የዲጂታል የመስክ ምርመራ ሪፖርቶች',
        'ከ36 ወረዳዎች የዜሮ-ሪፖርት ተገዢነት ማረጋገጫ'
      ],
      om: [
        'Mallattoolee dhibee adda baasuu (FMD, PPR, LSD, CBPP, Abbaa Saangaa, ND)',
        'Gabaasa qorannoo dirree dijitaalaa mobaayilaan',
        'Mirkaneessa gabaasa-zeeroo aanoolee 36 irraa'
      ]
    },
    icon: Activity,
    accentColor: 'from-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400',
    statLabel: { en: 'Reporting Woredas', am: 'ሪፖርት የሚያደርጉ ወረዳዎች', om: 'Aanoolee Gabaasan' },
    statValue: { en: '36 Woredas', am: '36 ወረዳዎች', om: 'Aanoolee 36' }
  },
  {
    id: 'data-quality',
    stageNumber: 2,
    title: {
      en: 'Data Quality & Validation',
      am: 'የመረጃ ጥራትና ማረጋገጫ',
      om: 'Qulqullina Daataa fi Mirkaneessa'
    },
    category: {
      en: 'Integrity Assurance',
      am: 'የጥራት ቁጥጥር',
      om: 'Eegumsa Qulqullinaa'
    },
    description: {
      en: 'Incoming records undergo validation checks for epidemiological consistency, GPS coordinates, dates, and livestock species population bounds.',
      am: 'የሚገቡ መረጃዎች የኤፒዲሚዮሎጂ ወጥነት፣ የGPS መጋጠሚያዎች፣ ቀናት እና የእንስሳት ዝርያ ቁጥሮች ትክክለኛነት ይረጋገጣል።',
      om: 'Daataan dhufe walsimsiisa epidemiology, qindoomina GPS, guyyoota fi lakkoofsa beeyladaaf ni qoratama.'
    },
    narration: {
      en: 'Data Quality and Validation ensures incoming field records are verified for geographical accuracy and epidemiological consistency.',
      am: 'የመረጃ ጥራትና ማረጋገጫ የመስክ መዝገቦች ጂኦግራፊያዊ ትክክለኛነትና የኤፒዲሚዮሎጂ ወጥነት ያላቸው መሆኑን ያረጋግጣል።',
      om: 'Qulqullina daataa mirkaneessuun odeeffannoon dirree sirrii ta’uu fi teessuma lafaan walsimuu isaa mirkaneessa.'
    },
    highlights: {
      en: [
        'Offline caching with automatic bidirectional cloud reconciliation',
        'Geocoding bounds check for Hararghe administrative woredas',
        'Duplicate detection and case definition standardization'
      ],
      am: [
        'ከመስመር ውጭ የሚሰራና ሲገናኝ ራሱን በራሱ የሚያመሳስል ስርዓት',
        'የሐረርጌ ወረዳዎች የጂኦኮዲንግ ወሰን ትክክለኛነት ፍተሻ',
        'ተደጋጋሚ መረጃዎችን ማስወገድና የበሽታ ትርጓሜዎችን ማመሳከር'
      ],
      om: [
        'Kuusaa toora malee hojjetu fi ofumaan wal-simu',
        'Qorannoo daangaa teessuma lafaa aanoolee Harargee',
        'Daataa walfakkaatu adda baasuu fi hiika dhibee mirkaneessuu'
      ]
    },
    icon: CheckCircle2,
    accentColor: 'from-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-400',
    statLabel: { en: 'Reconciliation', am: 'የመረጃ ማመሳከር', om: 'Mirkaneessa' },
    statValue: { en: '100% Verified', am: '100% የተረጋገጠ', om: '100% Mirkanaa’e' }
  },
  {
    id: 'laboratory-evidence',
    stageNumber: 3,
    title: {
      en: 'Laboratory Evidence',
      am: 'የላቦራቶሪ ማስረጃ',
      om: 'Ragaa Laaboraatorii'
    },
    category: {
      en: 'Confirmatory Diagnostics',
      am: 'የማረጋገጫ ምርመራ',
      om: 'Qorannoo Mirkaneessaa'
    },
    description: {
      en: 'Hirna Regional Veterinary Laboratory performs confirmatory serological, molecular (PCR), and microbiological testing to definitively identify pathogens.',
      am: 'የሂርና ቀጠናዊ እንስሳት ላቦራቶሪ በሽታ አምጪ ተህዋስያንን ለመለየት የሴሮሎጂ፣ ሞለኪውላር (PCR) እና ማይክሮባዮሎጂ ምርመራዎችን ያካሂዳል።',
      om: 'Laaboraatorii Hirnaa (HRVL) qorannoo Seeroologii, PCR fi Maaykiroobaayoloojii dhibee mirkaneessuuf raawwata.'
    },
    narration: {
      en: 'Laboratory Evidence connects field surveillance with confirmatory testing at Hirna Regional Veterinary Laboratory for definitive diagnosis.',
      am: 'የላቦራቶሪ ማስረጃ የመስክ ክትትልን በሂርና የእንስሳት ላቦራቶሪ ከሚደረግ የማረጋገጫ ምርመራ ጋር ያገናኛል።',
      om: 'Ragaa laaboraatorii hordoffii dirree qorannoo mirkaneessaa HRVL waliin walitti hidhuun dhibee adda baasa.'
    },
    highlights: {
      en: [
        'ELISA and PCR diagnostic verification workflows',
        'Sample collection chain-of-custody and cold-chain monitoring',
        'Positivity rates and diagnostic turnaround benchmark tracking'
      ],
      am: [
        'የELISA እና PCR የምርመራ ማረጋገጫ የሥራ ሂደቶች',
        'የናሙና አያያዝ እና የቀዝቃዛ ሰንሰለት ጥራት ክትትል',
        'የፖዘቲቪቲ ምጣኔ እና የምርመራ ማጠናቀቂያ ጊዜ መለኪያዎች'
      ],
      om: [
        'Adeemsa mirkaneessa qorannoo ELISA fi PCR',
        'Eegumsa saamudaa fi qabbana eeguu',
        'Reeshoo poozatiivii fi yeroo xumura qorannoo'
      ]
    },
    icon: FlaskConical,
    accentColor: 'from-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400',
    statLabel: { en: 'Lab Test Panels', am: 'የምርመራ ፓነሎች', om: 'Gosa Qorannoo' },
    statValue: { en: 'ELISA • PCR • Culture', am: 'ELISA • PCR • ካልቸር', om: 'ELISA • PCR • Kaalcherii' }
  },
  {
    id: 'epidemiological-analysis',
    stageNumber: 4,
    title: {
      en: 'Epidemiological Analysis',
      am: 'የኤፒዲሚዮሎጂ ትንተና',
      om: 'Xiinxala Epidemiology'
    },
    category: {
      en: 'Advanced Analytics',
      am: 'የላቀ ትንተና',
      om: 'Xiinxala Olaanaa'
    },
    description: {
      en: 'Cross-tabulation of temporal incidence trends, species vulnerability curves, and longitudinal Case Fatality Rates (CFR) to isolate emerging outbreaks.',
      am: 'የጊዜያዊ ክስተቶች አዝማሚያ፣ የእንስሳት ተጋላጭነት እና የሞት ምጣኔ (CFR) ትንተና በማድረግ ወረርሽኞችን ይለያል።',
      om: 'Jijjiirama dhibee yeroo, saaxilamummaa sanyii beeyladaa fi reeshoo du’aa (CFR) qorachuun weerara adda baasa.'
    },
    narration: {
      en: 'Epidemiological Analysis models incidence curves, species vulnerability, and case fatality rates to isolate emerging epidemic patterns.',
      am: 'የኤፒዲሚዮሎጂ ትንተና የህመም ስርጭት ኩርባዎችን፣ የእንስሳት ተጋላጭነትንና የሞት ምጣኔዎችን በማስላት የወረርሽኝ አዝማሚያዎችን ይለያል።',
      om: 'Xiinxalli epidemiology jijjiirama weeraraa, saaxilamummaa beeyladaa fi reeshoo du’aa qorachuun haala dhibee hubachiisa.'
    },
    highlights: {
      en: [
        'Epi-curve temporal modeling with cubic spline tracking',
        'Livestock species distribution breakdowns and herd risk scores',
        'Year-over-Year (YoY) comparative epidemic trajectory analysis'
      ],
      am: [
        'የኤፒዲሚዮሎጂ የጊዜ ኩርባ ሞዴሊንግ ስሌት',
        'የእንስሳት ዝርያ ስርጭት እና የመንጋ አደጋ ደረጃዎች',
        'ከዓመት ወደ ዓመት የሚደረግ የንጽጽር ወረርሽኝ ትንተና'
      ],
      om: [
        'Moodela sarraara weerara dhibee yeroo',
        'Qoodiinsa sanyii beeyladaa fi sadarkaa balaa bushaayee',
        'Xiinxala walbira qabaa waggaa-waggaatti (YoY)'
      ]
    },
    icon: TrendingUp,
    accentColor: 'from-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400',
    statLabel: { en: 'Metrics Analyzed', am: 'የተተነተኑ መለኪያዎች', om: 'Safartuu Xiinxalame' },
    statValue: { en: 'Incidence • CFR • Morbidity', am: 'ክስተት • CFR • ሞርቢዲቲ', om: 'Dhibee • CFR • Du’a' }
  },
  {
    id: 'gis-spatial-intelligence',
    stageNumber: 5,
    title: {
      en: 'GIS / Spatial Intelligence',
      am: 'የጂኦስፓሻል ካርታ መረጃ',
      om: 'Odeeffannoo Kaartaa GIS'
    },
    category: {
      en: 'Geospatial Intelligence',
      am: 'የቦታ መረጃ ግንዛቤ',
      om: 'Hubannoo Teessuma Lafaa'
    },
    description: {
      en: 'Geospatial disease mapping pinpoints active outbreak hotspots, transmission corridors along pastoral migration routes, and climatic risk variables.',
      am: 'የካርታ መረጃ ንቁ የወረርሽኝ ማዕከሎችን፣ በእንስሳት ዝውውር መስመሮች ላይ ያሉ የመተላለፊያ መንገዶችንና የአየር ንብረት አደጋዎችን ያሳያል።',
      om: 'Kaartaan dhibee iddoo weerara jiru, daandii socho’a beeyladaa fi balaa qilleensaa agarsiisa.'
    },
    narration: {
      en: 'GIS Spatial Intelligence maps outbreak clusters and pastoral transmission corridors to uncover geographical hotspots.',
      am: 'የጂኦስፓሻል ካርታ መረጃ የወረርሽኝ ስብስቦችንና የእንስሳት እንቅስቃሴ መስመሮችን በካርታ በማሳየት ቁልፍ የአደጋ ቦታዎችን ያሳያል።',
      om: 'Odeeffannoon Kaartaa GIS iddoo dhibeen itti baay’atee fi daandii daddarbasa beeyladaa kaartaan ifa godha.'
    },
    highlights: {
      en: [
        'Interactive outbreak coordinate mapping with cluster rings',
        'Weather telemetry overlays (precipitation, temp, humidity)',
        'Cross-woreda vulnerability corridors and risk zone categorization'
      ],
      am: [
        'የወረርሽኝ መጋጠሚያዎችን የሚያሳይ በይነተገናኝ ካርታ ከስብስብ ቀለበቶች ጋር',
        'የአየር ሁኔታ መረጃዎች (ዝናብ፣ የሙቀት መጠን፣ እርጥበት)',
        'የወረዳዎች ተጋላጭነት መስመሮችና የአደጋ ቀጠናዎች ምደባ'
      ],
      om: [
        'Kaartaa wal-qunnamtii iddoo weeraraa fi qubeelaa calaqqisu',
        'Odeeffannoo qilleensaa (rooba, hoo’a, jiidhinsa)',
        'Daandii saaxilamummaa aanoolee fi qoodiinsa balaa'
      ]
    },
    icon: MapPin,
    accentColor: 'from-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400',
    statLabel: { en: 'Spatial Coverage', am: 'የሽፋን ቀጠና', om: 'Haguuggaa Kaartaa' },
    statValue: { en: 'East & West Hararghe', am: 'ምስራቅና ምዕራብ ሐረርጌ', om: 'Harargee Bahaa fi Dhihaa' }
  },
  {
    id: 'reporting',
    stageNumber: 6,
    title: {
      en: 'Reporting & Dissemination',
      am: 'ሪፖርትና መረጃ ማጋራት',
      om: 'Gabaasa fi Qoodiinsa'
    },
    category: {
      en: 'Automated Outputs',
      am: 'አውቶሜትድ ውጤቶች',
      om: 'Bu’aa Ofumaan Qophaa’u'
    },
    description: {
      en: 'Immediate generation of automated AI Situation Reports (SitReps), structured Excel exports, and printable official surveillance bulletins.',
      am: 'በAI የታገዙ የወቅቱ ሁኔታ ሪፖርቶች (SitReps)፣ የኤክሴል መረጃዎችና የሚታተሙ ይፋዊ የክትትል ቡሌቲኖች ወዲያውኑ ይዘጋጃሉ።',
      om: 'Gabaasa yeroo (SitReps) AI tiin qophaa’u, daataa Excel fi maxxansa bulletins battalatti uumama.'
    },
    narration: {
      en: 'Reporting and Dissemination converts analyzed surveillance into automated situation reports and executive bulletins.',
      am: 'ሪፖርትና መረጃ ማጋራት የተተነተነ መረጃን ወደ አውቶሜትድ የሁኔታ ሪፖርቶችና ይፋዊ መግለጫዎች ይቀይራል።',
      om: 'Kutaan gabaasaa fi qoodiinsaa odeeffannoo xiinxalame gara gabaasa haala weeraraa fi xalayaa hooggansaatti jijjiira.'
    },
    highlights: {
      en: [
        'Automated executive summaries for veterinary authorities',
        'Formal printable outbreak briefs for regional health directors',
        'Standardized CSV and Excel datasets for research and donors'
      ],
      am: [
        'ለእንስሳት ህክምና ባለስልጣናት የሚዘጋጅ አውቶሜትድ ማጠቃለያ',
        'ለቀጠናው የጤና አመራሮች የሚዘጋጅ የታተመ የወረርሽኝ መግለጫ',
        'ለጥናትና ምርምርና ለአጋሮች የተዘጋጁ የCSVና Excel መረጃዎች'
      ],
      om: [
        'Cuunfaa hooggansa ogeeyyii fayyaa beeyladaaf ofumaan qophaa’u',
        'Gabaasa maxxansaa qajeelchaa fayyaa naannoof',
        'Daataa CSV fi Excel qorannoo fi deeggartootaaf'
      ]
    },
    icon: FileText,
    accentColor: 'from-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-400',
    statLabel: { en: 'SitRep Output', am: 'የSitRep ዝግጅት', om: 'Qophii SitRep' },
    statValue: { en: 'One-Click AI Gen', am: 'በአንድ ጠቅታ የሚዘጋጅ', om: 'Cuqisa Tokkoon AI' }
  },
  {
    id: 'decision-support',
    stageNumber: 7,
    title: {
      en: 'Decision Support',
      am: 'ለውሳኔ አሰጣጥ ድጋፍ',
      om: 'Deeggarsa Murtii'
    },
    category: {
      en: 'Actionable Intelligence',
      am: 'ተግባራዊ ግንዛቤ',
      om: 'Odeeffannoo Qabatamaa'
    },
    description: {
      en: 'Synthesizes epidemiological indicators into prioritized veterinary interventions, ring vaccination targets, and containment measures.',
      am: 'የኤፒዲሚዮሎጂ አመልካቾችን ወደ ቅድሚያ የሚሰጣቸው የእንስሳት ህክምና ጣልቃገብነቶች፣ የዙሪያ ክትባት እና የቁጥጥር እርምጃዎች ይቀይራል።',
      om: 'Agarsiistota dhibee gara tarkaanfii talaallii marsaa fi eegumsa beeyladaa murteessaatti jijjiira.'
    },
    narration: {
      en: 'Decision Support synthesizes surveillance evidence into prioritized veterinary containment and targeted vaccination strategies.',
      am: 'ለውሳኔ አሰጣጥ ድጋፍ የክትትል ማስረጃዎችን ወደ ቅድሚያ የሚሰጣቸው የእንስሳት ህክምና ቁጥጥር እና የክትባት ስልቶች ያቀናጃል።',
      om: 'Deeggarsi murtii ragaa hordoffii gara tarsiimoo talaallii fi to’annoo weeraraatti qindeessa.'
    },
    highlights: {
      en: [
        'Evidence-based ring vaccination radius planning',
        'Targeted veterinary drug and diagnostic kit dispatch',
        'Livestock market quarantine and movement restrictions'
      ],
      am: [
        'በማስረጃ የተደገፈ የዙሪያ ክትባት ራዲየስ እቅድ',
        'የእንስሳት መድኃኒቶችና የምርመራ መሣሪያዎችን ወደ ተመረጡ ቦታዎች መላክ',
        'የእንስሳት ገበያ ኳረንቲንና የእንቅስቃሴ ገደቦች'
      ],
      om: [
        'Karoora talaallii marsaa ragaa irratti hundaa’e',
        'Qoricha beeyladaa fi meeshaalee qorannoo erguu',
        'Tursiisa gabaa beeyladaa fi daangessuu socho’aa'
      ]
    },
    icon: BrainCircuit,
    accentColor: 'from-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400',
    statLabel: { en: 'Decision Mode', am: 'የውሳኔ አሰጣጥ ሁኔታ', om: 'Haala Murtii' },
    statValue: { en: 'Evidence-Informed', am: 'በማስረጃ የተደገፈ', om: 'Ragaa Irratti' }
  },
  {
    id: 'action',
    stageNumber: 8,
    title: {
      en: 'Targeted Field Action',
      am: 'የታለመ የመስክ እርምጃ',
      om: 'Tarkaanfii Dirree Qabatamaa'
    },
    category: {
      en: 'One Health Impact',
      am: 'የOne Health ተጽእኖ',
      om: 'Bu’aa Fayyaa Tokko'
    },
    description: {
      en: 'Mobilizes veterinary rapid response teams, livestock protection measures, and pastoral community engagement to extinguish outbreaks at the source.',
      am: 'ፈጣን ምላሽ ሰጪ ቡድኖችን፣ የእንስሳት ጥበቃ እርምጃዎችንና የአርብቶ አደሩን ማህበረሰብ በማሳተፍ ወረርሽኞችን ከመነሻቸው ይገታልታል።',
      om: 'Garee deebii saffisaa, eegumsa beeyladaa fi hirmaannaa hawaasa horsiisee bultootaa qindeessuun weerara battalatti to’ata.'
    },
    narration: {
      en: 'Targeted Field Action mobilizes veterinary rapid response teams to extinguish outbreaks at the source, advancing One Health.',
      am: 'የታለመ የመስክ እርምጃ ፈጣን ምላሽ ሰጪ ቡድኖችን በማሰማራት ወረርሽኞችን ከመነሻቸው በማስቀረት የOne Health ዓላማን ያሳካል።',
      om: 'Tarkaanfiin dirree qabatamaa garee deebii saffisaa bobbaasuun weerara hundee irraa balleessa, Fayyaa Tokko mirkaneessa.'
    },
    highlights: {
      en: [
        'Active outbreak containment and ring vaccination execution',
        'One Health cross-sector zoonotic disease coordination',
        'Safeguarding pastoral livelihoods and regional biosecurity'
      ],
      am: [
        'ንቁ የወረርሽኝ ቁጥጥርና የዙሪያ ክትባት አፈጻጸም',
        'የOne Health ዘርፈ-ብዙ የዞኦኖቲክ በሽታዎች ቅንጅት',
        'የአርብቶ አደሩን ኑሮና የቀጠናውን ባዮሴኪዩሪቲ መጠበቅ'
      ],
      om: [
        'To’annoo weeraraa fi raawwii talaallii marsaa',
        'Qindoomina qooda fudhattoota Fayyaa Tokko',
        'Jireenya horsiisee bultootaa fi nageenya beeyladaa eeguu'
      ]
    },
    icon: ShieldCheck,
    accentColor: 'from-emerald-600/20 border-emerald-600 text-emerald-700 dark:text-emerald-300',
    statLabel: { en: 'Core Mission', am: 'ዋና ተልዕኮ', om: 'Ergama Ijoo' },
    statValue: { en: 'Outbreak Containment', am: 'ወረርሽኝን መቆጣጠር', om: 'To’annoo Weeraraa' }
  }
];

export const TourOverview: React.FC<TourOverviewProps> = ({
  isOpen,
  locale,
  voiceEnabled,
  onSelectLocale,
  onToggleVoice,
  onClose,
  onStartTour,
}) => {
  const { selectedLab } = useLaboratory();
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [speechRate, setSpeechRate] = useState<number>(() => voiceService.getRate());
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const STAGE_DURATION_MS = 8500; // ~8.5s per stage
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = WORKFLOW_STAGES[activeStageIndex];
  const Icon = currentStage.icon;

  // Subscribe to voiceService state
  useEffect(() => {
    const unsub = voiceService.subscribe({
      onStateChange: (st) => setSpeechState(st),
    });
    return unsub;
  }, []);

  // Speak stage narration when stage or language changes
  useEffect(() => {
    voiceService.setLabContext(selectedLab);
    if (!isOpen) {
      voiceService.stop();
      return;
    }

    if (voiceEnabled) {
      const narrationText = currentStage.narration[locale] || currentStage.narration.en;
      voiceService.speak(narrationText, locale);
    } else {
      voiceService.stop();
    }

    return () => {
      voiceService.stop();
    };
  }, [isOpen, activeStageIndex, locale, voiceEnabled, selectedLab]);

  // Handle automatic slide advancement
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const start = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / STAGE_DURATION_MS) * 100);
      setProgressPercent(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      setActiveStageIndex((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    }, STAGE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPlaying, activeStageIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    soundEngine.playClick();
    setActiveStageIndex((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    setProgressPercent(0);
  };

  const handlePrev = () => {
    soundEngine.playClick();
    setActiveStageIndex((prev) => (prev === 0 ? WORKFLOW_STAGES.length - 1 : prev - 1));
    setProgressPercent(0);
  };

  const handleSelectStage = (idx: number) => {
    soundEngine.playClick();
    setActiveStageIndex(idx);
    setProgressPercent(0);
  };

  const handleTogglePlayPause = () => {
    soundEngine.playClick();
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) {
      voiceService.resume();
    } else {
      voiceService.pause();
    }
  };

  const handleReplayVoice = () => {
    soundEngine.playClick();
    setProgressPercent(0);
    const narrationText = currentStage.narration[locale] || currentStage.narration.en;
    voiceService.speak(narrationText, locale);
  };

  const handleChangeRate = (rate: number) => {
    setSpeechRate(rate);
    voiceService.setRate(rate);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Title, Language Selector & Close */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  HRVL Surveillance Pathway
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Stage {activeStageIndex + 1} of {WORKFLOW_STAGES.length}
                </span>
              </div>
              <h2 id="overview-modal-title" className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                From Field Data to One Health Action
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TourLanguageSelector
              currentLocale={locale}
              onSelectLocale={onSelectLocale}
              size="sm"
            />

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label="Close overview"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Stage Timeline Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar">
          {WORKFLOW_STAGES.map((stg, idx) => {
            const isCurrent = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer
                  ${isCurrent 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : isCompleted 
                      ? 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }
                `}
              >
                <span className="font-mono text-[10px] opacity-75">{idx + 1}.</span>
                <span className="truncate max-w-[90px] sm:max-w-none">{stg.title[locale]}</span>
              </button>
            );
          })}
        </div>

        {/* Progress Bar for Current Stage */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 relative overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Voice Controls Bar */}
        <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800">
          <TourVoiceControls
            voiceEnabled={voiceEnabled}
            speechState={speechState}
            speechRate={speechRate}
            onToggleVoice={onToggleVoice}
            onPlay={() => {
              setIsPlaying(true);
              voiceService.resume();
            }}
            onPause={() => {
              setIsPlaying(false);
              voiceService.pause();
            }}
            onReplay={handleReplayVoice}
            onChangeRate={handleChangeRate}
            compact
          />
        </div>

        {/* Stage Content Card */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto custom-scrollbar space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentStage.accentColor} border shrink-0 shadow-md`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {currentStage.category[locale]}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentStage.title[locale]}
                </h3>
              </div>
            </div>

            {/* Stage Quick Stat Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left md:text-right shrink-0 min-w-[150px]">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                {currentStage.statLabel[locale]}
              </div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {currentStage.statValue[locale]}
              </div>
            </div>
          </div>

          {/* Stage Description */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {currentStage.description[locale]}
          </p>

          {/* Highlights List */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operational Focus
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStage.highlights[locale]?.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Narration Transcript */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Voice Narration ({locale.toUpperCase()}):
            </span>
            <p className="text-xs italic text-slate-700 dark:text-slate-300 text-justify leading-relaxed m-0">
              "{currentStage.narration[locale]}"
            </p>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlayPause}
              aria-label={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
              className="px-3.5 py-2 flex items-center gap-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccess();
                onStartTour();
              }}
              className="py-2.5 px-4 flex items-center gap-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Start 10-Step Interactive Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
