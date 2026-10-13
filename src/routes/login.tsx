import { createFileRoute } from '@tanstack/react-router';
import { PatientFlow } from '@/components/carebrief/patient-flow';
export const Route = createFileRoute('/login')({
 head: () => ({ meta: [{ title: 'Aayu CareBrief — Patient Login' }, { name: 'description', content: 'Patient verification with Name and Aadhaar to generate Patient ID.' }, { property: 'og:title', content: 'Aayu CareBrief — Patient Login' }, { property: 'og:description', content: 'Patient verification with Name and Aadhaar to generate Patient ID.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: () => <PatientFlow initialStep={0} />,
});
