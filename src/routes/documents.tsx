import { createFileRoute } from '@tanstack/react-router';
import { DocumentsPage } from '@/components/carebrief/patient-pages';
export const Route = createFileRoute('/documents')({
 head: () => ({ meta: [{ title: 'CareBrief — My documents' }, { name: 'description', content: 'Your fictional medical reports and documents.' }, { property: 'og:title', content: 'CareBrief — My documents' }, { property: 'og:description', content: 'Your fictional medical reports and documents.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: DocumentsPage,
});
