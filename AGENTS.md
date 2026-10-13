<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## CareBrief architecture
- Keep TanStack file-based routes and per-leaf head metadata; the platform router is fixed and every content surface has its own URL.
- All backend-facing data goes through typed `src/services/api.ts`; default to fictional mock mode and use the configured base URL when mock mode is disabled.
- Demo roles are UI simulation only, never production authorization; real private API endpoints must enforce server-side identity and role checks when integrated.
- Keep reusable CareBrief presentation in `src/components/carebrief` and semantic visual tokens in `src/styles.css` so the patient and doctor experiences stay consistent.
- Browser-only draft, upload and demo session operations run in effects or event handlers to preserve SSR compatibility.
