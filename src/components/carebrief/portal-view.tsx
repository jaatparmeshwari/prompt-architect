import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { PatientFlow } from './patient-flow';
import { Dashboard } from './dashboard';
import { usePatientSession } from '@/hooks/use-patient-session';
import { Sparkles, LayoutDashboard, Stethoscope, Users, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PortalView() {
  const { isRegistered, patient } = usePatientSession();
  
  // By default, show the 3-step Patient Flow requested by the user
  const [viewMode, setViewMode] = useState<'flow' | 'dashboard'>('flow');

  return (
    <div className="w-full">
      {/* Top Header Switcher for seamless navigation between Patient, Doctor, and Dashboard */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-border flex-wrap gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <Sparkles size={13} /> AAYU HEALTHCARE PORTAL
          </span>
          <h1 className="text-xl font-bold mt-0.5">
            {viewMode === 'flow' ? 'Patient Consultation & Registration Workflow' : 'Patient Clinical Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border flex-wrap">
          <Button
            type="button"
            variant={viewMode === 'flow' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('flow')}
            className="text-xs font-semibold gap-1.5"
          >
            <Stethoscope size={14} /> Patient Portal (Intake & Consult)
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <Link to="/doctor">
              <Users size={14} /> Doctor Portal (OPD Queue & 2-Min Brief)
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <Link to="/history">
              <History size={14} /> Patient Health Locker
            </Link>
          </Button>

          <Button
            type="button"
            variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('dashboard')}
            className="text-xs font-semibold gap-1.5"
          >
            <LayoutDashboard size={14} /> Dashboard
          </Button>
        </div>
      </div>

      {viewMode === 'flow' ? (
        <PatientFlow initialStep={isRegistered ? 2 : 0} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
