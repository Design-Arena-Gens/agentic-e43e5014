import { NextResponse } from "next/server";

import { getConfig, updateConfig } from "@/lib/config-store";
import { AgentConfig } from "@/lib/types";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AgentConfig>;

  if (!payload.contentTheme || !payload.tone) {
    return NextResponse.json(
      { error: "contentTheme and tone are required." },
      { status: 400 },
    );
  }

  const updated = await updateConfig((current) => ({
    ...current,
    contentTheme: payload.contentTheme ?? current.contentTheme,
    tone: payload.tone ?? current.tone,
    hashtags: Array.isArray(payload.hashtags)
      ? payload.hashtags.filter(Boolean)
      : current.hashtags,
    callToAction: payload.callToAction ?? current.callToAction,
    imagePrompt: payload.imagePrompt ?? current.imagePrompt,
    autoPublish:
      typeof payload.autoPublish === "boolean"
        ? payload.autoPublish
        : current.autoPublish,
    dailyTime: payload.dailyTime ?? current.dailyTime,
  }));

  return NextResponse.json(updated);
}
