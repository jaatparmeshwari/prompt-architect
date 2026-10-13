import type { Patient, MedicalRecord, ConsultationDraft, Receipt, UploadedDocument } from '@/types/carebrief';
export const useMock = import.meta.env['VITE_USE_MOCK'] !== 'false';
export const defaultPatient: Patient = { 
  id: 'AYU-2026-0842', 
  name: 'Arjun Sharma', 
  age: 34, 
  sex: 'Male', 
  mobile: '9876543210', 
  language: 'English',
  aadhaar: '9876 5432 1098',
  bloodGroup: 'B+',
  address: 'Mumbai, Maharashtra',
  emergencyContact: '9876543211'
};

export const initialPatientDatabase: Patient[] = [
  { 
    id: 'AYU-2026-0842', 
    name: 'Arjun Sharma', 
    age: 34, 
    sex: 'Male', 
    mobile: '9876543210', 
    language: 'English',
    aadhaar: '9876 5432 1098',
    bloodGroup: 'B+',
    address: 'Andheri West, Mumbai',
    emergencyContact: '9876543211'
  },
  {
    id: 'AYU-2026-9412',
    name: 'Priya Verma',
    age: 29,
    sex: 'Female',
    mobile: '9811223344',
    language: 'Hindi',
    aadhaar: '5544 3322 1100',
    bloodGroup: 'O+',
    address: 'Koramangala, Bengaluru',
    emergencyContact: '9811223399'
  },
  {
    id: 'AYU-2026-7241',
    name: 'Vikram Rao',
    age: 52,
    sex: 'Male',
    mobile: '9766554433',
    language: 'English',
    aadhaar: '1122 3344 5566',
    bloodGroup: 'A+',
    address: 'Banjara Hills, Hyderabad',
    emergencyContact: '9766554499'
  }
];

export function getPatientDatabase(): Patient[] {
  if (typeof window === 'undefined') return initialPatientDatabase;
  try {
    const raw = localStorage.getItem('carebrief-patient-db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialPatientDatabase;
}

export function savePatientDatabase(db: Patient[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carebrief-patient-db', JSON.stringify(db));
  }
}

export function cleanAadhaarStr(a?: string): string {
  return (a || '').replace(/\D/g, '');
}

export function findPatientByAadhaar(aadhaar: string): Patient | undefined {
  const cleanTarget = cleanAadhaarStr(aadhaar);
  if (!cleanTarget) return undefined;
  const db = getPatientDatabase();
  return db.find(p => cleanAadhaarStr(p.aadhaar) === cleanTarget);
}

export function registerPatientInDatabase(newPatient: Patient): { success: boolean; message: string; patient: Patient } {
  const db = getPatientDatabase();
  const existing = findPatientByAadhaar(newPatient.aadhaar || '');
  if (existing) {
    // Already in database: log them in directly
    saveCurrentPatient(existing);
    return {
      success: true,
      message: `Welcome back! Aadhaar already registered as ${existing.name}. Profile loaded successfully.`,
      patient: existing
    };
  }

  const updatedDb = [newPatient, ...db];
  savePatientDatabase(updatedDb);
  saveCurrentPatient(newPatient);
  return {
    success: true,
    message: `Patient profile created successfully! Assigned Digital Patient ID: ${newPatient.id}`,
    patient: newPatient
  };
}

export function loginPatientByAadhaar(name: string, aadhaar: string): { success: boolean; message: string; patient?: Patient } {
  const cleanTarget = cleanAadhaarStr(aadhaar);
  if (cleanTarget.length !== 12) {
    return { success: false, message: 'Please enter a valid 12-digit Aadhaar number.' };
  }

  const existing = findPatientByAadhaar(cleanTarget);
  if (existing) {
    saveCurrentPatient(existing);
    return {
      success: true,
      message: `Welcome back, ${existing.name}! Logged in successfully.`,
      patient: existing
    };
  }

  return {
    success: false,
    message: 'No patient record found with this Aadhaar number in database. Please choose Sign Up to register once.'
  };
}

export function generatePatientId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `AYU-${year}-${rand}`;
}

export function getCurrentPatient(): Patient {
  if (typeof window === 'undefined') return initialPatientDatabase[0] || defaultPatient;
  try {
    const raw = localStorage.getItem('carebrief-active-patient');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.name) return parsed;
    }
  } catch {}
  return initialPatientDatabase[0] || defaultPatient;
}

export function isPatientRegistered(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem('carebrief-active-patient');
  } catch {
    return false;
  }
}

export function saveCurrentPatient(p: Patient): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carebrief-active-patient', JSON.stringify(p));
    sessionStorage.setItem('carebrief-demo-role', 'patient');
    window.dispatchEvent(new CustomEvent('carebrief-patient-updated', { detail: p }));
  }
}

export function clearCurrentPatient(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('carebrief-active-patient');
    sessionStorage.removeItem('carebrief-demo-role');
    sessionStorage.removeItem('carebrief-receipt');
    localStorage.removeItem('carebrief-draft');
    window.dispatchEvent(new CustomEvent('carebrief-patient-updated', { detail: null }));
  }
}

