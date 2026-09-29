import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  ExternalLink,
  Calculator,
  Award,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
  Share2,
  Lightbulb,
  Binary,
  RotateCcw
} from 'lucide-react';

interface ActivEpiLesson {
  id: number;
  number: string;
  title: string;
  duration: string;
  category: 'Foundations' | 'Disease Frequency' | 'Association & Effect' | 'Study Designs' | 'Bias & Error' | 'Diagnostics' | 'Outbreak Analytics';
  overview: string;
  coreConcepts: string[];
  keyFormula?: string;
  practiceTip: string;
}

const ACTIVEPI_LESSONS: ActivEpiLesson[] = [
  {
    id: 1,
    number: 'Lesson 1',
    title: 'What is Epidemiology & Disease Surveillance Dynamics',
    duration: '45 mins',
    category: 'Foundations',
    overview: 'Explores the historical foundations, objectives, and public health philosophy of epidemiology with emphasis on population thinking and disease distribution.',
    coreConcepts: ['Definition and goals of epidemiology', 'Descriptive vs Analytic Epidemiology', 'Infectious disease dynamics & herd immunity thresholds', 'Translating surveillance data into policy interventions'],
    practiceTip: 'Essential foundation for field officers conducting syndromic surveillance in pastoral livestock communities.'
  },
  {
    id: 2,
    number: 'Lesson 2',
    title: 'Quantifying Disease Occurrence: Incidence vs. Prevalence',
    duration: '60 mins',
    category: 'Disease Frequency',
    overview: 'Distinguishes between incidence proportions (cumulative incidence), incidence rates (incidence density with person-time denominators), and point/period prevalence.',
    coreConcepts: ['Cumulative Incidence (Risk) vs Incidence Rate (Density)', 'Point Prevalence vs Period Prevalence', 'Calculating Person-Time denominators in dynamic herds', 'Mathematical relationship: Prevalence ≈ Incidence × Average Duration'],
    keyFormula: 'Incidence Rate = (New Cases) / (Total Person-Time at Risk)',
    practiceTip: 'Use incidence rate when livestock herds have continuous births, purchases, and slaughter movements over time.'
  },
  {
    id: 3,
    number: 'Lesson 3',
    title: 'Measures of Risk, Rate, Hazard & Attack Rates',
    duration: '50 mins',
    category: 'Disease Frequency',
    overview: 'Covers attack rate calculations during acute outbreak emergencies, secondary attack rates in households or herds, and case fatality rates.',
    coreConcepts: ['Overall Attack Rate (AR) and Food/Water Specific Attack Rates', 'Secondary Attack Rate (SAR) measuring transmissibility', 'Case Fatality Rate (CFR) measuring disease severity', 'Mortality Rate vs Morbidity Rate'],
    keyFormula: 'Attack Rate = (Ill Individuals) / (Total Population Exposed at Risk) × 100%',
    practiceTip: 'Critical during acute Foot-and-Mouth Disease (FMD) or Anthrax cluster investigations.'
  },
  {
    id: 4,
    number: 'Lesson 4',
    title: 'Measures of Association: Relative Risk (Risk Ratio & Rate Ratio)',
    duration: '60 mins',
    category: 'Association & Effect',
    overview: 'Calculates and interprets ratios of disease frequency in exposed versus unexposed populations to establish disease etiology and exposure risks.',
    coreConcepts: ['Relative Risk (RR) interpretation (>1, =1, <1)', 'Risk Ratio vs Rate Ratio', '95% Confidence Intervals for Relative Risk', 'Interpreting null value (RR = 1.0) and statistical significance'],
    keyFormula: 'RR = [a / (a + b)] / [c / (c + d)]',
    practiceTip: 'Standard metric in cohort studies and prospective herd vaccination trials.'
  },
  {
    id: 5,
    number: 'Lesson 5',
    title: 'Measures of Effect: Odds Ratio & Attributable Risk',
    duration: '65 mins',
    category: 'Association & Effect',
    overview: 'Details the calculation of Odds Ratios (OR) in case-control studies, the rare disease assumption, Attributable Risk (AR), and Population Attributable Fraction (PAF).',
    coreConcepts: ['Odds Ratio (Cross-product ratio: ad/bc)', 'When Odds Ratio approximates Relative Risk', 'Risk Difference (Attributable Risk: I_exp - I_unexp)', 'Population Attributable Fraction (PAF%) for prioritizing interventions'],
    keyFormula: 'Odds Ratio (OR) = (a × d) / (b × c)',
    practiceTip: 'Key for evaluating livestock market contact as an exposure factor in sudden PPR or CBPP outbreaks.'
  },
  {
    id: 6,
    number: 'Lesson 6',
    title: 'Study Design 1: Randomized Controlled Trials & Interventions',
    duration: '50 mins',
    category: 'Study Designs',
    overview: 'Explores experimental study designs, randomization techniques, blinding, ethical considerations, and field vaccine efficacy trials.',
    coreConcepts: ['Random allocation and baseline balance', 'Cluster Randomized Trials for community interventions', 'Vaccine Efficacy (VE) formula: (1 - RR) × 100%', 'Intention-to-treat vs per-protocol analysis'],
    practiceTip: 'Framework for assessing efficacy of LSD or RVF ring vaccination campaigns.'
  },
  {
    id: 7,
    number: 'Lesson 7',
    title: 'Study Design 2: Prospective & Retrospective Cohort Studies',
    duration: '60 mins',
    category: 'Study Designs',
    overview: 'Structures cohort investigations following exposed and unexposed groups over time to quantify incident disease and temporal relationships.',
    coreConcepts: ['Prospective vs Retrospective (Historical) Cohorts', 'Minimizing loss to follow-up and attrition bias', 'Calculating incidence density and rate ratios', 'Strengths and limitations of cohort designs'],
    practiceTip: 'Gold-standard observational design for establishing disease causation.'
  },
  {
    id: 8,
    number: 'Lesson 8',
    title: 'Study Design 3: Case-Control Studies & Density Sampling',
    duration: '70 mins',
    category: 'Study Designs',
    overview: 'Guides selection of appropriate case and control groups, matching methods, cumulative incidence sampling, and retrospective odds ratios.',
    coreConcepts: ['Source population and control selection principles', 'Individual vs frequency matching (and avoiding overmatching)', 'Nested case-control designs in outbreak cohorts', 'Avoiding recall bias and interviewer bias'],
    practiceTip: 'The most rapid and cost-effective study design for investigating sudden transboundary disease clusters.'
  },
  {
    id: 9,
    number: 'Lesson 9',
    title: 'Study Design 4: Cross-Sectional & Sero-Prevalence Surveys',
    duration: '50 mins',
    category: 'Study Designs',
    overview: 'Analyzes point-in-time prevalence surveys, multi-stage cluster sampling, and serological surveillance in livestock populations.',
    coreConcepts: ['Representative random sampling and cluster weighting', 'Prevalence Odds Ratio (POR)', 'Length-time bias in cross-sectional surveys', 'Interpreting regional sero-prevalence maps (ELISA / NSP antibodies)'],
    practiceTip: 'Used in annual national FMD and PPR sero-surveys across East and West Hararghe.'
  },
  {
    id: 10,
    number: 'Lesson 10',
    title: 'Potential Errors: Selection Bias & Information / Recall Bias',
    duration: '60 mins',
    category: 'Bias & Error',
    overview: 'Systematically identifies systematic errors in study design, Berkson bias, non-response bias, misclassification (differential vs non-differential), and recall error.',
    coreConcepts: ['Systematic error vs Random error (P-values vs CIs)', 'Selection Bias: diagnostic suspicion, healthy worker/herd effect', 'Differential vs Non-differential misclassification', 'Preventive strategies during questionnaire design and sampling'],
    practiceTip: 'Always calibrate diagnostic tools and blinding to avoid observer bias in clinical field scorings.'
  },
  {
    id: 11,
    number: 'Lesson 11',
    title: 'Confounding Principles & Control Methods',
    duration: '65 mins',
    category: 'Bias & Error',
    overview: 'Deep dive into confounding definition (associated with exposure, independent risk factor for outcome, not on causal pathway), Directed Acyclic Graphs (DAGs), and control methods.',
    coreConcepts: ['Three classical criteria for a confounder', 'Methods of control at design phase: Restriction, Matching, Randomization', 'Methods of control at analysis phase: Stratification (Mantel-Haenszel) & Multivariable Regression', 'Distinguishing confounders from intermediate variables'],
    keyFormula: 'Adjusted OR_MH = Σ(a_i * d_i / T_i) / Σ(b_i * c_i / T_i)',
    practiceTip: 'Livestock age, breed, and seasonal grazing corridor are frequent confounders in herd mortality studies.'
  },
  {
    id: 12,
    number: 'Lesson 12',
    title: 'Effect Modification & Interaction Analysis',
    duration: '55 mins',
    category: 'Bias & Error',
    overview: 'Examines biological interaction and heterogeneity of effect across strata, comparing confounding (bias to eliminate) with effect modification (biological finding to report).',
    coreConcepts: ['Biological interaction vs Statistical interaction', 'Additive vs Multiplicative interaction models', 'Stratum-specific effect estimates vs crude estimates', 'Reporting subgroup disparities in vaccine protection'],
    practiceTip: 'Effect modification represents genuine biological variation (e.g. drought stress multiplying pathogen lethality).'
  },
  {
    id: 13,
    number: 'Lesson 13',
    title: 'Screening & Diagnostic Test Accuracy (Sensitivity, Specificity, PPV & NPV)',
    duration: '60 mins',
    category: 'Diagnostics',
    overview: 'Evaluates pen-side antigen lateral flow tests, RT-PCR, and ELISA diagnostic performance using 2x2 gold-standard validation tables.',
    coreConcepts: ['Sensitivity: P(Test + | Disease +)', 'Specificity: P(Test - | Disease -)', 'Positive Predictive Value (PPV): Impact of disease prevalence', 'Negative Predictive Value (NPV) and Likelihood Ratios (LR+, LR-)'],
    keyFormula: 'PPV = (Sens × Prev) / [ (Sens × Prev) + ((1 - Spec) × (1 - Prev)) ]',
    practiceTip: 'When disease prevalence drops, PPV drops dramatically even with highly specific diagnostic tests.'
  },
  {
    id: 14,
    number: 'Lesson 14',
    title: 'Field Outbreak Investigation Steps & Epidemic Curve Modeling',
    duration: '70 mins',
    category: 'Outbreak Analytics',
    overview: 'Step-by-step 10-stage outbreak investigation framework, case definitions (Suspect, Probable, Confirmed), line-listing, spot mapping, and epidemic curve interpretation.',
    coreConcepts: ['Standard 10-step outbreak investigation protocol', 'Constructing case definitions with sensitivity/specificity balance', 'Constructing and interpreting Epi Curves: Point source, continuous source, propagated (person-to-person / animal-to-animal)', 'Calculating median incubation periods from peak epidemic dates'],
    practiceTip: 'Use epi curves to establish the exact window of index case introduction into communal watering points.'
  },
  {
    id: 15,
    number: 'Lesson 15',
    title: 'Statistical Inferences, Survival Curves & Multivariable Modeling Primer',
    duration: '60 mins',
    category: 'Outbreak Analytics',
    overview: 'Introduces hypothesis testing, Kaplan-Meier survival curves, Cox proportional hazards, and logistic regression modeling for multi-factorial outbreak data.',
    coreConcepts: ['P-values, Alpha levels, Type I and Type II statistical errors', 'Kaplan-Meier survival estimation for disease survival time', 'Logistic regression: logit(p) = β0 + β1*X1 + β2*X2', 'Interpreting adjusted odds ratios from multivariable models'],
    practiceTip: 'Enables field epidemiologists to interpret peer-reviewed veterinary literature and national surveillance reports.'
  }
];

