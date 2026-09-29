import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Briefcase, 
  Award, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  Github, 
  Linkedin, 
  BookOpen, 
  Send, 
  Video, 
  Facebook,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { professionalProfile } from '../data/profile';
import { soundEngine } from '../utils/sound';
import { QRCodeBadge } from './QRCodeBadge';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            soundEngine.playClick();
            onClose();
          }
        }}
      >
        <motion.div
          id="profile-modal-dialog"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 bg-linear-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <a
                  href={professionalProfile.links.gravatar}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  title="Scan or click to view Developer Profile"
                  className="block cursor-pointer"
                >
                  <QRCodeBadge 
                    value={professionalProfile.links.gravatar}
                    size={56}
                    title="Scan to view Developer Profile"
                    ariaLabel="Developer Profile QR Code"
                  />
                </a>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{professionalProfile.name}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-300" />
                    Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-emerald-100/90 leading-tight">
                  {professionalProfile.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/80 pt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 opacity-80" />
                    {professionalProfile.organization}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 opacity-80" />
                    {professionalProfile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 opacity-80" />
                    {professionalProfile.experience} Experience
                  </span>
                </div>
              </div>
            </div>

            <button
              id="profile-modal-close-btn"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm">
            {/* Mission Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Mission & Professional Purpose
                </p>
                <p className="text-sm font-semibold italic text-slate-800 dark:text-slate-200">
                  "{professionalProfile.mission}"
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Executive Overview
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {professionalProfile.summary}
              </p>
            </div>

            {/* Operational Focus Pipeline */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Operational & Surveillance Paradigm
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">HRVL Workflow</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs">Field Epidemiology</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs">Lab Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs">Data</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs">Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs">Decision-Making</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">Public Health Action</span>
              </div>
            </div>

            {/* Core Expertise Grid */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Core Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {professionalProfile.coreAreasOfExpertise.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-500 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Digital Tools & Tech Stack */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Digital Surveillance & Analytics Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {professionalProfile.digitalDataTools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60"
                  >
                    <Database className="w-3 h-3 mr-1 text-indigo-500" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Profiles & Online Footprint */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Verified Research & Online Presence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={professionalProfile.links.gravatar}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Gravatar Verified Profile</p>
                      <p className="text-[11px] text-slate-400">henokabebet.link</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </a>

                <a
                  href={professionalProfile.links.orcid}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">ORCID Researcher ID</p>
                      <p className="text-[11px] text-slate-400">0000-0001-8575-9312</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-lime-600 transition-colors" />
                </a>

                <a
                  href={professionalProfile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">LinkedIn Profile</p>
                      <p className="text-[11px] text-slate-400">henok-abebe-369ha</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>

                <a
                  href={professionalProfile.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">GitHub Organization</p>
                      <p className="text-[11px] text-slate-400">github.com/hirnarvl</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                </a>

                <a
                  href={professionalProfile.links.wordpress}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">WordPress Blog</p>
                      <p className="text-[11px] text-slate-400">henockabebe.wordpress.com</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </a>

                <a
                  href={professionalProfile.links.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Hirna Regional Veterinary Laboratory (Google Maps)
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        CID: 15875862256016053253 • Hirna, West Hararghe Zone, Oromia
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hirna Regional Veterinary Laboratory • One Health Systems
            </p>
            <button
              id="profile-modal-done-btn"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
