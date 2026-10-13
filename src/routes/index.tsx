import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from '@/components/carebrief/dashboard';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'CareBrief — Patient dashboard' },
    { name: 'description', content: 'Your CareBrief appointments, medical history, reports and prescriptions in one place. Fictional demo.' },
    { property: 'og:title', content: 'CareBrief — Patient dashboard' },
    { property: 'og:description', content: 'Your care journey, all in one place.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Dashboard,
});