export const patient: Patient = new Proxy({} as Patient, {
  get(_target, prop: string | symbol) {
    const cur = getCurrentPatient();
    return Reflect.get(cur, prop);
  },
  set(_target, prop: string | symbol, value: any) {
    const cur = getCurrentPatient();
    Reflect.set(cur, prop, value);
    saveCurrentPatient(cur);
    return true;
  }
});
export const records: MedicalRecord[] = [
 { id: 'v1', title: 'General consultation', type: 'Visit', date: '2026-10-08', doctor: 'Dr. Meera Patel', description: 'Follow-up for blood pressure. Patient reports feeling well. Continue the clinician-prescribed medicine and return in four weeks.', confirmed: true },
 { id: 'l1', title: 'Complete blood count', type: 'Lab report', date: '2026-10-06', doctor: 'Dr. Meera Patel', description: 'A fictional blood test report was added to your medical history. Extracted information needs clinical review.', confirmed: false },
 { id: 'p1', title: 'Blood pressure prescription', type: 'Prescription', date: '2026-09-12', doctor: 'Dr. Meera Patel', description: 'Amlodipine 5 mg · once daily · 30 days. Fictional prescription; not medical advice.', confirmed: true },
 { id: 'v2', title: 'Routine health check-up', type: 'Visit', date: '2026-09-12', doctor: 'Dr. Meera Patel', description: 'Routine check-up and a discussion of the patient-reported health history.', confirmed: true },
];
async function request<T>(path: string, fallback: T, body?: unknown): Promise<T> {
 if (useMock) { await new Promise(resolve => setTimeout(resolve, 350)); return fallback; }
 const base = import.meta.env['VITE_API_BASE_URL'];
 if (!base) throw new Error('The real service is not connected. Enable demo mode to continue.');
 const res = await fetch(`${base}${path}`, { credentials: 'include', method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : null });
 if (!res.ok) throw new Error('Unable to load your information. Please try again.');
 return res.json();
}
export interface DoctorQueueItem {
  patient: Patient;
  token: string;
  status: string;
  slot: string;
  submittedAt: string;
  receipt?: Receipt;
}

export function getStoredConsultations(): Receipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('carebrief-consultations');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveStoredConsultation(receipt: Receipt): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredConsultations();
    const updated = [receipt, ...current.filter(r => r.reference !== receipt.reference)];
    localStorage.setItem('carebrief-consultations', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('carebrief-queue-updated'));
  } catch {}
}

export const api = {
 getPatient: () => request('/patient', patient),
 getRecords: () => request('/records', records),
 submitConsultation: (
   draft: ConsultationDraft, 
   documentCount: number, 
   patientData?: Patient,
   documents?: UploadedDocument[],
   findings: import('@/types/carebrief').ExtractedFinding[] = [],
   aiSummary: string = ''
 ) => {
   const currentPat = patientData || getCurrentPatient();
   const queue = getStoredConsultations();
   const nextTokenNum = (8 + queue.length).toString().padStart(2, '0');
   const token = `TOKEN-${nextTokenNum}`;

   const receipt: Receipt = {
     reference: `AYU-${Date.now().toString().slice(-7)}`,
     tokenNumber: token,
     submittedAt: new Date().toISOString(),
     patient: currentPat,
     draft,
     documentCount,
     documents: documents ?? [],
     dangerousFindings: findings,
     aiBriefSummary: aiSummary
   };

   saveStoredConsultation(receipt);

   // Also save into patient medical records for the permanent Patient Locker
   if (typeof window !== 'undefined') {
     try {
       const userHistoryKey = `carebrief-history-${currentPat.id}`;
       const oldHist = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
       const newRecord: MedicalRecord = {
         id: receipt.reference,
         title: `${draft.specialty} Consultation (${draft.doctor})`,
         type: 'Visit',
         date: new Date().toISOString().split('T')[0] ?? '2026-10-13',
         doctor: draft.doctor,
         description: `${draft.complaint}. Vitals recorded. Reference: ${receipt.reference}. Token: ${token}`,
         confirmed: false,
         hospital: draft.clinic
       };
       localStorage.setItem(userHistoryKey, JSON.stringify([newRecord, ...oldHist]));
     } catch {}
   }

   return request<Receipt>('/consultations', receipt, receipt);
 },
};
export const emptyDraft: ConsultationDraft = { 
  specialty: 'General physician', 
  clinic: 'Greenleaf Family Clinic', 
  doctor: 'Dr. Meera Patel', 
  slot: '10:30 AM', 
  complaint: '', 
  started: '', 
  severity: 3, 
  symptoms: '', 
  treatments: '', 
  betterOrWorse: 'The same',
  takenMedicineAlready: false,
  allergies: 'No known allergies', 
  medicines: 'Amlodipine 5 mg, once daily', 
  conditions: ['High BP'], 
  pastHistory: '', 
  consent: true,
  vitals: {
    bpSystolic: '120',
    bpDiastolic: '80',
    pulse: '72',
    temperature: '98.6',
    spo2: '99',
    weight: '68'
  }
};
export function recordDownload(title: string, description: string) { const url = URL.createObjectURL(new Blob([`AAYU HEALTHCARE — CLINICAL RECORD\n\n${title}\n\n${description}\n\nEncrypted Digital Health Record. Confidential.`], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '-')}-record.txt`; a.click(); URL.revokeObjectURL(url); }
