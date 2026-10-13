import { createFileRoute } from '@tanstack/react-router';
import { HelpPage } from '@/components/carebrief/auth-help';
export const Route = createFileRoute('/help')({
 head: () => ({ meta: [{ title: 'CareBrief — Help & support' }, { name: 'description', content: 'Answers about your CareBrief care journey.' }, { property: 'og:title', content: 'CareBrief — Help & support' }, { property: 'og:description', content: 'Answers about your CareBrief care journey.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: HelpPage,
});