export const ActivEpiPortal: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2x2 Table State for Live Interactive Epidemiology Calculations
  const [calcA, setCalcA] = useState<number>(45); // Exposed + Diseased
  const [calcB, setCalcB] = useState<number>(55); // Exposed + Non-Diseased
  const [calcC, setCalcC] = useState<number>(12); // Unexposed + Diseased
  const [calcD, setCalcD] = useState<number>(88); // Unexposed + Non-Diseased
  const [scenarioName, setScenarioName] = useState<string>('Custom Outbreak Scenario');

  // Mathematical Calculations
  const totalExposed = calcA + calcB;
  const totalUnexposed = calcC + calcD;
  const totalDiseased = calcA + calcC;
  const totalNonDiseased = calcB + calcD;
  const totalSample = totalExposed + totalUnexposed;

  const riskExposed = totalExposed > 0 ? (calcA / totalExposed) : 0;
  const riskUnexposed = totalUnexposed > 0 ? (calcC / totalUnexposed) : 0;
  const relativeRisk = riskUnexposed > 0 ? (riskExposed / riskUnexposed) : 0;
  
  const oddsRatio = (calcB * calcC) > 0 ? ((calcA * calcD) / (calcB * calcC)) : 0;
  const riskDifference = riskExposed - riskUnexposed;
  const attributableFraction = riskExposed > 0 ? ((riskExposed - riskUnexposed) / riskExposed) * 100 : 0;

  // Diagnostic Test Metrics (treating Exposed as Test+ and Diseased as True Disease)
  const sensitivity = totalDiseased > 0 ? (calcA / totalDiseased) * 100 : 0;
  const specificity = totalNonDiseased > 0 ? (calcD / totalNonDiseased) * 100 : 0;
  const ppv = totalExposed > 0 ? (calcA / totalExposed) * 100 : 0;
  const npv = totalUnexposed > 0 ? (calcD / totalUnexposed) * 100 : 0;

  // 95% Confidence Interval for Relative Risk (Woolf's formula)
  const calculateRRCi = () => {
    if (calcA === 0 || calcC === 0 || totalExposed === 0 || totalUnexposed === 0) return { lower: 0, upper: 0 };
    const seLnRR = Math.sqrt((1 / calcA) - (1 / totalExposed) + (1 / calcC) - (1 / totalUnexposed));
    const lower = Math.exp(Math.log(relativeRisk) - 1.96 * seLnRR);
    const upper = Math.exp(Math.log(relativeRisk) + 1.96 * seLnRR);
    return { lower, upper };
  };

  const rrCi = calculateRRCi();

  const loadPresetScenario = (scenario: 'fmd' | 'rabies' | 'anthrax' | 'diagnostic') => {
    if (scenario === 'fmd') {
      setScenarioName('Hararghe FMD Market Contact Study');
      setCalcA(58);
      setCalcB(42);
      setCalcC(14);
      setCalcD(86);
    } else if (scenario === 'rabies') {
      setScenarioName('Rabies Bite Post-Exposure Prophylaxis Trial');
      setCalcA(2);
      setCalcB(98);
      setCalcC(35);
      setCalcD(65);
    } else if (scenario === 'anthrax') {
      setScenarioName('Anthrax Carcass Slaughtering Exposure');
      setCalcA(24);
      setCalcB(6);
      setCalcC(3);
      setCalcD(97);
    } else if (scenario === 'diagnostic') {
      setScenarioName('FMD Pen-Side Rapid Antigen Lateral Flow Test');
      setCalcA(92); // True Positive
      setCalcB(8);  // False Positive
      setCalcC(8);  // False Negative
      setCalcD(192); // True Negative
    }
  };

  const categories = ['All', 'Foundations', 'Disease Frequency', 'Association & Effect', 'Study Designs', 'Bias & Error', 'Diagnostics', 'Outbreak Analytics'];

  const filteredLessons = ACTIVEPI_LESSONS.filter(l => {
    const matchesCat = filterCategory === 'All' || l.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.coreConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activeLessonObj = ACTIVEPI_LESSONS.find(l => l.id === selectedLesson) || ACTIVEPI_LESSONS[0];

  return (
    <div className="space-y-6">
      {/* ActivEpi Hero & Official Launch Portal Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-emerald-950 via-teal-900 to-slate-950 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                Free Online Course • Open-Access Epi.Centre
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs">
                Author: Dr. David G. Kleinbaum (Emory University)
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              ActivEpi: Interactive Electronic Epidemiology Course
            </h1>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              World-renowned multimedia curriculum teaching core epidemiological principles, outbreak study designs, biostatistical effect measures (RR, OR, attack rates), bias adjustment, and diagnostic test evaluation. Designed for field veterinarians, public health practitioners, and surveillance officers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 15 Interactive Multimedia Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interactive 2x2 Risk & Odds Calculators
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Practice Quizzes & Case Studies
              </span>
            </div>
          </div>

          {/* Primary Action Button Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href="https://courses.activepi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="w-5 h-5 text-slate-950" />
              <span>Launch courses.activepi.com</span>
            </a>

            <a
              href="https://courses.activepi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/15"
            >
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>Open ActivEpi Courses</span>
            </a>
          </div>
        </div>
      </div>

      {/* Two-Column Learning Hub & Calculator Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: 15 Lessons Interactive Explorer (7 Cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ActivEpi 15-Lesson Curriculum & Syllabus
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a module below to inspect learning objectives and field practice tips
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  {filteredLessons.length} Modules
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lessons Scrollable List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredLessons.map(lesson => {
                const isSelected = selectedLesson === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                            {lesson.number}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {lesson.category} • {lesson.duration}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                          {lesson.title}
                        </h4>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5' : 'text-slate-400 opacity-40'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Lesson Detail Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  {activeLessonObj.number} Detailed Syllabus
                </span>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeLessonObj.title}
                </h3>
              </div>
              <a
                href="https://courses.activepi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <span>Study on ActivEpi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeLessonObj.overview}
            </p>

            {/* Core concepts checklist */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Key Learning Competencies:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeLessonObj.coreConcepts.map((concept, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeLessonObj.keyFormula && (
              <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs flex items-center justify-between gap-2 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{activeLessonObj.keyFormula}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Standard Metric</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Field Application in Hararghe / Arsi: </span>
                {activeLessonObj.practiceTip}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ActivEpi Interactive Epidemiology Calculator (5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    ActivEpi Epidemiological Workbench
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live 2×2 Contingency Table & Metric Calculator
                  </p>
                </div>
              </div>

              <button
                onClick={() => loadPresetScenario('fmd')}
                title="Reset to default FMD scenario"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Pre-Loaded Scenarios */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Load Outbreak Scenario Preset:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => loadPresetScenario('fmd')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-left transition-colors truncate"
                >
                  🐄 FMD Market Exposure
                </button>
                <button
                  onClick={() => loadPresetScenario('rabies')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-left transition-colors truncate"
                >
                  🐕 Rabies Post-Exposure
                </button>
                <button
                  onClick={() => loadPresetScenario('anthrax')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-left transition-colors truncate"
                >
                  ⚠️ Anthrax Carcass Contact
                </button>
                <button
                  onClick={() => loadPresetScenario('diagnostic')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-left transition-colors truncate"
                >
                  🔬 Rapid Antigen Test
                </button>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              Active Scenario: {scenarioName}
            </div>

            {/* 2x2 Matrix Input Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                2×2 Contingency Table (Edit Values):
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-center">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                    <tr>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-red-600 dark:text-red-400">Disease + (Cases)</th>
                      <th className="p-2 text-slate-600 dark:text-slate-400">Disease − (Healthy)</th>
                      <th className="p-2 bg-slate-200/60 dark:bg-slate-700/60">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-2 font-bold text-left bg-slate-50 dark:bg-slate-800/40">Exposed (+)</td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          min="0"
                          value={calcA}
                          onChange={e => setCalcA(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 text-center font-bold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded-lg"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          min="0"
                          value={calcB}
                          onChange={e => setCalcB(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </td>
                      <td className="p-2 font-black bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white">
                        {totalExposed}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-left bg-slate-50 dark:bg-slate-800/40">Unexposed (−)</td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          min="0"
                          value={calcC}
                          onChange={e => setCalcC(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 text-center font-bold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded-lg"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          min="0"
                          value={calcD}
                          onChange={e => setCalcD(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 text-center font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                      </td>
                      <td className="p-2 font-black bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white">
                        {totalUnexposed}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-[11px]">
                      <td className="p-2 text-left">Total</td>
                      <td className="p-2 text-red-700 dark:text-red-300">{totalDiseased}</td>
                      <td className="p-2 text-slate-700 dark:text-slate-300">{totalNonDiseased}</td>
                      <td className="p-2 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60">
                        {totalSample}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculated Results Dashboard */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Calculated Epidemiological Indicators:
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Relative Risk */}
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 space-y-1">
                  <div className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">
                    Relative Risk (RR)
                  </div>
                  <div className="text-xl font-black text-blue-900 dark:text-blue-100">
                    {relativeRisk.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-blue-700 dark:text-blue-400">
                    95% CI: [{rrCi.lower.toFixed(2)}, {rrCi.upper.toFixed(2)}]
                  </div>
                </div>

                {/* Odds Ratio */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-1">
                  <div className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase">
                    Odds Ratio (OR)
                  </div>
                  <div className="text-xl font-black text-purple-900 dark:text-purple-100">
                    {oddsRatio.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-purple-700 dark:text-purple-400">
                    Cross-product ratio (ad/bc)
                  </div>
                </div>

                {/* Attack Rate Exposed */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Attack Rate (Exposed)
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {(riskExposed * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-slate-500">
                    vs {(riskUnexposed * 100).toFixed(1)}% in Unexposed
                  </div>
                </div>

                {/* Attributable Fraction */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    Attributable Fraction (AF)
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {attributableFraction.toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Preventable by removing risk
                  </div>
                </div>
              </div>

              {/* Diagnostic Test Performance Panel */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Diagnostic Accuracy Metrics:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Sensitivity</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{sensitivity.toFixed(1)}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-500 block">Specificity</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{specificity.toFixed(1)}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-500 block">PPV</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{ppv.toFixed(1)}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-500 block">NPV</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{npv.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-blue-950 text-white border border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              ActivEpi Companion Learning Resources
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://courses.activepi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>ActivEpi Course Portal (courses.activepi.com)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://courses.activepi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>ActivEpi Electronic Companion Textbook</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://courses.activepi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Interactive Instructional Quizzes & CD Exercises</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
