import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/components/carebrief/auth-help';
export const Route = createFileRoute('/login')({
 head: () => ({ meta: [{ title: 'CareBrief — Demo sign-in' }, { name: 'description', content: 'Sign in with a fictional mobile number and demo OTP. No SMS is sent.' }, { property: 'og:title', content: 'CareBrief — Demo sign-in' }, { property: 'og:description', content: 'Sign in with a fictional mobile number and demo OTP. No SMS is sent.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: LoginPage,
});
