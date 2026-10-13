import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPage } from '@/components/carebrief/auth-help';
export const Route = createFileRoute('/privacy')({
 head: () => ({ meta: [{ title: 'CareBrief — Privacy & consent' }, { name: 'description', content: 'Understand the CareBrief frontend demo privacy notice.' }, { property: 'og:title', content: 'CareBrief — Privacy & consent' }, { property: 'og:description', content: 'Understand the CareBrief frontend demo privacy notice.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: PrivacyPage,
});
