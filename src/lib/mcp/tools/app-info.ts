import { defineTool } from '@lovable.dev/mcp-js';
export default defineTool({
 name: 'get_app_info',
 title: 'Get app information',
 description: 'Read CareBrief demo capabilities and integration privacy boundaries without accessing patient records.',
 inputSchema: {},
 annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
 handler: () => ({ content: [{ type: 'text', text: 'CareBrief is a fictional patient–doctor consultation frontend. It includes consultation intake, document previews, medical history and a doctor review workspace. This integration exposes app information only; patient records, browser drafts, uploads and prescriptions are not accessible. No medical advice or diagnosis is provided.' }], structuredContent: { application: 'CareBrief', mode: 'fictional_demo', capabilities: ['consultation_intake', 'medical_history', 'document_previews', 'doctor_review'], patientDataAccessible: false, browserDraftsAccessible: false } }),
});
