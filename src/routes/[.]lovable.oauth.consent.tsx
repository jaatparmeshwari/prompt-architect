import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/.lovable/oauth/consent')({
 ssr: false,
 validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s['authorization_id'] === 'string' ? s['authorization_id'] : '' }),
 head: () => ({ meta: [{ title: 'CareBrief — Connect an assistant' }, { name: 'description', content: 'Review and approve protected access to CareBrief app information.' }, { property: 'og:title', content: 'CareBrief — Connect an assistant' }, { property: 'og:description', content: 'Review your assistant connection permissions.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
 beforeLoad: async ({ search, location }) => {
  if (!search.authorization_id) throw new Error('This connection request is missing its authorization ID. Start again from your assistant.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: '/integration-login', search: { next: location.pathname + location.searchStr } });
 },
 loader: async ({ location }) => {
  const id = new URLSearchParams(location.searchStr).get('authorization_id');
  if (!id) throw new Error('Missing connection request.');
  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
  if (error) throw new Error('This connection request could not be loaded. It may have expired; start again from your assistant.');
  if (data && 'redirect_url' in data) throw redirect({ href: data.redirect_url });
  if (!data) throw new Error('No authorization details were returned.');
  const { data: account } = await supabase.auth.getUser();
  return { details: data, account: account.user?.email ?? 'Signed-in account' };
 },
 component: Consent,
 errorComponent: () => <section className="auth-panel auth-wrapper"><h1>Connection unavailable</h1><p>This connection request is invalid, expired or could not be loaded. Please start a new connection from your assistant.</p></section>,
});
function Consent() {
 const { details, account } = Route.useLoaderData();
 const { authorization_id } = Route.useSearch();
 const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 async function decide(approve: boolean) {
  if (busy) return; setBusy(true); setError('');
  try {
   const result = approve ? await supabase.auth.oauth.approveAuthorization(authorization_id) : await supabase.auth.oauth.denyAuthorization(authorization_id);
   if (result.error) throw new Error(approve ? 'Approval failed. Please try again.' : 'Cancellation failed. Please try again.');
   if (!result.data?.redirect_url) throw new Error('No return address was provided. Start a new connection.');
   window.location.assign(result.data.redirect_url);
  } catch (e) { setError(e instanceof Error ? e.message : 'The connection could not be updated.'); setBusy(false); }
 }
 return <section className="auth-panel auth-wrapper"><h1>Connect {details.client.name} to CareBrief</h1><p>Signed in as {account}</p><p>This lets {details.client.name} call the enabled app-information tool. Patient records, prescriptions, uploads and drafts are not exposed.</p><p>Client return address: {details.redirect_uri}</p><p>This does not bypass the app’s permissions or backend policies.</p>{error && <p role="alert" className="error-message">{error}</p>}<div className="flex gap-3 mt-6"><Button disabled={busy} onClick={() => decide(true)}>{busy ? 'Please wait…' : 'Approve connection'}</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button></div></section>;
}
