import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { oauthReturnPath } from '@/lib/oauth-return-path';
export const Route = createFileRoute('/integration-login')({
 validateSearch: (s: Record<string, unknown>) => ({ next: oauthReturnPath(s['next']) }),
 head: () => ({ meta: [{ title: 'CareBrief — Integration sign-in' }, { name: 'description', content: 'Sign in securely to authorize an external assistant connection.' }, { property: 'og:title', content: 'CareBrief — Integration sign-in' }, { property: 'og:description', content: 'Protected assistant authorization sign-in.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
 component: IntegrationLogin,
});
function IntegrationLogin() {
 const { next } = Route.useSearch(); const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [account, setAccount] = useState('');
 useEffect(() => { void supabase.auth.getUser().then(({ data }) => { if (data.user) setAccount(data.user.email ?? 'Signed-in account'); }); }, []);
 async function signIn() {
  setBusy(true); setError('');
  try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: new URL(`/integration-login?next=${encodeURIComponent(next)}`, window.location.origin).href }); if (result.error) throw new Error('Sign-in could not be completed. Please try again.'); if (result.redirected) return; const { data } = await supabase.auth.getUser(); if (!data.user) throw new Error('Sign-in is not complete yet. Please try again.'); await router.navigate({ href: next, replace: true }); } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed.'); setBusy(false); }
 }
 return <section className="auth-panel auth-wrapper"><h1>Connect your assistant securely</h1><p>Use a real integration account to approve access. The patient demo OTP does not authorize external assistants.</p>{account ? <><p>Signed in as {account}</p><Button onClick={() => router.navigate({ href: next, replace: true })}>Continue to connection</Button><Button className="ml-2" variant="outline" onClick={async () => { await supabase.auth.signOut(); setAccount(''); }}>Switch account</Button></> : <Button onClick={signIn} disabled={busy}>{busy ? 'Signing in…' : 'Continue with Google'}</Button>}{error && <p role="alert" className="error-message">{error}</p>}</section>;
}
