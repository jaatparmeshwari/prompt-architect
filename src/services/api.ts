import type { Patient, MedicalRecord, ConsultationDraft, Receipt } from '@/types/carebrief';
export const useMock = import.meta.env['VITE_USE_MOCK'] !== 'false';
export const patient: Patient = { id: 'CB-2024-0842', name: 'Arjun Sharma', age: 34, sex: 'Male', mobile: '9876543210', language: 'English' };
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
export const api = {
 getPatient: () => request('/patient', patient),
 getRecords: () => request('/records', records),
 submitConsultation: (draft: ConsultationDraft, documentCount: number) => request<Receipt>('/consultations', { reference: `CB-${Date.now().toString().slice(-8)}`, submittedAt: new Date().toISOString(), draft, documentCount }, { draft, documentCount }),
};
export const emptyDraft: ConsultationDraft = { specialty: 'General physician', clinic: 'Greenleaf Family Clinic', doctor: 'Dr. Meera Patel', slot: '10:30 AM', complaint: '', started: '', severity: 3, symptoms: '', treatments: '', allergies: 'No known allergies', medicines: 'Amlodipine 5 mg, once daily', conditions: ['High BP'], pastHistory: '', consent: false };
export function recordDownload(title: string, description: string) { const url = URL.createObjectURL(new Blob([`CAREBRIEF — FICTIONAL DEMO RECORD\n\n${title}\n\n${description}\n\nNot a real medical document. Not medical advice.`], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '-')}-demo.txt`; a.click(); URL.revokeObjectURL(url); }
