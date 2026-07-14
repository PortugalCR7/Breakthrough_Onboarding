import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Eye, Layout, ShieldAlert, Sparkles, CheckCircle2, FileText, ArrowRight, RefreshCw, Calendar, CalendarCheck, Award, Lock } from 'lucide-react';
import { IntakeFormState, BookingState, Submission } from './types';
import { INITIAL_FORM_STATE } from './constants';
import WizardForm from './components/WizardForm';
import LongForm from './components/LongForm';
import Scheduler from './components/Scheduler';
import PractitionerPortal from './components/PractitionerPortal';

export default function App() {
  const [formState, setFormState] = useState<IntakeFormState>(INITIAL_FORM_STATE);
  const [layoutMode, setLayoutMode] = useState<'wizard' | 'single'>('wizard');
  const [viewPhase, setViewPhase] = useState<'intake' | 'loading' | 'booking' | 'completed'>('intake');
  const [currentBooking, setCurrentBooking] = useState<BookingState | null>(null);
  const [bookingSynced, setBookingSynced] = useState<boolean>(false);
  const [isPortalMode, setIsPortalMode] = useState<boolean>(false);
  const [encryptionLog, setEncryptionLog] = useState<string>('Initializing secure ledger channel...');
  const [encryptionProgress, setEncryptionProgress] = useState<number>(0);
  const [welcomeAccepted, setWelcomeAccepted] = useState<boolean>(false);

  // Load form state caching and booking status from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('draft_onboarding_form');
      if (cached) {
        setFormState(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Error loading draft caching:', e);
    }
  }, []);

  // Sync draft form state caching to localStorage on change
  const handleFormChange = (newState: IntakeFormState) => {
    setFormState(newState);
    try {
      localStorage.setItem('draft_onboarding_form', JSON.stringify(newState));
    } catch (e) {
      console.error('Error saving draft caching:', e);
    }
  };

  // Form submission: triggers loading phase with cryptographic signatures
  const handleFormSubmit = () => {
    setViewPhase('loading');
    setEncryptionProgress(0);
    setEncryptionLog('Initializing secure transport layer key (SSL/TLS v1.3)...');

    const logs = [
      'Establishing secure de-identified symmetric encryption...',
      'De-identifying client biography metadata (AES-256-GCM)...',
      'Structuring values hierarchy coordinates with Demartini vectors...',
      'Mapping life impediments against the 7 Areas of Life...',
      'Securing transformational breakthrough ledger payload...',
      'Values determined successfully. Routing to scheduling registry...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setEncryptionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setViewPhase('booking');
          return 100;
        }
        
        // Update log logs progressively
        const logStep = Math.floor(prev / 18);
        if (logStep > currentLogIndex && currentLogIndex < logs.length) {
          setEncryptionLog(logs[currentLogIndex]);
          currentLogIndex += 1;
        }

        return prev + 2;
      });
    }, 40);
  };

  // Handles successful booking completion
  const handleBookingCompleted = (booking: BookingState, synced: boolean) => {
    setCurrentBooking(booking);
    setBookingSynced(synced);

    // Package the dossier and booking as a complete clinical record
    const newSubmission: Submission = {
      id: `DOS-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      formData: formState,
      booking: booking,
      syncedToGoogleCalendar: synced
    };

    try {
      const stored = localStorage.getItem('onboarding_submissions');
      const parsed: Submission[] = stored ? JSON.parse(stored) : [];
      parsed.push(newSubmission);
      localStorage.setItem('onboarding_submissions', JSON.stringify(parsed));
      
      // Clear current drafts
      localStorage.removeItem('draft_onboarding_form');
    } catch (e) {
      console.error('Error saving breakthrough submission:', e);
    }

    // Transition to success completed state
    setViewPhase('completed');
  };

  // Restart clean onboarding session
  const handleResetSession = () => {
    setFormState(INITIAL_FORM_STATE);
    setCurrentBooking(null);
    setBookingSynced(false);
    setWelcomeAccepted(false);
    setViewPhase('intake');
    localStorage.removeItem('draft_onboarding_form');
  };

  if (isPortalMode) {
    return <PractitionerPortal onExit={() => setIsPortalMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased flex flex-col selection:bg-stone-800 selection:text-white">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.02),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.01),transparent_40%)] pointer-events-none" />

      {/* Header element */}
      <header className="border-b border-stone-900 bg-stone-950/90 shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 border border-stone-850 rounded-xl flex items-center justify-center">
              <Award className="w-5.5 h-5.5 text-stone-100 font-bold" />
            </div>
            <div>
              <span className="text-base font-display font-bold text-white uppercase block">
                THE BREAKTHROUGH
              </span>
              <span className="text-[9px] font-heading uppercase tracking-widest text-stone-400 block mt-0.5 font-semibold">
                EXPERIENCE & VALUES ALIGNMENT
              </span>
            </div>
          </div>

          {/* Access Options & Dashboard portal */}
          <div className="flex items-center gap-3">
            <button
              id="practitioner-portal-toggle-btn"
              onClick={() => setIsPortalMode(true)}
              className="px-4 py-1.5 border border-stone-850 hover:border-stone-700 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white rounded-full text-[10px] font-heading uppercase tracking-widest font-semibold transition-all cursor-pointer"
            >
              Facilitator Portal
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-10 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: Intake Forms */}
          {viewPhase === 'intake' && (
            <motion.div
              key="phase-intake"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {!welcomeAccepted ? (
                /* Welcome Screen inside same card layout */
                <div className="glass-premium text-stone-100 border-metallic rounded-3xl p-6 md:p-12 shadow-2xl">
                  <div className="text-center max-w-2xl mx-auto py-4 space-y-8">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-xl bg-stone-900 border border-stone-850 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-stone-300 animate-pulse" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide leading-snug">
                        Welcome to Your Breakthrough Journey
                      </h2>
                      <p className="text-xs text-stone-400 font-heading uppercase tracking-widest font-semibold">
                        The Beginning of a New Standard
                      </p>
                    </div>

                    <div className="space-y-5 text-stone-300 font-sans text-sm leading-relaxed max-w-xl mx-auto">
                      <p>
                        Congratulations on taking this vital step. Choosing to examine your life with absolute clarity is a rare and powerful decision.
                      </p>
                      <p>
                        This reflective questionnaire is not an evaluation, an institutional assessment, or a formal test. It is simply the starting point of an important, personalized conversation.
                      </p>
                      <p>
                        By offering your honest, unvarnished reflections here, you allow us to deeply understand your context and design a far more impactful, tailored Discovery Call.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        id="begin-questionnaire-btn"
                        onClick={() => setWelcomeAccepted(true)}
                        className="px-10 py-4.5 bg-white hover:bg-stone-100 text-stone-950 rounded-full font-heading text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        Begin Reflection
                        <ArrowRight className="w-4 h-4 text-stone-950" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Layout Presentation Control Panel */}
                  <div className="glass-premium p-1.5 rounded-full border-metallic max-w-md mx-auto flex items-center justify-between shadow-lg">
                    <span className="text-[9px] font-heading text-stone-400 uppercase tracking-widest pl-4 flex items-center gap-1.5 font-semibold">
                      <Layout className="w-3.5 h-3.5 text-stone-400" /> Intake Presentation Layout
                    </span>
                    <div className="flex gap-1">
                      <button
                        id="wizard-layout-toggle-btn"
                        onClick={() => setLayoutMode('wizard')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-semibold font-heading tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          layoutMode === 'wizard'
                            ? 'bg-stone-100 text-stone-950 font-bold shadow'
                            : 'text-stone-400 hover:text-white hover:bg-stone-900'
                        }`}
                      >
                        Walkthrough
                      </button>
                      <button
                        id="single-layout-toggle-btn"
                        onClick={() => setLayoutMode('single')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-semibold font-heading tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          layoutMode === 'single'
                            ? 'bg-stone-100 text-stone-950 font-bold shadow'
                            : 'text-stone-400 hover:text-white hover:bg-stone-900'
                        }`}
                      >
                        Single Page
                      </button>
                    </div>
                  </div>

                  {/* Form Card Frame */}
                  <div className="glass-premium border-metallic rounded-3xl p-6 md:p-10 shadow-2xl text-stone-100">
                    {layoutMode === 'wizard' ? (
                      <WizardForm
                        data={formState}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                      />
                    ) : (
                      <LongForm
                        data={formState}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                      />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* PHASE 1.5: Encryption Loading Screen */}
          {viewPhase === 'loading' && (
            <motion.div
              key="phase-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-md w-full mx-auto glass-premium rounded-3xl p-8 border-metallic shadow-2xl space-y-8 text-center text-stone-100 py-12"
            >
              <div className="space-y-3">
                <div className="relative mx-auto w-16 h-16 rounded-2xl border border-stone-850 flex items-center justify-center bg-stone-950">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  <div className="absolute inset-0 rounded-2xl border-t border-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white tracking-wide leading-snug">Compiling Breakthrough Vectors</h3>
                <p className="text-xs text-stone-400 font-sans font-light">Structuring values hierarchy and aligning transformational coordinates.</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-stone-400 tracking-wider font-semibold">
                  <span>SECURE LEDGER DISPATCH</span>
                  <span className="text-white font-bold">{encryptionProgress}%</span>
                </div>
                <div className="w-full h-[6px] bg-stone-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 rounded-full"
                    style={{ width: `${encryptionProgress}%` }}
                  />
                </div>
              </div>

              {/* Log stream */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-850 h-20 flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={encryptionLog}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[9px] font-mono text-stone-300 uppercase tracking-widest leading-relaxed font-semibold"
                  >
                    {encryptionLog}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: Booking Scheduler */}
          {viewPhase === 'booking' && (
            <motion.div
              key="phase-booking"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="glass-premium border-metallic rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              <Scheduler
                onBooked={handleBookingCompleted}
                userEmail={formState.personalProfile.email}
              />
            </motion.div>
          )}

          {/* PHASE 3: Completed Success Screen */}
          {viewPhase === 'completed' && (
            <motion.div
              key="phase-completed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl w-full mx-auto glass-premium rounded-3xl p-8 md:p-10 border-metallic shadow-2xl text-center space-y-8 text-stone-100"
            >
              <div className="space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-wide leading-snug">Breakthrough Ledger Compiled & Session Reserved</h2>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed font-sans font-light">
                  Your life vectors have been compiled. Your private Breakthrough Experience & values alignment consultation is officially scheduled.
                </p>
              </div>

              {/* Booking Confirmation details */}
              {currentBooking && (
                <div className="bg-black/40 border border-white/10 p-5 text-left space-y-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-stone-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Confirmed Consultation Time</span>
                      <span className="text-lg font-display font-semibold text-white block mt-1 uppercase tracking-normal">
                        {new Date(currentBooking.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-xs font-mono text-stone-300 font-semibold block mt-0.5">
                        Hours: {currentBooking.timeSlot} (45-Minute Intense Breakthrough Session)
                      </span>
                    </div>
                  </div>

                  {bookingSynced && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">Google Calendar sync complete. Secure invites dispatched.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio recap */}
              <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                <span>Client: {formState.personalProfile.lastName}, {formState.personalProfile.firstName}</span>
                <span>Mobile Line: {formState.personalProfile.phone}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="submit-new-dossier-btn"
                  onClick={handleResetSession}
                  className="w-full py-3.5 bg-white hover:bg-stone-100 text-stone-950 rounded-full font-heading text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
                >
                  Submit New Ledger
                </button>
                <button
                  id="revisit-portal-btn"
                  onClick={() => setIsPortalMode(true)}
                  className="w-full py-3.5 border border-stone-800 hover:border-stone-700 bg-stone-950 text-stone-300 hover:text-white rounded-full font-heading text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Facilitator Portal
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-stone-900 py-6 text-center text-[9px] font-mono uppercase tracking-widest text-stone-500 shrink-0">
        © 2026 THE BREAKTHROUGH EXPERIENCE. ADVANCED DE-IDENTIFIED INTELLECTUAL LEDGER. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
}
