import { createFileRoute } from '@tanstack/react-router';
import { DoctorQueue } from '@/components/carebrief/doctor-pages';
export const Route = createFileRoute('/doctor')({
 head: () => ({ meta: [{ title: 'CareBrief — Doctor patient queue' }, { name: 'description', content: 'Review the fictional CareBrief clinic patient queue.' }, { property: 'og:title', content: 'CareBrief — Doctor patient queue' }, { property: 'og:description', content: 'Review the fictional CareBrief clinic patient queue.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: DoctorQueue,
});
