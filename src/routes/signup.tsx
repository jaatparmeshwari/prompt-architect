import { createFileRoute } from '@tanstack/react-router';
import { SignupPage } from '@/components/carebrief/auth-help';
export const Route = createFileRoute('/signup')({
 head: () => ({ meta: [{ title: 'CareBrief — Patient registration' }, { name: 'description', content: 'Create a fictional demo patient profile.' }, { property: 'og:title', content: 'CareBrief — Patient registration' }, { property: 'og:description', content: 'Create a fictional demo patient profile.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: SignupPage,
});
