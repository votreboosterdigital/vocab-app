import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  let word = "";
  let allWords: string[] = [];
  let count = 3;

  try {
    const body = (await request.json()) as {
      word?: string;
      allWords?: string[];
      count?: number;
    };
    word = body.word ?? word;
    allWords = body.allWords ?? allWords;
    count = body.count ?? count;
  } catch {
    /* body illisible — on continue avec les valeurs par défaut */
  }

  const pool = allWords.filter((w) => w !== word).slice(0, 20).join(", ");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: `You generate quiz distractors for an English vocabulary learning app for children. Given a target word and a pool, select ${count} plausible wrong answers (similar category or difficulty). Respond ONLY with valid JSON: {"distractors": ["word1", "word2", "word3"]}. No markdown.`,
      messages: [
        {
          role: "user",
          content: `Target: "${word}". Pool: ${pool}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = JSON.parse(cleaned) as { distractors: string[] };
    return Response.json(data);
  } catch (err) {
    console.error("[generate-quiz] error:", err instanceof Error ? err.message : err);

    const fallback = allWords.filter((x) => x !== word).slice(0, count);
    return Response.json({ distractors: fallback });
  }
}
