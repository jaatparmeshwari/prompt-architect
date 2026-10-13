import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { 
  Search, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Clock, 
  User, 
  Stethoscope, 
  Pill, 
  Calendar, 
  Printer, 
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Badge, AlertPanel, Modal, DocumentPreview } from './shared';
import { canAccess } from '@/utils/validation';
import { getStoredConsultations, getCurrentPatient, recordDownload } from '@/services/api';
import type { Receipt, ExtractedFinding } from '@/types/carebrief';
import patientPhotoDefault from '@/assets/patient.jpg';

export function DoctorGate({ children }: { children: import('react').ReactNode }) {
  const [access, setAccess] = useState<boolean | null>(null);
  useEffect(() => {
    // For demo/hackathon convenience, grant doctor access if in demo mode or doctor role
    const role = sessionStorage.getItem('carebrief-demo-role');
    setAccess(role === 'doctor' || role === 'patient' || true);
  }, []);

  if (access === null) return <div className="empty-state">Loading doctor workspace…</div>;
  return <>{children}</>;
}

export function DoctorQueue() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [storedQueue, setStoredQueue] = useState<Receipt[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      setStoredQueue(getStoredConsultations());
    };
    load();
    window.addEventListener('carebrief-queue-updated', load);
    return () => window.removeEventListener('carebrief-queue-updated', load);
  }, []);

  // Merge default demo patients with real-time registered and submitted patients
  const currentPat = getCurrentPatient();
  const queuePatients = storedQueue.map(item => ({
    name: item.patient?.name || currentPat.name,
    id: item.patient?.id || currentPat.id,
    token: item.tokenNumber || 'TOKEN-08',
    status: 'Ready for review',
    age: item.patient?.age || currentPat.age,
    sex: item.patient?.sex || currentPat.sex,
    slot: item.draft?.slot || '10:30 AM',
    photo: item.patient?.photo || currentPat.photo || patientPhotoDefault,
    hasAlerts: (item.dangerousFindings?.length || 0) > 0,
    complaint: item.draft?.complaint || 'General consultation'
  }));

  const defaultDemoPatients = [
    {
      name: currentPat.name,
      id: currentPat.id,
      token: storedQueue[0]?.tokenNumber || 'TOKEN-08',
      status: 'Ready for review',
      age: currentPat.age,
      sex: currentPat.sex,
      slot: '10:30 AM',
      photo: currentPat.photo || patientPhotoDefault,
      hasAlerts: true,
      complaint: storedQueue[0]?.draft.complaint || 'Persistent headache and elevated blood pressure'
    },
    {
      name: 'Priya Verma',
      id: 'AYU-2026-9412',
      token: 'TOKEN-09',
      status: 'Reports processing',
      age: 29,
      sex: 'Female',
      slot: '11:00 AM',
      photo: '',
      hasAlerts: false,
      complaint: 'Routine follow-up for thyroid profile'
    },
    {
      name: 'Vikram Rao',
      id: 'AYU-2026-7241',
      token: 'TOKEN-10',
      status: 'Ready for review',
      age: 52,
      sex: 'Male',
      slot: '11:30 AM',
      photo: '',
      hasAlerts: true,
      complaint: 'Severe knee pain and elevated uric acid'
    }
  ];

  const combinedList = queuePatients.length > 0
    ? [...queuePatients, ...defaultDemoPatients.filter(d => !queuePatients.some(q => q.id === d.id))]
    : defaultDemoPatients;

  const filtered = combinedList.filter(
    p => `${p.name} ${p.id} ${p.token}`.toLowerCase().includes(search.toLowerCase()) &&
         (filter === 'All statuses' || filter === p.status)
  );

  return (
    <DoctorGate>
      <PageHeading
        eyebrow="CLINICAL OPD WORKSPACE"
        title="Live Doctor OPD Queue"
        subtitle="Good morning, Dr. Meera Patel. Review synthesized 2-minute clinical briefs before meeting patients."
        action={
          <div className="flex items-center gap-2">
            <span className="status-badge status-teal">
              <span className="size-2 rounded-full bg-teal inline-block mr-1.5 animate-pulse" />
              Live Clinic Active
            </span>
            <Badge tone="blue">13 October 2026 · General Physician OPD</Badge>
          </div>
        }
      />

      <div className="search-row">
        <div className="search-field">
          <Search />
          <input
            className="field"
            placeholder="Search patient name, ID, or token…"
            aria-label="Search patient queue"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field"
          aria-label="Filter patient status"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option>All statuses</option>
          <option>Ready for review</option>
          <option>Reports processing</option>
        </select>
      </div>

      <div className="data-panel table-scroll shadow-sm">
        <table className="doctor-table">
          <thead>
            <tr>
              <th>Patient Profile & ID</th>
              <th>Live Token</th>
              <th>OPD Slot</th>
              <th>Status</th>
              <th>AI Risk Flags</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <div className="flex gap-3 items-center">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        width={42}
                        height={42}
                        alt={p.name}
                        className="rounded-full size-10 object-cover border-2 border-primary/20 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <strong className="text-foreground text-sm">{p.name}</strong>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        <span className="font-mono">{p.id}</span> · {p.age}y · {p.sex}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="font-mono font-bold text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md border border-primary/20">
                    {p.token}
                  </span>
                </td>

                <td className="text-xs text-muted-foreground font-medium">
                  {p.slot}
                </td>

                <td>
                  <Badge tone={p.status === 'Ready for review' ? 'teal' : 'amber'}>
                    {p.status}
                  </Badge>
                </td>

                <td>
                  {p.hasAlerts ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle size={12} /> Critical Lab Flags
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Normal baseline</span>
                  )}
                </td>

                <td>
                  <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                    <Link to="/doctor/patient">
                      Open 2-Min Brief <ArrowRight size={13} className="ml-1" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="empty-state py-12">
            <h3>No patients found in queue</h3>
            <p>Try clearing your search or register a new patient.</p>
          </div>
        )}
      </div>
    </DoctorGate>
  );
}

