import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      word: string;
      level: 1 | 2 | 3;
      distractors: string[];
    };
    const { word, level, distractors } = body;

    const maxWords = level === 1 ? 6 : level === 2 ? 8 : 10;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: `You create fill-in-the-blank sentences for a French-speaking child aged 7-8 learning English. Replace the target word with "_____" in a short, fun sentence. Max ${maxWords} words total. Context: animals, school, family, food, games. Respond ONLY with valid JSON: {"sentence": "The _____ is big.", "translation": "Le ... est grand."}. No markdown.`,
      messages: [
        {
          role: "user",
          content: `Create a fill-in-the-blank sentence where the answer is "${word}". Level ${level}.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(text) as { sentence: string; translation: string };

    const choices = [word, ...distractors.slice(0, 2)].sort(
      () => Math.random() - 0.5
    );

    return Response.json({ ...data, choices, answer: word });
  } catch {
    const body = await request.clone().json().catch(() => ({ word: "cat", distractors: ["dog", "fish"] })) as { word?: string; distractors?: string[] };
    const word = body.word ?? "cat";
    const dis = body.distractors ?? ["dog", "fish"];
    return Response.json({
      sentence: `The _____ is my favorite animal.`,
      translation: "Le _____ est mon animal préféré.",
      choices: [word, ...dis.slice(0, 2)].sort(() => Math.random() - 0.5),
      answer: word,
    });
  }
}
