import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      word: string;
      allWords: string[];
      count?: number;
    };
    const { word, allWords, count = 3 } = body;

    const pool = allWords.filter((w) => w !== word).slice(0, 20).join(", ");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
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
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(text) as { distractors: string[] };
    return Response.json(data);
  } catch {
    const body = await request.clone().json().catch(() => ({ allWords: [], word: "" })) as { allWords?: string[]; word?: string };
    const fallback = (body.allWords ?? [])
      .filter((x: string) => x !== body.word)
      .slice(0, 3);
    return Response.json({ distractors: fallback });
  }
}