export function DoctorPatient() {
  const [reviewed, setReviewed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [complete, setComplete] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  // Active patient data
  const currentPat = getCurrentPatient();
  const storedConsultations = getStoredConsultations();
  const activeReceipt = storedConsultations[0];
  const activeDraft = activeReceipt?.draft;

  // Extracted Dangerous & Key Findings
  const findings: ExtractedFinding[] = activeReceipt?.dangerousFindings?.length 
    ? activeReceipt.dangerousFindings 
    : [
        {
          test: 'Fasting Blood Sugar',
          value: '184',
          unit: 'mg/dL',
          alertLevel: 'critical',
          remark: '🚨 CRITICAL: Marked hyperglycemia (Ref < 100 mg/dL)'
        },
        {
          test: 'Blood Pressure',
          value: activeDraft?.vitals?.bpSystolic ? `${activeDraft.vitals.bpSystolic}/${activeDraft.vitals.bpDiastolic}` : '142/92',
          unit: 'mmHg',
          alertLevel: 'warning',
          remark: '⚠️ Stage 2 Hypertension reading'
        },
        {
          test: 'Haemoglobin (Hb)',
          value: '10.8',
          unit: 'g/dL',
          alertLevel: 'warning',
          remark: 'Mild hypochromic microcytic anemia'
        },
        {
          test: 'Drug Allergy',
          value: 'Penicillin / Amoxicillin',
          unit: 'Documented',
          alertLevel: 'critical',
          remark: '🚨 Severe anaphylaxis / urticaria risk'
        }
      ];

  const tokenNumber = activeReceipt?.tokenNumber || 'TOKEN-08';
  const chiefComplaint = activeDraft?.complaint || 'Severe pulsating headache for 3 days, mild fever, and lethargy.';

  return (
    <DoctorGate>
      <div className="flex justify-between items-center mb-5 pb-3 border-b flex-wrap gap-3">
        <PageHeading
          title={currentPat.name}
          subtitle={`${currentPat.age} years · ${currentPat.sex} · ID: ${currentPat.id} · Queue Token: ${tokenNumber}`}
          action={
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-3 py-1.5 bg-primary text-white font-bold rounded-lg shadow-sm">
                {tokenNumber}
              </span>
              <img
                src={currentPat.photo || patientPhotoDefault}
                alt={currentPat.name}
                className="rounded-full size-14 object-cover border-2 border-primary shadow"
                width={56}
                height={56}
              />
            </div>
          }
        />
      </div>

      {/* 2-MINUTE CLINICAL EXECUTIVE BRIEF */}
      <section className="form-section shadow-sm mb-6 border-l-4 border-l-primary">
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="icon-tile teal">
              <Clock size={18} />
            </span>
            <h2 className="text-xl font-bold">2-Minute Clinical Summary (Doctor Brief)</h2>
          </div>
          <Badge tone={reviewed ? 'teal' : 'blue'}>
            {reviewed ? 'Doctor Confirmed ✓' : 'AI Synthesized · 60s Review'}
          </Badge>
        </div>

        <div className="p-4 bg-muted/40 rounded-xl mt-4 border space-y-3 leading-relaxed text-sm">
          <p>
            <strong>PATIENT:</strong> {currentPat.name}, {currentPat.age}y / {currentPat.sex} (Aadhaar: {currentPat.aadhaar || 'Verified'}, Mobile: +91 {currentPat.mobile}).
          </p>
          <p>
            <strong>CHIEF COMPLAINT:</strong> "{chiefComplaint}". Onset: {activeDraft?.started || '3 days ago'}. 
            Severity: {activeDraft?.severity || 7}/10. 
            Trajectory: {activeDraft?.betterOrWorse || 'Worse'}. 
            Medication already tried: "{activeDraft?.treatments || 'Paracetamol 650mg once'}".
          </p>
          <p>
            <strong>RECORDED VITALS:</strong> BP: {activeDraft?.vitals?.bpSystolic || '142'}/{activeDraft?.vitals?.bpDiastolic || '92'} mmHg · 
            Pulse: {activeDraft?.vitals?.pulse || '76'} bpm · 
            Temp: {activeDraft?.vitals?.temperature || '98.8'}°F · 
            SpO2: {activeDraft?.vitals?.spo2 || '99'}% · 
            Weight: {activeDraft?.vitals?.weight || '68'} kg.
          </p>
          <p>
            <strong>CHRONIC HISTORY & ALLERGIES:</strong> {activeDraft?.conditions?.join(', ') || 'High Blood Pressure'}. 
            Active Drugs: {activeDraft?.medicines || 'Amlodipine 5mg once daily'}. 
            <span className="text-destructive font-bold ml-1">
              ⚠️ Allergies: {activeDraft?.allergies || 'Penicillin group (reported)'}
            </span>.
          </p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">
            {reviewed ? 'Confirmed by Dr. Meera Patel for this session' : 'Synthesized automatically from patient intake and uploaded reports'}
          </span>
          <Button
            variant={reviewed ? 'outline' : 'default'}
            disabled={reviewed}
            onClick={() => setConfirm(true)}
            className="text-xs"
          >
            <Check size={14} className="mr-1" />
            {reviewed ? 'Summary Reviewed' : 'Mark as Reviewed'}
          </Button>
        </div>
      </section>

      {/* DANGEROUS & CRITICAL ALERTS FROM PAST REPORTS */}
      <section className="form-section mb-6 border-l-4 border-l-destructive shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-destructive" size={20} />
          <h2 className="text-lg font-bold text-destructive">
            Critical Alerts & Abnormal Lab Findings (AI Extracted)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          The AI clinical parser scanned past lab reports and marked these urgent items for immediate medical attention:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {findings.map((item, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-lg border ${
                item.alertLevel === 'critical'
                  ? 'bg-red-50/70 border-red-300 text-red-950'
                  : item.alertLevel === 'warning'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-muted/40 border-border text-foreground'
              }`}
            >
              <div className="flex justify-between items-start">
                <strong className="text-sm">{item.test}</strong>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  item.alertLevel === 'critical' 
                    ? 'bg-red-200 text-red-900' 
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {item.value} {item.unit}
                </span>
              </div>
              <p className="text-xs mt-1.5 font-medium leading-relaxed">
                {item.remark}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE ORIGINAL DOCUMENT AND EXTRACTED REPORT DATA */}
      <div className="section-title">
        <h2>Source Document vs AI Extracted Data</h2>
      </div>

      <div className="detail-grid mb-6">
        <div className="demo-document m-0 shadow-sm">
          <FileText className="text-primary" size={24} />
          <p className="eyebrow mt-3">DOCUMENT 1 · ORIGINAL UPLOAD</p>
          <h3 className="text-base font-bold mt-1">Complete Blood Count & Sugar Panel</h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Report Date: 06 Oct 2026<br />
            Lab: Metropolis Diagnostics, Mumbai<br />
            Patient: {currentPat.name}<br />
            Fasting Plasma Glucose: 184 mg/dL [HIGH]<br />
            Haemoglobin: 10.8 g/dL [LOW]<br />
            Platelet count: 140,000 /µL [BORDERLINE LOW]
          </p>
          <Button variant="link" size="sm" className="px-0 mt-2 text-xs" onClick={() => setPreview(true)}>
            <Eye size={13} className="mr-1" /> View Full Original File
          </Button>
        </div>

        <div className="form-section shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold">Extracted Diagnostic Highlights</h3>
            <Badge tone="blue">OCR Parsed</Badge>
          </div>
          <p className="summary-text text-xs leading-relaxed mt-3">
            • Fasting Glucose: <strong>184 mg/dL</strong> (Flagged for diabetic workup)<br />
            • Haemoglobin: <strong>10.8 g/dL</strong> (Microcytic anemia)<br />
            • Platelets: <strong>140,000 /µL</strong><br />
            • Document verified and cross-referenced with active intake.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Confidence score: 98.4%. Please verify clinical signs before prescribing.
          </p>
        </div>
      </div>

      {/* DOCTOR CONSULTATION NOTES & PRESCRIPTION PAD */}
      <form 
        className="form-section shadow-sm"
        onSubmit={e => {
          e.preventDefault();
          setComplete(true);
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope size={20} className="text-primary" />
          <h2 className="text-lg font-bold">Doctor Assessment & Prescription Pad</h2>
        </div>

        <div>
          <label className="field-label" htmlFor="doctor-notes">
            Clinical Assessment & Doctor Notes
          </label>
          <textarea
            id="doctor-notes"
            className="field"
            rows={3}
            defaultValue="Patient presents with acute headache secondary to Stage 2 Hypertension (142/92) and uncontrolled fasting hyperglycemia (184 mg/dL). Avoid Penicillin group. Commencing dosage titration."
            placeholder="Write clinical diagnosis and observations…"
          />
        </div>

        <div className="form-grid mt-4">
          <div>
            <label className="field-label" htmlFor="doctor-rx">
              Prescription (Medicines, Dose & Frequency)
            </label>
            <textarea
              id="doctor-rx"
              className="field"
              rows={3}
              defaultValue="1. Telmisartan 40mg - 1 tab OD morning after breakfast x 30 days&#10;2. Metformin 500mg - 1 tab BD after meals x 30 days&#10;3. Paracetamol 650mg - SOS for headache"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-followup">
              Recommended Follow-Up Date
            </label>
            <input
              id="doctor-followup"
              type="date"
              className="field"
              defaultValue="2026-10-27"
              required
            />

            <label className="field-label" htmlFor="doctor-lifestyle">
              Lifestyle & Dietary Advice
            </label>
            <input
              id="doctor-lifestyle"
              className="field"
              defaultValue="Low sodium diet, daily 30-min brisk walk, monitor fasting sugar twice weekly."
            />
          </div>
        </div>

        {saved && (
          <div className="success-message">
            <Check size={16} /> Doctor notes and draft prescription saved.
          </div>
        )}

        {complete && (
          <div className="success-message">
            <Check size={16} /> Consultation finalized! Digital prescription slip dispatched to patient locker.
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setSaved(true)}>
            Save Draft Notes
          </Button>

          <Button type="submit" disabled={complete} className="bg-primary font-bold">
            <Check size={16} className="mr-1" />
            {complete ? 'Consultation Finalized' : 'Finalize & Issue Prescription'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => recordDownload(
              `Prescription-${currentPat.id}`,
              `OFFICIAL CLINICAL PRESCRIPTION\n\nDoctor: Dr. Meera Patel (MD, General Medicine)\nClinic: Greenleaf Family Clinic\nDate: 13 Oct 2026\n\nPatient: ${currentPat.name} (ID: ${currentPat.id})\nAge/Sex: ${currentPat.age}y / ${currentPat.sex}\nToken: ${tokenNumber}\n\nDiagnosis: Stage 2 Hypertension + Hyperglycemia\nPrescriptions:\n1. Telmisartan 40mg OD x 30 days\n2. Metformin 500mg BD x 30 days\n3. Paracetamol 650mg SOS\n\nFollow-up: 2 weeks (27 Oct 2026)`
            )}
            className="text-xs"
          >
            <Printer size={14} className="mr-1" /> Print / Download Rx Slip
          </Button>

          <Button asChild variant="ghost" className="text-xs">
            <Link to="/history">
              Patient Full Locker <ArrowRight size={13} className="ml-1" />
            </Link>
          </Button>
        </div>
      </form>

      {confirm && (
        <Modal title="Confirm Clinical Brief Review" onClose={() => setConfirm(false)}>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Have you reviewed the patient's chief complaints, vitals, and AI-flagged lab values against the source records?
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button onClick={() => { setReviewed(true); setConfirm(false); }}>
              <Check size={16} className="mr-1" /> Confirm Review
            </Button>
          </div>
        </Modal>
      )}

      {preview && (
        <DocumentPreview
          title="Metropolis Diagnostics · Complete Blood Count & Sugar Panel"
          description={`Patient: ${currentPat.name}. Report Date: 06 Oct 2026. Fasting Glucose: 184 mg/dL (Critical High), Hb: 10.8 g/dL (Mild Anemia), Platelets: 140,000/µL. Verified by Metropolis Pathologist Dr. K. Nair.`}
          onClose={() => setPreview(false)}
        />
      )}
    </DoctorGate>
  );
}
