import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CEFR_DIFFICULTY: Record<string, string> = {
  A1: "very simple (max 6 words, present tense only)",
  A2: "simple (max 8 words, basic tenses)",
  B1: "intermediate (max 10 words)",
  B2: "upper-intermediate (max 12 words)",
  C1: "advanced (max 14 words)",
};

export async function POST(request: Request) {
  /* Parse body une seule fois, hors du try/catch */
  let word = "cat";
  let level = "B1";
  let distractors: string[] = ["dog", "fish"];

  try {
    const body = (await request.json()) as {
      word?: string;
      level?: string;
      distractors?: string[];
    };
    word = body.word ?? word;
    level = body.level ?? level;
    distractors = body.distractors ?? distractors;
  } catch {
    /* body illisible — on continue avec les valeurs par défaut */
  }

  const difficulty = CEFR_DIFFICULTY[level] ?? CEFR_DIFFICULTY.B1;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `You create fill-in-the-blank English sentences for a French-speaking learner.
Rules:
- Replace the target word with "_____" in a short, natural sentence
- Difficulty: ${difficulty}
- Context: everyday life, school, family, sports, food
- Provide a French translation with "_____" too
- Respond ONLY with valid JSON — no markdown, no explanation:
  {"sentence": "The _____ is very fast.", "translation": "Le _____ est très rapide."}`,
      messages: [
        {
          role: "user",
          content: `Target word: "${word}" (level: ${level}). Create one fill-in-the-blank sentence.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = JSON.parse(cleaned) as { sentence: string; translation: string };

    const choices = [word, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
    return Response.json({ sentence: data.sentence, translation: data.translation, choices, answer: word });

  } catch (err) {
    console.error("[generate-fill] error:", err instanceof Error ? err.message : err);

    /* Fallback : template varié selon le mot */
    const templates: Array<[string, string]> = [
      [`The _____ is here.`,          `Le _____ est ici.`],
      [`I really like the _____.`,    `J'aime beaucoup le _____.`],
      [`She has a _____.`,            `Elle a un _____.`],
      [`We can see the _____.`,       `On peut voir le _____.`],
      [`The _____ is beautiful.`,     `Le _____ est beau.`],
      [`My _____ is great.`,          `Mon _____ est super.`],
      [`Look at the _____.`,          `Regarde le _____.`],
      [`The _____ is very useful.`,   `Le _____ est très utile.`],
      [`I have a _____.`,             `J'ai un _____.`],
      [`The _____ is very nice.`,     `Le _____ est très sympa.`],
      [`They found a _____.`,         `Ils ont trouvé un _____.`],
      [`The _____ is quite small.`,   `Le _____ est assez petit.`],
    ];
    const idx = word.charCodeAt(word.length - 1) % templates.length;
    const [sentence, translation] = templates[idx];
    const choices = [word, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);
    return Response.json({ sentence, translation, choices, answer: word });
  }
}
