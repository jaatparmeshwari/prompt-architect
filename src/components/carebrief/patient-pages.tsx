import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, CalendarDays, Clock3, MapPin, Download, Eye, ChevronDown, ChevronUp, FileText, Plus, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, patient, recordDownload } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Badge, PageHeading, DocumentPreview, CorrectionButton, FileIcon, Modal } from './shared';
import type { MedicalRecord } from '@/types/carebrief';
import doctorPhoto from '@/assets/doctor.png';
import patientPhoto from '@/assets/patient.jpg';
export function MedicalHistory() {
  const { data: serverRecords = [], isLoading, error, refetch } = useQuery({ queryKey: ['records'], queryFn: api.getRecords });
  const [search, setSearch] = useState(''); 
  const [type, setType] = useState('All records'); 
  const [date, setDate] = useState('All dates'); 
  const [expanded, setExpanded] = useState<string[]>([]); 
  const [preview, setPreview] = useState<MedicalRecord | null>(null);

  // Merge server records with patient's locally saved history & uploaded files
  const localHistoryKey = `carebrief-history-${patient.id}`;
  let localRecords: MedicalRecord[] = [];
  try {
    localRecords = JSON.parse(localStorage.getItem(localHistoryKey) || '[]');
  } catch {}

  // Include consultations and documents submitted by patient in real time
  let consultationRecords: MedicalRecord[] = [];
  try {
    const consultations = JSON.parse(localStorage.getItem('carebrief-consultations') || '[]');
    consultations.forEach((c: any) => {
      consultationRecords.push({
        id: c.reference,
        title: `Consultation (${c.tokenNumber || 'Token'}) - ${c.draft?.specialty || 'General Physician'}`,
        type: 'Visit',
        date: c.submittedAt ? c.submittedAt.split('T')[0] : '2026-10-13',
        doctor: c.draft?.doctor || 'Dr. Meera Patel',
        hospital: c.draft?.clinic || 'Greenleaf Family Clinic',
        description: `Chief Complaint: "${c.draft?.complaint}". Vitals: BP ${c.draft?.vitals?.bpSystolic}/${c.draft?.vitals?.bpDiastolic}, Pulse ${c.draft?.vitals?.pulse}. Critical alerts: ${c.dangerousFindings?.map((d: any) => `${d.test} (${d.value} ${d.unit})`).join(', ') || 'Normal baseline'}. Token: ${c.tokenNumber}.`,
        confirmed: true
      });
      if (c.documents && Array.isArray(c.documents)) {
        c.documents.forEach((d: any) => {
          consultationRecords.push({
            id: d.id,
            title: d.name,
            type: (d.type as any) || 'Lab report',
            date: d.reportDate || '2026-10-06',
            doctor: c.draft?.doctor || 'Dr. Meera Patel',
            hospital: d.lastHospital || 'Diagnostic Center',
            description: d.extractedText || 'Document uploaded during intake.',
            confirmed: false
          });
        });
      }
    });
  } catch {}

  const allRecords = [...consultationRecords, ...localRecords, ...serverRecords];
  const filtered = allRecords.filter(r => 
    `${r.title} ${r.doctor}`.toLowerCase().includes(search.toLowerCase()) && 
    (type === 'All records' || r.type === type)
  );

  return (
    <>
      <PageHeading 
        title="Patient Health Locker & History" 
        subtitle="All your past consultations, uploaded reports, and clinical prescriptions in one permanent digital vault." 
        action={
          <Button asChild variant="outline">
            <Link to="/consultation"><Plus />Add new report</Link>
          </Button>
        } 
      />

      <div className="search-row">
        <div className="search-field">
          <Search />
          <input 
            className="field" 
            aria-label="Search medical history" 
            placeholder="Search by visit, document or doctor…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="field" aria-label="Filter by document type" value={type} onChange={e => setType(e.target.value)}>
          {['All records','Visit','Lab report','Prescription','Discharge summary'].map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      {isLoading && <div className="empty-state">Loading your health vault…</div>}
      {error && <div className="error-message">Unable to load history. <Button variant="link" onClick={() => refetch()}>Try again</Button></div>}
      {!isLoading && !error && !filtered.length && (
        <div className="empty-state">
          <FileText />
          <h3>No records found</h3>
          <p>Upload a report or book your first consultation.</p>
        </div>
      )}

      <div className="timeline" aria-label="Medical history timeline">
        {filtered.map(r => (
          <article className="timeline-entry" key={r.id}>
            <span className="timeline-node" />
            <time>{r.date ? new Date(`${r.date}T12:00:00`).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : 'Recent'}</time>
            <div className="timeline-card shadow-sm">
              <div className="flex justify-between gap-3 items-center">
                <div className="flex items-center gap-3">
                  <FileIcon />
                  <div>
                    <h3 className="font-bold">{r.title}</h3>
                    <p className="text-xs text-muted-foreground">{r.doctor} · {r.type} {r.hospital ? `· ${r.hospital}` : ''}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label={`Expand ${r.title}`} 
                  onClick={() => setExpanded(v => v.includes(r.id) ? v.filter(id => id !== r.id) : [...v, r.id])}
                >
                  {expanded.includes(r.id) ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>

              <div className="mt-4 flex gap-2">
                <Badge tone={r.confirmed ? 'teal' : 'blue'}>
                  {r.confirmed ? 'Doctor-confirmed' : 'Patient Uploaded'}
                </Badge>
                <Badge tone="gray">Permanent Record</Badge>
              </div>

              {expanded.includes(r.id) && (
                <div className="timeline-details">
                  <p className="text-xs leading-relaxed">{r.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setPreview(r)}>
                      <Eye size={14} className="mr-1" /> View record
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => recordDownload(r.title, r.description)}>
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                    <CorrectionButton title={r.title} />
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {preview && (
        <DocumentPreview 
          title={preview.title} 
          description={preview.description} 
          onClose={() => setPreview(null)} 
        />
      )}
    </>
  );
}
export function DocumentsPage({ prescriptions = false }: { prescriptions?: boolean }) {
 const { data = [], isLoading, error, refetch } = useQuery({ queryKey:['records'], queryFn:api.getRecords }); const [search,setSearch] = useState(''); const [preview,setPreview] = useState<MedicalRecord | null>(null);
 const filtered = data.filter(r => (prescriptions ? r.type==='Prescription' : r.type !== 'Visit') && r.title.toLowerCase().includes(search.toLowerCase()));
 return <><PageHeading title={prescriptions ? 'Prescriptions' : 'My documents'} subtitle={prescriptions ? 'Your doctor’s advice, together in one place. Fictional demo; not medical advice.' : 'Your reports and records, organised and easy to find.'} action={!prescriptions && <Button asChild><Link to="/consultation"><Plus />Upload documents</Link></Button>} /><div className="search-row"><div className="search-field"><Search /><input className="field" aria-label="Search documents" placeholder={prescriptions ? 'Search prescriptions…' : 'Search your documents…'} value={search} onChange={e=>setSearch(e.target.value)} /></div></div><div className="data-panel">{isLoading ? <div className="empty-state">Loading documents…</div> : error ? <div className="empty-state">Documents could not load.<Button onClick={()=>refetch()}>Retry</Button></div> : !filtered.length ? <div className="empty-state"><FileText /><h3>No documents found</h3><p>Try a different search.</p></div> : filtered.map(r=><div key={r.id} className="document-row"><FileIcon /><div className="flex-1"><h3>{r.title}</h3><p>{r.type} · Report date: {r.date} · {r.doctor}</p><Badge tone="gray">Fictional demo</Badge></div><Button variant="ghost" size="icon" aria-label={`Preview ${r.title}`} onClick={()=>setPreview(r)}><Eye /></Button><Button variant="ghost" size="icon" aria-label={`Download ${r.title}`} onClick={()=>recordDownload(r.title,r.description)}><Download /></Button></div>)}</div>{preview && <DocumentPreview title={preview.title} description={preview.description} onClose={()=>setPreview(null)} />}</>;
}
export function AppointmentsPage() { const [cancel,setCancel] = useState(false); const [cancelled,setCancelled] = useState(false); return <><PageHeading title="Appointments & tokens" subtitle="Know when to arrive and keep track of your next visit." action={<Button asChild><Link to="/consultation"><Plus />New consultation</Link></Button>} /><div className="form-section max-w-3xl"><div className="flex justify-between items-center"><h2>Today’s appointment</h2><Badge tone={cancelled?'gray':'teal'}>{cancelled?'Cancelled':'Confirmed · Demo'}</Badge></div><div className="doctor-row mt-6"><img src={doctorPhoto} alt="Fictional Dr. Meera Patel" width={43} height={43} className="doctor-photo" /><div><h3>Dr. Meera Patel</h3><p>General physician · Greenleaf Family Clinic</p></div></div><div className="form-grid mt-5"><div><div className="appointment-meta"><CalendarDays size={17}/>Tuesday, 13 October 2026</div><div className="appointment-meta"><Clock3 size={17}/>10:30 AM</div><div className="appointment-meta"><MapPin size={17}/>Greenleaf Family Clinic · Fictional clinic</div></div><div className="token-box"><div><small>Your queue token</small><strong>{cancelled ? '—' : '08'}</strong></div><div><Badge tone="blue">{cancelled ? 'Not in queue' : '3 patients ahead'}</Badge><p className="text-xs text-muted-foreground mt-2">Estimated wait: 15–20 min</p></div></div></div><p className="mt-6">Please arrive 10 minutes before your appointment. Bring any original reports you would like your doctor to review.</p>{!cancelled && <div className="mt-6 flex gap-3"><Button asChild variant="outline"><Link to="/consultation">Update consultation details</Link></Button><Button variant="ghost" onClick={()=>setCancel(true)}>Cancel appointment</Button></div>}</div>{cancel && <Modal title="Cancel this demo appointment?" onClose={()=>setCancel(false)}><p className="text-muted-foreground mt-4">This changes only the fictional appointment shown in this preview.</p><div className="flex gap-3 mt-6"><Button variant="destructive" onClick={()=>{setCancelled(true);setCancel(false);}}>Confirm cancellation</Button><Button variant="outline" onClick={()=>setCancel(false)}>Keep appointment</Button></div></Modal>}</>; }
export function ProfilePage() { const [saved,setSaved] = useState(false); const [photo,setPhoto] = useState(patientPhoto); const [photoError,setPhotoError] = useState(''); return <><PageHeading title="Profile & settings" subtitle="Help your doctor get to know you. Review and update your details." /><form className="form-section max-w-3xl" onSubmit={e=>{e.preventDefault();setSaved(true);}}><div className="flex items-center gap-5"><img src={photo} alt="Patient profile preview" className="rounded-full object-cover size-20" width={80} height={80} /><div><h3>Patient photo</h3><p className="text-xs text-muted-foreground mt-2 mb-3">Optional · Helps the doctor recognise you.</p><label className="text-primary cursor-pointer text-xs" htmlFor="profile-photo">Choose or capture a photo</label><input id="profile-photo" type="file" accept="image/jpeg,image/png" capture="user" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png'].includes(file.type)||file.size>10*1024*1024){setPhotoError('Choose a JPG or PNG photo under 10 MB.');return;}setPhotoError('');setPhoto(URL.createObjectURL(file));}} /></div></div>{photoError && <p className="error-message">{photoError}</p>}<div className="form-grid"><div><label className="field-label" htmlFor="profile-name">Full name</label><input className="field" id="profile-name" defaultValue={patient.name} required maxLength={100}/></div><div><label className="field-label" htmlFor="profile-mobile">Mobile number</label><input className="field" id="profile-mobile" defaultValue={patient.mobile} pattern="[6-9][0-9]{9}" maxLength={10}/></div><div><label className="field-label" htmlFor="age">Entered age (years)</label><input id="age" className="field" type="number" min={0} max={120} defaultValue={34}/></div><div><label className="field-label" htmlFor="sex">Sex</label><select className="field" id="sex"><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></div><div><label className="field-label" htmlFor="language">Preferred language</label><select className="field" id="language"><option>English</option><option>Hindi</option></select></div><div><label className="field-label" htmlFor="patient-id">Patient ID</label><input id="patient-id" className="field" readOnly value={patient.id}/></div></div>{saved && <div className="success-message"><Check/>Your changes are saved for this demo view only.</div>}<Button type="submit" className="mt-6">Save demo profile</Button><p className="text-xs text-muted-foreground mt-5"><ShieldCheck size={13} className="inline mr-1"/>No Aadhaar collected. No real patient information should be entered in this demo.</p></form></>; }
