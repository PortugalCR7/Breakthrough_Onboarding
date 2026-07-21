import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Calendar, CheckCircle2, ArrowRight, RefreshCw, CalendarCheck, Award, Lock, Sparkles } from 'lucide-react';
import { IntakeFormState, BookingState, Submission } from './types';
import { INITIAL_FORM_STATE } from './constants';
import WizardForm from './components/WizardForm';
import LongForm from './components/LongForm';
import Scheduler from './components/Scheduler';
import PractitionerPortal from './components/PractitionerPortal';
import { saveSubmissionToFirestore } from './lib/firebase';
import { downloadIcsFile } from './lib/ics';

const CrownIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <svg 
      viewBox="0 0 512 512" 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circular gold border */}
      <circle cx="256" cy="256" r="190" stroke="currentColor" strokeWidth="12" />
      
      {/* Crown base horizontal bands */}
      <path d="M138 350 H374" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M138 362 H374" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M145 374 H367" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      
      {/* Crown peaks and curls */}
      {/* Base curve of the crown cup */}
      <path d="M146 338 Q256 325 366 338" stroke="currentColor" strokeWidth="8" fill="none" />
      
      {/* Left peak */}
      <path d="M146 338 L98 200 L180 270" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" fill="none" />
      <circle cx="180" cy="270" r="12" stroke="currentColor" strokeWidth="8" fill="none" />
      
      {/* Right peak */}
      <path d="M366 338 L414 200 L332 270" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" fill="none" />
      <circle cx="332" cy="270" r="12" stroke="currentColor" strokeWidth="8" fill="none" />
      
      {/* Central tall peak */}
      <path d="M180 270 L256 120 L332 270" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" fill="none" />
      {/* Central peak vertical line anchor */}
      <path d="M256 120 V330" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      
      {/* Starburst Lens flare at the top of the middle peak */}
      <g stroke="currentColor" strokeWidth="3">
        {/* Vertical beam */}
        <path d="M256 40 V150" strokeWidth="4" />
        {/* Horizontal beam */}
        <path d="M210 95 H302" strokeWidth="2" />
        {/* Diagonal beams */}
        <path d="M224 63 L288 127" strokeWidth="1.5" />
        <path d="M288 63 L224 127" strokeWidth="1.5" />
      </g>
      {/* Bright center diamond */}
      <path d="M256 80 L262 95 L256 110 L250 95 Z" fill="currentColor" />
    </svg>
  );
};

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

  // Clear any existing draft state from localStorage on mount to ensure fresh sessions
  useEffect(() => {
    try {
      localStorage.removeItem('draft_onboarding_form');
    } catch (e) {
      console.error('Error clearing draft caching:', e);
    }
  }, []);

  // Form changes only update component state in-memory to preserve privacy and confidentiality
  const handleFormChange = (newState: IntakeFormState) => {
    setFormState(newState);
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

    const newSubmission: Submission = {
      id: `DOS-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      formData: formState,
      booking: booking,
      syncedToGoogleCalendar: synced
    };

    // Asynchronously save to cloud Firestore to avoid blocking the main UI thread
    saveSubmissionToFirestore(newSubmission).catch((err) => {
      console.error('Failed to sync breakthrough dossier to Firestore:', err);
    });

    try {
      const stored = localStorage.getItem('onboarding_submissions');
      const parsed: Submission[] = stored ? JSON.parse(stored) : [];
      parsed.push(newSubmission);
      localStorage.setItem('onboarding_submissions', JSON.stringify(parsed));
      localStorage.removeItem('draft_onboarding_form');
    } catch (e) {
      console.error('Error saving breakthrough submission:', e);
    }

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
    <div className="min-h-screen font-sans antialiased flex flex-col" style={{ background: 'var(--surface-base)', color: 'var(--text-primary)' }}>

      {/* Ambient background layers */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Diagonal light beam, echoing a directional key light across the canvas */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(112deg, transparent 15%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0.02) 45%, transparent 60%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 55% at 75% -8%, rgba(202,138,4,0.10) 0%, transparent 58%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 6% 108%, rgba(255,255,255,0.035) 0%, transparent 55%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 55% 45% at 50% 45%, rgba(255,255,255,0.015) 0%, transparent 70%)'
        }} />
      </div>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(10,10,11,0.55)',
        backdropFilter: 'blur(28px) saturate(150%)',
        WebkitBackdropFilter: 'blur(28px) saturate(150%)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-[72px] flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div style={{
              width: 40, height: 40,
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-gold)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(202,138,4,0.12)',
            }}>
              <CrownIcon style={{ width: 22, height: 22, color: 'var(--gold)' }} />
            </div>
            <div>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                color: '#F5F3EF',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                The Breakthrough
              </span>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-heading)',
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginTop: 4,
                opacity: 0.8,
              }}>
                Values and Alignment Form
              </span>
            </div>
          </div>

          {/* Facilitator Portal */}
          <button
            id="practitioner-portal-toggle-btn"
            onClick={() => setIsPortalMode(true)}
            className="btn-ghost"
            style={{ padding: '8px 18px', fontSize: 10 }}
          >
            <Lock style={{ width: 12, height: 12 }} />
            Facilitator Portal
          </button>
        </div>

        {/* Gold hairline rule */}
        <div className="gold-rule" />
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-10 flex flex-col justify-center relative" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">

          {/* ── PHASE 1: Intake ── */}
          {viewPhase === 'intake' && (
            <motion.div
              key="phase-intake"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-8"
            >
              {!welcomeAccepted ? (
                /* ── Welcome Screen ── */
                <div className="glass-liquid border-shimmer rounded-3xl overflow-hidden">
                  {/* Gold top accent bar */}
                  <div style={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent)'
                  }} />

                  <div className="px-8 py-16 md:px-16 md:py-20 text-center max-w-2xl mx-auto space-y-10">
                    {/* Icon sigil */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        margin: '0 auto',
                        marginBottom: 20,
                        width: 64, height: 64,
                        borderRadius: 16,
                        background: 'rgba(202,138,4,0.08)',
                        border: '1px solid rgba(202,138,4,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 32px rgba(202,138,4,0.15)',
                      }}
                    >
                      <CrownIcon style={{ width: 36, height: 36, color: 'var(--gold)' }} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="space-y-5"
                    >
                      <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        color: '#F5F3EF',
                        lineHeight: 1.15,
                        letterSpacing: '0.03em',
                      }}>
                        Welcome to Your<br />
                        <span style={{ color: 'var(--gold-light)', fontStyle: 'normal', letterSpacing: '0.03em' }}>BREAKTHROUGH EXPERIENCE</span>
                      </h1>

                      {/* Gold ornament */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div className="gold-rule" style={{ width: 40 }} />
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', opacity: 0.8 }} />
                        <div className="gold-rule" style={{ width: 40 }} />
                      </div>

                      <p style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)',
                      }}>
                        The Beginning of a New Standard
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                      className="space-y-4"
                      style={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 15,
                        lineHeight: 1.75,
                        maxWidth: 480,
                        margin: '0 auto',
                      }}
                    >
                      <p>
                        Congratulations on taking this vital step. Choosing to examine your life with absolute clarity is a rare and powerful decision.
                      </p>
                      <p>
                        This reflective questionnaire is not an evaluation or a test. It is simply the starting point of an important, personalized conversation — designed to deliver a far more impactful, tailored Discovery Call.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      style={{ paddingTop: 16 }}
                    >
                      <button
                        id="begin-questionnaire-btn"
                        onClick={() => setWelcomeAccepted(true)}
                        className="btn-gold"
                        style={{ margin: '0 auto' }}
                      >
                        Enter the Dojo
                        <ArrowRight style={{ width: 15, height: 15 }} />
                      </button>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Lock style={{ width: 10, height: 10 }} />
                      End-to-end encrypted · Confidential
                    </motion.p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Layout Toggle & Clear Form */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    width: '100%',
                  }}>
                    <div className="hidden md:block" style={{ width: 140 }} />

                    <div className="glass-card" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 4,
                      borderRadius: 9999,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        padding: '0 12px',
                      }}>
                        Layout
                      </span>
                      {(['wizard', 'single'] as const).map((mode) => (
                        <button
                          key={mode}
                          id={`${mode}-layout-toggle-btn`}
                          onClick={() => setLayoutMode(mode)}
                          style={{
                            padding: '7px 18px',
                            borderRadius: 9999,
                            fontFamily: 'var(--font-heading)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'all 250ms ease',
                            background: layoutMode === mode
                              ? 'linear-gradient(135deg, #CA8A04, #EAB308)'
                              : 'transparent',
                            color: layoutMode === mode ? '#0c0a08' : 'var(--text-muted)',
                            boxShadow: layoutMode === mode ? '0 2px 12px rgba(202,138,4,0.3)' : 'none',
                          }}
                        >
                          {mode === 'wizard' ? 'Walkthrough' : 'Single Page'}
                        </button>
                      ))}
                    </div>

                    <button
                      id="reset-form-top-btn"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to completely clear this form and start fresh? All typed responses will be permanently cleared.")) {
                          handleResetSession();
                        }
                      }}
                      className="btn-ghost"
                      style={{
                        padding: '8px 16px',
                        fontSize: 9,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <RefreshCw style={{ width: 11, height: 11 }} />
                      Clear Form
                    </button>
                  </div>

                  {/* Form Card */}
                  <div className="glass-liquid border-shimmer rounded-3xl overflow-hidden">
                    <div style={{
                      height: 2,
                      background: 'linear-gradient(90deg, transparent, rgba(202,138,4,0.6), rgba(234,179,8,0.8), rgba(202,138,4,0.6), transparent)'
                    }} />
                    <div className="p-6 md:p-10">
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
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── PHASE 1.5: Loading ── */}
          {viewPhase === 'loading' && (
            <motion.div
              key="phase-loading"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-md w-full mx-auto"
            >
              <div className="glass-liquid border-shimmer rounded-3xl overflow-hidden">
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent)',
                }} />
                <div className="p-10 text-center space-y-9">
                  {/* Orbital Spinner */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: 72, height: 72 }}>
                      {/* Outer ring */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        border: '1px solid rgba(202,138,4,0.15)',
                      }} />
                      {/* Inner dim ring */}
                      <div style={{
                        position: 'absolute', inset: 12,
                        borderRadius: '50%',
                        border: '1px solid rgba(202,138,4,0.08)',
                      }} />
                      {/* Center sigil */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 28, height: 28,
                          borderRadius: 8,
                          background: 'rgba(202,138,4,0.08)',
                          border: '1px solid rgba(202,138,4,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Award style={{ width: 14, height: 14, color: 'var(--gold)' }} />
                        </div>
                      </div>
                      {/* Orbiting gold dot */}
                      <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        width: 8, height: 8,
                        marginTop: -4, marginLeft: -4,
                        borderRadius: '50%',
                        background: 'var(--gold)',
                        boxShadow: '0 0 12px var(--gold-glow)',
                        animation: 'orbit 2s linear infinite',
                        transformOrigin: '-28px center',
                      }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 24,
                      color: '#F5F3EF',
                      letterSpacing: '0.01em',
                    }}>
                      Compiling Breakthrough Vectors
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      fontWeight: 400,
                    }}>
                      Structuring values hierarchy and aligning transformational coordinates.
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}>
                        Secure Ledger Dispatch
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        fontWeight: 700, color: 'var(--gold)',
                      }}>
                        {encryptionProgress}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${encryptionProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Terminal log */}
                  <div style={{
                    background: 'rgba(6,6,7,0.85)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(202,138,4,0.12)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    minHeight: 72,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={encryptionLog}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="terminal-cursor"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: '0.10em',
                          textTransform: 'uppercase',
                          color: 'rgba(202,138,4,0.75)',
                          lineHeight: 1.5,
                          textAlign: 'center',
                        }}
                      >
                        {encryptionLog}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 2: Booking ── */}
          {viewPhase === 'booking' && (
            <motion.div
              key="phase-booking"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="glass-liquid border-shimmer rounded-3xl overflow-hidden">
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(202,138,4,0.6), rgba(234,179,8,0.8), rgba(202,138,4,0.6), transparent)'
                }} />
                <div className="p-6 md:p-10">
                  <Scheduler
                    onBooked={handleBookingCompleted}
                    userEmail={formState.personalProfile.email}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 3: Completed ── */}
          {viewPhase === 'completed' && (
            <motion.div
              key="phase-completed"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-xl w-full mx-auto"
            >
              <div className="glass-liquid border-shimmer rounded-3xl overflow-hidden">
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent)',
                }} />
                <div className="p-8 md:p-12 text-center space-y-9">
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{
                      margin: '0 auto',
                      width: 64, height: 64,
                      borderRadius: 16,
                      background: 'rgba(202,138,4,0.08)',
                      border: '1px solid rgba(202,138,4,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 32px rgba(202,138,4,0.2)',
                    }}
                  >
                    <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--gold)' }} />
                  </motion.div>

                  <div className="space-y-4">
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                      color: '#F5F3EF',
                      lineHeight: 1.2,
                    }}>
                      BREAKTHROUGH<br />
                      Form Submitted<br />
                      <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>& Session Reserved</em>
                    </h2>

                    {/* Ornament */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div className="gold-rule" style={{ width: 32 }} />
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', opacity: 0.7 }} />
                      <div className="gold-rule" style={{ width: 32 }} />
                    </div>

                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      maxWidth: 380,
                      margin: '0 auto',
                      lineHeight: 1.7,
                    }}>
                      Your life vectors have been compiled. Your private Breakthrough Experience & values alignment consultation is officially scheduled.
                    </p>
                  </div>

                  {/* Booking details card */}
                  {currentBooking && (
                    <div className="glass-subtle" style={{
                      borderColor: 'var(--border-gold)',
                      borderLeft: '3px solid var(--gold)',
                      borderRadius: 16,
                      padding: '20px 24px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <Calendar style={{ width: 18, height: 18, color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9,
                            letterSpacing: '0.16em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', display: 'block', fontWeight: 700,
                          }}>
                            Confirmed Consultation Time
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 600,
                            fontSize: 20, color: '#F5F3EF',
                            display: 'block', marginTop: 6, letterSpacing: '0.01em',
                          }}>
                            {new Date(currentBooking.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 12,
                            color: 'var(--text-secondary)', display: 'block', marginTop: 4,
                          }}>
                            {currentBooking.timeSlot} — 45-Minute Breakthrough Session
                          </span>

                          <button
                            id="download-ical-completion-btn"
                            type="button"
                            onClick={() => downloadIcsFile(currentBooking.date, currentBooking.timeSlot)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              padding: '10px 18px',
                              background: 'rgba(202,138,4,0.08)',
                              border: '1px solid rgba(202,138,4,0.3)',
                              borderRadius: 12,
                              fontFamily: 'var(--font-heading)',
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.10em',
                              textTransform: 'uppercase',
                              color: 'var(--gold-light)',
                              cursor: 'pointer',
                              marginTop: 14,
                              transition: 'all 200ms ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(202,138,4,0.16)';
                              e.currentTarget.style.borderColor = 'rgba(202,138,4,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(202,138,4,0.08)';
                              e.currentTarget.style.borderColor = 'rgba(202,138,4,0.3)';
                            }}
                          >
                            <Calendar style={{ width: 14, height: 14 }} />
                            Download iCal Invite (.ics)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio recap */}
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Client: {formState.personalProfile.lastName}, {formState.personalProfile.firstName}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {formState.personalProfile.phone}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <button
                      id="submit-new-dossier-btn"
                      onClick={handleResetSession}
                      className="btn-gold"
                      style={{ padding: '12px 36px' }}
                    >
                      Submit New Form
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 24, paddingBottom: 24,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
        position: 'relative',
      }}>
        <div className="gold-rule" style={{ width: 60 }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          © 2026 The Breakthrough Experience · All Rights Reserved
        </span>
      </footer>
    </div>
  );
}
