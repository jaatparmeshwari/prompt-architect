import { createFileRoute } from '@tanstack/react-router';
import { ConsultationPage } from '@/components/carebrief/consultation';
export const Route = createFileRoute('/consultation')({
 head: () => ({ meta: [{ title: 'CareBrief — Consultation' }, { name: 'description', content: 'Prepare your symptoms, history and reports before your visit.' }, { property: 'og:title', content: 'CareBrief — Consultation' }, { property: 'og:description', content: 'Prepare your symptoms, history and reports before your visit.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: ConsultationPage,
});
