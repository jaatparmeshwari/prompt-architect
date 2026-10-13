import { createFileRoute } from "@tanstack/react-router";
import { PortalView } from '@/components/carebrief/portal-view';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Aayu CareBrief — Patient Portal' },
    { name: 'description', content: 'Patient registration, Aadhaar verification, and digital doctor consultation.' },
    { property: 'og:title', content: 'Aayu CareBrief — Patient Portal' },
    { property: 'og:description', content: 'Patient registration, Aadhaar verification, and digital doctor consultation.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PortalView,
});
