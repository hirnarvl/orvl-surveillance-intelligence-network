import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  UserCheck, 
  Phone, 
  Building, 
  MapPin, 
  Briefcase, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { soundEngine } from '../utils/sound';
import { UserRole, ProfessionalDesignation } from '../types';
import { INITIAL_DEMO_USERS, getRoleDisplayName, getRoleBadgeClass } from '../services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLab?: 'hrvl' | 'arvl';
}

type AuthTab = 'signin' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultLab }) => {
  const { selectedLab, setSelectedLab } = useLaboratory();
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [modalLab, setModalLab] = useState<'hrvl' | 'arvl'>(defaultLab || (selectedLab === 'arvl' ? 'arvl' : 'hrvl'));

  const isArvl = modalLab === 'arvl';
  const logoSrc = isArvl
    ? 'https://lh3.googleusercontent.com/d/1ramCieRBgrY-MWZteIHalwv5vYbIy36R'
    : 'https://lh3.googleusercontent.com/d/1LzxKTsj6b4TO1aIyI-tAddDsR5QMYYom';
  const labName = isArvl
    ? 'Asela Regional Veterinary Laboratory'
    : 'Hirna Regional Veterinary Laboratory';
  const labShort = isArvl ? 'ARVL' : 'HRVL';

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('+251 9');
  const [regEmail, setRegEmail] = useState('');
  const [regRegion, setRegRegion] = useState('Oromia');
  const [regZone, setRegZone] = useState<string>(isArvl ? 'Arsi Zone' : 'West Hararghe');
  const [regDistrict, setRegDistrict] = useState(isArvl ? 'Asella' : 'Hirna');
  const [regDesignation, setRegDesignation] = useState<ProfessionalDesignation>('Veterinarian');
  const [regOrganization, setRegOrganization] = useState(isArvl ? 'Asela Regional Veterinary Laboratory (ARVL)' : 'Hirna Regional Veterinary Laboratory (HRVL)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Status
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { 
    signInWithEmail, 
    registerWithEmail, 
    resetPassword, 
    signInWithGoogle 
  } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    soundEngine.playClick();

    try {
      const user = await signInWithGoogle(modalLab);
      if (user) {
        soundEngine.playSuccess();
        setSelectedLab(modalLab);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.includes('INTERNAL ASSERTION FAILED') ||
        msg.includes('Pending promise was never set') ||
        msg.includes('popup-blocked')
      ) {
        setError('Popup was blocked or closed by your browser. Please allow popups or use email sign-in.');
      } else if (msg.includes('network-request-failed')) {
        setError('Network connectivity issue. Please check your internet connection.');
      } else {
        setError(msg || 'Google authentication failed.');
      }
      soundEngine.playAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    soundEngine.playClick();

    try {
      await signInWithEmail(loginEmail, loginPassword);
      soundEngine.playSuccess();
      setSelectedLab(modalLab);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Invalid credentials or connection error.';
      if (msg.startsWith('UNVERIFIED_EMAIL:')) {
        soundEngine.playAlert();
        onClose();
        return;
      }
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email address or password. Please verify credentials or register.');
      } else {
        setError(msg);
      }
      soundEngine.playAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      soundEngine.playAlert();
      return;
    }

    setLoading(true);
    soundEngine.playClick();

    try {
      await registerWithEmail({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        region: regRegion,
        zone: regZone,
        district: regDistrict,
        professionalDesignation: regDesignation,
        organization: regOrganization,
        intendedLaboratory: modalLab.toUpperCase()
      });

      soundEngine.playSuccess();
      // Close modal immediately so the Verification Screen is shown
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify fields.');
      soundEngine.playAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    soundEngine.playClick();

    try {
      await resetPassword(forgotEmail);
      setForgotSent(true);
      soundEngine.playSuccess();
    } catch (err: any) {
      setError(err?.message || 'Could not send reset instructions.');
      soundEngine.playAlert();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Lab Selector */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
              <img 
                src={logoSrc} 
                alt={`${labShort} Emblem`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-xs" 
              />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {activeTab === 'signin' && 'Institutional Sign In'}
                {activeTab === 'register' && 'Request Laboratory Access'}
                {activeTab === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-300">
                {labName} ({labShort})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Laboratory Context Switcher */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Diagnostic Center:
          </span>
          <div className="flex rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setModalLab('hrvl');
                setRegOrganization('Hirna Regional Veterinary Laboratory (HRVL)');
                setRegZone('West Hararghe');
                setRegDistrict('Hirna');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                modalLab === 'hrvl'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HRVL (Hirna)
            </button>
            <button
              type="button"
              onClick={() => {
                setModalLab('arvl');
                setRegOrganization('Asela Regional Veterinary Laboratory (ARVL)');
                setRegZone('Arsi Zone');
                setRegDistrict('Asella');
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                modalLab === 'arvl'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ARVL (Asela)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('signin');
              setError('');
            }}
            className={`py-2.5 px-3 border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'signin'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('register');
              setError('');
            }}
            className={`py-2.5 px-3 border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Request Membership
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-4">
              {/* Prominent Google Authentication */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center space-x-3 text-sm font-bold text-slate-800 dark:text-white transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center space-x-2 my-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  or sign in with password
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="user@hrvl.health.et"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : `Enter ${labShort} Portal`}</span>
                </button>
              </form>

              {/* Security Architecture Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Security & Authorization Notice</span>
                </div>
                <p>
                  Authentication verifies your identity. Dashboard and laboratory access require an active Firestore user profile approved by laboratory administration.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Access Verification Workflow</p>
                  <p className="text-[11px] opacity-90">
                    All accounts require laboratory administrator approval for {modalLab.toUpperCase()} diagnostic access.
                  </p>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Dr. Abebe Bekele"
                    required
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251 91 234 5678"
                      required
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="abebe.bekele@gov.et"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Organization & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Professional Role
                  </label>
                  <select
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value as ProfessionalDesignation)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Veterinarian">Veterinarian</option>
                    <option value="Veterinary Epidemiologist">Veterinary Epidemiologist</option>
                    <option value="Laboratory Technologist">Laboratory Technologist</option>
                    <option value="Animal Health Assistant">Animal Health Assistant</option>
                    <option value="Surveillance Officer">Surveillance Officer</option>
                    <option value="Laboratory Director">Laboratory Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Target Laboratory
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${modalLab.toUpperCase()} Diagnostic Center`}
                    className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      minLength={6}
                      required
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Submitting Application...' : 'Submit Application for Approval'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Reset Instructions Sent
                  </h3>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-400">
                    If an institutional account exists for <strong>{forgotEmail}</strong>, password reset guidelines have been dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setActiveTab('signin');
                    }}
                    className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your registered email address and we will send password recovery verification.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="user@hrvl.health.et"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="w-1/2 py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Oromia Regional State • Veterinary Services</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Secure RBAC v3.0</span>
        </div>
      </div>
    </div>
  );
};
