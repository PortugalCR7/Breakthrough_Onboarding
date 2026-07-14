import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, HelpCircle, Award } from 'lucide-react';
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
      // Validate Personal Profile
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
    }

    if (step === 1) {
      // Validate Goals / Transformation Areas
      if (data.goals.transformationAreas.length === 0) {
        newErrors.transformationAreas = "Please select at least one area of life for transformation";
      }
    }

    if (step === 2) {
      // Validate Challenges / Impediments
      const struggles = Array.isArray(data.challengesAndValues.primaryStruggle)
        ? data.challengesAndValues.primaryStruggle
        : [];
      if (struggles.length === 0) {
        newErrors.primaryStruggle = "Please select your primary life struggle or challenge";
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

  const progressPercentage = ((currentStep + 1) / 3) * 100;

  return (
    <div id="wizard-form-container" className="w-full text-stone-200">
      {/* Progress Bar Header */}
      <div className="mb-10 bg-black p-5 border-metallic rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-heading uppercase tracking-widest text-stone-400 font-bold">
            Onboarding Phase {currentStep + 1} of 3
          </span>
          <span className="text-[10px] font-heading uppercase tracking-widest text-white font-bold">
            {Math.round(progressPercentage)}% Aligned
          </span>
        </div>
        <div className="w-full h-[6px] bg-stone-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step Titles Indicator */}
        <div className="flex justify-between mt-6 border-t border-stone-850 pt-4">
          {[
            { label: 'I', title: 'Contact Info' },
            { label: 'II', title: 'Transformation' },
            { label: 'III', title: 'Obstacles' }
          ].map((step, idx) => (
            <div
              key={step.title}
              className={`flex items-center gap-2.5 transition-colors duration-300 ${
                currentStep === idx
                  ? 'text-white font-semibold font-heading'
                  : currentStep > idx
                  ? 'text-stone-300 font-medium'
                  : 'text-stone-500'
              }`}
            >
              <span className={`text-xs font-mono border rounded-full w-7 h-7 flex items-center justify-center transition-all ${
                currentStep === idx
                  ? 'border-white bg-white text-stone-950 font-bold shadow-md'
                  : currentStep > idx
                  ? 'border-stone-500 bg-stone-800 text-stone-200 font-bold'
                  : 'border-stone-800 bg-transparent'
              }`}>
                {currentStep > idx ? '✓' : step.label}
              </span>
              <span className="text-xs font-display tracking-widest uppercase hidden sm:inline">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
                <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 flex items-center justify-center font-mono text-sm font-bold shrink-0">
                  I
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">
                  Primary Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first-name-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">First Name</label>
                  <input
                    id="first-name-input"
                    type="text"
                    value={data.personalProfile.firstName}
                    onChange={(e) => updateProfileField('firstName', e.target.value)}
                    placeholder="e.g., Jean"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.firstName ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.firstName && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.firstName}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="last-name-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Last Name</label>
                  <input
                    id="last-name-input"
                    type="text"
                    value={data.personalProfile.lastName}
                    onChange={(e) => updateProfileField('lastName', e.target.value)}
                    placeholder="e.g., Dupont"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.lastName ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.lastName && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.lastName}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Email Address</label>
                  <input
                    id="email-input"
                    type="email"
                    value={data.personalProfile.email}
                    onChange={(e) => updateProfileField('email', e.target.value)}
                    placeholder="e.g., jean.dupont@elitevision.com"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.email ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.email && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="phone-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Mobile Number</label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={data.personalProfile.phone}
                    onChange={(e) => updateProfileField('phone', e.target.value)}
                    placeholder="e.g., +1 (555) 0199"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.phone ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="preferred-comm-select" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">Preferred Communication</label>
                  <select
                    id="preferred-comm-select"
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
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.preferredCommunication}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="city-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">City</label>
                  <input
                    id="city-input"
                    type="text"
                    value={data.personalProfile.city}
                    onChange={(e) => updateProfileField('city', e.target.value)}
                    placeholder="e.g., Zurich"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.city ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.city && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="state-input" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 mb-2 font-semibold">State / Country</label>
                  <input
                    id="state-input"
                    type="text"
                    value={data.personalProfile.state}
                    onChange={(e) => updateProfileField('state', e.target.value)}
                    placeholder="e.g., Switzerland"
                    className={`w-full px-4 py-3 bg-stone-100 border text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans rounded-xl ${
                      errors.state ? 'border-red-900 bg-red-950/10 text-stone-100' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  />
                  {errors.state && (
                    <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.state}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
                <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 flex items-center justify-center font-mono text-sm font-bold shrink-0">
                  II
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">
                  Transformation Targets
                </h3>
              </div>

              {/* Transformation Areas */}
              <div>
                <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
                  A. Determine Target Areas of Your Breakthrough
                  <span className="block mt-1 text-[9px] font-normal text-stone-500 font-heading tracking-widest uppercase">(SELECT UP TO THREE IN ORDER OF PRIORITY)</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TRANSFORMATION_AREAS.map((area) => {
                    const isChecked = data.goals.transformationAreas.includes(area);
                    const rankIndex = data.goals.transformationAreas.indexOf(area);
                    return (
                      <button
                        key={area}
                        id={`area-btn-${area.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => toggleTransformationArea(area)}
                        className={`flex items-center gap-4 text-left p-4 border rounded-2xl transition-all duration-300 cursor-pointer ${
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
                  <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.transformationAreas}
                  </span>
                )}
              </div>

              {/* Breakthrough Vision Free Text */}
              <div className="pt-4">
                <label htmlFor="notes-textarea" className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-2">
                  B. Describe Your Ideal Breakthrough
                </label>
                <textarea
                  id="notes-textarea"
                  value={data.goals.breakthroughVision}
                  onChange={(e) => updateVision(e.target.value)}
                  placeholder="Example: Share details regarding your most pressing challenge, relationship dynamics, or specific blocks you wish to resolve in this breakthrough session. What is the emotional breakthrough that would make the biggest impact?"
                  rows={5}
                  className="w-full px-4 py-3 bg-stone-100 border border-stone-200 hover:border-stone-300 rounded-2xl text-stone-950 focus:outline-none focus:bg-white focus:border-stone-950 transition-all placeholder-stone-500 text-sm font-sans font-medium leading-relaxed"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8 border-b border-stone-850 pb-4">
                <div className="w-9 h-9 bg-stone-900 text-stone-100 border border-stone-850 flex items-center justify-center font-mono text-sm font-bold shrink-0">
                  III
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase">
                  Obstacles & Challenges
                </h3>
              </div>

              {/* Primary Life Struggle Selector (Up to three) */}
              <div>
                <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
                  A. What are your primary struggles or challenges you feel are holding you back?
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
                        id={`struggle-btn-${struggle.value.replace(/\s+/g, '-').toLowerCase()}`}
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
                  <span className="text-xs text-red-400 mt-2 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.primaryStruggle}
                  </span>
                )}
              </div>

              {/* Impediments Checkboxes */}
              <div>
                <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
                  B. Identify Current Mental & Behavioral Blocks
                  <span className="block mt-1 text-[9px] font-normal text-stone-500 font-heading tracking-widest uppercase">(SELECT ALL THAT APPLY)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURRENT_IMPEDIMENTS.map((imp) => {
                    const isChecked = data.challengesAndValues.currentImpediments.includes(imp);
                    return (
                      <button
                        key={imp}
                        id={`impediment-btn-${imp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
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

              {/* Prior Development Checkboxes */}
              <div>
                <label className="block text-[10px] font-heading uppercase tracking-widest text-stone-400 font-semibold mb-3">
                  C. Personal Development Experience to Date
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRIOR_EXPERIENCE.map((exp) => {
                    const isChecked = data.challengesAndValues.priorExperience.includes(exp);
                    return (
                      <button
                        key={exp}
                        id={`experience-tag-${exp.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button controls */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-stone-850">
        <button
          id="wizard-back-btn"
          type="button"
          onClick={handleBack}
          className={`flex items-center gap-1 px-5 py-3 font-heading text-xs font-semibold uppercase tracking-widest transition-all rounded-full border ${
            currentStep === 0
              ? 'opacity-0 pointer-events-none'
              : 'border-stone-800 text-stone-400 hover:bg-stone-950 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          id="wizard-next-btn"
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 px-6 py-3 bg-white hover:bg-stone-100 text-stone-950 font-heading text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer"
        >
          {currentStep === 2 ? 'Compile & Align' : 'Next Stage'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
