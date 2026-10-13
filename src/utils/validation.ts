import { z } from 'zod';
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');
export const complaintSchema = z.string().trim().min(10, 'Please describe your complaint in at least 10 characters.').max(3000);
export function validateUpload(file: Pick<File, 'type' | 'size'>) {
 if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return 'Please choose a PDF, JPG or PNG file.';
 if (file.size > 10 * 1024 * 1024) return 'This file is too large. Choose a file under 10 MB.';
 return null;
}
export function canAccess(role: string | null, target: 'patient' | 'doctor') { return role === target; }
export function createSubmitGuard() { let pending = false; return { begin: () => { if (pending) return false; pending = true; return true; }, release: () => { pending = false; } }; }
