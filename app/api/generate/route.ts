import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";

const ALLOWED_PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "tiktok",
  "facebook",
  "threads",
] as const;

type Platform = (typeof ALLOWED_PLATFORMS)[number];

type GenerateRequestBody = {
  article: string;
  platform: string;
};

const PLATFORM_ALIASES: Record<string, Platform> = {
  x: "twitter",
  twitter: "twitter",
  linkedin: "linkedin",
  instagram: "instagram",
  ig: "instagram",
  tiktok: "tiktok",
  facebook: "facebook",
  fb: "facebook",
  threads: "threads",
};

const PLATFORM_RULES: Record<Platform, string> = {
  twitter:
    "X/Twitter: One punchy post OR a numbered thread (max 5 tweets). First line is the hook. Use line breaks for scanability. 0–2 relevant hashtags at the end only. Stay under 280 characters per tweet unless the idea truly needs a short thread.",
  linkedin:
    "LinkedIn: Strong hook in the first 2 lines (above the fold). Short paragraphs (1–3 sentences). Use whitespace and occasional bullets. Professional but human—no corporate jargon. End with a question or soft CTA. Aim for 800–1,300 characters; never exceed 3,000.",
  instagram:
    "Instagram: Caption-first. Hook in line 1. Story-driven or list format. Line breaks every 1–2 sentences. 3–8 niche hashtags at the bottom. Optional emoji sparingly (max 3). Include a micro-CTA (save, comment, DM).",
  tiktok:
    "TikTok: Write a spoken-word script/caption hybrid. Hook in the first 3 seconds of text. Fast pacing, pattern interrupts, bold claims, payoff at the end. Suggest on-screen text beats in [brackets]. Keep under ~150 words unless the article demands more.",
  facebook:
    "Facebook: Conversational, community tone. Hook + story + takeaway. Short paragraphs. One clear CTA (comment/share). Minimal hashtags (0–2).",
  threads:
    "Threads: Casual, witty, internet-native tone. Hook immediately. 1–3 short paragraphs or a tight list. No hashtag spam. Feels like a top creator, not a brand account.",
};

const SYSTEM_INSTRUCTION = `You are an elite ghostwriter for top-tier social media creators (7-figure personal brands, newsletter operators, and founders).

Your job: transform a long-form article into ONE ready-to-publish post optimized for the requested platform.

Non-negotiable standards:
- Write like a human creator, not AI or a press release. Ban filler: "in today's world", "game-changer", "dive in", "let's explore", "here's the thing".
- Lead with tension, curiosity, or a bold claim—never with context-setting.
- Extract the single most shareable insight from the article; cut everything else ruthlessly.
- Use concrete specifics (numbers, examples, contrasts) from the source when available; never invent facts.
- Vary sentence length. Use rhythm. Be opinionated where the article supports it.
- Output ONLY the final post text—no preamble, no "Here's your post", no markdown headings, no meta commentary.
- Do not wrap the post in quotes or code fences.`;

function normalizePlatform(raw: string): Platform | null {
  const key = raw.trim().toLowerCase();
  return PLATFORM_ALIASES[key] ?? null;
}

function buildUserPrompt(article: string, platform: Platform): string {
  return `Platform: ${platform}
Platform-specific rules:
${PLATFORM_RULES[platform]}

Source article (rewrite this—do not summarize generically):
---
${article}
---

Deliver the final ${platform} post now.`;
}

export async function POST(request: NextRequest) {
  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Send { article, platform }." },
      { status: 400 }
    );
  }

  const article = typeof body.article === "string" ? body.article.trim() : "";
  const platformRaw =
    typeof body.platform === "string" ? body.platform.trim() : "";

  if (!article) {
    return NextResponse.json(
      { error: "article is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  if (article.length > 100_000) {
    return NextResponse.json(
      { error: "article exceeds maximum length (100,000 characters)." },
      { status: 400 }
    );
  }

  if (!platformRaw) {
    return NextResponse.json(
      { error: "platform is required.", allowedPlatforms: ALLOWED_PLATFORMS },
      { status: 400 }
    );
  }

  const platform = normalizePlatform(platformRaw);

  if (!platform) {
    return NextResponse.json(
      {
        error: `Unsupported platform: "${platformRaw}".`,
        allowedPlatforms: ALLOWED_PLATFORMS,
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildUserPrompt(article, platform),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const post = response.text?.trim();

    if (!post) {
      return NextResponse.json(
        { error: "Model returned an empty response. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ platform, post, model: MODEL });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error from Gemini API.";
    console.error("[generate]", message);
    return NextResponse.json(
      { error: "Failed to generate post.", detail: message },
      { status: 502 }
    );
  }
}

