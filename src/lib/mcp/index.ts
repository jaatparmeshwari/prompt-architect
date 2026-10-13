import { auth, defineMcp } from '@lovable.dev/mcp-js';
import appInfo from './tools/app-info';
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? 'project-ref-unset';
export default defineMcp({
 name: 'prompt-architect',
 title: 'Prompt Architect',
 version: '0.1.0',
 instructions: 'Read CareBrief application information and privacy boundaries. No patient data, medical diagnosis, browser uploads or consultation drafts are available through these tools.',
 auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: 'authenticated', requireOAuthClientClaim: true }),
 tools: [appInfo],
});
