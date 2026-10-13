import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  User, 
  CreditCard, 
  Phone, 
  Calendar, 
  Copy, 
  CheckCheck, 
  Stethoscope, 
  HeartPulse, 
  Bone, 
  Eye, 
  Brain, 
  Baby, 
  Mic, 
  Upload, 
  Camera, 
  Trash2, 
  LoaderCircle, 
  Printer, 
  Download, 
  Activity, 
  Thermometer, 
  Droplet, 
  Scale, 
  FileText,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, PageHeading, FileIcon } from './shared';
import { 
  api, 
  emptyDraft, 
  generatePatientId, 
  recordDownload,
  findPatientByAadhaar,
  loginPatientByAadhaar,
  registerPatientInDatabase,
  initialPatientDatabase
} from '@/services/api';
import { 
  extractMedicalDocumentInsights, 
  generateTwoMinuteDoctorBrief,
  getSample10ClinicalReports 
} from '@/services/medical-extractor';
import { usePatientSession } from '@/hooks/use-patient-session';
import type { Patient, ConsultationDraft, UploadedDocument, Receipt, ExtractedFinding } from '@/types/carebrief';
import patientPhotoDefault from '@/assets/patient.jpg';

interface PatientFlowProps {
  initialStep?: 0 | 1 | 2;
  onConsultationComplete?: () => void;
}

