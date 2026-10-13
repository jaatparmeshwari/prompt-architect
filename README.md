# Welcome to your Lovable project

## Agent integrations (MCP)

The app includes an OAuth-protected MCP server at `/mcp`, registered under the project display name **Prompt Architect**. The single read-only `get_app_info` tool describes CareBrief capabilities and privacy boundaries. It does not access patient records, prescriptions, uploads or browser drafts.

External clients authorize using managed OAuth and `/.lovable/oauth/consent`. Integration sign-in uses Google at `/integration-login`, separate from the fictional patient OTP flow. No browser-session token copying is supported.

The app must be published before external clients can use this revision. OAuth provider setup, catalog extraction, anonymous rejection and consent redirect handling were checked locally; the full external approve/deny flow remains to be verified after publishing with a real integration account.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
