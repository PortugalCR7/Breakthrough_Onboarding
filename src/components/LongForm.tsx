import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { IntakeFormState } from '../types';
import { PRIMARY_STRUGGLES, CURRENT_IMPEDIMENTS, PRIOR_EXPERIENCE, TRANSFORMATION_AREAS } from '../constants';

interface LongFormProps {
  data: IntakeFormState;
  onChange: (newData: IntakeFormState) => void;
  onSubmit: () => void;
}

export default function LongForm({ data, onChange, onSubmit }: LongFormProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedAttempted, setSubmittedAttempted] = useState(false);

  const validateAll = (): boolean => {
    const newErrors: { [key: string]: string } = {};
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
    if (data.goals.transformationAreas.length === 0) {
      newErrors.transformationAreas = 'Please select at least one area of life for transformation';
    }
    const struggles = Array.isArray(data.challengesAndValues.primaryStruggle)
      ? data.challengesAndValues.primaryStruggle : [];
    if (struggles.length === 0) {
      newErrors.primaryStruggle = 'Please select your primary life struggle or challenge';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempted(true);
    if (validateAll()) {
      onSubmit();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateProfileField = (field: keyof typeof data.personalProfile, value: string) => {
    onChange({ ...data, personalProfile: { ...data.personalProfile, [field]: value } });
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const toggleTransformationArea = (area: string) => {
    const areas = [...data.goals.transformationAreas];
    const idx = areas.indexOf(area);
    if (idx > -1) { areas.splice(idx, 1); }
    else if (areas.length < 3) { areas.push(area); }
    onChange({ ...data, goals: { ...data.goals, transformationAreas: areas } });
    if (errors.transformationAreas) setErrors(prev => { const c = { ...prev }; delete c.transformationAreas; return c; });
  };

  const togglePrimaryStruggle = (value: string) => {
    const list = Array.isArray(data.challengesAndValues.primaryStruggle)
      ? [...data.challengesAndValues.primaryStruggle] : [];
    const idx = list.indexOf(value);
    if (idx > -1) { list.splice(idx, 1); }
    else if (list.length < 3) { list.push(value); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, primaryStruggle: list } });
    if (errors.primaryStruggle) setErrors(prev => { const c = { ...prev }; delete c.primaryStruggle; return c; });
  };

  const toggleImpediment = (imp: string) => {
    const list = [...data.challengesAndValues.currentImpediments];
    const idx = list.indexOf(imp);
    if (idx > -1) { list.splice(idx, 1); } else { list.push(imp); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, currentImpediments: list } });
  };

  const togglePriorExperience = (exp: string) => {
    const list = [...data.challengesAndValues.priorExperience];
    const idx = list.indexOf(exp);
    if (idx > -1) { list.splice(idx, 1); } else { list.push(exp); }
    onChange({ ...data, challengesAndValues: { ...data.challengesAndValues, priorExperience: list } });
  };

  const updateVision = (value: string) => {
    onChange({ ...data, goals: { ...data.goals, breakthroughVision: value } });
  };

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
    <form id="long-form-container" onSubmit={handleSubmit} className="w-full space-y-10">

      {/* ── SECTION 1: Primary Contact Information ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass-subtle"
        style={{ borderRadius: 20, padding: '28px 28px' }}
      >
        <SectionHeader roman="I" title="PRIMARY CONTACT INFORMATION" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldWrap label="First Name" error={errors.firstName}>
            <input
              id="long-first-name"
              type="text"
              value={data.personalProfile.firstName}
              onChange={e => updateProfileField('firstName', e.target.value)}
              placeholder="e.g., Jean"
              className={`input-dark${errors.firstName ? ' error' : ''}`}
            />
          </FieldWrap>

          <FieldWrap label="Last Name" error={errors.lastName}>
            <input
              id="long-last-name"
              type="text"
              value={data.personalProfile.lastName}
              onChange={e => updateProfileField('lastName', e.target.value)}
              placeholder="e.g., Dupont"
              className={`input-dark${errors.lastName ? ' error' : ''}`}
            />
          </FieldWrap>

          <div className="sm:col-span-2">
            <FieldWrap label="Email Address" error={errors.email}>
              <input
                id="long-email"
                type="email"
                value={data.personalProfile.email}
                onChange={e => updateProfileField('email', e.target.value)}
                placeholder="e.g., jean.dupont@elitevision.com"
                className={`input-dark${errors.email ? ' error' : ''}`}
              />
            </FieldWrap>
          </div>

          <FieldWrap label="Mobile Number" error={errors.phone}>
            <input
              id="long-phone"
              type="tel"
              value={data.personalProfile.phone}
              onChange={e => updateProfileField('phone', e.target.value)}
              placeholder="e.g., +1 (555) 0199"
              className={`input-dark${errors.phone ? ' error' : ''}`}
            />
          </FieldWrap>

          <FieldWrap label="Preferred Communication" error={errors.preferredCommunication}>
            <select
              id="long-preferred-comm"
              value={data.personalProfile.preferredCommunication}
              onChange={e => updateProfileField('preferredCommunication', e.target.value)}
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
              id="long-city"
              type="text"
              value={data.personalProfile.city}
              onChange={e => updateProfileField('city', e.target.value)}
              placeholder="e.g., Zurich"
              className={`input-dark${errors.city ? ' error' : ''}`}
            />
          </FieldWrap>

          <FieldWrap label="State / Country" error={errors.state}>
            <input
              id="long-state"
              type="text"
              value={data.personalProfile.state}
              onChange={e => updateProfileField('state', e.target.value)}
              placeholder="e.g., Switzerland"
              className={`input-dark${errors.state ? ' error' : ''}`}
            />
          </FieldWrap>
        </div>
      </motion.section>

      {/* ── SECTION 2: Transformation Targets ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
        className="glass-subtle"
        style={{ borderRadius: 20, padding: '28px 28px' }}
      >
        <SectionHeader roman="II" title="TRANSFORMATION TARGETS" />

        {/* Transformation Areas */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel
            label="A. Determine Target Areas of Your Breakthrough"
            hint="Select up to three, in order of priority"
          />
          <div className="grid grid-cols-1 gap-2.5">
            {TRANSFORMATION_AREAS.map(area => {
              const isChecked = data.goals.transformationAreas.includes(area);
              const rankIndex = data.goals.transformationAreas.indexOf(area);
              return (
                <button
                  key={area}
                  id={`long-outcome-btn-${area.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
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
        <div>
          <SectionLabel label="B. Describe Your Ideal Breakthrough" />
          <textarea
            id="notes-textarea"
            value={data.goals.breakthroughVision}
            onChange={e => updateVision(e.target.value)}
            placeholder="Share details regarding your most pressing challenge, relationship dynamics, or specific blocks you wish to resolve. What is the emotional breakthrough that would make the biggest impact?"
            rows={5}
            className="input-dark"
            style={{ resize: 'vertical', lineHeight: 1.7 }}
          />
        </div>
      </motion.section>

      {/* ── SECTION 3: Obstacles & Challenges ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16, ease: [0.4, 0, 0.2, 1] }}
        className="glass-subtle"
        style={{ borderRadius: 20, padding: '28px 28px' }}
      >
        <SectionHeader roman="III" title="OBSTACLES & CHALLENGES" />

        {/* Primary Struggles */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel
            label="A. What are your primary struggles holding you back?"
            hint="Select up to three, in order of priority"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRIMARY_STRUGGLES.map(struggle => {
              const list = Array.isArray(data.challengesAndValues.primaryStruggle)
                ? data.challengesAndValues.primaryStruggle : [];
              const isSelected = list.includes(struggle.value);
              const rankIndex = list.indexOf(struggle.value);
              return (
                <button
                  key={struggle.value}
                  id={`long-struggle-btn-${struggle.value.replace(/\s+/g, '-').toLowerCase()}`}
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
                    color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 400,
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
        <div style={{ marginBottom: 28 }}>
          <SectionLabel
            label="B. Identify Current Mental & Behavioral Blocks"
            hint="Select all that apply"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CURRENT_IMPEDIMENTS.map(imp => {
              const isChecked = data.challengesAndValues.currentImpediments.includes(imp);
              return (
                <button
                  key={imp}
                  id={`long-impediment-btn-${imp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => toggleImpediment(imp)}
                  className={`select-card${isChecked ? ' selected' : ''}`}
                  style={{ gap: 12 }}
                >
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
            {PRIOR_EXPERIENCE.map(exp => {
              const isChecked = data.challengesAndValues.priorExperience.includes(exp);
              return (
                <button
                  key={exp}
                  id={`long-experience-tag-${exp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
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
      </motion.section>

      {/* ── Global Validation Banner ── */}
      {submittedAttempted && Object.keys(errors).length > 0 && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(185,28,28,0.08)',
          border: '1px solid rgba(185,28,28,0.25)',
          borderRadius: 14,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <AlertCircle style={{ width: 16, height: 16, color: 'rgba(239,68,68,0.8)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              color: '#F5F3EF', letterSpacing: '0.01em',
            }}>
              Incomplete Alignment Parameters
            </span>
            <span style={{
              display: 'block', marginTop: 4,
              fontFamily: 'var(--font-sans)', fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              {Object.keys(errors).length} outstanding area{Object.keys(errors).length > 1 ? 's' : ''} — please review the highlighted fields above.
            </span>
          </div>
        </div>
      )}

      {/* ── Submit Button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          id="long-submit-btn"
          type="submit"
          className="btn-gold"
          style={{ paddingLeft: 40, paddingRight: 40 }}
        >
          <Sparkles style={{ width: 15, height: 15 }} />
          Submit Form & Book Session
        </button>
      </div>
    </form>
  );
}

/* ── Sub-components ── */

function SectionHeader({ roman, title }: { roman: string; title: string }) {
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
        color: '#F5F3EF', letterSpacing: '0.01em', lineHeight: 1.2,
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
