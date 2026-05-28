/**
 * generate-words.ts
 * Génère les 3000 mots anglais CEFR enrichis via Claude API avec prompt caching.
 * Usage: npx tsx scripts/generate-words.ts
 * Output: data/words.json
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── SEED WORDS organisés par niveau CEFR ────────────────────────────────────

const SEED_WORDS: Record<string, string[]> = {
  A1: [
    // Actions de base
    "run", "jump", "eat", "drink", "sleep", "play", "walk", "sing", "read",
    "open", "close", "go", "come", "see", "like", "love", "want", "need",
    "have", "make", "take", "give", "put", "get", "say", "tell", "ask",
    "know", "think", "look", "hear", "help", "stop", "start", "sit", "stand",
    "swim", "fly", "drive", "ride", "buy", "sell", "work", "cook", "wash",
    "write", "draw", "paint", "cut", "carry",
    // Animaux
    "cat", "dog", "fish", "bird", "horse", "cow", "chicken", "duck", "rabbit",
    "lion", "tiger", "elephant", "monkey", "bear", "snake", "sheep", "pig",
    "mouse", "frog", "bee", "ant", "wolf", "fox", "deer", "whale", "dolphin",
    "penguin", "giraffe", "zebra", "turtle", "parrot", "crab", "butterfly",
    // Nourriture
    "apple", "bread", "water", "milk", "egg", "meat", "rice", "soup", "cake",
    "sugar", "salt", "butter", "cheese", "orange", "banana", "potato",
    "carrot", "tomato", "pasta", "sandwich", "cookie", "chocolate", "juice",
    "tea", "coffee", "candy", "strawberry", "grape", "lemon", "pepper",
    "onion", "garlic", "corn", "bean", "pea", "mushroom",
    // Couleurs
    "red", "blue", "green", "yellow", "white", "black", "pink", "purple",
    "orange", "brown", "grey", "gold", "silver",
    // Corps
    "head", "eye", "ear", "nose", "mouth", "hand", "arm", "leg", "foot",
    "back", "face", "hair", "tooth", "finger", "heart", "body", "skin",
    "neck", "knee", "shoulder", "stomach", "chest", "toe", "thumb", "lip",
    // Famille
    "mother", "father", "sister", "brother", "son", "daughter", "baby",
    "child", "parent", "family", "husband", "wife", "grandmother",
    "grandfather", "uncle", "aunt", "cousin", "friend",
    // Chiffres et temps
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "hundred", "thousand", "day", "week", "month", "year", "hour",
    "minute", "morning", "afternoon", "evening", "night", "today", "tomorrow",
    "yesterday", "summer", "winter", "spring", "autumn",
    // Maison et objets
    "house", "room", "door", "window", "bed", "table", "chair", "floor",
    "wall", "roof", "kitchen", "bathroom", "garden", "lamp", "key", "phone",
    "computer", "clock", "cup", "plate", "knife", "fork", "spoon", "glass",
    "bag", "box", "book", "pen", "pencil", "paper", "umbrella",
    // Lieux
    "school", "shop", "park", "hospital", "restaurant", "hotel", "church",
    "library", "station", "airport", "beach", "city", "town", "country",
    "street", "road", "bridge", "farm",
    // Transport
    "car", "bus", "train", "bike", "boat", "plane", "taxi", "ship",
    "helicopter", "truck",
    // Nature
    "sun", "moon", "star", "sky", "rain", "cloud", "tree", "flower",
    "grass", "sea", "river", "mountain", "snow", "wind", "fire", "earth",
    "leaf", "rock", "stone", "sand", "lake", "forest", "hill", "island",
    "desert", "rainbow", "storm", "wave",
    // Descriptions de base
    "big", "small", "long", "short", "tall", "fat", "thin", "young", "old",
    "new", "good", "bad", "hot", "cold", "warm", "cool", "fast", "slow",
    "easy", "hard", "clean", "dirty", "open", "closed", "right", "wrong",
    "happy", "sad", "angry", "tired", "sick", "hungry", "thirsty", "free",
    "busy", "ready", "nice", "beautiful", "funny", "dark", "light", "heavy",
    "empty", "full", "quiet", "loud", "soft", "wet", "dry", "sweet", "sour",
    "round", "flat", "safe", "alive", "brave", "kind", "clever", "shy",
    // Personnnes
    "boy", "girl", "man", "woman", "person", "people", "teacher", "doctor",
    "nurse", "police", "chef", "farmer", "driver", "student", "visitor",
  ],

  A2: [
    // Émotions
    "beautiful", "angry", "hungry", "tired", "excited", "bored", "scared",
    "worried", "surprised", "proud", "shy", "jealous", "lonely", "nervous",
    "confident", "relaxed", "embarrassed", "grateful", "disappointed",
    // Maison
    "bedroom", "kitchen", "bathroom", "living room", "garage", "cellar",
    "attic", "sofa", "mirror", "curtain", "carpet", "drawer", "shelf",
    "ladder", "basket", "brush", "comb", "towel", "pillow",
    // Vêtements
    "shirt", "dress", "coat", "shoe", "hat", "jacket", "pants", "sock",
    "skirt", "scarf", "glove", "boot", "jeans", "sweater", "tie", "shorts",
    "uniform", "belt", "pocket", "button", "sleeve",
    // Nourriture et cuisine
    "breakfast", "lunch", "dinner", "snack", "recipe", "ingredient",
    "flavor", "dessert", "vegetable", "fruit", "portion", "meal", "diet",
    "menu", "cook", "bake", "fry", "boil", "mix", "taste", "smell",
    "pineapple", "cherry", "watermelon", "mango", "avocado", "broccoli",
    "cucumber", "lettuce", "spinach", "cabbage", "celery", "ginger",
    // Loisirs et sport
    "sport", "game", "music", "dance", "paint", "draw", "sing", "travel",
    "swim", "run", "climb", "ski", "skate", "play", "practice", "hobby",
    "football", "basketball", "tennis", "volleyball", "baseball", "cricket",
    "golf", "boxing", "yoga", "gym", "exercise", "fitness",
    // Météo et nature
    "weather", "sunny", "cloudy", "windy", "rainy", "snowy", "foggy",
    "thunder", "lightning", "hurricane", "earthquake", "flood", "fire",
    "temperature", "climate", "season", "animal", "plant", "garden",
    "forest", "ocean", "mountain", "valley", "desert", "field",
    // Temps et calendrier
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "Saturday", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
    "birthday", "holiday", "celebration", "evening", "morning",
    // Transport et voyages
    "trip", "journey", "holiday", "vacation", "ticket", "passport",
    "luggage", "suitcase", "camera", "map", "guide", "tourist", "visa",
    "departure", "arrival", "flight", "platform", "delay", "cancel",
    "border", "customs", "ferry", "motor", "traffic", "direction", "route",
    // Social et communication
    "together", "always", "never", "different", "important", "careful",
    "outside", "laugh", "listen", "share", "remember", "forget", "ask",
    "answer", "agree", "disagree", "discuss", "explain", "describe",
    "guess", "understand", "manage", "continue", "finish", "succeed", "fail",
    "win", "lose", "story", "window", "number", "letter", "word", "language",
    // Arts et culture
    "festival", "concert", "theater", "cinema", "exhibition", "gallery",
    "museum", "performance", "actor", "singer", "musician", "artist",
    "painting", "sculpture", "photograph", "film", "novel", "poem",
    // Achats et argent
    "shop", "market", "supermarket", "price", "discount", "sale",
    "advertisement", "brand", "product", "customer", "service", "payment",
    "cash", "change", "bill", "receipt", "credit", "bank", "account",
    "savings", "budget",
    // Corps et santé
    "headache", "stomachache", "pain", "fever", "cold", "flu", "medicine",
    "appointment", "weight", "height", "age", "blood", "bone", "muscle",
    "operation", "bandage", "tablet", "pill", "injection", "allergy",
    // Technologie basique
    "internet", "website", "email", "message", "photo", "video", "call",
    "battery", "charger", "screen", "keyboard", "mouse", "printer",
    "download", "upload", "app", "game", "password", "network",
    // École et éducation
    "class", "lesson", "course", "subject", "exam", "test", "grade",
    "homework", "assignment", "project", "essay", "vocabulary", "grammar",
    "pronunciation", "dictionary", "library", "notebook", "backpack",
    "certificate",
  ],

  B1: [
    // Aventure et découverte
    "adventure", "discover", "explore", "journey", "experience", "travel",
    "memory", "culture", "tradition", "festival", "event", "guide",
    "treasure", "mystery", "legend", "ancient", "volcano", "telescope",
    "rainbow", "butterfly", "universe", "galaxy", "planet", "atmosphere",
    // Descriptions intermédiaires
    "curious", "gentle", "enormous", "delicious", "mysterious", "wonderful",
    "fantastic", "impossible", "magical", "brilliant", "incredible",
    "powerful", "positive", "confident", "generous", "wise", "patient",
    "creative", "energetic", "enthusiastic", "ambitious", "responsible",
    // Concepts et idées
    "silence", "kindness", "courage", "freedom", "harmony", "patience",
    "surprise", "challenge", "achievement", "creativity", "friendship",
    "beginning", "respect", "dream", "believe", "inspire", "protect",
    "celebrate", "champion", "transform", "grateful",
    // Société et communauté
    "community", "society", "neighbor", "volunteer", "charity", "donation",
    "equality", "justice", "poverty", "wealth", "democracy", "government",
    "authority", "leadership", "election", "protest", "rights", "law",
    "education", "healthcare", "welfare",
    // Environnement
    "environment", "pollution", "recycling", "energy", "climate",
    "sustainability", "conservation", "ecosystem", "biodiversity", "habitat",
    "species", "extinction", "deforestation", "renewable", "solar", "wind",
    "carbon", "temperature", "global warming", "nature reserve",
    // Travail et carrière
    "career", "job", "work", "office", "meeting", "boss", "employee",
    "colleague", "salary", "contract", "deadline", "project", "report",
    "presentation", "schedule", "goal", "application", "interview",
    "promotion", "resignation", "company", "business", "industry",
    // Santé et bien-être
    "disease", "illness", "condition", "symptom", "diagnosis", "treatment",
    "therapy", "medication", "prescription", "prevention", "vaccination",
    "immunity", "virus", "bacteria", "infection", "surgery", "recovery",
    "rehabilitation", "mental health", "stress", "anxiety", "depression",
    "wellness", "nutrition", "lifestyle",
    // Communication et médias
    "newspaper", "magazine", "television", "radio", "podcast", "blog",
    "social media", "advertisement", "headline", "article", "interview",
    "documentary", "broadcast", "journalist", "editor", "publisher",
    "opinion", "debate", "argument", "evidence", "fact",
    // Science et technologie
    "technology", "innovation", "invention", "discovery", "research",
    "experiment", "hypothesis", "theory", "data", "information", "system",
    "network", "software", "digital", "virtual", "simulation", "model",
    "design", "engineering", "manufacturing",
    // Émotions complexes
    "nostalgia", "compassion", "admiration", "inspiration", "frustration",
    "satisfaction", "disappointment", "enthusiasm", "determination",
    "confidence", "optimism", "pessimism", "jealousy", "regret", "relief",
    "excitement", "anxiety", "sympathy", "empathy",
    // Géographie
    "continent", "country", "region", "province", "capital", "population",
    "border", "territory", "climate zone", "tropical", "arctic", "equator",
    "hemisphere", "latitude", "longitude", "geography", "landscape",
    // Cuisine internationale
    "cuisine", "spice", "herb", "sauce", "marinade", "grill", "roast",
    "steam", "simmer", "chop", "slice", "blend", "ferment", "organic",
    "vegetarian", "vegan", "gluten-free", "protein", "calorie", "portion",
    // Logement
    "rent", "mortgage", "landlord", "tenant", "lease", "property",
    "neighborhood", "suburb", "urban", "rural", "commute", "furniture",
    "decoration", "renovation", "balcony", "courtyard",
  ],

  B2: [
    // Économie et finance
    "economy", "finance", "investment", "profit", "loss", "revenue",
    "expenditure", "budget", "inflation", "recession", "unemployment",
    "taxation", "subsidy", "trade", "export", "import", "currency",
    "exchange rate", "stock market", "dividend", "bankruptcy", "merger",
    "acquisition", "negotiation", "contract", "liability", "asset",
    // Politique et société
    "politics", "democracy", "parliament", "constitution", "legislation",
    "referendum", "coalition", "opposition", "corruption", "transparency",
    "accountability", "bureaucracy", "diplomacy", "sovereignty", "treaty",
    "sanction", "humanitarian", "refugee", "immigration", "integration",
    "discrimination", "prejudice", "stereotype", "diversity", "inclusion",
    // Sciences et recherche
    "hypothesis", "methodology", "analysis", "synthesis", "evaluation",
    "observation", "experiment", "variable", "correlation", "causation",
    "evidence", "conclusion", "peer review", "publication", "citation",
    "laboratory", "specimen", "molecule", "atom", "particle", "energy",
    "gravity", "radiation", "chromosome", "gene", "evolution",
    // Technologie avancée
    "artificial intelligence", "machine learning", "automation", "robotics",
    "algorithm", "database", "cybersecurity", "encryption", "blockchain",
    "virtual reality", "augmented reality", "cloud computing", "big data",
    "programming", "software development", "interface", "bandwidth",
    "connectivity", "infrastructure",
    // Psychologie et comportement
    "psychology", "behavior", "motivation", "perception", "cognition",
    "emotion", "personality", "identity", "consciousness", "subconscious",
    "trauma", "therapy", "resilience", "coping", "mindfulness", "habit",
    "addiction", "phobia", "disorder", "wellbeing",
    // Arts et culture avancés
    "renaissance", "baroque", "impressionism", "modernism", "postmodern",
    "literature", "philosophy", "mythology", "symbolism", "metaphor",
    "narrative", "genre", "criticism", "interpretation", "aesthetic",
    "architecture", "heritage", "preservation", "restoration", "curator",
    // Relations internationales
    "globalization", "multilateral", "bilateral", "alliance", "conflict",
    "negotiation", "mediation", "resolution", "cooperation", "development",
    "sustainability", "agenda", "summit", "declaration", "protocol",
    "convention", "ratification", "implementation", "monitoring",
    // Médias et communication
    "propaganda", "censorship", "freedom of speech", "misinformation",
    "disinformation", "bias", "objectivity", "credibility", "source",
    "citation", "verification", "transparency", "influence", "persuasion",
    "rhetoric", "discourse", "narrative", "framing",
    // Environnement et écologie
    "carbon footprint", "greenhouse gas", "fossil fuel", "nuclear energy",
    "hydroelectric", "geothermal", "biofuel", "emission", "deforestation",
    "desertification", "acidification", "microplastic", "biodegradable",
    "composting", "circular economy", "carbon neutral", "net zero",
    // Droit et justice
    "legislation", "regulation", "enforcement", "violation", "penalty",
    "prosecution", "defendant", "plaintiff", "verdict", "appeal",
    "jurisdiction", "precedent", "constitutional", "civil rights",
    "intellectual property", "copyright", "patent", "trademark",
    // Santé publique
    "epidemiology", "pandemic", "endemic", "outbreak", "quarantine",
    "vaccination rate", "herd immunity", "clinical trial", "placebo",
    "dosage", "side effect", "contraindication", "prognosis", "mortality",
    "morbidity", "public health", "prevention", "intervention",
    // Urbanisme et architecture
    "urbanization", "infrastructure", "transportation", "public space",
    "zoning", "gentrification", "sustainable architecture", "smart city",
    "green building", "density", "sprawl", "accessibility",
    // Philosophie et éthique
    "ethics", "morality", "justice", "equality", "freedom", "rights",
    "responsibility", "autonomy", "integrity", "principle", "value",
    "dilemma", "consequence", "intention", "virtue", "pragmatism",
  ],

  C1: [
    // Vocabulaire académique
    "epistemology", "ontology", "dialectic", "hermeneutics", "empiricism",
    "rationalism", "idealism", "materialism", "positivism", "relativism",
    "determinism", "phenomenology", "axiology", "teleology", "sophistry",
    "syllogism", "axiom", "theorem", "postulate", "corollary",
    // Analyse et critique
    "juxtaposition", "dichotomy", "paradox", "ambiguity", "nuance",
    "connotation", "denotation", "subtext", "implication", "inference",
    "extrapolation", "interpolation", "contextualization", "deconstruction",
    "abstraction", "generalization", "particularity", "universality",
    // Politique et gouvernance avancés
    "hegemony", "geopolitics", "neoliberalism", "authoritarianism",
    "totalitarianism", "federalism", "devolution", "decentralization",
    "technocracy", "plutocracy", "oligarchy", "meritocracy",
    "constitutionalism", "judicial review", "legislative process",
    // Sciences sociales
    "socialization", "stratification", "social mobility", "class structure",
    "cultural capital", "habitus", "discourse", "ideology", "hegemony",
    "alienation", "commodification", "globalization", "cosmopolitanism",
    "multiculturalism", "intersectionality", "positionality",
    // Sciences naturelles avancées
    "thermodynamics", "electromagnetism", "quantum mechanics", "relativity",
    "cosmology", "neuroscience", "genomics", "proteomics", "nanotechnology",
    "biotechnology", "synthetic biology", "cognitive science",
    "computational linguistics", "astrophysics", "biochemistry",
    // Économie avancée
    "macroeconomics", "microeconomics", "fiscal policy", "monetary policy",
    "quantitative easing", "austerity", "protectionism", "free trade",
    "comparative advantage", "market failure", "externality", "monopoly",
    "oligopoly", "equilibrium", "elasticity", "liquidity", "derivatives",
    // Technologie de pointe
    "transhumanism", "singularity", "superintelligence", "neuromorphic",
    "quantum computing", "edge computing", "digital twin", "metaverse",
    "decentralized finance", "non-fungible token", "autonomous vehicle",
    "brain-computer interface", "gene editing", "CRISPR",
    // Droit international
    "jurisdiction", "sovereignty", "extradition", "asylum", "statelessness",
    "jus cogens", "customary law", "treaty obligation", "arbitration",
    "mediation", "conciliation", "adjudication", "reparations",
    // Arts et littérature avancés
    "allegory", "allusion", "anachronism", "catharsis", "denouement",
    "diegesis", "ekphrasis", "epistolary", "intertextuality", "leitmotif",
    "metafiction", "pastiche", "polyphony", "satire", "stream of consciousness",
    "sublime", "tragicomedy", "unreliable narrator",
    // Psychologie clinique
    "psychoanalysis", "cognitive behavioral therapy", "neuroplasticity",
    "psychopathology", "dissociation", "narcissism", "borderline",
    "attachment theory", "developmental psychology", "social cognition",
    "metacognition", "executive function", "working memory", "implicit bias",
    // Linguistique
    "morphology", "phonology", "syntax", "semantics", "pragmatics",
    "discourse analysis", "sociolinguistics", "code-switching",
    "lingua franca", "pidgin", "creole", "diglossia", "lexicography",
    "etymology", "neologism", "euphemism", "dysphemism",
    // Environnement avancé
    "tipping point", "feedback loop", "carbon sequestration",
    "geoengineering", "rewilding", "ecosystem services", "biome",
    "keystone species", "ecological niche", "food web", "biomagnification",
    "eutrophication", "anthropocene", "sixth extinction",
    // Médias et communication avancés
    "epistemological crisis", "post-truth", "echo chamber", "filter bubble",
    "astroturfing", "dark patterns", "surveillance capitalism",
    "algorithmic bias", "digital divide", "media literacy", "deepfake",
    "disinformation campaign", "persuasion architecture",
    // Leadership et management
    "strategic thinking", "systemic approach", "organizational culture",
    "transformational leadership", "servant leadership", "agile methodology",
    "stakeholder management", "crisis management", "change management",
    "succession planning", "corporate governance", "ethical leadership",
  ],
};

// ─── Type pour la réponse Claude ─────────────────────────────────────────────

interface WordEnrichment {
  word: string;
  translation: string;
  phonetic: string;
  category: string;
  emoji: string;
}

// ─── Fonction principale ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert en linguistique anglais-français et en pédagogie des langues.
Pour chaque mot anglais fourni, génère un objet JSON avec ces champs :
- "word": le mot anglais tel quel
- "translation": la traduction française la plus courante et utile (pas trop longue)
- "phonetic": la transcription IPA simplifiée (uniquement les sons principaux)
- "category": une catégorie parmi : animaux, actions, nourriture, couleurs, corps, famille, lieux, objets, nature, temps, descriptions, personnes, arts, social, transport, technologie, santé, concepts, émotions, sciences, économie, politique, droit, éducation, sports, culture, thèmes
- "emoji": UN seul emoji représentatif pour les mots CONCRETS (objet, animal, lieu, nourriture visible) ; chaîne vide "" pour les mots ABSTRAITS (verbes mentaux, adjectifs, concepts, adverbes)

Règles importantes :
- Pour les mots abstraits (think, justice, freedom, always...) → emoji: ""
- Pour les mots concrets (cat, apple, house, car...) → emoji approprié
- Traduction concise : préfère "voiture" à "une voiture", "courir" à "action de courir"
- Phonétique simple : /kæt/ pas de diacritiques complexes inutiles

Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans explication.`;

async function enrichBatch(
  words: string[],
  level: string,
  batchIndex: number
): Promise<WordEnrichment[]> {
  const prompt = `Niveau CEFR: ${level}\nMots à enrichir:\n${words.join("\n")}`;

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
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned) as WordEnrichment[];
    console.log(`  ✓ Batch ${batchIndex}: ${parsed.length} mots traités`);
    return parsed;
  } catch {
    console.error(`  ✗ Batch ${batchIndex}: erreur parsing JSON`, text.slice(0, 200));
    return words.map((w) => ({
      word: w,
      translation: w,
      phonetic: "",
      category: "général",
      emoji: "",
    }));
  }
}

async function main() {
  const outputPath = path.join(process.cwd(), "data", "words.json");
  const allWords: object[] = [];
  let globalIndex = 0;

  for (const [level, words] of Object.entries(SEED_WORDS)) {
    console.log(`\n🔤 Niveau ${level} — ${words.length} mots`);
    const batchSize = 50;

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      console.log(`  📦 Batch ${batchNum}/${Math.ceil(words.length / batchSize)} (${batch.length} mots)...`);

      const enriched = await enrichBatch(batch, level, batchNum);

      for (const item of enriched) {
        globalIndex++;
        allWords.push({
          id: `${level}-${String(globalIndex).padStart(4, "0")}`,
          word: item.word,
          translation: item.translation,
          level,
          category: item.category,
          emoji: item.emoji,
          phonetic: item.phonetic,
        });
      }

      // Pause pour respecter les rate limits
      if (i + batchSize < words.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Sauvegarde intermédiaire après chaque niveau
    fs.writeFileSync(outputPath, JSON.stringify(allWords, null, 2), "utf-8");
    console.log(`  💾 Sauvegarde intermédiaire: ${allWords.length} mots total`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(allWords, null, 2), "utf-8");
  console.log(`\n✅ Terminé ! ${allWords.length} mots sauvegardés dans ${outputPath}`);
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
