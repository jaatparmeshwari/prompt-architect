import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types/carebrief';
import { 
  getCurrentPatient, 
  saveCurrentPatient, 
  clearCurrentPatient, 
  isPatientRegistered,
  generatePatientId 
} from '@/services/api';

export function usePatientSession() {
  const [patient, setPatient] = useState<Patient>(() => getCurrentPatient());
  const [registered, setRegistered] = useState<boolean>(() => isPatientRegistered());

  useEffect(() => {
    const handleUpdate = () => {
      setPatient(getCurrentPatient());
      setRegistered(isPatientRegistered());
    };

    window.addEventListener('carebrief-patient-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('carebrief-patient-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const savePatient = useCallback((data: Patient) => {
    saveCurrentPatient(data);
    setPatient(data);
    setRegistered(true);
  }, []);

  const clearPatient = useCallback(() => {
    clearCurrentPatient();
    setPatient(getCurrentPatient());
    setRegistered(false);
  }, []);

  return {
    patient,
    isRegistered: registered,
    savePatient,
    clearPatient,
    generateNewId: generatePatientId
  };
}
