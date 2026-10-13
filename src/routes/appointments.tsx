import { createFileRoute } from '@tanstack/react-router';
import { AppointmentsPage } from '@/components/carebrief/patient-pages';
export const Route = createFileRoute('/appointments')({
 head: () => ({ meta: [{ title: 'CareBrief — Appointments & tokens' }, { name: 'description', content: 'Your upcoming appointments and queue tokens.' }, { property: 'og:title', content: 'CareBrief — Appointments & tokens' }, { property: 'og:description', content: 'Your upcoming appointments and queue tokens.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: AppointmentsPage,
});
