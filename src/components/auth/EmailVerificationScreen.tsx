import React, { useState } from 'react';
import { 
  MailCheck, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  Microscope, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLaboratory } from '../../contexts/LaboratoryContext';
import { soundEngine } from '../../utils/sound';

interface EmailVerificationScreenProps {
  email: string;
  onLoginClick: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onLoginClick
}) => {
  const { currentLabInfo, selectedLab } = useLaboratory();
  const [copied, setCopied] = useState(false);

  const isArvl = selectedLab === 'arvl';
  const logoSrc = isArvl
    ? '/arvl-emblem.png'
    : '/hrvl-emblem.png';
  const labName = isArvl
    ? 'Asela Regional Veterinary Laboratory (ARVL)'
    : 'Hirna Regional Veterinary Laboratory (HRVL)';

  const handleLogin = () => {
    soundEngine.playClick();
    onLoginClick();
  };

  const handleCopyEmail = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <img 
              src={logoSrc} 
              alt="Laboratory Emblem" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-md" 
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{labName}</h1>
            <p className="text-xs text-slate-400">Official Disease Surveillance & Diagnostic Network</p>
          </div>
        </div>

        <button
          id="verification-header-login-btn"
          onClick={handleLogin}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Login</span>
        </button>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-xl w-full mx-auto my-8 sm:my-12">
        <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Mail Icon Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <MailCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>

          {/* Title & Badge */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Firebase Email Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verify Your Email Address
            </h2>
          </div>

          {/* Primary Verification Message (Exact required phrasing) */}
          <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-3 text-left">
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              We have sent you a verification email to <span className="text-emerald-400 font-bold underline underline-offset-2 break-all">{email}</span>. Please verify it and log in.
            </p>
          </div>

          {/* Step Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400">Step 1</span>
              <p className="text-slate-300">Open your inbox at <span className="font-mono text-slate-200">{email}</span></p>
            </div>
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400">Step 2</span>
              <p className="text-slate-300">Click the confirmation link sent by Firebase Auth</p>
            </div>
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400">Step 3</span>
              <p className="text-slate-300">Click the Login button below to access the platform</p>
            </div>
          </div>

          {/* Primary Login Action Button */}
          <div className="pt-2 space-y-3">
            <button
              id="verification-primary-login-btn"
              onClick={handleLogin}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-emerald-900/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <p className="text-[11px] text-slate-400">
              Did not receive the email? Please check your Spam or Junk folder.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        Oromia Regional Veterinary Laboratories Network • Firebase Authentication Security
      </footer>
    </div>
  );
};
