import { createFileRoute } from '@tanstack/react-router';
import { ReceiptPage } from '@/components/carebrief/consultation';
export const Route = createFileRoute('/receipt')({
 head: () => ({ meta: [{ title: 'CareBrief — Submission receipt' }, { name: 'description', content: 'Your safe CareBrief submission reference and status.' }, { property: 'og:title', content: 'CareBrief — Submission receipt' }, { property: 'og:description', content: 'Your safe CareBrief submission reference and status.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: ReceiptPage,
});
