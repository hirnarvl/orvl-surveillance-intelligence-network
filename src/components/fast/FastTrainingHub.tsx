import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Users,
  Award,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Flame,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { fastTrainingCoursesData } from '../../data/fastKnowledgeData';
import { ActivEpiPortal } from './ActivEpiPortal';

export const FastTrainingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'activepi' | 'fetpv' | 'eufmd'>('all');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Capacity Building & Workforce Development
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Free Online Epidemiology Courses
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-white">
              FAST Training Hub & Field Epi Curricula
            </h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Curated e-learning courses including ActivEpi (Emory University), Frontline In-Service Applied Veterinary Epidemiology (FETPV), and Community One Health simulation exercises designed by EuFMD, FAO, and EPHI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href="https://courses.activepi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>ActivEpi: courses.activepi.com</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </a>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-100 flex items-center justify-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Accredited Continuing Professional Education</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Hub Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Training Programs ({fastTrainingCoursesData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activepi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'activepi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>ActivEpi Interactive Epi Course (Free Online)</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 border border-emerald-400/30">
            courses.activepi.com
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fetpv')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'fetpv'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Frontline Applied FETPV</span>
        </button>

        <button
          onClick={() => setActiveTab('eufmd')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'eufmd'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span>EuFMD FAST Simulations</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeTab === 'activepi' ? (
        <ActivEpiPortal />
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
          {fastTrainingCoursesData
            .filter(course => {
              if (activeTab === 'fetpv') return course.id.includes('fetpv');
              if (activeTab === 'eufmd') return course.id.includes('eufmd') || course.id.includes('one-health');
              return true;
            })
            .map(course => {
              const isActivEpi = course.id === 'course-activepi-free';
              return (
                <div
                  key={course.id}
                  id={`course-${course.id}`}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isActivEpi
                      ? 'bg-linear-to-br from-emerald-950/20 via-white to-teal-950/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/60 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          course.level === 'Advanced' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40' :
                          course.level === 'Intermediate' ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40' :
                          'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                        }`}>
                          {course.level} Level
                        </span>

                        {isActivEpi && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-emerald-600 text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Free Online Course
                          </span>
                        )}
                      </div>

                      {course.certificateAvailable && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                          <Award className="w-3 h-3" />
                          Certificate
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {course.provider}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {course.targetAudience}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Modules list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Core Curriculum Modules:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {course.modules.slice(0, 5).map((mod, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-snug">{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                    {course.linkUrl ? (
                      <a
                        href={course.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs ${
                          isActivEpi
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span>{isActivEpi ? 'Launch courses.activepi.com' : 'Launch Training Portal'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center justify-center gap-2"
                      >
                        In-Person Workshop Series
                      </button>
                    )}

                    {isActivEpi && (
                      <button
                        onClick={() => setActiveTab('activepi')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-800"
                      >
                        <span>Explore Syllabus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

