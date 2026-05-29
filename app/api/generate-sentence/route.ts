import Anthropic from "@anthropic-ai/sdk";
import type { WordLevel } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CEFR_MAX_WORDS: Record<string, number> = {
  A1: 6,
  A2: 8,
  B1: 10,
  B2: 12,
  C1: 14,
};

const SYSTEM_PROMPT = `You are an English teacher creating example sentences for a French-speaking child learning English. Create ONE simple, fun, and memorable sentence using the target word. The sentence must be age-appropriate, positive, and include a relatable context (animals, school, family, food, games). Respond ONLY with valid JSON: {"sentence": "...", "translation": "..."}. No markdown, no explanation. Put the target word in the sentence exactly as given.`;

export async function POST(request: Request) {
  let word = "friend";
  let level: WordLevel | string = "B1";

  try {
    const body = (await request.json()) as {
      word?: string;
      level?: WordLevel | string;
      userProfile?: string;
    };
    word = body.word ?? word;
    level = body.level ?? level;
  } catch {
    /* body illisible — on continue avec les valeurs par défaut */
  }

  const maxWords = CEFR_MAX_WORDS[level] ?? 10;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a sentence using the word "${word}". Max ${maxWords} words. Level ${level}.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = JSON.parse(cleaned) as { sentence: string; translation: string };
    return Response.json(data);
  } catch (err) {
    console.error("[generate-sentence] error:", err instanceof Error ? err.message : err);

    return Response.json({
      sentence: `I love my **${word}**!`,
      translation: `J'adore ${word} !`,
    });
  }
}
