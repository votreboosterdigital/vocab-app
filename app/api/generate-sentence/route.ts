import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an English teacher creating example sentences for a French-speaking child aged 7-8 who is learning English. Create ONE simple, fun, and memorable sentence using the target word. The sentence must be age-appropriate, positive, and include a relatable context (animals, school, family, food, games). Respond ONLY with valid JSON: {"sentence": "...", "translation": "..."}. No markdown, no explanation. Put the target word in the sentence exactly as given.`;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { word: string; level: 1 | 2 | 3; userProfile?: string };
    const { word, level } = body;

    if (!word || !level) {
      return Response.json({ error: "Missing word or level" }, { status: 400 });
    }

    const maxWords = level === 1 ? 6 : level === 2 ? 8 : 10;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
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
      response.content[0].type === "text" ? response.content[0].text : "";

    const data = JSON.parse(text) as { sentence: string; translation: string };
    return Response.json(data);
  } catch {
    const body = await request.clone().json().catch(() => ({ word: "friend" })) as { word?: string };
    const word = body.word ?? "friend";
    return Response.json({
      sentence: `I love my **${word}**!`,
      translation: "J'adore mon ami !",
    });
  }
}
