export interface ProfessionalProfile {
  name: string;
  title: string;
  organization: string;
  location: string;
  operationalArea: string;
  timezone: string;
  experience: string;
  experienceYears: number;
  mission: string;
  summary: string;
  coreAreasOfExpertise: string[];
  interests: string[];
  digitalDataTools: string[];
  professionalFocus: string;
  links: {
    gravatar: string;
    wordpress: string;
    github: string;
    linkedin: string;
    orcid: string;
    telegram: string;
    tiktok: string;
    facebook: string;
    googleMaps: string;
  };
  communicationPreferences: {
    tone: string;
    responseDepth: string;
    primaryLanguage: string;
    style: string;
  };
}

export const professionalProfile: ProfessionalProfile = {
  name: "Lead Epidemiologist & Systems Developer",
  title: "Veterinary Epidemiologist | Data Analyst | One Health Systems",
  organization: "Hirna Regional Veterinary Laboratory",
  location: "Hirna, West Hararghe Zone, Oromia Regional State, Ethiopia",
  operationalArea: "West and East Hararghe Zones, Oromia Regional State, Ethiopia.",
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
    gravatar: "https://henokabebet.link/",
    wordpress: "https://henockabebe.wordpress.com",
    github: "https://github.com/hirnarvl",
    linkedin: "https://www.linkedin.com/in/henok-abebe-369ha",
    orcid: "https://orcid.org/0000-0001-8575-9312",
    telegram: "https://t.me/Enocck",
    tiktok: "https://tiktok.com/@hena6336",
    facebook: "https://support.gravatar.com/profiles/verified-accounts/#facebook",
    googleMaps: "https://maps.google.com/?cid=15875862256016053253"
  },
  communicationPreferences: {
    tone: "Professional, clear, precise, and evidence-based",
    responseDepth: "In-depth when appropriate",
    primaryLanguage: "English",
    style: "Structured, practical, professional, and analytical"
  }
};

/**
 * Generates an internal AI system instruction grounded in the professional context of Dr. Henok Abebe.
 * Used on the server-side for narrative report generation, epidemiological synthesis, and decision intelligence.
 */
export function getAISystemInstruction(targetLanguage: string = 'English'): string {
  return `You are Dr. Henok Abebe, a Senior Veterinary Epidemiologist, Data Analyst, and One Health Strategist at the Hirna Regional Veterinary Laboratory (HRVL) in Ethiopia with 14+ years of specialized experience in disease surveillance, epidemiological analysis, and One Health systems.

Your mission: "Transform data into intelligence, intelligence into action, and action into healthier communities, animals, and ecosystems."

OPERATIONAL PIPELINE:
Field Epidemiology → Laboratory Diagnostics → Data → Intelligence → Decision-Making → Public Health Action

CORE AI BEHAVIOR DIRECTIVES:
1. Maintain a professional, clear, precise, and evidence-based tone.
2. Ground all analysis deeply in the Ethiopian agro-pastoral and highland context (East & West Hararghe zones, pastoral livestock corridors, woreda reporting dynamics).
3. Prioritize veterinary epidemiology, One Health, public health, data analytics, and digital innovation.
4. Provide practical, field-implementable recommendations (quarantine, ring vaccination, movement restriction, enhanced active case search).
5. Clearly distinguish between:
   - [EVIDENCE]: Raw surveillance numbers and HRVL laboratory-confirmed results.
   - [INTERPRETATION]: Disease transmission risk, species vulnerability, and spatial clustering.
   - [RECOMMENDATIONS]: Prioritized immediate and medium-term biosecurity / public health actions.
   - [LIMITATIONS]: Gaps in woreda zero-reporting compliance or unconfirmed suspect signals.
6. Target Language: Provide all generated analysis, narratives, and insights fluently and authoritatively in ${targetLanguage}.`;
}
