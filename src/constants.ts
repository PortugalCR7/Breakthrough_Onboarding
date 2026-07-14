import { IntakeFormState } from './types';

export const PRIMARY_STRUGGLES = [
  { value: 'Lack of Vision & Purpose', label: 'Lack of Vision & Purpose', description: 'Feeling uninspired, lost, or unclear about your highest values and life direction.' },
  { value: 'Relationship & Family Conflicts', label: 'Relationship Conflicts', description: 'Navigating resentment, communication gaps, or deep tension with partners, family, or friends.' },
  { value: 'Career & Business Stagnation', label: 'Vocation & Career Expansion', description: 'Uncovering your purpose, expanding your vision, and transitioning into your true high-value calling.' },
  { value: 'Financial Blockages & Debt', label: 'Financial Blockages', description: 'Struggling to build wealth, charge your worth, or overcome limiting wealth beliefs.' },
  { value: 'Emotional Baggage, Guilt or Resentment', label: 'Emotional Baggage & Guilt', description: 'Carrying heavy anger, guilt, shame, or regret from relationships or infatuations.' },
  { value: 'Motivation & Discipline', label: 'Motivation & Discipline', description: 'Struggling with consistency, daily action, lethargy, or maintaining physical and mental momentum.' },
  { value: 'Spiritual Void or Disconnection', label: 'Spiritual Void', description: 'Yearning for deeper alignment and connection with a greater order.' },
] as const;

export const CURRENT_IMPEDIMENTS = [
  "Procrastination & chronic self-sabotage",
  "Fear of failure, rejection, or public criticism",
  "Unresolved resentment or guilt toward specific individuals",
  "Letting others' expectations or values become obstacles to your own path",
  "Imbalanced perceptions (feeling overly infatuated or highly resentful)",
  "Lack of structured, high-value daily action steps",
  "Feeling overwhelmed by daily emotional triggers or anxiety",
  "Difficulty retaining wealth or undervaluing yourself financially",
];

export const PRIOR_EXPERIENCE = [
  "Meditation",
  "Yoga",
  "Breathwork",
  "Plant Medicine",
  "Executive Coaching",
  "Performance Coaching",
  "Therapy",
  "Books",
  "Retreats",
  "Other"
];

export const TRANSFORMATION_AREAS = [
  "Clarifying your true mission and achieving career mastery",
  "Overcoming financial limits and growing sustainable wealth",
  "Achieving vibrant health, body alignment, and high energy",
  "Expanding mental focus, intellectual power, and genius",
  "Deepening inner wisdom, equanimity, and presence",
  "Cultivating intimacy, authentic relating, and deep fulfillment in relationships",
  "Establishing clear boundaries, high standards, and alignment of values",
  "Developing authentic leadership, social influence, and legacy",
];

export const INITIAL_FORM_STATE: IntakeFormState = {
  personalProfile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    preferredCommunication: '',
  },
  challengesAndValues: {
    primaryStruggle: [],
    currentImpediments: [],
    priorExperience: [],
  },
  goals: {
    transformationAreas: [],
    breakthroughVision: '',
  },
};
