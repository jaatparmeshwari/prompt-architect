import { createFileRoute } from '@tanstack/react-router';
import { PatientFlow } from '@/components/carebrief/patient-flow';
export const Route = createFileRoute('/consultation')({
 head: () => ({ meta: [{ title: 'Aayu CareBrief — Consultation' }, { name: 'description', content: 'Prepare your symptoms, history and reports before your visit.' }, { property: 'og:title', content: 'Aayu CareBrief — Consultation' }, { property: 'og:description', content: 'Prepare your symptoms, history and reports before your visit.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: () => <PatientFlow initialStep={2} />,
});
