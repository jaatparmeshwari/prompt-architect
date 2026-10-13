import { createFileRoute } from '@tanstack/react-router';
import { DocumentsPage } from '@/components/carebrief/patient-pages';
export const Route = createFileRoute('/prescriptions')({
 head: () => ({ meta: [{ title: 'CareBrief — Prescriptions' }, { name: 'description', content: 'Your fictional doctor-prescribed medicines and instructions.' }, { property: 'og:title', content: 'CareBrief — Prescriptions' }, { property: 'og:description', content: 'Doctor advice, together in one place.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: () => <DocumentsPage prescriptions />,
});
