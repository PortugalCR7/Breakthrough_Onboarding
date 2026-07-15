import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { IntakeFormState } from '../types';
import { PRIMARY_STRUGGLES, CURRENT_IMPEDIMENTS, PRIOR_EXPERIENCE, TRANSFORMATION_AREAS } from '../constants';

interface WizardFormProps {
  data: IntakeFormState;
  onChange: (newData: IntakeFormState) => void;
  onSubmit: () => void;
}

export default function WizardForm({ data, onChange, onSubmit }: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      const { firstName, lastName, email, phone, city, state, preferredCommunication } = data.personalProfile;
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!city.trim()) newErrors.city = 'City is required';
      if (!state.trim()) newErrors.state = 'State/Country is required';
      if (!preferredCommunication) newErrors.preferredCommunication = 'Preferred communication method is required';
    }

    if (step === 1) {
      if (data.goals.transformationAreas.length === 0) {
        newErrors.transformationAreas = 'Please select at least one area of life for transformation';
      }
    }

    if (step === 2) {
      const struggles = Array.isArray(data.challengesAndValues.primaryStruggle)
        ? data.challengesAndValues.primaryStruggle
        : [];
      if (struggles.length === 0) {
        newErrors.primaryStruggle = 'Please select your primary life struggle or challenge';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateProfileField = (field: keyof typeof data.personalProfile, value: string) => {
    const updated = {
      ...data,
      personalProfile: { ...data.personalProfile, [field]: value }
    };
    onChange(updated);
    if (errors[field]) {
      setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
    }
  };

  const togglePrimaryStruggle = (value: string) => {
    const currentList = Array.isArray(data.challengesAndValues.primaryStruggle)
      ? data.challengesAndValues.primaryStruggle : [];
    const index = currentList.indexOf(value);
    let updatedList = [...currentList];
    if (index > -1) { updatedList.splice(index, 1); }
    else if (updatedList.length < 3) { updatedList.push(value); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, primaryStruggle: updatedList } });
    if (errors.primaryStruggle) {
      setErrors(prev => { const copy = { ...prev }; delete copy.primaryStruggle; return copy; });
    }
  };

  const toggleImpediment = (impediment: string) => {
    const impediments = [...data.challengesAndValues.currentImpediments];
    const index = impediments.indexOf(impediment);
    if (index > -1) { impediments.splice(index, 1); } else { impediments.push(impediment); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, currentImpediments: impediments } });
  };

  const togglePriorExperience = (exp: string) => {
    const experiences = [...data.challengesAndValues.priorExperience];
    const index = experiences.indexOf(exp);
    if (index > -1) { experiences.splice(index, 1); } else { experiences.push(exp); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, priorExperience: experiences } });
  };

  const toggleTransformationArea = (area: string) => {
    const areas = [...data.goals.transformationAreas];
    const index = areas.indexOf(area);
    if (index > -1) { areas.splice(index, 1); }
    else if (areas.length < 3) { areas.push(area); }
    onChange({ ...data, goals: { ...data.goals, transformationAreas: areas } });
    if (errors.transformationAreas) {
      setErrors(prev => { const copy = { ...prev }; delete copy.transformationAreas; return copy; });
    }
  };

  const updateVision = (value: string) => {
    onChange({ ...data, goals: { ...data.goals, breakthroughVision: value } });
  };

  const progressPercentage = ((currentStep + 1) / 3) * 100;

  const STEPS = [
    { roman: 'I', title: 'Contact Info' },
    { roman: 'II', title: 'Transformation' },
    { roman: 'III', title: 'Obstacles' },
  ];

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    msg ? (
      <span style={{
        display: 'flex', alignItems: 'center', gap: 5, marginTop: 6,
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'rgba(239,68,68,0.85)', letterSpacing: '0.06em',
      }}>
        <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
        {msg}
      </span>
    ) : null;

  return (
    <div id="wizard-form-container" className="w-full">

      {/* ── Progress Header ── */}
      <div className="glass-subtle" style={{
        marginBottom: 36,
        borderRadius: 16,
        padding: '18px 22px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: 9,
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--text-muted)', fontWeight: 600,
          }}>
            Onboarding Phase {currentStep + 1} of 3
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            fontWeight: 700, color: 'var(--gold)',
          }}>
            {Math.round(progressPercentage)}% Aligned
          </span>
        </div>

        {/* Gold progress bar */}
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Step indicators */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 16, paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {STEPS.map((step, idx) => {
            const isActive = currentStep === idx;
            const isDone = currentStep > idx;
            return (
              <div key={step.title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  transition: 'all 400ms ease',
                  ...(isActive ? {
                    background: 'var(--gold)',
                    border: '1px solid var(--gold)',
                    color: '#0c0a08',
                    boxShadow: '0 0 12px rgba(202,138,4,0.4)',
                  } : isDone ? {
                    background: 'rgba(202,138,4,0.12)',
                    border: '1px solid rgba(202,138,4,0.35)',
                    color: 'var(--gold)',
                  } : {
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }),
                }}>
                  {isDone ? '✓' : step.roman}
                </div>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontSize: 10,
                  fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: isActive ? 'var(--text-primary)' : isDone ? 'var(--gold-dim)' : 'var(--text-muted)',
                  display: 'none',
                }} className="sm:inline-block">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form Content ── */}
      <div style={{ minHeight: 420 }}>
        <AnimatePresence mode="wait">

          {/* Step 0: Contact Info */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-6"
            >
              <StepHeader roman="I" title="PRIMARY CONTACT INFORMATION" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrap label="First Name" error={errors.firstName}>
                  <input
                    id="first-name-input"
                    type="text"
                    value={data.personalProfile.firstName}
                    onChange={(e) => updateProfileField('firstName', e.target.value)}
                    placeholder="e.g., Jean"
                    className={`input-dark${errors.firstName ? ' error' : ''}`}
                  />
                </FieldWrap>

                <FieldWrap label="Last Name" error={errors.lastName}>
                  <input
                    id="last-name-input"
                    type="text"
                    value={data.personalProfile.lastName}
                    onChange={(e) => updateProfileField('lastName', e.target.value)}
                    placeholder="e.g., Dupont"
                    className={`input-dark${errors.lastName ? ' error' : ''}`}
                  />
                </FieldWrap>

                <div className="sm:col-span-2">
                  <FieldWrap label="Email Address" error={errors.email}>
                    <input
                      id="email-input"
                      type="email"
                      value={data.personalProfile.email}
                      onChange={(e) => updateProfileField('email', e.target.value)}
                      placeholder="e.g., jean.dupont@elitevision.com"
                      className={`input-dark${errors.email ? ' error' : ''}`}
                    />
                  </FieldWrap>
                </div>

                <FieldWrap label="Mobile Number" error={errors.phone}>
                  <input
                    id="phone-input"
                    type="tel"
                    value={data.personalProfile.phone}
                    onChange={(e) => updateProfileField('phone', e.target.value)}
                    placeholder="e.g., +1 (555) 0199"
                    className={`input-dark${errors.phone ? ' error' : ''}`}
                  />
                </FieldWrap>

                <FieldWrap label="Preferred Communication" error={errors.preferredCommunication}>
                  <select
                    id="preferred-comm-select"
                    value={data.personalProfile.preferredCommunication}
                    onChange={(e) => updateProfileField('preferredCommunication', e.target.value)}
                    className={`input-dark${errors.preferredCommunication ? ' error' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select a method...</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Signal">Signal</option>
                    <option value="SMS">SMS</option>
                    <option value="Phone">Phone</option>
                  </select>
                </FieldWrap>

                <FieldWrap label="City" error={errors.city}>
                  <input
                    id="city-input"
                    type="text"
                    value={data.personalProfile.city}
                    onChange={(e) => updateProfileField('city', e.target.value)}
                    placeholder="e.g., Zurich"
                    className={`input-dark${errors.city ? ' error' : ''}`}
                  />
                </FieldWrap>

                <FieldWrap label="State / Country" error={errors.state}>
                  <input
                    id="state-input"
                    type="text"
                    value={data.personalProfile.state}
                    onChange={(e) => updateProfileField('state', e.target.value)}
                    placeholder="e.g., Switzerland"
                    className={`input-dark${errors.state ? ' error' : ''}`}
                  />
                </FieldWrap>
              </div>
            </motion.div>
          )}

          {/* Step 1: Transformation Targets */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-6"
            >
              <StepHeader roman="II" title="TRANSFORMATION TARGETS" />

              {/* Transformation Areas */}
              <div>
                <SectionLabel
                  label="A. Determine Target Areas of Your Breakthrough"
                  hint="Select up to three, in order of priority"
                />
                <div className="grid grid-cols-1 gap-2.5">
                  {TRANSFORMATION_AREAS.map((area) => {
                    const isChecked = data.goals.transformationAreas.includes(area);
                    const rankIndex = data.goals.transformationAreas.indexOf(area);
                    return (
                      <button
                        key={area}
                        id={`area-btn-${area.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => toggleTransformationArea(area)}
                        className={`select-card${isChecked ? ' selected' : ''}`}
                      >
                        <div className={`select-card-rank${isChecked ? ' selected' : ''}`}>
                          {isChecked ? rankIndex + 1 : null}
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-sans)', fontWeight: 500,
                          fontSize: 15, letterSpacing: '0.01em',
                          color: 'var(--text-primary)',
                          transition: 'color 300ms ease',
                        }}>
                          {area}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <ErrorMsg msg={errors.transformationAreas} />
              </div>

              {/* Breakthrough Vision */}
              <div style={{ paddingTop: 8 }}>
                <SectionLabel label="B. Describe Your Ideal Breakthrough" />
                <textarea
                  id="notes-textarea"
                  value={data.goals.breakthroughVision}
                  onChange={(e) => updateVision(e.target.value)}
                  placeholder="Share details regarding your most pressing challenge, relationship dynamics, or specific blocks you wish to resolve. What is the emotional breakthrough that would make the biggest impact?"
                  rows={5}
                  className="input-dark"
                  style={{ resize: 'vertical', lineHeight: 1.7 }}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Obstacles & Challenges */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-8"
            >
              <StepHeader roman="III" title="OBSTACLES & CHALLENGES" />

              {/* Primary Struggles */}
              <div>
                <SectionLabel
                  label="A. What are your primary struggles holding you back?"
                  hint="Select up to three, in order of priority"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRIMARY_STRUGGLES.map((struggle) => {
                    const currentList = Array.isArray(data.challengesAndValues.primaryStruggle)
                      ? data.challengesAndValues.primaryStruggle : [];
                    const isSelected = currentList.includes(struggle.value);
                    const rankIndex = currentList.indexOf(struggle.value);
                    return (
                      <button
                        key={struggle.value}
                        id={`struggle-btn-${struggle.value.replace(/\s+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => togglePrimaryStruggle(struggle.value)}
                        className={`select-card${isSelected ? ' selected' : ''}`}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '16px 18px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 600,
                            fontSize: 14, color: isSelected ? '#EAB308' : 'var(--text-primary)',
                            transition: 'color 300ms ease',
                          }}>
                            {struggle.label}
                          </span>
                          {isSelected && (
                            <div className="select-card-rank selected" style={{ width: 22, height: 22, fontSize: 10 }}>
                              {rankIndex + 1}
                            </div>
                          )}
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-sans)', fontSize: 12,
                          color: 'var(--text-secondary)', lineHeight: 1.6,
                          fontWeight: 400,
                        }}>
                          {struggle.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <ErrorMsg msg={errors.primaryStruggle} />
              </div>

              {/* Impediments */}
              <div>
                <SectionLabel
                  label="B. Identify Current Mental & Behavioral Blocks"
                  hint="Select all that apply"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CURRENT_IMPEDIMENTS.map((imp) => {
                    const isChecked = data.challengesAndValues.currentImpediments.includes(imp);
                    return (
                      <button
                        key={imp}
                        id={`impediment-btn-${imp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => toggleImpediment(imp)}
                        className={`select-card${isChecked ? ' selected' : ''}`}
                        style={{ gap: 12 }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: isChecked ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
                          background: isChecked ? 'var(--gold)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 250ms ease',
                          boxShadow: isChecked ? '0 0 8px rgba(202,138,4,0.3)' : 'none',
                        }}>
                          {isChecked && <span style={{ fontSize: 10, fontWeight: 900, color: '#0c0a08', lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-sans)', fontSize: 13,
                          color: 'var(--text-primary)',
                          fontWeight: isChecked ? 600 : 400,
                          transition: 'color 250ms ease',
                        }}>
                          {imp}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prior Experience */}
              <div>
                <SectionLabel label="C. Personal Development Experience to Date" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRIOR_EXPERIENCE.map((exp) => {
                    const isChecked = data.challengesAndValues.priorExperience.includes(exp);
                    return (
                      <button
                        key={exp}
                        id={`experience-tag-${exp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => togglePriorExperience(exp)}
                        className={`tag-pill${isChecked ? ' selected' : ''}`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Navigation Controls ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 44, paddingTop: 24,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          id="wizard-back-btn"
          type="button"
          onClick={handleBack}
          className="btn-ghost"
          style={{
            opacity: currentStep === 0 ? 0 : 1,
            pointerEvents: currentStep === 0 ? 'none' : 'auto',
          }}
        >
          <ChevronLeft style={{ width: 15, height: 15 }} />
          Back
        </button>

        <button
          id="wizard-next-btn"
          type="button"
          onClick={handleNext}
          className="btn-gold"
        >
          {currentStep === 2 ? 'Compile & Align' : 'Next Stage'}
          <ChevronRight style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StepHeader({ roman, title }: { roman: string; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      marginBottom: 28, paddingBottom: 18,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: 'rgba(202,138,4,0.08)',
        border: '1px solid rgba(202,138,4,0.3)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
        color: 'var(--gold)',
        lineHeight: 1,
      }}>
        {roman}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
        color: '#F5F3EF', letterSpacing: '0.01em',
        lineHeight: 1.2,
      }}>
        {title}
      </h3>
    </div>
  );
}

function SectionLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{
        display: 'block',
        fontFamily: 'var(--font-heading)', fontSize: 10,
        fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}>
        {label}
      </span>
      {hint && (
        <span style={{
          display: 'block', marginTop: 4,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          ({hint})
        </span>
      )}
    </div>
  );
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 8,
        fontFamily: 'var(--font-heading)', fontSize: 10,
        fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5, marginTop: 6,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(239,68,68,0.85)', letterSpacing: '0.06em',
        }}>
          <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
          {error}
        </span>
      )}
    </div>
  );
}
