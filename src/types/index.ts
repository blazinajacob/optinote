// User types
export type UserRole = 'doctor' | 'technician' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Patient types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  // New fields
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  background?: {
    language: string;
    ethnicity: string;
    race: string;
  };
  occupation?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  surgeries?: string[];
  substanceUse?: {
    smoking: string;
    alcohol: string;
    drugs: string;
  };
  nutrition?: string;
  exercise?: string;
  stress?: string;
  familyHistory?: string;
  createdAt: string;
  updatedAt: string;
}

// Examination types
export interface Vision {
  rightEye: {
    uncorrected?: string;
    corrected?: string;
    pinhole?: string;
  };
  leftEye: {
    uncorrected?: string;
    corrected?: string;
    pinhole?: string;
  };
}

export interface Refraction {
  rightEye: {
    sphere?: number;
    cylinder?: number;
    axis?: number;
    add?: number;
    pd?: number;
  };
  leftEye: {
    sphere?: number;
    cylinder?: number;
    axis?: number;
    add?: number;
    pd?: number;
  };
}

export interface PupilTest {
  rightEye: {
    size?: number;
    reaction?: 'normal' | 'sluggish' | 'fixed';
    RAPD?: boolean;
  };
  leftEye: {
    size?: number;
    reaction?: 'normal' | 'sluggish' | 'fixed';
    RAPD?: boolean;
  };
}

export interface AutoRefraction {
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
}

export interface CoverTest {
  distance: 'ortho' | 'eso' | 'exo' | 'hyper' | 'hypo' | 'not_tested';
  distanceAmount?: number;
  near: 'ortho' | 'eso' | 'exo' | 'hyper' | 'hypo' | 'not_tested';
  nearAmount?: number;
  notes?: string;
}

export interface ConfrontationFields {
  rightEye: {
    superior?: boolean;
    inferior?: boolean;
    nasal?: boolean;
    temporal?: boolean;
  };
  leftEye: {
    superior?: boolean;
    inferior?: boolean;
    nasal?: boolean;
    temporal?: boolean;
  };
  notes?: string;
}

export interface ColorVisionTest {
  rightEye: {
    performed: boolean;
    result?: 'normal' | 'deficient';
    value?: number;
    type?: 'ishihara' | 'hrr' | 'other';
  };
  leftEye: {
    performed: boolean;
    result?: 'normal' | 'deficient';
    value?: number;
    type?: 'ishihara' | 'hrr' | 'other';
  };
  notes?: string;
}

export interface StereoTest {
  performed: boolean;
  test?: 'titmus' | 'randot' | 'other';
  result?: number;
  notes?: string;
}

export interface PreTestData {
  autoRefraction?: AutoRefraction;
  coverTest?: CoverTest;
  confrontationFields?: ConfrontationFields;
  colorVision?: ColorVisionTest;
  stereoVision?: StereoTest;
}

export interface Examination {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  chiefComplaint: string;
  vision: Vision;
  intraocularPressure?: {
    rightEye?: number;
    leftEye?: number;
  };
  refraction?: Refraction;
  pupils?: PupilTest;
  anteriorSegment?: string;
  posteriorSegment?: string;
  diagnosis?: string[];
  plan?: string;
  followUp?: string;
  status: 'in-progress' | 'completed';
  images?: ExamImage[];
  preTestData?: PreTestData;
  createdAt: string;
  updatedAt: string;
}

export interface ExamImage {
  id: string;
  examinationId: string;
  type: 'fundus' | 'oct' | 'topography' | 'other';
  url: string;
  notes?: string;
  createdAt: string;
}

export interface ScanResult {
  id: string;
  examinationId: string;
  patientId: string;
  type: 'oct' | 'fundus' | 'visual_field' | 'topography' | 'pachymetry' | 'iol_master' | 'other';
  imageUrl: string;
  date: string;
  notes?: string;
  findings?: string;
  performedBy: string;
  status: 'completed' | 'pending_review';
}

// SOAP Note types
export interface SOAPNote {
  id: string;
  examinationId: string;
  patientId: string;
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10Codes: ICD10Code[];
  mipsCompliant: boolean;
  mipsCategories?: string[];
  returnToClinic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICD10Code {
  code: string;
  description: string;
}

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'new-patient' | 'follow-up' | 'emergency' | 'other';
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: string;
  patientId: string;
  examinationId?: string;
  amount: number;
  method: 'cash' | 'credit-card' | 'insurance' | 'other';
  status: 'pending' | 'completed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Timeline types
export interface TimelineEvent {
  id: string;
  type: 'appointment' | 'examination' | 'record' | 'note' | 'document';
  title: string;
  date: string;
  icon: any; // Lucide icon component
  iconBackground: string;
  content: string;
  link?: string;
  status?: string;
}

// Document types
export interface PatientDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: 'medical_record' | 'insurance' | 'prescription' | 'imaging' | 'lab_result' | 'other';
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}