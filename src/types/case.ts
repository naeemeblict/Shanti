export type CaseStatus = 'submitted' | 'under_review' | 'completed' | 'archived';
export type ReviewStatus = 'pending' | 'reviewed' | 'requires_followup';
export type GenderType = 'male' | 'female' | 'other';

export interface ModalityItem {
  aggravation?: string;
  amelioration?: string;
}

export interface ModalitiesState {
  time_of_day: ModalityItem;
  movement_posture: ModalityItem;
  food_drinks: ModalityItem;
  weather_season: ModalityItem;
  warmth: ModalityItem;
  cold: ModalityItem;
}

export interface PatientCase {
  id: string;
  caseReference: string;
  patientCode: string;
  createdAt: string;
  updatedAt: string;

  // Section 1: Patient Information
  fullName: string;
  age: number;
  gender?: GenderType;
  occupation?: string;
  contactNumber: string;
  address: string;
  district: string;

  // Section 2: General Questionnaire
  primaryComplaint: string;
  associatedComplaints?: string;
  onsetDuration?: string;
  diseaseWorries?: string;
  dailyThoughts?: string;
  suspectedCause?: string;
  foodCravings?: string;
  foodAversions?: string;
  temperamentMood?: string;
  sleepPattern?: string;
  fears?: string;

  // Section 3: Symptom selections (from 31 items)
  selectedSymptoms: string[];
  symptomClarifications?: Record<string, string>;

  // Section 4: Modalities
  modalities: ModalitiesState;

  // Section 5: Additional Info & Consent
  additionalNotes?: string;
  consentGiven: boolean;
  consentTimestamp: string;

  // Safety & Triage
  hasUrgentRedFlags: boolean;
  redFlagDetails?: string;

  // Administrative
  submissionStatus: CaseStatus;
  reviewStatus: ReviewStatus;

  // AI Synthesis
  aiAnalysis?: AICaseAnalysis;

  // Clinician Notes
  clinicalNotes?: ClinicalNotes;
}

export interface AICaseAnalysis {
  watermark: string;
  generatedAt: string;
  chiefComplaintSummary: string;
  symptomChronology: string;
  modalitySynthesis: {
    aggravation: string[];
    amelioration: string[];
  };
  generalCharacteristics: string;
  unansweredOrAmbiguousPoints: string[];
  suggestedClinicianQuestions: string[];
  safetyObservations: string;
  isApprovedByDoctor?: boolean;
  approvedAt?: string;
  doctorFeedback?: string;
}

export interface ClinicalNotes {
  doctorObservations: string;
  differentialRepertoryNotes?: string;
  prescriptionPlan?: string;
  followUpDate?: string;
  updatedAt: string;
  prescribedBy?: string;
}
