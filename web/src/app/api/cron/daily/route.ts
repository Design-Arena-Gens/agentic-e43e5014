import { NextResponse } from "next/server";

import { getConfigReadyForCron } from "@/lib/scheduler";
import { runAgent } from "@/lib/daily-agent";

export const runtime = "nodejs";

export async function GET() {
  const { config, ready } = await getConfigReadyForCron();

  if (!ready) {
    return NextResponse.json({
      ok: true,
      ran: false,
      reason: "Not scheduled to run right now.",
      config,
    });
  }

  const post = await runAgent({ forcePublish: true });

  return NextResponse.json({
    ok: true,
    ran: true,
    post,
  });
}
