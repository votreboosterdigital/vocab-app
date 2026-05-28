/**
 * fix-missing-translations.ts
 * Ré-enrichit uniquement les mots dont translation === word (fallback)
 * Usage: npx tsx scripts/fix-missing-translations.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const OUTPUT_PATH = path.join(process.cwd(), "data", "words.json");
const BATCH_SIZE = 30;

interface VocabWord {
  id: string;
  word: string;
  translation: string;
  level: string;
  category: string;
  emoji: string;
  phonetic: string;
}

interface Fix {
  word: string;
  translation: string;
  emoji: string;
  phonetic: string;
  category: string;
}

const SYSTEM = `Tu es un expert en linguistique anglais-français.
Pour chaque mot ou expression anglaise, génère:
- "word": le mot tel quel
- "translation": traduction française la plus courante (max 4 mots, 2 sens si utile: "sens1 / sens2")
- "emoji": 1 emoji pour les mots CONCRETS (objet, animal, lieu, nourriture) ; "" pour les abstraits
- "phonetic": IPA simplifié SANS slashes, uniquement les sons piégeux pour francophones
- "category": une parmi → noms, verbes, descriptions, connecteurs, émotions, expressions, temps, quantité

Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown.`;

async function fixBatch(words: VocabWord[]): Promise<Fix[]> {
  const list = words.map((w) => `${w.word} (${w.level})`).join("\n");
  const res = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `Traduis ces mots :\n${list}` }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(cleaned) as Fix[];
  } catch {
    console.error("  ✗ JSON parse error:", text.slice(0, 100));
    return [];
  }
}

async function main() {
  const allWords: VocabWord[] = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  const missing = allWords.filter((w) => w.translation === w.word);
  console.log(`🔧 ${missing.length} mots à corriger`);

  const byId = new Map(allWords.map((w) => [w.id, w]));
  let fixed = 0;

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(missing.length / BATCH_SIZE);
    process.stdout.write(`  📦 Batch ${batchNum}/${total}... `);

    const results = await fixBatch(batch);
    if (results.length > 0) {
      for (let j = 0; j < batch.length; j++) {
        const fix = results[j];
        const orig = batch[j];
        if (fix && fix.translation && fix.translation !== orig.word) {
          const w = byId.get(orig.id);
          if (w) {
            w.translation = fix.translation;
            if (fix.emoji) w.emoji = fix.emoji;
            if (fix.phonetic) w.phonetic = fix.phonetic;
            if (fix.category) w.category = fix.category;
            fixed++;
          }
        }
      }
    }
    console.log(`✓ (${fixed} corrigés jusqu'ici)`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allWords, null, 2), "utf-8");
    if (i + BATCH_SIZE < missing.length) await new Promise((r) => setTimeout(r, 500));
  }

  const stillMissing = allWords.filter((w) => w.translation === w.word).length;
  console.log(`\n✅ ${fixed} mots corrigés. Restants sans traduction: ${stillMissing}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