export function PatientFlow({ initialStep }: PatientFlowProps) {
  const { patient, savePatient, clearPatient } = usePatientSession();

  // Determine starting step
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof initialStep === 'number') return initialStep;
    if (patient && patient.aadhaar && patient.mobile && patient.id) {
      return 2; // Consultation page
    }
    return 0; // Login page
  });

  // Step 1 Form State (Login / Sign Up)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState(patient?.name || '');
  const [aadhaarRaw, setAadhaarRaw] = useState(patient?.aadhaar ? patient.aadhaar.replace(/\D/g, '') : '');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [generatedId, setGeneratedId] = useState(patient?.id || '');
  const [step1Error, setStep1Error] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Step 2 Form State (Photo, Mobile, Age, Sex, etc.)
  const [photo, setPhoto] = useState<string>(patient?.photo || '');
  const [mobile, setMobile] = useState(patient?.mobile || '');
  const [age, setAge] = useState<string>(patient?.age ? String(patient.age) : '32');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(
    (patient?.sex as any) || 'Male'
  );
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || 'O+');
  const [address, setAddress] = useState(patient?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(patient?.emergencyContact || '');
  const [language, setLanguage] = useState(patient?.language || 'English');
  const [step2Error, setStep2Error] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Step 3 Consultation State
  const [consultSubStep, setConsultSubStep] = useState(0);
  const [draft, setDraft] = useState<ConsultationDraft>({ ...emptyDraft });
  const [vitals, setVitals] = useState({
    bpSystolic: '120',
    bpDiastolic: '80',
    pulse: '72',
    temperature: '98.6',
    spo2: '99',
    weight: '68'
  });
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [documentType, setDocumentType] = useState('Lab report');
  const [reportDate, setReportDate] = useState('');
  const [lastHospital, setLastHospital] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [consultError, setConsultError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [allExtractedFindings, setAllExtractedFindings] = useState<ExtractedFinding[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const photoCamRef = useRef<HTMLInputElement>(null);

  // Auto-format Aadhaar with spaces: "1234 5678 9012"
  const formattedAadhaar = aadhaarRaw
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

  // Masked Aadhaar preview
  const maskedAadhaar = aadhaarRaw.length >= 4 
    ? `•••• •••• ${aadhaarRaw.slice(-4)}`
    : '•••• •••• ••••';

  // Step 1: Submit Login or Sign Up
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setStep1Error('Please enter your full legal name (at least 2 characters).');
      return;
    }
    const cleanAadhaar = aadhaarRaw.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setStep1Error('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setStep1Error('');

    if (authMode === 'login') {
      const res = loginPatientByAadhaar(name.trim(), cleanAadhaar);
      if (res.success && res.patient) {
        savePatient(res.patient);
        setName(res.patient.name);
        setAadhaarRaw(cleanAadhaar);
        setGeneratedId(res.patient.id);
        setPhoto(res.patient.photo || patientPhotoDefault);
        setMobile(res.patient.mobile);
        setAge(String(res.patient.age));
        setSex(res.patient.sex as any);
        setBloodGroup(res.patient.bloodGroup || 'O+');
        setLoginSuccessMsg(res.message);
        setTimeout(() => {
          setCurrentStep(2); // Jump directly into consultation!
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      } else {
        setStep1Error(res.message);
      }
    } else {
      // Sign Up mode
      const existing = findPatientByAadhaar(cleanAadhaar);
      if (existing) {
        setStep1Error(`This Aadhaar is already registered under "${existing.name}" (ID: ${existing.id}). Please click the "Log In" tab above.`);
        return;
      }
      const newId = generatePatientId();
      setGeneratedId(newId);
      setCurrentStep(1); // Advance to Details form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickDemoLogin = (pat: typeof initialPatientDatabase[0]) => {
    savePatient(pat);
    setName(pat.name);
    setAadhaarRaw((pat.aadhaar ?? '').replace(/\D/g, ''));
    setGeneratedId(pat.id);
    setPhoto(pat.photo || patientPhotoDefault);
    setMobile(pat.mobile);
    setAge(String(pat.age));
    setSex(pat.sex as any);
    setBloodGroup(pat.bloodGroup || 'O+');
    setLoginSuccessMsg(`Logged in as ${pat.name}! Record loaded.`);
    setTimeout(() => {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  };

  const copyPatientId = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  // Step 2: Submit Complete Patient Profile (Stored in database once)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setStep2Error('Please enter a valid 10-digit mobile number.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
      setStep2Error('Please enter a valid age between 1 and 120 years.');
      return;
    }

    setStep2Error('');

    const newPatientData: Patient = {
      id: generatedId || generatePatientId(),
      name: name.trim(),
      aadhaar: formattedAadhaar,
      mobile: cleanMobile,
      age: parsedAge,
      sex,
      photo: photo || patientPhotoDefault, // Fallback to verified demo photo if unselected
      bloodGroup,
      address: address.trim(),
      emergencyContact: emergencyContact.replace(/\D/g, ''),
      language
    };

    registerPatientInDatabase(newPatientData);
    savePatient(newPatientData);
    setCurrentStep(2); // Advance to Consultation Page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSample10Reports = () => {
    setOcrLoading(true);
    setTimeout(() => {
      const sampleDocs = getSample10ClinicalReports();
      setDocuments(sampleDocs);
      const findings: ExtractedFinding[] = [];
      sampleDocs.forEach(d => {
        if (d.extractedFindings) findings.push(...d.extractedFindings);
      });
      setAllExtractedFindings(findings);
      setOcrLoading(false);
    }, 450);
  };

  const updateDraft = <K extends keyof ConsultationDraft>(key: K, value: ConsultationDraft[K]) => {
    setDraft(v => ({ ...v, [key]: value }));
    setConsultError('');
  };

  // Voice typing
  const handleVoiceInput = () => {
    type SpeechResult = { results: { [index: number]: { [index: number]: { transcript: string } } } };
    type SpeechRecognitionInstance = {
      lang: string;
      interimResults: boolean;
      onresult: ((e: SpeechResult) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    };
    const speechWin = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const Recognition = speechWin.SpeechRecognition ?? speechWin.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus('Voice typing is not supported in this browser. Please type directly.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e: SpeechResult) => {
      const text = e.results[0]?.[0]?.transcript;
      if (text) {
        updateDraft('complaint', `${draft.complaint} ${text}`.trim().slice(0, 3000));
        setVoiceStatus('✓ Spoken complaint transcribed. Please review.');
      }
    };
    recognition.onerror = () => {
      setVoiceStatus('Microphone permission denied or inactive. Please type instead.');
    };
    setVoiceStatus('Listening… Speak clearly into your microphone.');
    recognition.start();
  };

  // Add document uploads with AI OCR extraction
  const handleAddFiles = async (files: FileList | null) => {
    if (!files) return;
    setOcrLoading(true);
    const additions: UploadedDocument[] = [];
    const newFindings: ExtractedFinding[] = [...allExtractedFindings];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setConsultError(`File ${file.name} exceeds 10 MB limit.`);
        continue;
      }

      // Run AI OCR Clinical Parameter Extraction
      const ocrResult = await extractMedicalDocumentInsights(file, documentType);
      newFindings.push(...ocrResult.findings);

      additions.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: documentType,
        reportDate,
        lastHospital,
        url: URL.createObjectURL(file),
        status: 'Done',
        extractedText: ocrResult.text,
        extractedFindings: ocrResult.findings
      });
    }

    setDocuments(v => [...v, ...additions]);
    setAllExtractedFindings(newFindings);
    setOcrLoading(false);
  };

  // Submit Consultation
  const handleConsultationSubmit = async () => {
    if (!draft.consent) {
      setConsultError('Please check the consent box to share these details with your consulting doctor.');
      return;
    }
    setSubmitting(true);
    setConsultError('');

    try {
      const fullDraft: ConsultationDraft = {
        ...draft,
        vitals
      };

      const aiBrief = generateTwoMinuteDoctorBrief(patient, fullDraft, allExtractedFindings);

      const newReceipt = await api.submitConsultation(
        fullDraft, 
        documents.length, 
        patient, 
        documents, 
        allExtractedFindings,
        aiBrief
      );

      setReceipt(newReceipt);
      sessionStorage.setItem('carebrief-receipt', JSON.stringify(newReceipt));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setConsultError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetToNewPatient = () => {
    if (window.confirm('Do you want to register a new patient or restart login?')) {
      clearPatient();
      setName('');
      setAadhaarRaw('');
      setGeneratedId('');
      setPhoto('');
      setMobile('');
      setAge('30');
      setReceipt(null);
      setDocuments([]);
      setAllExtractedFindings([]);
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      {/* 3-Step Stepper */}
      <nav aria-label="Registration and Consultation Progress" className="patient-flow-stepper">
        <div className="patient-flow-line">
          <div 
            className="patient-flow-line-fill" 
            style={{ 
              width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%' 
            }} 
          />
        </div>

        <div className={`patient-flow-step ${currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : ''}`}>
          <div className="patient-flow-step-circle">
            {currentStep > 0 ? <Check size={18} /> : 1}
          </div>
          <span className="patient-flow-step-label">1. Patient Login (Name & Aadhaar)</span>
        </div>

        <div className={`patient-flow-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="patient-flow-step-circle">
            {currentStep > 1 ? <Check size={18} /> : 2}
          </div>
          <span className="patient-flow-step-label">2. Patient Details & Photo</span>
        </div>

        <div className={`patient-flow-step ${currentStep === 2 ? 'active' : ''}`}>
          <div className="patient-flow-step-circle">3</div>
          <span className="patient-flow-step-label">3. Doctor Consultation</span>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* STEP 1: PATIENT LOGIN / SIGN UP (NAME & AADHAAR NUMBER)                   */}
      {/* ========================================================================= */}
      {currentStep === 0 && (
        <section aria-labelledby="step1-title" className="form-section shadow-md animate-fade-in">
          {/* Tab Switcher: Log In vs Sign Up */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setStep1Error(''); setLoginSuccessMsg(''); }}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                authMode === 'login'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck size={16} /> Log In (Existing Patient)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setStep1Error(''); setLoginSuccessMsg(''); }}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                authMode === 'signup'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={16} /> Sign Up (New Patient Registration)
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="icon-tile teal">
              <ShieldCheck size={20} />
            </span>
            <div>
              <Badge tone="teal">
                {authMode === 'login' ? 'Existing Patient Verification' : 'One-Time Registration'}
              </Badge>
              <h1 id="step1-title" className="text-2xl mt-1 font-bold">
                {authMode === 'login' ? 'Patient Login (Name & Aadhaar)' : 'Patient Registration (Sign Up)'}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {authMode === 'login' ? (
              <>
                Enter your registered <strong>Full Name</strong> and <strong>12-digit Aadhaar Number</strong>. 
                Your profile, photo, and previous consultations will be retrieved from the database.
              </>
            ) : (
              <>
                Enter your legal <strong>Full Name</strong> and <strong>12-digit Aadhaar Number</strong> to register. 
                A permanent <strong>Digital Patient ID</strong> will be generated, followed by mandatory photo capture.
              </>
            )}
          </p>

          {loginSuccessMsg && (
            <div className="success-message p-3 bg-teal-50 border border-teal-200 rounded-md text-teal-800 text-xs font-medium mb-4 flex items-center gap-2">
              <Check size={16} className="text-teal" />
              {loginSuccessMsg}
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="patient-name">
                <span className="flex items-center gap-2">
                  <User size={15} className="text-primary" />
                  Patient Full Name <span className="text-destructive">*</span>
                </span>
              </label>
              <input
                id="patient-name"
                className="field"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Ramesh Kumar Patel"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setStep1Error('');
                }}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter name as officially recorded in medical or identity records.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="patient-aadhaar">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard size={15} className="text-primary" />
                    Aadhaar Card Number (12 Digits) <span className="text-destructive">*</span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {aadhaarRaw.length}/12 Digits
                  </span>
                </span>
              </label>

              <div className="relative">
                <input
                  id="patient-aadhaar"
                  className="field pr-24 tracking-widest font-mono text-base font-semibold"
                  type={showAadhaar ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="XXXX XXXX XXXX"
                  value={showAadhaar ? formattedAadhaar : formattedAadhaar.replace(/\d(?=\d{4})/g, '•')}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setAadhaarRaw(clean);
                    setStep1Error('');
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-medium hover:underline px-2 py-1 bg-secondary rounded"
                  onClick={() => setShowAadhaar(v => !v)}
                >
                  {showAadhaar ? 'Mask' : 'Show'}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  UIDAI standard 12-digit format. One patient is stored only once in database.
                </p>
                {aadhaarRaw.length === 12 && (
                  <span className="text-xs text-teal font-semibold flex items-center gap-1">
                    <Check size={14} /> 12-Digit Format Valid
                  </span>
                )}
              </div>
            </div>

            {authMode === 'login' ? (
              <div className="patient-id-card">
                <span className="patient-id-badge">
                  <UserCheck size={13} /> Database Check
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  Passwordless Aadhaar Authentication
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Logging in looks up your record in the database. If found, your photo, age, sex, and history load instantly. If not registered yet, switch to <strong>Sign Up</strong>.
                </p>
              </div>
            ) : (
              <div className="patient-id-card">
                <span className="patient-id-badge">
                  <Sparkles size={13} /> Instant Verification
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  Automatic Digital Patient ID Generation
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Clicking <strong>Verify & Proceed to Photo Capture</strong> assigns your unique ID (e.g. <code>AYU-2026-XXXXX</code>) and opens your photo and profile form.
                </p>
              </div>
            )}

            {/* Quick Demo Logins for Hackathon Evaluators */}
            {authMode === 'login' && (
              <div className="p-3.5 bg-muted/40 rounded-xl border space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  ⚡ 1-Click Demo Patient Quick Logins (Pre-Registered):
                </span>
                <div className="flex gap-2 flex-wrap">
                  {initialPatientDatabase.map(pat => (
                    <Button
                      key={pat.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDemoLogin(pat)}
                      className="text-xs h-auto py-1.5 px-3 flex items-center gap-1.5 bg-card"
                    >
                      <UserCheck size={13} className="text-teal" />
                      <span><strong>{pat.name}</strong> ({pat.id})</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step1Error && (
              <div role="alert" className="error-message p-3 bg-red-50 border border-red-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>{step1Error}</span>
                {authMode === 'login' && step1Error.includes('Sign Up') && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setAuthMode('signup'); setStep1Error(''); }}
                    className="text-xs text-destructive border-destructive"
                  >
                    Switch to Sign Up →
                  </Button>
                )}
                {authMode === 'signup' && step1Error.includes('Log In') && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setAuthMode('login'); setStep1Error(''); }}
                    className="text-xs text-primary border-primary"
                  >
                    Switch to Log In →
                  </Button>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName('Rahul Sharma');
                  setAadhaarRaw('543289123456');
                }}
                className="text-xs"
              >
                Fill Sample Data
              </Button>

              <Button type="submit" size="lg" className="min-w-48 font-semibold bg-primary">
                {authMode === 'login' ? (
                  <>Log In to Profile <ArrowRight size={16} /></>
                ) : (
                  <>Verify & Proceed to Photo <ArrowRight size={16} /></>
                )}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COMPLETE PATIENT INFORMATION & MANDATORY PHOTO                      */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <section aria-labelledby="step2-title" className="form-section shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Badge tone="blue">Step 2 of 3 · Profile Registration</Badge>
              <h1 id="step2-title" className="text-2xl mt-1 font-bold">Complete Patient Information</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)} className="text-xs">
              <ArrowLeft size={14} /> Change Name/Aadhaar
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Your permanent <strong>Patient ID</strong> has been generated. Please provide your photo, mobile number, and demographic details.
          </p>

          {/* Highlighted Patient ID Card */}
          <div className="patient-id-card">
            <div className="flex justify-between items-start">
              <div>
                <span className="patient-id-badge">
                  <Check size={13} /> Auto-Generated Digital Patient ID
                </span>
                <div className="patient-id-value">
                  <span>{generatedId}</span>
                  <button 
                    type="button" 
                    onClick={copyPatientId}
                    className="text-xs font-sans font-medium px-2.5 py-1 bg-card border rounded flex items-center gap-1.5 hover:bg-muted text-muted-foreground transition-colors"
                  >
                    {copiedId ? <CheckCheck size={14} className="text-teal" /> : <Copy size={14} />}
                    {copiedId ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Linked to: <strong>{name}</strong> · Aadhaar: <code>{maskedAadhaar}</code>
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <span className="status-badge status-teal">
                  <UserCheck size={12} /> Verified Identity
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-5">
            {/* Mandatory Patient Photo */}
            <div>
              <label className="field-label">
                <span className="flex items-center gap-2">
                  <Camera size={15} className="text-primary" />
                  Patient Photo (Mandatory for Doctor OPD Recognition) <span className="text-destructive">*</span>
                </span>
              </label>

              <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border">
                {photo ? (
                  <img 
                    src={photo} 
                    alt="Patient preview" 
                    className="rounded-full size-20 object-cover border-2 border-primary shadow-sm" 
                  />
                ) : (
                  <div className="rounded-full size-20 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center text-primary">
                    <User size={32} />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => photoFileRef.current?.click()}
                    >
                      <Upload size={13} className="mr-1" /> Upload Photo
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => photoCamRef.current?.click()}
                    >
                      <Camera size={13} className="mr-1" /> Take Selfie
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs" 
                      onClick={() => setPhoto(patientPhotoDefault)}
                    >
                      Use Verified Photo
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ensures your consulting doctor immediately recognizes you upon opening your clinical chart.
                  </p>
                </div>

                <input 
                  ref={photoFileRef} 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setPhoto(URL.createObjectURL(file));
                  }}
                />
                <input 
                  ref={photoCamRef} 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  capture="user"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setPhoto(URL.createObjectURL(file));
                  }}
                />
              </div>
            </div>

            {/* Mobile Number & Age */}
            <div className="form-grid">
              <div>
                <label className="field-label" htmlFor="patient-mobile">
                  <span className="flex items-center gap-2">
                    <Phone size={15} className="text-primary" />
                    Mobile Number <span className="text-destructive">*</span>
                  </span>
                </label>
                <div className="flex gap-2">
                  <span className="field w-16 text-center font-bold text-muted-foreground bg-muted select-none flex items-center justify-center">
                    +91
                  </span>
                  <input
                    id="patient-mobile"
                    className="field flex-1 font-mono tracking-wider"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={e => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setStep2Error('');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="patient-age">
                  <span className="flex items-center gap-2">
                    <Calendar size={15} className="text-primary" />
                    Age (Years) <span className="text-destructive">*</span>
                  </span>
                </label>
                <input
                  id="patient-age"
                  className="field"
                  type="number"
                  min={1}
                  max={120}
                  required
                  placeholder="e.g. 32"
                  value={age}
                  onChange={e => {
                    setAge(e.target.value);
                    setStep2Error('');
                  }}
                />
              </div>
            </div>

            {/* Sex / Gender */}
            <div>
              <label className="field-label">
                Sex / Gender <span className="text-destructive">*</span>
              </label>
              <div className="pill-group">
                {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    className={`pill-option ${sex === option ? 'active' : ''}`}
                    onClick={() => setSex(option)}
                  >
                    {sex === option && <Check size={14} className="inline mr-1" />}
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="field-label">
                <span className="flex items-center gap-2">
                  <Droplet size={15} className="text-destructive" />
                  Blood Group
                </span>
              </label>
              <div className="pill-group">
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <button
                    key={bg}
                    type="button"
                    className={`pill-option ${bloodGroup === bg ? 'active' : ''}`}
                    onClick={() => setBloodGroup(bg)}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="field-label" htmlFor="patient-address">
                Residential Address / City
              </label>
              <input
                id="patient-address"
                className="field"
                placeholder="e.g. Bandra West, Mumbai, Maharashtra"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {step2Error && (
              <div role="alert" className="error-message p-3 bg-red-50 border border-red-200 rounded-md">
                {step2Error}
              </div>
            )}

            <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                <ArrowLeft size={16} /> Back
              </Button>

              <Button type="submit" size="lg" className="min-w-56 font-bold bg-primary">
                Save Information & Open Consultation <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONSULTATION PAGE & LIVE RECEIPT/TOKEN GENERATION                  */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <section aria-labelledby="consultation-heading" className="space-y-6 animate-fade-in">
          {/* Active Patient Banner */}
          <div className="patient-consultation-banner">
            <div className="patient-consultation-details">
              <img 
                src={patient.photo || patientPhotoDefault} 
                alt={patient.name} 
                className="rounded-full size-14 object-cover border-2 border-primary shadow-sm"
              />
              <div className="patient-info-lines">
                <h2>
                  <span>{patient.name}</span>
                  <span className="status-badge status-teal text-xs">
                    <UserCheck size={12} /> Active OPD Patient
                  </span>
                </h2>
                <p>
                  <strong>Patient ID:</strong> <span className="font-mono text-primary font-bold">{patient.id}</span> · 
                  {' '}{patient.age} yrs · {patient.sex} · +91 {patient.mobile}
                  {patient.bloodGroup ? ` · Blood: ${patient.bloodGroup}` : ''}
                </p>
                {patient.aadhaar && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aadhaar: <span className="font-mono">{patient.aadhaar}</span>
                  </p>
                )}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetToNewPatient}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw size={13} className="mr-1" /> Switch / Register New Patient
            </Button>
          </div>

          {/* Receipt View if Consultation is Submitted */}
          {receipt ? (
            <div className="receipt shadow-lg animate-fade-in">
              <div className="receipt-icon">
                <Check size={32} />
              </div>
              <h1 className="text-center text-2xl font-bold">Consultation Booked & Token Issued!</h1>
              <p className="text-center text-muted-foreground mt-2 text-sm">
                Your consultation token is active on the doctor OPD display board.
              </p>

              {/* Token Number Box */}
              <div className="reference-box my-6">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  OFFICIAL OPD QUEUE TOKEN
                </p>
                <h2 className="font-mono text-4xl font-extrabold text-primary mt-1">
                  {receipt.tokenNumber}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Reference: <code>{receipt.reference}</code> · Show this token at reception
                </p>
              </div>

              <div className="receipt-grid">
                <div>
                  <small>Patient</small>
                  <div className="flex items-center gap-2">
                    <img src={patient.photo || patientPhotoDefault} className="rounded-full size-8 object-cover" alt="" />
                    <strong>{patient.name}</strong>
                  </div>
                </div>
                <div>
                  <small>Digital Patient ID</small>
                  <strong className="font-mono text-primary">{patient.id}</strong>
                </div>
                <div>
                  <small>Age / Sex / Mobile</small>
                  <strong>{patient.age} yrs / {patient.sex} · +91 {patient.mobile}</strong>
                </div>
                <div>
                  <small>Doctor & Specialty</small>
                  <strong>{receipt.draft.doctor}</strong>
                  <p className="text-xs text-muted-foreground">{receipt.draft.specialty}</p>
                </div>
              </div>

              {/* Highlight Critical/Dangerous Findings Extracted from Reports */}
              {receipt.dangerousFindings && receipt.dangerousFindings.length > 0 && (
                <div className="mt-5 p-4 bg-red-50/80 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-sm mb-2">
                    <AlertTriangle size={16} className="text-destructive" />
                    Important Clinical Findings Extracted from Previous Reports
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {receipt.dangerousFindings.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                        <span><strong>{f.test}:</strong> {f.value} {f.unit} ({f.remark})</span>
                        <span className="font-bold text-destructive uppercase text-[10px]">{f.alertLevel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 flex-wrap justify-center print-hidden">
                <Button onClick={() => window.print()} className="gap-2">
                  <Printer size={16} /> Print Token & Slip
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => recordDownload(
                    `Token-${receipt.tokenNumber}`,
                    `AAYU CLINICAL OPD TOKEN\n\nToken: ${receipt.tokenNumber}\nReference: ${receipt.reference}\nPatient: ${patient.name} (${patient.id})\nDoctor: ${receipt.draft.doctor}\nSlot: ${receipt.draft.slot}\nClinic: ${receipt.draft.clinic}`
                  )}
                  className="gap-2"
                >
                  <Download size={16} /> Download Token
                </Button>
                <Button 
                  asChild
                  variant="secondary"
                >
                  <Link to="/doctor">
                    View Doctor OPD Queue <ArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Active Consultation Form */
            <div className="form-section shadow-md">
              <PageHeading 
                title="Doctor Consultation Intake" 
                subtitle="Complete your symptoms, health history, vitals, and reports for your doctor."
                action={
                  <span className="saved-label">
                    {savingDraft ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />} 
                    {savingDraft ? 'Saving draft…' : 'Patient linked'}
                  </span>
                }
              />

              <div className="stepper" aria-label="Consultation stages">
                {['Doctor & Care', 'Chief Complaint', 'Health History & Vitals', 'Documents & Reports', 'Review & Token'].map((label, i) => (
                  <div key={label} className={`step ${consultSubStep === i ? 'current' : ''}`}>
                    <span>{i < consultSubStep ? <Check size={15} /> : i + 1}</span>
                    <label>{label}</label>
                  </div>
                ))}
              </div>

              {/* Sub-step 0: Specialty & Doctor */}
              {consultSubStep === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <h2>Select Disease Specialty & Doctor</h2>
                  <p>Choose which type of doctor you would like to consult.</p>

                  <div className="selection-grid">
                    {[
                      { name: 'General physician', icon: Stethoscope },
                      { name: 'Heart & blood pressure', icon: HeartPulse },
                      { name: 'Bones & joints', icon: Bone },
                      { name: 'Eye care', icon: Eye },
                      { name: 'Neurology', icon: Brain },
                      { name: 'Child care', icon: Baby },
                    ].map(({ name: specName, icon: Icon }) => (
                      <Button
                        key={specName}
                        type="button"
                        variant="outline"
                        className={`selection-option ${draft.specialty === specName ? 'selected' : ''}`}
                        onClick={() => updateDraft('specialty', specName)}
                      >
                        <Icon size={24} />
                        <span>{specName}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="field-label" htmlFor="clinic-select">Clinic Location</label>
                      <select 
                        id="clinic-select" 
                        className="field"
                        value={draft.clinic}
                        onChange={e => updateDraft('clinic', e.target.value)}
                      >
                        <option>Greenleaf Family Clinic</option>
                        <option>CareWell Medical Centre</option>
                        <option>Apollo Digital OPD</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="doctor-select">Doctor</label>
                      <select 
                        id="doctor-select" 
                        className="field"
                        value={draft.doctor}
                        onChange={e => updateDraft('doctor', e.target.value)}
                      >
                        <option>Dr. Meera Patel (MD, General Medicine)</option>
                        <option>Dr. Rohan Sen (Cardiologist)</option>
                        <option>Dr. Priya Deshmukh (Consultant Physician)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Available Time Slots</label>
                    <div className="flex flex-wrap gap-2.5">
                      {['10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'].map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          variant={slot === draft.slot ? 'default' : 'outline'}
                          onClick={() => updateDraft('slot', slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-step 1: Chief Complaint & Specific Questions */}
              {consultSubStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h2>What Is Troubling You? (Chief Complaint)</h2>
                  <p>Describe your symptoms in your own words, or use voice input.</p>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="field-label" htmlFor="complaint-input">
                        Main Complaint <span className="text-destructive">*</span>
                      </label>
                      <Button type="button" variant="outline" size="sm" onClick={handleVoiceInput} className="gap-1.5 text-xs">
                        <Mic size={14} className="text-destructive" /> Speak Complaint
                      </Button>
                    </div>

                    <textarea
                      id="complaint-input"
                      className="field"
                      rows={4}
                      maxLength={3000}
                      placeholder="e.g. Having severe headache for three days, body pain, and difficulty sleeping…"
                      value={draft.complaint}
                      onChange={e => updateDraft('complaint', e.target.value)}
                    />
                    {voiceStatus && (
                      <p className="text-xs text-primary mt-1 font-medium">{voiceStatus}</p>
                    )}
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="field-label" htmlFor="started-select">When did this start?</label>
                      <select
                        id="started-select"
                        className="field"
                        value={draft.started}
                        onChange={e => updateDraft('started', e.target.value)}
                      >
                        <option value="">Choose an answer</option>
                        {['Today', '2–3 days ago', 'About a week ago', 'More than a month ago', 'Not sure'].map(v => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="progression-select">
                        Is it getting better, worse or the same?
                      </label>
                      <select
                        id="progression-select"
                        className="field"
                        value={draft.betterOrWorse}
                        onChange={e => updateDraft('betterOrWorse', e.target.value as any)}
                      >
                        <option>Better</option>
                        <option>Worse</option>
                        <option>The same</option>
                        <option>Not sure</option>
                      </select>
                    </div>
                  </div>

                  {/* Have you taken any medicine already? */}
                  <div>
                    <label className="field-label" htmlFor="treatments-input">
                      Have you taken any medicine for this already? (Home remedies or tablets)
                    </label>
                    <input
                      id="treatments-input"
                      className="field"
                      placeholder="e.g. Took Paracetamol 650mg once yesterday, warm turmeric milk"
                      value={draft.treatments}
                      onChange={e => updateDraft('treatments', e.target.value)}
                    />
                  </div>

                  {/* Severity: How bad is it right now? */}
                  <div>
                    <label className="field-label" htmlFor="severity-slider">
                      How bad is it right now? Severity: {draft.severity} / 10
                    </label>
                    <input
                      id="severity-slider"
                      type="range"
                      min={0}
                      max={10}
                      className="w-full accent-primary mt-2"
                      value={draft.severity}
                      onChange={e => updateDraft('severity', Number(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0: Mild / Bearable</span>
                      <span>5: Moderate discomfort</span>
                      <span>10: Severe / Unbearable pain</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-step 2: Health History & Vitals */}
              {consultSubStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h2>Health History & Vital Signs</h2>
                  <p>Answer what you know. This lets your doctor assess your case in 2 minutes.</p>

                  {/* Vitals Grid */}
                  <div>
                    <label className="field-label">Current Vital Signs</label>
                    <div className="vitals-grid">
                      <div className="vital-card">
                        <label>BP (Systolic)</label>
                        <input 
                          type="number" 
                          value={vitals.bpSystolic} 
                          onChange={e => setVitals(v => ({ ...v, bpSystolic: e.target.value }))}
                          placeholder="120"
                        />
                        <small>mmHg</small>
                      </div>

                      <div className="vital-card">
                        <label>BP (Diastolic)</label>
                        <input 
                          type="number" 
                          value={vitals.bpDiastolic} 
                          onChange={e => setVitals(v => ({ ...v, bpDiastolic: e.target.value }))}
                          placeholder="80"
                        />
                        <small>mmHg</small>
                      </div>

                      <div className="vital-card">
                        <label>Pulse</label>
                        <input 
                          type="number" 
                          value={vitals.pulse} 
                          onChange={e => setVitals(v => ({ ...v, pulse: e.target.value }))}
                          placeholder="72"
                        />
                        <small>bpm</small>
                      </div>

                      <div className="vital-card">
                        <label>Temp</label>
                        <input 
                          type="text" 
                          value={vitals.temperature} 
                          onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))}
                          placeholder="98.6"
                        />
                        <small>°F</small>
                      </div>

                      <div className="vital-card">
                        <label>SpO2</label>
                        <input 
                          type="number" 
                          value={vitals.spo2} 
                          onChange={e => setVitals(v => ({ ...v, spo2: e.target.value }))}
                          placeholder="99"
                        />
                        <small>%</small>
                      </div>

                      <div className="vital-card">
                        <label>Weight</label>
                        <input 
                          type="number" 
                          value={vitals.weight} 
                          onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))}
                          placeholder="68"
                        />
                        <small>kg</small>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="allergies-input">
                      Any Allergy to Medicines or Food?
                    </label>
                    <input
                      id="allergies-input"
                      className="field"
                      placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, or No known allergies"
                      value={draft.allergies}
                      onChange={e => updateDraft('allergies', e.target.value)}
                    />
                    <div className="flex gap-2 flex-wrap mt-2">
                      {['No known allergies', 'Penicillin', 'Sulfa drugs', 'Dust / Pollen', 'Not sure'].map(opt => (
                        <Button 
                          key={opt} 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateDraft('allergies', opt)}
                          className="text-xs"
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="medicines-input">
                      Medicines You Take Now (Name or describe — "white tablet for BP" is fine)
                    </label>
                    <textarea
                      id="medicines-input"
                      className="field"
                      rows={2}
                      placeholder="e.g. Amlodipine 5mg once daily, or 'one white round tablet for BP after food'"
                      value={draft.medicines}
                      onChange={e => updateDraft('medicines', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">
                      Long-Term Conditions (Chronic Illnesses)
                    </label>
                    <div className="form-grid">
                      {['Diabetes', 'High BP', 'Heart disease', 'Asthma', 'Thyroid', 'Kidney disease', 'TB (past)', 'None'].map(cond => (
                        <label className="checkbox-line" key={cond}>
                          <input
                            type="checkbox"
                            checked={draft.conditions.includes(cond)}
                            onChange={e => {
                              const checked = e.target.checked;
                              updateDraft(
                                'conditions',
                                checked 
                                  ? [...draft.conditions, cond] 
                                  : draft.conditions.filter(c => c !== cond)
                              );
                            }}
                          />
                          <span>{cond}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-step 3: Documents & Uploads */}
              {consultSubStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h2>Upload Medical Documents & Reports</h2>
                  <p>Upload your latest lab report or previous prescription first. AI OCR will extract key values.</p>

                  <div className="form-grid">
                    <div>
                      <label className="field-label" htmlFor="doc-type-sel">Document Type</label>
                      <select
                        id="doc-type-sel"
                        className="field"
                        value={documentType}
                        onChange={e => setDocumentType(e.target.value)}
                      >
                        {['Lab report', 'Prescription', 'Discharge summary', 'Patient photo', 'Imaging / X-Ray', 'Other'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="doc-date-inp">
                        Report Date (When you did the checkup · Skip if not remembered)
                      </label>
                      <input
                        id="doc-date-inp"
                        type="date"
                        className="field"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="last-hospital-inp">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-primary" />
                        In which hospital or clinic was the last checkup? (Optional)
                      </span>
                    </label>
                    <input
                      id="last-hospital-inp"
                      className="field"
                      placeholder="e.g. Apollo Hospital, Metropolis Labs, Civil Hospital"
                      value={lastHospital}
                      onChange={e => setLastHospital(e.target.value)}
                    />
                  </div>

                  {/* 1-Click 10-Reports Evaluation Package */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Sparkles size={14} /> 1-Click Hackathon Evaluation Mode
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Instantly load 10 comprehensive clinical lab reports & prescriptions (CBC, Lipid Profile, Thyroid, Past Rx with Penicillin Allergy, KFT, LFT, ECG, Chest X-Ray, etc.) with pre-extracted OCR parameters.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleLoadSample10Reports}
                      disabled={ocrLoading}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs whitespace-nowrap shadow-sm"
                    >
                      <FileText size={14} className="mr-1.5" /> ⚡ Load 10 Clinical Reports & PDFs
                    </Button>
                  </div>

                  <div className="upload-zone">
                    <Upload className="mx-auto text-primary" size={32} />
                    <h3 className="font-bold">Choose a Report or Take a Live Photo</h3>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG, PNG up to 10 MB · Up to 10 reports allowed ({documents.length}/10 uploaded)
                    </p>

                    <div className="flex justify-center gap-3 mt-3 flex-wrap">
                      <Button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={documents.length >= 10}
                        className="gap-2"
                      >
                        <Upload size={15} /> Upload Files ({10 - documents.length} remaining)
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => cameraInputRef.current?.click()} 
                        disabled={documents.length >= 10}
                        className="gap-2"
                      >
                        <Camera size={15} /> Live Camera Capture
                      </Button>
                    </div>

                    {documents.length >= 10 && (
                      <p className="text-xs text-amber-700 font-semibold mt-2">
                        ✓ Maximum limit of 10 medical reports reached.
                      </p>
                    )}

                    {ocrLoading && (
                      <p className="text-xs text-primary font-semibold mt-3 animate-pulse">
                        Scanning document text with AI OCR & checking for critical values…
                      </p>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/*"
                      multiple
                      onChange={e => handleAddFiles(e.target.files)}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handleAddFiles(e.target.files)}
                    />
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">
                          Uploaded Reports & Prescriptions ({documents.length} of 10)
                        </h4>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setDocuments([]); setAllExtractedFindings([]); }}
                          className="text-xs text-destructive hover:bg-red-50"
                        >
                          Clear All ({documents.length})
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {documents.map((doc, idx) => (
                          <div key={doc.id || idx} className="document-row bg-muted/40 rounded-lg p-3 border">
                            <FileIcon />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-muted-foreground">#{idx + 1}</span>
                                <h4 className="text-sm font-bold truncate">{doc.name}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <span className="font-semibold text-primary">{doc.type}</span> · {doc.reportDate ? `Report Date: ${doc.reportDate}` : 'Date: Recent'} {doc.lastHospital ? `· Hospital: ${doc.lastHospital}` : ''}
                              </p>
                              {doc.extractedText && (
                                <p className="text-xs text-teal font-medium mt-1 leading-snug">
                                  <strong>AI OCR:</strong> {doc.extractedText}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setDocuments(v => v.filter(d => d.id !== doc.id))}
                              title="Delete report"
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlighted Critical & Dangerous Findings Banner */}
                  {allExtractedFindings.length > 0 && (
                    <div className="p-4 bg-red-50/80 border-2 border-red-300 rounded-xl text-xs space-y-3 mt-4">
                      <div className="font-bold text-red-950 text-sm flex items-center gap-2">
                        <AlertTriangle size={18} className="text-destructive" />
                        AI Clinical Findings & Critical Alerts (Highlighted for Doctor Review):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allExtractedFindings.map((f, i) => (
                          <div 
                            key={i} 
                            className={`p-2.5 rounded-md border flex flex-col justify-between ${
                              f.alertLevel === 'critical'
                                ? 'bg-red-100/90 border-red-400 text-red-950 font-medium'
                                : f.alertLevel === 'warning'
                                ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-medium'
                                : 'bg-white border-border text-foreground'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <strong>{f.test}</strong>
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                f.alertLevel === 'critical' 
                                  ? 'bg-red-600 text-white' 
                                  : f.alertLevel === 'warning'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {f.value} {f.unit}
                              </span>
                            </div>
                            <p className="text-[11px] mt-1 leading-tight">
                              {f.remark}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-step 4: Review & Generate Token */}
              {consultSubStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h2>Review Before Generating Token</h2>
                  <p>Check the details below before booking your consultation.</p>

                  <div className="bg-muted/40 p-4 rounded-xl space-y-3 border text-sm">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-semibold text-muted-foreground">PATIENT</span>
                      <span className="font-bold">{patient.name} ({patient.id})</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-semibold text-muted-foreground">DOCTOR</span>
                      <span>{draft.doctor} ({draft.specialty}) · {draft.slot}</span>
                    </div>

                    <div className="border-b pb-2">
                      <span className="text-xs font-semibold text-muted-foreground block mb-1">CHIEF COMPLAINT</span>
                      <p className="text-sm bg-background p-2.5 rounded border">
                        "{draft.complaint}" · Severity: {draft.severity}/10 · Started: {draft.started || 'Not specified'} · Trajectory: {draft.betterOrWorse}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div><span>BP:</span> <strong>{vitals.bpSystolic}/{vitals.bpDiastolic}</strong></div>
                      <div><span>Pulse:</span> <strong>{vitals.pulse} bpm</strong></div>
                      <div><span>Temp:</span> <strong>{vitals.temperature} °F</strong></div>
                      <div><span>SpO2:</span> <strong>{vitals.spo2}%</strong></div>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs text-muted-foreground">
                      <span>DOCUMENTS ATTACHED:</span>
                      <strong>{documents.length} File(s)</strong>
                    </div>
                  </div>

                  <label className="checkbox-line mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.consent}
                      onChange={e => updateDraft('consent', e.target.checked)}
                    />
                    <span className="text-xs font-medium">
                      I agree to share my health history and symptoms with the doctor.
                    </span>
                  </label>
                </div>
              )}

              {consultError && (
                <div role="alert" className="error-message p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                  {consultError}
                </div>
              )}

              <div className="form-actions pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={consultSubStep === 0 || submitting}
                  onClick={() => {
                    setConsultError('');
                    setConsultSubStep(v => Math.max(0, v - 1));
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </Button>

                {consultSubStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (consultSubStep === 1 && !draft.complaint.trim()) {
                        setConsultError('Please describe your main complaint before continuing.');
                        return;
                      }
                      setConsultError('');
                      setConsultSubStep(v => Math.min(4, v + 1));
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleConsultationSubmit}
                    className="bg-primary min-w-56 font-bold"
                  >
                    {submitting ? <LoaderCircle size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
                    {submitting ? 'Generating Token…' : 'Generate Token & Book Appointment'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
