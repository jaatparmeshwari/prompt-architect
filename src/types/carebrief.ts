export type Role = 'patient' | 'doctor';
export interface Patient { id: string; name: string; age: number; sex: string; mobile: string; language: string }
export interface MedicalRecord { id: string; title: string; type: 'Visit' | 'Lab report' | 'Prescription' | 'Discharge summary'; date: string; doctor: string; description: string; confirmed: boolean }
export interface ConsultationDraft { specialty: string; clinic: string; doctor: string; slot: string; complaint: string; started: string; severity: number; symptoms: string; treatments: string; allergies: string; medicines: string; conditions: string[]; pastHistory: string; consent: boolean }
export interface UploadedDocument { id: string; name: string; type: string; reportDate: string; url: string; status: 'Uploaded' | 'Reading' | 'Done' | 'Needs manual review' }
export interface Receipt { reference: string; submittedAt: string; draft: ConsultationDraft; documentCount: number }
