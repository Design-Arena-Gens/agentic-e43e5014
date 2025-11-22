"use client";

import { useState, useTransition } from "react";

import { AgentConfig, GeneratedPost } from "@/lib/types";
import { statusMessage } from "@/lib/status";

type DashboardProps = {
  initialConfig: AgentConfig;
};

type UiState = {
  message: string | null;
  variant: "idle" | "success" | "error" | "loading";
};

const defaultUi: UiState = {
  message: null,
  variant: "idle",
};

export default function Dashboard({ initialConfig }: DashboardProps) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig);
  const [hashtagsInput, setHashtagsInput] = useState(
    initialConfig.hashtags.join(", "),
  );
  const [pendingPost, setPendingPost] = useState<GeneratedPost | null>(
    initialConfig.lastPost,
  );
  const [ui, setUi] = useState<UiState>(defaultUi);
  const [isSaving, startSaving] = useTransition();
  const [isRunning, startRunning] = useTransition();

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSaving(async () => {
      setUi({ message: "Saving configuration…", variant: "loading" });
      const payload = {
        ...config,
        hashtags: parseHashtags(hashtagsInput),
      };
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setUi({ message: error ?? "Unable to save configuration.", variant: "error" });
        return;
      }

      const nextConfig = (await response.json()) as AgentConfig;
      setConfig(nextConfig);
      setUi({
        message: "Configuration saved.",
        variant: "success",
      });
    });
  }

  function handleInputChange<K extends keyof AgentConfig>(
    key: K,
    value: AgentConfig[K],
  ) {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function parseHashtags(value: string) {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  async function handleRun(forcePublish: boolean) {
    startRunning(async () => {
      setUi({
        message: forcePublish
          ? "Generating and publishing…"
          : "Generating preview…",
        variant: "loading",
      });

      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ forcePublish }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setUi({
          message: error ?? "Failed to run agent.",
          variant: "error",
        });
        return;
      }

      const post = (await response.json()) as GeneratedPost;
      setPendingPost(post);
      setUi({
        message: forcePublish
          ? "Post published to Instagram."
          : "Post generated.",
        variant: "success",
      });
    });
  }

  const isBusy = isSaving || isRunning || ui.variant === "loading";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-2 border-b border-white/10 pb-8">
          <span className="text-sm uppercase tracking-[0.3em] text-orange-400">
            Agentic Social
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Instagram Daily Post Agent
          </h1>
          <p className="text-stone-300 sm:max-w-2xl">
            Configure your intelligent content agent, preview daily outputs, and
            automatically publish to Instagram once you&apos;re ready.
          </p>
        </header>

        <div className="mt-12 grid gap-8 md:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <form className="flex flex-col gap-6" onSubmit={handleSave}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Content Blueprint
                </h2>
                <span className="text-xs uppercase tracking-[0.3em] text-orange-300">
                  Daily script
                </span>
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                  Content Theme
                </span>
                <input
                  value={config.contentTheme}
                  onChange={(event) =>
                    handleInputChange("contentTheme", event.target.value)
                  }
                  required
                  className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                  Tone
                </span>
                <input
                  value={config.tone}
                  onChange={(event) =>
                    handleInputChange("tone", event.target.value)
                  }
                  required
                  className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                  Hashtags
                </span>
                <textarea
                  value={hashtagsInput}
                  onChange={(event) => setHashtagsInput(event.target.value)}
                  rows={2}
                  className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                  placeholder="#creators, #motivation, #dailyinspo"
                />
                <span className="text-xs text-stone-400">
                  Separate with commas. The agent will clean them automatically.
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                  Call to Action
                </span>
                <textarea
                  value={config.callToAction}
                  onChange={(event) =>
                    handleInputChange("callToAction", event.target.value)
                  }
                  rows={2}
                  className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                  Image Prompt
                </span>
                <textarea
                  value={config.imagePrompt}
                  onChange={(event) =>
                    handleInputChange("imagePrompt", event.target.value)
                  }
                  rows={3}
                  className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                />
                <span className="text-xs text-stone-400">
                  The visual description the image generator follows.
                </span>
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Daily Drop Time
                  </span>
                  <input
                    type="time"
                    value={config.dailyTime}
                    onChange={(event) =>
                      handleInputChange("dailyTime", event.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-stone-900 px-4 py-3 text-base text-white shadow-inner focus:border-orange-400 focus:outline-none"
                  />
                  <span className="text-xs text-stone-400">
                    HH:MM in your deployment region (default UTC).
                  </span>
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Auto Publish
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-stone-900 px-4 py-3">
                    <input
                      id="autoPublish"
                      type="checkbox"
                      checked={config.autoPublish}
                      onChange={(event) =>
                        handleInputChange("autoPublish", event.target.checked)
                      }
                      className="h-5 w-5 rounded border-white/20 bg-stone-800 accent-orange-500"
                    />
                    <label htmlFor="autoPublish" className="text-sm text-white">
                      Publish automatically after generating.
                    </label>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:bg-white/40"
                >
                  {isSaving ? "Saving…" : "Save Blueprint"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRun(false)}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-orange-400 hover:text-orange-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
                >
                  {isRunning ? "Generating…" : "Preview Post"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRun(true)}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-full border border-orange-400 bg-orange-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-200 transition hover:bg-orange-500/30 disabled:cursor-not-allowed disabled:border-orange-200/50 disabled:text-orange-200/50"
                >
                  {isRunning ? "Publishing…" : "Generate + Publish"}
                </button>
              </div>
            </form>

            {ui.message && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  ui.variant === "error"
                    ? "border-red-500/40 bg-red-500/10 text-red-200"
                    : ui.variant === "success"
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                      : "border-orange-400/40 bg-orange-500/10 text-orange-100"
                }`}
              >
                {statusMessage(ui)}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Latest Output
                </h2>
                <span className="text-xs uppercase tracking-[0.3em] text-orange-300">
                  Preview
                </span>
              </div>

              {pendingPost ? (
                <GeneratedPostCard post={pendingPost} />
              ) : (
                <p className="py-10 text-sm text-stone-400">
                  No posts generated yet. Save your blueprint and run the agent
                  to see the first preview.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold text-white">
                Deployment Checklist
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-stone-300">
                <li>
                  • Set <code className="text-orange-200">OPENAI_API_KEY</code>{" "}
                  in your environment.
                </li>
                <li>
                  • Add{" "}
                  <code className="text-orange-200">
                    INSTAGRAM_ACCESS_TOKEN
                  </code>{" "}
                  and{" "}
                  <code className="text-orange-200">
                    INSTAGRAM_BUSINESS_ACCOUNT_ID
                  </code>{" "}
                  when you&apos;re ready to publish.
                </li>
                <li>• Schedule a Vercel Cron to call `/api/cron/daily`.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function GeneratedPostCard({ post }: { post: GeneratedPost }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm shadow-2xl shadow-black/40">
      <header className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-orange-400">
          {new Date(post.createdAt).toLocaleString()}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
            post.published
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-orange-500/10 text-orange-200"
          }`}
        >
          {post.published ? "Published" : "Draft"}
        </span>
      </header>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt={post.altText ?? "Generated Instagram visual"}
          className="w-full rounded-xl border border-white/10 object-cover"
        />
      )}

      <div className="space-y-3 rounded-xl border border-white/10 bg-stone-900/60 p-4">
        <p className="whitespace-pre-wrap text-stone-100">{post.caption}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          Hashtags
        </p>
        <p className="text-sm text-orange-200">
          {post.hashtags.length ? post.hashtags.join(" ") : "—"}
        </p>
      </div>

      {post.instagramMediaId && (
        <p className="text-xs text-stone-500">
          Media ID:{" "}
          <code className="rounded bg-stone-900 px-2 py-1">
            {post.instagramMediaId}
          </code>
        </p>
      )}
    </article>
  );
}
