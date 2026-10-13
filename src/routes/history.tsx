import { createFileRoute } from '@tanstack/react-router';
import { MedicalHistory } from '@/components/carebrief/patient-pages';
export const Route = createFileRoute('/history')({
 head: () => ({ meta: [{ title: 'CareBrief — Medical history' }, { name: 'description', content: 'Your visits, reports and prescriptions in a chronological timeline.' }, { property: 'og:title', content: 'CareBrief — Medical history' }, { property: 'og:description', content: 'Your visits, reports and prescriptions in a chronological timeline.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: MedicalHistory,
});
