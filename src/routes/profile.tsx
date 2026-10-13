import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/carebrief/patient-pages';
export const Route = createFileRoute('/profile')({
 head: () => ({ meta: [{ title: 'CareBrief — Profile & settings' }, { name: 'description', content: 'Review your patient profile and preferred language.' }, { property: 'og:title', content: 'CareBrief — Profile & settings' }, { property: 'og:description', content: 'Review your patient profile and preferred language.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: ProfilePage,
});
