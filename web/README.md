## Instagram Daily Agent

An opinionated Next.js agent that designs and (optionally) publishes a fresh Instagram post every day. Configure your brand voice, run instant previews, and connect publishing credentials when you are ready to automate the workflow.

### Stack

- Next.js App Router + Server Actions
- Tailwind CSS
- OpenAI API for copy + visuals
- Meta Graph API for Instagram publishing

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

Create a `.env.local` with:

```
OPENAI_API_KEY=sk-...
# Required for auto publishing
INSTAGRAM_ACCESS_TOKEN=EAAG...
INSTAGRAM_BUSINESS_ACCOUNT_ID=1784...
# Optional if you want Upstash KV persistence
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Daily Automation

1. Enable auto publish in the UI once your Instagram credentials are configured.
2. On Vercel, add a cron job that calls `https://<your-domain>/api/cron/daily` at your desired cadence.
3. The agent will skip runs if it has already posted during the current day or the slot is outside the 10-minute window of your configured time.

### Data Persistence

- By default the agent stores its blueprint in `data/settings.json` (handy for local dev).
- In production provide `KV_REST_API_URL` and `KV_REST_API_TOKEN` from Upstash KV and the configuration will persist in the managed store.

### Scripts

- `npm run dev` – local dev server.
- `npm run build` – production build.
- `npm start` – start production server.
- `npm run lint` – lint the codebase.
