export interface PersonalProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string; // State or Country
  preferredCommunication: string; // e.g., "WhatsApp", "Signal", "SMS", "Phone"
}

export interface ChallengesAndValues {
  primaryStruggle: string[]; // e.g., ["Lack of Vision & Purpose", "Relationship Conflicts"]
  currentImpediments: string[]; // e.g., ["Procrastination & self-sabotage", "Fear of failure"]
  priorExperience: string[]; // e.g., ["Coaching", "Values Determination"]
}

export interface BreakthroughGoals {
  transformationAreas: string[]; // 7 Areas of Life
  breakthroughVision: string; // Free text field for notes
}

export interface IntakeFormState {
  personalProfile: PersonalProfile;
  challengesAndValues: ChallengesAndValues;
  goals: BreakthroughGoals;
}

export interface BookingState {
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "09:00 AM"
}

export interface Submission {
  id: string;
  createdAt: string;
  formData: IntakeFormState;
  booking: BookingState | null;
  syncedToGoogleCalendar: boolean;
}
