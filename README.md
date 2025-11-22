# Agentic Instagram Poster

The full-stack implementation lives in the `web/` directory. It is a Next.js application that generates daily Instagram posts by combining OpenAI for creative direction and the Meta Graph API for publication.

## Quickstart

```bash
cd web
npm install
npm run dev
```

Set the required environment variables in `web/.env.local` (see `web/README.md` for details) and open `http://localhost:3000` to configure the agent.

## Deployment

Deploy the app to Vercel (`web` directory as the project root) and schedule a cron job to call `/api/cron/daily`. Supply the Instagram access token, business account id, and OpenAI key as environment variables in the Vercel dashboard so the agent can run autonomously.
