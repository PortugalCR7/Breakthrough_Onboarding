import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
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

    // Personal Profile
    const { firstName, lastName, email, phone, city, state, preferredCommunication } = data.personalProfile;
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State/Country is required";
    if (!preferredCommunication) newErrors.preferredCommunication = "Preferred communication method is required";

    // Transformation Targets
    if (data.goals.transformationAreas.length === 0) {
      newErrors.transformationAreas = "Please select at least one area of life for transformation";
    }

    // Challenges
    const struggles = Array.isArray(data.challengesAndValues.primaryStruggle)
      ? data.challengesAndValues.primaryStruggle
      : [];
    if (struggles.length === 0) {
      newErrors.primaryStruggle = "Please select your primary life struggle or challenge";
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
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`long-err-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const updateProfileField = (field: keyof typeof data.personalProfile, value: string) => {
    const updated = {
      ...data,
      personalProfile: {
        ...data.personalProfile,
        [field]: value
      }
    };
    onChange(updated);
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const togglePrimaryStruggle = (value: string) => {
    const currentList = Array.isArray(data.challengesAndValues.primaryStruggle)
      ? data.challengesAndValues.primaryStruggle
      : [];
    const index = currentList.indexOf(value);
    let updatedList = [...currentList];
    if (index > -1) {
      updatedList.splice(index, 1);
    } else {
      if (updatedList.length < 3) {
        updatedList.push(value);
      }
    }
    const updated = {
      ...data,
      challengesAndValues: {
        ...data.challengesAndValues,
        primaryStruggle: updatedList
      }
    };
    onChange(updated);
    if (errors.primaryStruggle) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.primaryStruggle;
        return copy;
      });
    }
  };

  const toggleImpediment = (impediment: string) => {
    const impediments = [...data.challengesAndValues.currentImpediments];
    const index = impediments.indexOf(impediment);
    if (index > -1) {
      impediments.splice(index, 1);
    } else {
      impediments.push(impediment);
    }
    onChange({
      ...data,
      challengesAndValues: {
        ...data.challengesAndValues,
        currentImpediments: impediments
      }
    });
  };

  const togglePriorExperience = (exp: string) => {
    const experiences = [...data.challengesAndValues.priorExperience];
    const index = experiences.indexOf(exp);
    if (index > -1) {
      experiences.splice(index, 1);
    } else {
      experiences.push(exp);
    }
    onChange({
      ...data,
      challengesAndValues: {
        ...data.challengesAndValues,
        priorExperience: experiences
      }
    });
  };

  const toggleTransformationArea = (area: string) => {
    const areas = [...data.goals.transformationAreas];
    const index = areas.indexOf(area);
    if (index > -1) {
      areas.splice(index, 1);
    } else {
      if (areas.length < 3) {
        areas.push(area);
      }
    }
    onChange({
      ...data,
      goals: {
        ...data.goals,
        transformationAreas: areas
      }
    });

    if (errors.transformationAreas) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.transformationAreas;
        return copy;
      });
    }
  };

  const updateVision = (value: string) => {
    onChange({
      ...data,
      goals: {
        ...data.goals,
        breakthroughVision: value
      }
    });
  };

  return (
    <form id="long-form-container" onSubmit={handleSubmit} className="w-full space-y-12 text-stone-200">
      {/* SECTION 1: Primary Contact Information */}
      <section className="bg-black p-6 md:p-8 rounded-2xl border-metallic shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
          <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0">
            01
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">Primary Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="long-first-name" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">First Name</label>
            <input
              id="long-first-name"
              type="text"
              value={data.personalProfile.firstName}
              onChange={(e) => updateProfileField('firstName', e.target.value)}
              placeholder="e.g., Jean"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.firstName ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.firstName && (
              <span id="long-err-firstName" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.firstName}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="long-last-name" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Last Name</label>
            <input
              id="long-last-name"
              type="text"
              value={data.personalProfile.lastName}
              onChange={(e) => updateProfileField('lastName', e.target.value)}
              placeholder="e.g., Dupont"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.lastName ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.lastName && (
              <span id="long-err-lastName" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.lastName}
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="long-email" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Email Address</label>
            <input
              id="long-email"
              type="email"
              value={data.personalProfile.email}
              onChange={(e) => updateProfileField('email', e.target.value)}
              placeholder="e.g., jean.dupont@elitevision.com"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.email ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.email && (
              <span id="long-err-email" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="long-phone" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Mobile Number</label>
            <input
              id="long-phone"
              type="tel"
              value={data.personalProfile.phone}
              onChange={(e) => updateProfileField('phone', e.target.value)}
              placeholder="e.g., +1 (555) 0199"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.phone ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.phone && (
              <span id="long-err-phone" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="long-preferred-comm" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Preferred Communication</label>
            <select
              id="long-preferred-comm"
              value={data.personalProfile.preferredCommunication}
              onChange={(e) => updateProfileField('preferredCommunication', e.target.value)}
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all text-sm font-sans rounded-xl cursor-pointer ${
                errors.preferredCommunication ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <option value="" className="text-stone-500 bg-white">Select a method...</option>
              <option value="WhatsApp" className="text-stone-900 bg-white">WhatsApp</option>
              <option value="Signal" className="text-stone-900 bg-white">Signal</option>
              <option value="SMS" className="text-stone-900 bg-white">SMS</option>
              <option value="Phone" className="text-stone-900 bg-white">Phone</option>
            </select>
            {errors.preferredCommunication && (
              <span id="long-err-preferredCommunication" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.preferredCommunication}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="long-city" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">City</label>
            <input
              id="long-city"
              type="text"
              value={data.personalProfile.city}
              onChange={(e) => updateProfileField('city', e.target.value)}
              placeholder="e.g., Zurich"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.city ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.city && (
              <span id="long-err-city" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.city}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="long-state" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">State / Country</label>
            <input
              id="long-state"
              type="text"
              value={data.personalProfile.state}
              onChange={(e) => updateProfileField('state', e.target.value)}
              placeholder="e.g., Switzerland"
              className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                errors.state ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            />
            {errors.state && (
              <span id="long-err-state" className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.state}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Transformation Targets */}
      <section className="bg-black p-6 md:p-8 rounded-2xl border-metallic shadow-2xl space-y-6">
        <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
          <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0">
            02
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">Transformation Targets</h3>
        </div>

        {/* Desired Outcomes Checkboxes */}
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
            Determine Target Areas of Your Breakthrough
            <span className="block mt-1 text-[9px] font-normal text-stone-500 font-heading tracking-widest uppercase">(SELECT UP TO THREE IN ORDER OF PRIORITY)</span>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {TRANSFORMATION_AREAS.map((area) => {
              const isChecked = data.goals.transformationAreas.includes(area);
              const rankIndex = data.goals.transformationAreas.indexOf(area);
              return (
                <button
                  key={area}
                  id={`long-outcome-btn-${area.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => toggleTransformationArea(area)}
                  className={`flex items-center gap-4 text-left p-4.5 border rounded-2xl transition-all duration-300 cursor-pointer ${
                    isChecked
                      ? 'border-white bg-white shadow-lg text-stone-950'
                      : 'border-stone-200 bg-stone-100 text-stone-900 hover:bg-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                    isChecked ? 'bg-stone-950 border-stone-950 text-white font-bold' : 'border-stone-300 bg-stone-200'
                  }`}>
                    {isChecked ? (
                      <span className="text-xs leading-none font-bold font-mono">
                        {rankIndex + 1}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className={`text-sm sm:text-base font-display tracking-tight font-bold ${isChecked ? 'text-black' : 'text-stone-900'}`}>{area}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.transformationAreas && (
            <span id="long-err-transformationAreas" className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.transformationAreas}
            </span>
          )}
        </div>

        {/* Breakthrough Vision text */}
        <div>
          <label htmlFor="long-notes-textarea" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-2">
            Describe Your Ideal Breakthrough
          </label>
          <textarea
            id="long-notes-textarea"
            value={data.goals.breakthroughVision}
            onChange={(e) => updateVision(e.target.value)}
            placeholder="Example: Share details regarding your most pressing challenge, relationship dynamics, or specific blocks you wish to resolve in this breakthrough session. What is the emotional breakthrough that would make the biggest impact?"
            rows={5}
            className="w-full px-4 py-3 bg-stone-100 border border-stone-200 hover:border-stone-300 rounded-2xl text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans font-medium leading-relaxed"
          />
        </div>
      </section>

      {/* SECTION 3: Obstacles & Challenges */}
      <section className="bg-black p-6 md:p-8 rounded-2xl border-metallic shadow-2xl space-y-8">
        <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
          <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0">
            03
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">Obstacles & Challenges</h3>
        </div>

        {/* Primary Struggles Selector (Up to three) */}
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
            What are your primary struggles or challenges you feel are holding you back?
            <span className="block mt-1 text-[9px] font-normal text-stone-500 font-heading tracking-widest uppercase">(SELECT UP TO THREE, IN ORDER OF PRIORITY)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIMARY_STRUGGLES.map((struggle) => {
              const currentList = Array.isArray(data.challengesAndValues.primaryStruggle)
                ? data.challengesAndValues.primaryStruggle
                : [];
              const isSelected = currentList.includes(struggle.value);
              const rankIndex = currentList.indexOf(struggle.value);
              return (
                <button
                  key={struggle.value}
                  id={`long-struggle-btn-${struggle.value.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => togglePrimaryStruggle(struggle.value)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    isSelected
                      ? 'border-white bg-white shadow-lg text-stone-950'
                      : 'border-stone-200 bg-stone-100 hover:bg-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`font-display font-bold text-sm sm:text-base tracking-tight ${isSelected ? 'text-stone-950' : 'text-stone-900'}`}>{struggle.label}</span>
                    {isSelected && (
                      <div className="w-5.5 h-5.5 rounded-full bg-stone-950 border border-stone-950 text-white font-bold flex items-center justify-center font-mono text-xs leading-none shrink-0">
                        {rankIndex + 1}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed font-sans font-light ${isSelected ? 'text-stone-700' : 'text-stone-600'}`}>{struggle.description}</p>
                </button>
              );
            })}
          </div>
          {errors.primaryStruggle && (
            <span id="long-err-primaryStruggle" className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.primaryStruggle}
            </span>
          )}
        </div>

        {/* Impediments */}
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
            Identify Current Mental & Behavioral Blocks
            <span className="block mt-1 text-[9px] font-normal text-stone-500 font-heading tracking-widest uppercase">(SELECT ALL THAT APPLY)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CURRENT_IMPEDIMENTS.map((imp) => {
              const isChecked = data.challengesAndValues.currentImpediments.includes(imp);
              return (
                <button
                  key={imp}
                  id={`long-impediment-btn-${imp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => toggleImpediment(imp)}
                  className={`flex items-center gap-3.5 text-left p-4 border rounded-xl transition-all font-sans cursor-pointer ${
                    isChecked
                      ? 'border-white bg-white text-stone-950 font-bold'
                      : 'border-stone-200 bg-stone-100 hover:border-stone-300 text-stone-800 hover:bg-stone-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    isChecked ? 'bg-stone-950 border-stone-950 text-white font-bold' : 'border-stone-300 bg-stone-200'
                  }`}>
                    {isChecked && <span className="text-xs leading-none">✓</span>}
                  </div>
                  <span className={`text-xs sm:text-sm font-normal ${isChecked ? 'text-stone-950 font-semibold' : 'text-stone-800'}`}>{imp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prior Experience */}
        <div>
          <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
            Personal Development Experience to Date
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PRIOR_EXPERIENCE.map((exp) => {
              const isChecked = data.challengesAndValues.priorExperience.includes(exp);
              return (
                <button
                  key={exp}
                  id={`long-preference-tag-${exp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => togglePriorExperience(exp)}
                  className={`px-4 py-2.5 text-xs sm:text-sm rounded-full border transition-all font-sans cursor-pointer ${
                    isChecked
                      ? 'border-white bg-white text-stone-950 font-bold shadow-sm'
                      : 'border-stone-200 bg-stone-100 text-stone-800 hover:border-stone-300 hover:bg-stone-200 hover:text-stone-950'
                  }`}
                >
                  {exp}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Validation Alert if errors exist */}
      {submittedAttempted && Object.keys(errors).length > 0 && (
        <div id="long-form-error-banner" className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display font-bold text-white tracking-tight text-lg uppercase">Incomplete Alignment Parameters</h4>
            <p className="text-xs text-stone-300 mt-1">There are {Object.keys(errors).length} outstanding areas. Please review the highlighted fields above.</p>
          </div>
        </div>
      )}

      {/* Unified Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          id="long-submit-btn"
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4.5 bg-white hover:bg-stone-100 text-stone-950 font-heading text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer animate-pulse-subtle"
        >
          <Sparkles className="w-4 h-4" /> Submit Ledger & Book Session
        </button>
      </div>
    </form>
  );
}
