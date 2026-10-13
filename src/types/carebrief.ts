export type Role = 'patient' | 'doctor';
export interface Patient { 
  id: string; 
  name: string; 
  age: number; 
  sex: string; 
  mobile: string; 
  language: string;
  aadhaar?: string;
  photo?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
}

export interface ExtractedFinding {
  test: string;
  value: string;
  unit: string;
  alertLevel: 'critical' | 'warning' | 'normal';
  remark: string;
}

export interface MedicalRecord { 
  id: string; 
  title: string; 
  type: 'Visit' | 'Lab report' | 'Prescription' | 'Discharge summary'; 
  date: string; 
  doctor: string; 
  description: string; 
  confirmed: boolean;
  hospital?: string;
  fileUrl?: string;
}

export interface ConsultationDraft { 
  specialty: string; 
  clinic: string; 
  doctor: string; 
  slot: string; 
  complaint: string; 
  started: string; 
  severity: number; 
  symptoms: string; 
  treatments: string; 
  betterOrWorse?: 'Better' | 'Worse' | 'The same' | 'Not sure';
  takenMedicineAlready?: boolean;
  allergies: string; 
  medicines: string; 
  conditions: string[]; 
  pastHistory: string; 
  consent: boolean;
  vitals?: {
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    temperature: string;
    spo2: string;
    weight: string;
  };
}

export interface UploadedDocument { 
  id: string; 
  name: string; 
  type: string; 
  reportDate: string; 
  lastHospital?: string;
  url: string; 
  status: 'Uploaded' | 'Reading' | 'Done' | 'Needs manual review';
  extractedText?: string;
  extractedFindings?: ExtractedFinding[];
}

export interface Receipt { 
  reference: string; 
  tokenNumber: string;
  submittedAt: string; 
  patient: Patient;
  draft: ConsultationDraft; 
  documentCount: number;
  documents?: UploadedDocument[] | undefined;
  aiBriefSummary: string;
  dangerousFindings: ExtractedFinding[];
}
