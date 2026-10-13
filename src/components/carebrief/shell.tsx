import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Stethoscope, CalendarDays, History, FolderOpen, Pill, Settings, CircleHelp, LogOut, ShieldCheck, ChevronDown, Bell, Globe2, Menu, HeartPulse, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import patientPhoto from '@/assets/patient.jpg';
import { useMock } from '@/services/api';
const LanguageContext = createContext({ hindi: false, toggle: () => {} });
export const useLanguage = () => useContext(LanguageContext);
export function LanguageProvider({ children }: { children: ReactNode }) { const [hindi, setHindi] = useState(false); return <LanguageContext.Provider value={{ hindi, toggle: () => setHindi(v => !v) }}>{children}</LanguageContext.Provider>; }
const navigation = [
 { to: '/', label: 'Dashboard', hi: 'डैशबोर्ड', icon: LayoutDashboard },
 { to: '/consultation', label: 'Start consultation', hi: 'परामर्श शुरू करें', icon: Stethoscope },
 { to: '/appointments', label: 'Appointments & tokens', hi: 'अपॉइंटमेंट और टोकन', icon: CalendarDays },
 { to: '/history', label: 'Medical history', hi: 'चिकित्सा इतिहास', icon: History },
 { to: '/documents', label: 'My documents', hi: 'मेरे दस्तावेज़', icon: FolderOpen },
 { to: '/prescriptions', label: 'Prescriptions', hi: 'दवाइयों के पर्चे', icon: Pill },
 { to: '/profile', label: 'Profile & settings', hi: 'प्रोफ़ाइल और सेटिंग्स', icon: Settings },
] as const;
export function Brand() { return <Link to="/" className="brand"><span className="brand-mark"><HeartPulse size={24} strokeWidth={2} /></span><span>CareBrief<span className="brand-dot">.</span></span></Link>; }
export const hasDemoSession = () => typeof window !== 'undefined' && !!sessionStorage.getItem('carebrief-demo-role');
export const hasReceipt = () => typeof window !== 'undefined' && !!sessionStorage.getItem('carebrief-receipt');
import { usePatientSession } from '@/hooks/use-patient-session';

export function AppShell({ children }: { children: ReactNode }) {
 const { pathname } = useLocation(); const { hindi, toggle } = useLanguage(); const [menu, setMenu] = useState(false); const [notifications, setNotifications] = useState(false);
 const { patient, clearPatient } = usePatientSession();
 const doctor = pathname.startsWith('/doctor'); const unlocked = hasReceipt();
 const items = doctor ? navigation : unlocked ? navigation : navigation.filter(x => x.to === '/consultation');
 const active = navigation.find(x => x.to === pathname)?.label ?? (doctor ? 'Doctor portal' : 'Patient portal');
 return (
   <>
     {menu && <div className="sidebar-backdrop" onClick={() => setMenu(false)} />}
     <aside className={`app-sidebar ${menu ? 'is-open' : ''}`}>
       <div className="flex items-center justify-between">
         <Brand />
       </div>
       <div className="workspace-label">{doctor ? 'CLINIC WORKSPACE' : hindi ? 'रोगी कार्यक्षेत्र' : 'PATIENT WORKSPACE'}</div>
       <nav className="side-nav" aria-label="Main navigation">
         {doctor ? (
           <>
             <Link to="/doctor" onClick={() => setMenu(false)} className={`nav-item ${pathname === '/doctor' ? 'active' : ''}`}><Users />Patient queue</Link>
             <Link to="/" onClick={() => setMenu(false)} className="nav-item"><LayoutDashboard />Patient dashboard</Link>
           </>
         ) : (
           items.map(({ to, label, hi, icon: Icon }) => (
             <Link key={to} to={to} onClick={() => setMenu(false)} className={`nav-item ${pathname === to ? 'active' : ''}`}><Icon />{hindi ? hi : label}</Link>
           ))
         )}
       </nav>
       <div className="sidebar-bottom">
         <Link to="/help" onClick={() => setMenu(false)} className={`nav-item ${pathname === '/help' ? 'active' : ''}`}><CircleHelp />{hindi ? 'सहायता' : 'Help & support'}</Link>
         <Link to="/login" onClick={() => { setMenu(false); clearPatient(); }} className="nav-item"><LogOut />{hindi ? 'लॉग आउट' : 'Logout'}</Link>
         <div className="secure-note"><ShieldCheck size={16} /><div>{hindi ? 'आपका स्वास्थ्य, आपकी निजता।' : 'Your health. Your privacy.'}<br />{hindi ? 'सुरक्षित देखभाल, हमेशा।' : 'Secure care, every step.'}</div></div>
         <Link to="/profile" onClick={() => setMenu(false)} className="sidebar-user">
           <img src={patient.photo || patientPhoto} alt={`Patient ${patient.name}`} className="avatar-photo" width={38} height={38} />
           <div><strong>{doctor ? 'Dr. Meera Patel' : patient.name}</strong><small>{doctor ? 'General physician · Demo' : `Patient ID: ${patient.id}`}</small></div>
           <ChevronDown size={13} className="ml-auto text-muted-foreground" />
         </Link>
       </div>
     </aside>
     <div className="app-body">
       <header className="app-topbar">
         <div className="topbar-left">
           <Button className="nav-menu-btn" variant="ghost" size="icon" aria-label="Toggle navigation menu" title="Navigation Menu (3 lines)" onClick={() => setMenu(v => !v)}>
             <Menu size={20} />
           </Button>
           <span>{hindi ? 'रोगी पोर्टल' : doctor ? 'Doctor portal' : 'Patient portal'}</span>
           <ChevronRight size={13} className="text-muted-foreground" />
           <small>{active}</small>
           {useMock && <span className="demo-label">DEMO MODE</span>}
         </div>
         <div className="topbar-right">
           <Button variant="ghost" className="language-button" onClick={toggle} aria-label="Switch language">
             <Globe2 />{hindi ? 'हिन्दी' : 'English'}<ChevronDown size={12} />
           </Button>
           <span className="topbar-divider" />
           <Button className="relative" variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotifications(v => !v)}>
             <Bell /><span className="notification-dot" />
           </Button>
           <Link to="/profile">
             <img src={patient.photo || patientPhoto} alt="Your demo profile" width={32} height={32} className="avatar-photo h-8 w-8" />
           </Link>
         </div>
         {notifications && (
           <div className="notification-popover">
             <h3>Notifications</h3>
             <p>Your demo appointment is confirmed for today at 10:30 AM. Queue token: 08.</p>
             <p>All your demo documents are ready to view.</p>
           </div>
         )}
       </header>
       <main className="main-content">
         {children}
         <footer className="app-footer">
           <span>© 2026 CareBrief. Care starts with understanding.</span>
           <div><Link to="/privacy">Privacy policy</Link><Link to="/help">Help & support</Link></div>
         </footer>
       </main>
     </div>
     <nav className="mobile-bottom" aria-label="Mobile navigation">
       {[navigation[0],navigation[1],navigation[3],navigation[4],navigation[6]].map(({ to, label, icon: Icon }) => (
         <Link key={to} to={to} className={pathname === to ? 'active' : ''}>
           <Icon />
           {label === 'Start consultation' ? 'Consult' : label === 'Medical history' ? 'History' : label === 'Profile & settings' ? 'Profile' : label === 'My documents' ? 'Documents' : 'Home'}
         </Link>
       ))}
     </nav>
   </>
 );
}
