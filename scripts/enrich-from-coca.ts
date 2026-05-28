/**
 * enrich-from-coca.ts
 * Lit scripts/selected_words.json (3000 mots COCA oraux),
 * enrichit via Claude Haiku avec prompt caching,
 * et génère data/words.json au format VocabWord CEFR.
 *
 * Mode incrémental : reprend là où il s'est arrêté.
 * Usage: npx tsx scripts/enrich-from-coca.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SELECTED_PATH = path.join(process.cwd(), "scripts", "selected_words.json");
const OUTPUT_PATH   = path.join(process.cwd(), "data", "words.json");
const BACKUP_PATH   = path.join(process.cwd(), "data", "words.backup.json");
const BATCH_SIZE    = 50;

interface CocaWord {
  id: string;
  word: string;
  pos: string;
  spok: number;
  spokPM: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
}

interface VocabWord {
  id: string;
  word: string;
  translation: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  category: string;
  emoji: string;
  phonetic: string;
}

interface EnrichResult {
  word: string;
  translation: string;
  emoji: string;
  phonetic: string;
  category: string;
}

const POS_CATEGORY: Record<string, string> = {
  n: "noms",
  v: "verbes",
  j: "descriptions",
  r: "connecteurs",
  i: "connecteurs",
  c: "connecteurs",
};

const SYSTEM_PROMPT = `Tu es un expert en linguistique anglais-français et en pédagogie des langues.
Pour chaque mot ou expression anglaise fournie, génère un objet JSON avec ces champs :
- "word": le mot anglais tel quel
- "translation": la traduction française la plus courante à l'oral (concise, max 4 mots, peut inclure 2 sens : "sens1 / sens2" si polyvalent)
- "phonetic": la transcription IPA simplifiée SANS slashes, uniquement les sons qui piègent les francophones (th→ð/θ, æ, ə, ɪ, ʌ, ɔː, etc.) — ex: "θɪŋk" pour think
- "category": une parmi → noms, verbes, descriptions, connecteurs, émotions, expressions, temps, quantité
- "emoji": UN seul emoji pour les mots CONCRETS (objet, animal, lieu, nourriture) ; chaîne vide "" pour les mots ABSTRAITS (verbes mentaux, adjectifs de sens, adverbes, connecteurs, concepts)

Règles :
- Verbes : infinitif français sans "faire" (go → aller, not "faire aller")
- Adjectifs : masculin singulier
- Mots oraux courants : privilégie le sens oral (like → genre / comme, well → eh bien / bien)
- Phonétique SANS slashes : kæt pas /kæt/

Réponds UNIQUEMENT avec un tableau JSON valide — aucun markdown, aucun texte autour.`;

async function enrichBatch(
  batch: CocaWord[],
  batchNum: number,
  totalBatches: number
): Promise<EnrichResult[]> {
  const wordList = batch
    .map((w) => `${w.word} (${w.pos}, ${w.level})`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Mots à enrichir (batch ${batchNum}/${totalBatches}) :\n${wordList}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as EnrichResult[];
    return parsed;
  } catch {
    console.error(
      `  ✗ Batch ${batchNum}: erreur JSON, extrait:`,
      text.slice(0, 150)
    );
    // Fallback : retourner des données minimales
    return batch.map((w) => ({
      word: w.word,
      translation: w.word,
      emoji: "",
      phonetic: "",
      category: POS_CATEGORY[w.pos] ?? "noms",
    }));
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY manquante");
    process.exit(1);
  }

  // Charger les 3000 mots COCA sélectionnés
  const cocaWords: CocaWord[] = JSON.parse(
    fs.readFileSync(SELECTED_PATH, "utf-8")
  );
  console.log(`📂 ${cocaWords.length} mots COCA chargés depuis selected_words.json`);

  // Charger l'état existant de data/words.json
  let existingWords: VocabWord[] = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    existingWords = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
    console.log(`📂 ${existingWords.length} mots existants dans data/words.json`);
  }

  // Vérifier si on démarre fresh ou si on reprend
  const existingCocaIds = new Set(
    existingWords.filter((w) => w.id.startsWith("coca-")).map((w) => w.id)
  );
  const isFirstRun = existingCocaIds.size === 0;

  if (isFirstRun && existingWords.length > 0) {
    // Backup des mots manuels existants avant de remplacer
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(existingWords, null, 2), "utf-8");
    console.log(`💾 Backup créé : data/words.backup.json (${existingWords.length} mots)`);
    existingWords = [];
    existingCocaIds.clear();
  }

  // Mots COCA à traiter (ceux pas encore dans le fichier)
  const toProcess = cocaWords.filter((w) => !existingCocaIds.has(w.id));
  const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);
  const alreadyDone = cocaWords.length - toProcess.length;

  console.log(`\n🚀 À traiter: ${toProcess.length} mots (${alreadyDone} déjà faits)`);
  console.log(`📦 ${totalBatches} batches de ${BATCH_SIZE} mots\n`);

  if (toProcess.length === 0) {
    console.log("✅ Tout est déjà traité !");
    return;
  }

  const allWords: VocabWord[] = [...existingWords];

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(
      `  📦 Batch ${batchNum}/${totalBatches} (${batch[0].word}→${batch[batch.length - 1].word})... `
    );

    try {
      const enriched = await enrichBatch(batch, batchNum, totalBatches);

      for (let j = 0; j < batch.length; j++) {
        const coca = batch[j];
        const res = enriched[j] ?? {
          word: coca.word,
          translation: coca.word,
          emoji: "",
          phonetic: "",
          category: POS_CATEGORY[coca.pos] ?? "noms",
        };

        allWords.push({
          id: coca.id,
          word: coca.word,
          translation: res.translation ?? coca.word,
          level: coca.level,
          category: res.category ?? POS_CATEGORY[coca.pos] ?? "noms",
          emoji: res.emoji ?? "",
          phonetic: res.phonetic ?? "",
        });
      }

      // Sauvegarde après chaque batch
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allWords, null, 2), "utf-8");
      console.log(`✓ (${allWords.length} total)`);

      // Pause pour éviter le rate limiting
      if (i + BATCH_SIZE < toProcess.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`\n  ✗ Erreur batch ${batchNum}:`, err);
      // Continuer avec le batch suivant
    }
  }

  // Résumé final
  const byLevel: Record<string, number> = {};
  for (const w of allWords) {
    byLevel[w.level] = (byLevel[w.level] ?? 0) + 1;
  }
  const withoutTranslation = allWords.filter((w) => w.translation === w.word).length;

  console.log("\n✅ Enrichissement terminé !");
  console.log(`📊 Total: ${allWords.length} mots`);
  for (const lvl of ["A1", "A2", "B1", "B2", "C1"]) {
    console.log(`   ${lvl}: ${byLevel[lvl] ?? 0}`);
  }
  if (withoutTranslation > 0) {
    console.log(`⚠️  ${withoutTranslation} mots sans traduction (relancer le script)`);
  }
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
