"use client";

import { useState } from "react";

const PLATFORMS = [
  { label: "Twitter Thread", value: "twitter" },
  { label: "LinkedIn Post", value: "linkedin" },
] as const;

type PlatformValue = (typeof PLATFORMS)[number]["value"];

export default function Home() {
  const [article, setArticle] = useState("");
  const [platform, setPlatform] = useState<PlatformValue>("twitter");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setError(null);
    setPost("");
    setCopied(false);

    if (!article.trim()) {
      setError("Paste your article first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setPost(data.post ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-10 text-center sm:mb-12">
          <p className="mb-2 text-sm font-medium tracking-widest text-violet-400 uppercase">
            Viral Scale AI
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Turn long articles into viral posts
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Paste your draft, pick a platform, and get creator-grade copy in
            seconds.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <label
              htmlFor="article"
              className="mb-2 text-sm font-medium text-zinc-300"
            >
              Your article
            </label>
            <textarea
              id="article"
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Paste your blog post, newsletter, or long-form draft here…"
              rows={14}
              className="min-h-[280px] flex-1 resize-y rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            />

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="platform"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as PlatformValue)
                  }
                  className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[200px]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating…
                  </span>
                ) : (
                  "Generate Viral Post"
                )}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </section>

          <section className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="result"
                className="text-sm font-medium text-zinc-300"
              >
                Generated post
              </label>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!post}
                className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>

            <textarea
              id="result"
              readOnly
              value={post}
              placeholder="Your viral post will appear here…"
              rows={14}
              className="min-h-[280px] flex-1 resize-y rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none"
            />

            {post && (
              <p className="mt-3 text-xs text-zinc-500">
                {post.length.toLocaleString()} characters
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
