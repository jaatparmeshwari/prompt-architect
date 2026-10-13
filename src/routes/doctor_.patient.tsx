import { createFileRoute } from '@tanstack/react-router';
import { DoctorPatient } from '@/components/carebrief/doctor-pages';
export const Route = createFileRoute('/doctor_/patient')({
 head: () => ({ meta: [{ title: 'CareBrief — Doctor patient review' }, { name: 'description', content: 'A two-minute fictional patient summary and source review.' }, { property: 'og:title', content: 'CareBrief — Doctor patient review' }, { property: 'og:description', content: 'A two-minute fictional patient summary and source review.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: DoctorPatient,
});
