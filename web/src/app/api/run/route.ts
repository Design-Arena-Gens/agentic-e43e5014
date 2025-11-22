import { NextResponse } from "next/server";

import { runAgent } from "@/lib/daily-agent";
import { AgentRunOptions } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as AgentRunOptions;

  try {
    const post = await runAgent({
      forcePublish: payload.forcePublish,
    });

    return NextResponse.json(post);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
