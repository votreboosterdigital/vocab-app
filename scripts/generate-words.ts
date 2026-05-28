/**
 * generate-words.ts
 * Génère les mots anglais CEFR enrichis via Claude API avec prompt caching.
 * Mode incrémental : ne régénère pas les mots déjà dans data/words.json
 * Usage: npx tsx scripts/generate-words.ts
 * Output: data/words.json (~3000 mots)
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── SEED WORDS organisés par niveau CEFR (~600 par niveau) ──────────────────

const SEED_WORDS: Record<string, string[]> = {
  A1: [
    // Actions fondamentales
    "run", "jump", "eat", "drink", "sleep", "play", "walk", "sing", "read",
    "open", "close", "go", "come", "see", "like", "love", "want", "need",
    "have", "make", "take", "give", "put", "get", "say", "tell", "ask",
    "know", "think", "look", "hear", "help", "stop", "start", "sit", "stand",
    "swim", "fly", "drive", "ride", "buy", "sell", "work", "cook", "wash",
    "write", "draw", "cut", "carry", "talk", "feel", "touch", "hold",
    "pick", "drop", "smell", "taste", "turn", "fall", "break", "fix",
    "choose", "pay", "wait", "wake", "dress", "brush", "miss", "shake",
    "wave", "point", "pull", "push", "show", "hide", "climb", "kick",
    "catch", "throw", "lift", "hang", "fold", "save", "find", "lose",
    "win", "try", "move", "live", "call", "keep", "let", "begin",
    "leave", "mean", "follow", "bring", "meet", "reach", "pass", "use",
    // Jours et mois
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
    // Chiffres et temps
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "thirty",
    "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "hundred",
    "thousand", "first", "second", "third", "fourth", "fifth", "last",
    "day", "week", "month", "year", "hour", "minute", "second",
    "morning", "afternoon", "evening", "night", "today", "tomorrow",
    "yesterday", "summer", "winter", "spring", "autumn", "weekend",
    "holiday", "birthday", "age", "now", "soon", "early", "late",
    // Animaux
    "cat", "dog", "fish", "bird", "horse", "cow", "chicken", "duck",
    "rabbit", "lion", "tiger", "elephant", "monkey", "bear", "snake",
    "sheep", "pig", "mouse", "frog", "bee", "ant", "wolf", "fox", "deer",
    "whale", "dolphin", "penguin", "giraffe", "zebra", "turtle", "parrot",
    "crab", "butterfly", "hamster", "shark", "crocodile", "hippo", "camel",
    "koala", "kangaroo", "panda", "gorilla", "flamingo", "owl", "eagle",
    "lobster", "jellyfish", "octopus", "seal", "snail", "spider",
    "dragonfly", "ladybug", "rooster", "goldfish", "donkey", "goat",
    // Nourriture
    "apple", "bread", "water", "milk", "egg", "meat", "rice", "soup",
    "cake", "sugar", "salt", "butter", "cheese", "orange", "banana",
    "potato", "carrot", "tomato", "pasta", "sandwich", "cookie", "chocolate",
    "juice", "tea", "coffee", "candy", "strawberry", "grape", "lemon",
    "pepper", "onion", "garlic", "corn", "bean", "pea", "mushroom",
    "pizza", "hamburger", "toast", "donut", "yogurt", "honey", "jam",
    "cereal", "noodle", "pear", "peach", "plum", "coconut", "blueberry",
    "kiwi", "watermelon", "mango", "pineapple", "cream", "hot dog",
    // Couleurs
    "red", "blue", "green", "yellow", "white", "black", "pink", "purple",
    "orange", "brown", "grey", "gold", "silver", "navy", "teal", "beige",
    "turquoise", "ivory",
    // Corps
    "head", "eye", "ear", "nose", "mouth", "hand", "arm", "leg", "foot",
    "back", "face", "hair", "tooth", "finger", "heart", "body", "skin",
    "neck", "knee", "shoulder", "stomach", "chest", "toe", "thumb", "lip",
    "tongue", "chin", "forehead", "wrist", "elbow", "ankle", "nail",
    "eyebrow", "cheek", "heel", "palm", "fist",
    // Famille et personnes
    "mother", "father", "sister", "brother", "son", "daughter", "baby",
    "child", "parent", "family", "husband", "wife", "grandmother",
    "grandfather", "uncle", "aunt", "cousin", "friend", "nephew", "niece",
    "twin", "neighbor", "man", "woman", "boy", "girl", "person",
    "teacher", "doctor", "nurse", "police", "chef", "farmer", "driver",
    "student", "baby-sitter",
    // Maison et objets
    "house", "room", "door", "window", "bed", "table", "chair", "floor",
    "wall", "roof", "kitchen", "bathroom", "garden", "lamp", "key",
    "phone", "computer", "clock", "cup", "plate", "knife", "fork",
    "spoon", "glass", "bag", "box", "book", "pen", "pencil", "paper",
    "umbrella", "sofa", "closet", "mirror", "toilet", "sink", "shower",
    "fridge", "oven", "microwave", "fan", "bookshelf", "wardrobe",
    "yard", "balcony", "garage", "staircase", "desk", "lamp",
    "scissors", "eraser", "ruler", "glue", "crayon", "board",
    "television", "radio", "camera", "calculator",
    // Lieux
    "school", "shop", "park", "hospital", "restaurant", "hotel", "church",
    "library", "station", "airport", "beach", "city", "town", "country",
    "street", "road", "bridge", "farm", "cinema", "zoo", "aquarium",
    "playground", "mall", "market", "square", "corner", "port",
    "bank", "post office", "bakery", "garden", "pool",
    // Transport
    "car", "bus", "train", "bike", "boat", "plane", "taxi", "ship",
    "helicopter", "truck", "motorcycle", "elevator", "escalator",
    "subway", "scooter",
    // Nature
    "sun", "moon", "star", "sky", "rain", "cloud", "tree", "flower",
    "grass", "sea", "river", "mountain", "snow", "wind", "fire", "earth",
    "leaf", "rock", "stone", "sand", "lake", "forest", "hill", "island",
    "desert", "rainbow", "storm", "wave", "mud", "pond", "cave",
    "jungle", "field", "valley",
    // Descriptions de base
    "big", "small", "long", "short", "tall", "fat", "thin", "young",
    "old", "new", "good", "bad", "hot", "cold", "warm", "cool", "fast",
    "slow", "easy", "hard", "clean", "dirty", "right", "wrong", "happy",
    "sad", "angry", "tired", "sick", "hungry", "thirsty", "free", "busy",
    "ready", "nice", "beautiful", "ugly", "funny", "dark", "light",
    "heavy", "empty", "full", "quiet", "loud", "soft", "wet", "dry",
    "sweet", "sour", "round", "flat", "safe", "brave", "kind", "clever",
    "shy", "silly", "friendly", "lazy", "noisy", "peaceful", "narrow",
    "wide", "deep", "shallow", "sharp", "strong", "weak", "fair",
    "neat", "messy", "boring", "exciting", "expensive", "cheap",
    "straight", "smooth", "rough", "loose", "tight", "poor", "rich",
    "open", "closed", "alive",
    // Musique et loisirs
    "guitar", "piano", "drum", "violin", "music", "song", "game",
    "toy", "doll", "kite", "puzzle", "sport",
    "football", "basketball", "tennis", "volleyball", "swimming",
    // Mots essentiels divers
    "color", "number", "name", "word", "letter", "question", "answer",
    "idea", "money", "food", "drink", "thing", "place", "world", "life",
    "air", "voice", "noise", "sound", "dream", "plan", "way", "home",
    "address", "message", "photo", "map",
  ],

  A2: [
    // Émotions et états
    "excited", "bored", "scared", "worried", "surprised", "proud",
    "content", "ashamed", "guilty", "inspired", "hopeless", "restless",
    "cheerful", "miserable", "relieved", "overwhelmed", "frustrated",
    "nervous", "confident", "relaxed", "embarrassed", "grateful",
    "disappointed", "jealous", "lonely", "cheerful", "calm",
    "stressed", "confused", "curious", "hopeful",
    // Descriptions A2
    "beautiful", "angry", "hungry", "tired", "careful", "important",
    "different", "always", "never", "together", "outside", "interesting",
    "perfect", "terrible", "awful", "wonderful", "comfortable",
    "uncomfortable", "popular", "famous", "modern", "traditional",
    "healthy", "unhealthy", "dangerous", "safe", "useful", "necessary",
    "possible", "impossible", "similar", "certain", "special", "common",
    "general", "public", "private", "simple", "natural", "physical",
    "social", "cultural", "local", "busy", "lucky", "delicious",
    "polite", "rude", "patient", "impatient", "serious", "gentle",
    "independent", "creative", "funny", "clever", "honest", "fair",
    // Maison et vie quotidienne
    "bedroom", "living room", "attic", "cellar", "furniture",
    "decoration", "curtain", "carpet", "drawer", "shelf", "basket",
    "brush", "comb", "towel", "pillow", "blanket", "heater", "light",
    "switch", "plug", "battery", "cable", "screen", "button",
    // Vêtements
    "shirt", "dress", "coat", "shoe", "hat", "jacket", "pants", "sock",
    "skirt", "scarf", "glove", "boot", "jeans", "sweater", "tie",
    "shorts", "uniform", "belt", "pocket", "sleeve", "swimsuit",
    "raincoat", "pyjamas", "mittens", "vest", "sandal", "sneaker",
    "blouse", "suit", "collar", "zipper", "pattern",
    // Nourriture A2
    "breakfast", "lunch", "dinner", "snack", "recipe", "ingredient",
    "dessert", "vegetable", "fruit", "meal", "diet", "menu",
    "flavor", "portion", "cook", "bake", "fry", "boil", "mix",
    "pineapple", "cherry", "avocado", "broccoli", "cucumber",
    "lettuce", "spinach", "cabbage", "celery", "ginger", "salad",
    "pizza slice", "sausage", "bacon", "omelet", "stew", "curry",
    "waffle", "pancake", "brownie", "muffin", "chips", "popcorn",
    "smoothie", "lemonade", "sparkling water", "herbal tea",
    "mineral water", "syrup", "sauce", "spice", "herb",
    // Loisirs et sport A2
    "hobby", "practice", "exercise", "fitness", "gym", "yoga",
    "boxing", "skiing", "skating", "climbing", "cycling", "jogging",
    "hiking", "fishing", "sailing", "surfing", "dancing", "singing",
    "cooking", "reading", "drawing", "painting", "photography",
    "gardening", "shopping", "traveling", "gaming", "knitting",
    "golf", "cricket", "baseball",
    // Météo et saisons A2
    "weather", "sunny", "cloudy", "windy", "rainy", "snowy", "foggy",
    "thunder", "lightning", "hurricane", "earthquake", "flood",
    "temperature", "season", "forecast", "degree", "humidity",
    "breeze", "frost", "hail", "drought", "heatwave",
    // Transport et voyages
    "trip", "vacation", "ticket", "passport", "luggage", "suitcase",
    "camera", "map", "tourist", "visa", "departure", "arrival",
    "flight", "platform", "delay", "cancel", "border", "customs",
    "ferry", "traffic", "direction", "route", "distance", "speed",
    "journey", "reservation", "guide", "tour", "destination",
    "connection", "transfer", "check-in", "boarding", "gate",
    // Communication et médias
    "internet", "website", "email", "video", "call", "charger",
    "keyboard", "mouse", "printer", "download", "upload", "app",
    "password", "network", "chat", "profile", "selfie", "post",
    "share", "like", "follow", "subscribe", "stream",
    // Social et communication
    "together", "laugh", "listen", "share", "remember", "forget",
    "answer", "agree", "disagree", "discuss", "explain", "describe",
    "guess", "understand", "continue", "finish", "succeed", "fail",
    "win", "lose", "choose", "decide", "manage", "improve",
    "celebrate", "invite", "welcome", "introduce", "greet",
    "apologize", "forgive", "complain", "recommend", "suggest",
    // Arts et culture
    "festival", "concert", "theater", "cinema", "exhibition",
    "gallery", "museum", "performance", "actor", "singer", "musician",
    "artist", "painting", "sculpture", "photograph", "film", "novel",
    "poem", "character", "story", "cartoon", "cartoon",
    // Achats et argent
    "market", "supermarket", "price", "discount", "sale", "brand",
    "product", "customer", "service", "payment", "cash", "change",
    "bill", "receipt", "credit card", "bank", "account", "savings",
    "budget", "coin", "wallet", "loan", "free", "cost", "spend",
    "earn", "afford",
    // Corps et santé A2
    "headache", "stomachache", "pain", "fever", "cold", "flu",
    "medicine", "appointment", "weight", "height", "blood", "bone",
    "muscle", "bandage", "tablet", "pill", "injection", "allergy",
    "cough", "sneeze", "rash", "wound", "scar", "dizzy", "breathe",
    "heartbeat", "temperature", "prescription", "pharmacy",
    // École et éducation
    "class", "lesson", "course", "subject", "exam", "test", "grade",
    "homework", "assignment", "project", "essay", "vocabulary",
    "grammar", "pronunciation", "dictionary", "notebook", "backpack",
    "certificate", "degree", "result", "report", "research",
    "presentation", "debate", "question", "exercise", "correction",
    // Calendrier et événements
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
    "Saturday", "New Year", "Easter", "Christmas", "anniversary",
    "wedding", "party", "invitation", "guest", "celebration",
    "ceremony", "parade", "fireworks",
    // Relations et famille
    "relationship", "friendship", "marriage", "divorce",
    "neighbor", "community", "society", "colleague", "boss",
    "roommate", "classmate", "teammate", "partner",
    // Logement
    "rent", "landlord", "tenant", "apartment", "flat", "villa",
    "cottage", "studio", "neighborhood", "suburb", "urban", "rural",
    "commute", "renovation", "courtyard",
    // Adverbes et mots fonctionnels
    "however", "because", "although", "while", "since", "unless",
    "therefore", "besides", "instead", "finally", "actually",
    "usually", "probably", "already", "still", "again", "only",
    "both", "either", "neither", "each", "every", "another",
    // Travail et vie professionnelle A2
    "job", "career", "office", "boss", "meeting", "colleague",
    "schedule", "deadline", "project", "report", "presentation",
    "contract", "salary", "promotion", "resignation", "interview",
    "application", "qualification", "experience", "reference",
    "internship", "apprenticeship", "part-time", "full-time",
    // Santé pratique A2
    "symptom", "treatment", "recovery", "pharmacist", "clinic",
    "emergency", "ambulance", "surgeon", "specialist", "checkup",
    "prescription", "dosage", "side effect", "blood pressure",
    "pulse", "X-ray", "scan", "operation", "cast", "crutches",
    // Nature et géographie A2
    "landscape", "scenery", "viewpoint", "climate", "region",
    "coast", "coast", "peninsula", "bay", "cliff", "cave",
    "waterfall", "glacier", "delta", "plains", "plateau",
    // Commerce et services A2
    "delivery", "shipment", "package", "tracking", "refund",
    "exchange", "warranty", "guarantee", "complaint", "review",
    "rating", "membership", "subscription", "promotion", "coupon",
    // Chiffres et données A2
    "percentage", "proportion", "majority", "minority", "average",
    "total", "sum", "difference", "result", "estimate", "survey",
    "statistic", "graph", "chart", "table", "diagram",
    // Temps et société A2
    "generation", "decade", "era", "period", "century", "ancient",
    "medieval", "modern", "contemporary", "historical", "tradition",
    "custom", "culture", "heritage", "identity", "community",
  ],

  B1: [
    // Aventure et découverte
    "adventure", "discover", "explore", "experience", "memory",
    "culture", "tradition", "mystery", "legend", "ancient",
    "volcano", "telescope", "rainbow", "butterfly", "universe",
    "galaxy", "planet", "atmosphere", "horizon", "wilderness",
    "expedition", "archaeology", "monument", "ruins", "artifact",
    // Descriptions intermédiaires
    "curious", "gentle", "enormous", "delicious", "mysterious",
    "wonderful", "fantastic", "magical", "brilliant", "incredible",
    "powerful", "positive", "confident", "generous", "wise",
    "patient", "energetic", "enthusiastic", "ambitious",
    "responsible", "independent", "creative", "determined",
    "passionate", "dedicated", "flexible", "reliable", "honest",
    "optimistic", "pessimistic", "competitive", "supportive",
    "tolerant", "adaptable", "thoughtful", "imaginative",
    // Concepts et idées
    "silence", "kindness", "courage", "freedom", "harmony",
    "patience", "surprise", "challenge", "achievement", "creativity",
    "friendship", "beginning", "respect", "dream", "believe",
    "inspire", "protect", "celebrate", "champion", "transform",
    "grateful", "trust", "loyalty", "honesty", "justice",
    "equality", "responsibility", "opportunity", "sacrifice",
    "compromise", "perseverance", "motivation",
    // Société et communauté
    "community", "society", "volunteer", "charity", "donation",
    "poverty", "wealth", "democracy", "government", "authority",
    "leadership", "election", "protest", "rights", "law", "education",
    "healthcare", "welfare", "immigration", "integration",
    "neighborhood", "organization", "association", "union",
    "movement", "reform", "initiative", "campaign",
    // Environnement
    "environment", "pollution", "recycling", "energy", "climate",
    "sustainability", "conservation", "ecosystem", "biodiversity",
    "habitat", "species", "extinction", "deforestation", "renewable",
    "solar", "wind power", "carbon", "global warming", "nature reserve",
    "wildlife", "endangered", "organic", "eco-friendly", "greenhouse",
    "emission", "fossil fuel", "waterfall", "coral reef", "glacier",
    // Travail et carrière
    "career", "job", "office", "meeting", "employee", "colleague",
    "salary", "contract", "deadline", "project", "report",
    "presentation", "schedule", "goal", "application", "interview",
    "promotion", "resignation", "company", "business", "industry",
    "startup", "freelance", "entrepreneur", "manager", "supervisor",
    "department", "headquarters", "workshop", "conference",
    // Santé et bien-être
    "disease", "illness", "condition", "symptom", "diagnosis",
    "treatment", "therapy", "medication", "prescription",
    "prevention", "vaccination", "immunity", "virus", "bacteria",
    "infection", "surgery", "recovery", "rehabilitation",
    "mental health", "stress", "anxiety", "depression", "wellness",
    "nutrition", "lifestyle", "chronic", "acute", "terminal",
    "rehabilitation", "physiotherapy", "psychology",
    // Communication et médias
    "newspaper", "magazine", "television", "radio", "podcast",
    "blog", "social media", "advertisement", "headline", "article",
    "documentary", "broadcast", "journalist", "editor", "publisher",
    "opinion", "debate", "argument", "evidence", "fact",
    "fake news", "censorship", "freedom of press", "broadcasting",
    "interview", "review", "commentary",
    // Science et technologie B1
    "technology", "innovation", "invention", "discovery", "research",
    "experiment", "hypothesis", "theory", "data", "information",
    "system", "network", "software", "digital", "virtual",
    "simulation", "design", "engineering", "manufacturing",
    "laboratory", "microscope", "telescope", "satellite", "GPS",
    "robot", "drone", "sensor", "chip", "processor",
    // Émotions complexes
    "nostalgia", "compassion", "admiration", "inspiration",
    "frustration", "satisfaction", "disappointment", "enthusiasm",
    "determination", "optimism", "pessimism", "jealousy", "regret",
    "relief", "excitement", "sympathy", "empathy", "guilt", "shame",
    "pride", "grief", "loneliness", "homesickness", "awe",
    // Géographie et culture
    "continent", "country", "region", "province", "capital",
    "population", "border", "territory", "climate zone", "tropical",
    "arctic", "equator", "hemisphere", "landscape", "geography",
    "culture", "civilization", "religion", "nationality", "language",
    "dialect", "custom", "heritage", "identity", "tradition",
    // Cuisine internationale
    "cuisine", "spice", "herb", "sauce", "marinade", "grill",
    "roast", "steam", "simmer", "chop", "slice", "blend",
    "ferment", "vegetarian", "vegan", "protein", "calorie",
    "gluten-free", "dairy-free", "organic food", "fast food",
    "street food", "buffet", "catering", "nutrition label",
    // Logement et urbanisme
    "rent", "mortgage", "landlord", "property", "suburb", "urban",
    "rural", "commute", "infrastructure", "architecture", "zone",
    "district", "village", "metropolitan", "skyline", "landmark",
    // Éducation avancée
    "university", "college", "faculty", "campus", "scholarship",
    "tuition", "academic", "curriculum", "discipline", "major",
    "minor", "thesis", "dissertation", "seminar", "lecture",
    "tutorial", "internship", "placement", "graduation",
    // Économie basique B1
    "economy", "market", "trade", "export", "import", "profit",
    "investment", "inflation", "unemployment", "budget", "tax",
    "salary", "wage", "income", "expense", "debt", "loan",
    "interest", "insurance", "pension",
    // Travail avancé B1
    "strategy", "marketing", "client", "feedback", "workload",
    "overtime", "remote work", "teamwork", "networking", "expertise",
    "performance review", "annual report", "stakeholder",
    "supply chain", "logistics", "distribution", "quality control",
    "customer service", "human resources", "training", "recruitment",
    "professional development", "skill set", "mentoring",
    // Éducation avancée B1
    "curriculum", "syllabus", "assessment", "portfolio", "plagiarism",
    "citation", "bibliography", "critical thinking", "problem-solving",
    "tutoring", "vocational training", "online learning",
    "blended learning", "academic integrity", "learning outcome",
    // Santé avancée B1
    "hygiene", "sanitation", "chronic disease", "acute illness",
    "palliative care", "occupational therapy", "speech therapy",
    "nutritionist", "physiotherapist", "pharmacist", "pathology",
    "cardiology", "oncology", "neurology", "pediatrics",
    "dermatology", "orthopedics", "radiology",
    // Nature avancée B1
    "tide", "coral reef", "mangrove", "savanna", "tundra", "taiga",
    "estuary", "fjord", "canyon", "archipelago", "tropics",
    "biodiversity hotspot", "invasive species", "food chain",
    "sustainable fishing", "reforestation", "nature reserve",
    "ecosystem balance", "ecological footprint",
    // Culture et société B1
    "folklore", "mythology", "oral tradition", "proverb", "fable",
    "national identity", "cultural exchange", "intercultural",
    "diaspora", "social cohesion", "civic engagement",
    "community service", "social enterprise", "non-profit",
    "activism", "advocacy", "solidarity",
    // Psychologie B1
    "resilience", "vulnerability", "authenticity", "mindset",
    "self-awareness", "impulse control", "procrastination",
    "perfectionism", "impostor syndrome", "burnout",
    "work-life balance", "mindfulness", "well-being", "self-care",
    // Voyages avancés B1
    "itinerary", "backpacking", "eco-tourism", "culture shock",
    "jet lag", "layover", "travel insurance", "embassy", "consulate",
    "currency exchange", "travel advisory", "backpacker", "hostel",
    // Technologie B1
    "user interface", "digital literacy", "online privacy",
    "data security", "phishing", "malware", "antivirus",
    "cloud storage", "collaboration tool", "project management",
    "video conference", "screen sharing", "digital signature",
    "two-factor authentication", "data breach",
    // Sciences B1
    "evolution", "natural selection", "adaptation", "symbiosis",
    "photosynthesis", "cellular respiration", "genetic inheritance",
    "food web", "predator", "prey", "parasite", "host",
    "cell division", "DNA", "chromosome", "enzyme",
    // Médias et communication B1
    "social influence", "viral content", "influencer", "content creator",
    "algorithm curation", "targeted advertising", "data privacy",
    "digital footprint", "screen time", "media literacy",
    "fact-checking", "source credibility", "bias recognition",
    // Droit et civisme B1
    "constitution", "rights", "legislation", "democracy", "vote",
    "parliament", "government", "prime minister", "president",
    "council", "municipality", "citizen", "taxpayer", "civil servant",
    "law enforcement", "court", "judge", "lawyer", "trial",
    "verdict", "sentence", "fine", "appeal",
    // Sport avancé B1
    "tournament", "championship", "league", "division", "season",
    "playoff", "final", "quarter-final", "semi-final", "draw",
    "penalty", "referee", "athlete", "trophy", "medal",
    "record", "personal best", "team spirit", "sportsman",
    "coaching", "training camp", "doping", "fair play",
    // Finance personnelle B1
    "mortgage", "rent", "deposit", "interest rate", "credit score",
    "overdraft", "transaction", "invoice", "receipt", "payslip",
    "deduction", "contribution", "pension fund", "stock", "bond",
    // Alimentation et agriculture B1
    "harvest", "crop", "field", "livestock", "irrigation",
    "pesticide", "fertilizer", "organic farming", "genetically modified",
    "food security", "famine", "malnutrition", "obesity",
    "food waste", "expiry date", "food labeling",
  ],

  B2: [
    // Économie et finance
    "macroeconomics", "microeconomics", "fiscal policy", "monetary policy",
    "inflation", "recession", "unemployment", "taxation", "subsidy",
    "trade deficit", "exchange rate", "stock market", "dividend",
    "bankruptcy", "merger", "acquisition", "negotiation", "liability",
    "asset", "revenue", "expenditure", "austerity", "protectionism",
    "free trade", "comparative advantage", "market failure",
    "externality", "monopoly", "oligopoly", "equilibrium",
    "elasticity", "liquidity", "derivatives", "hedge fund",
    "venture capital", "financial crisis", "bail out",
    // Politique et société
    "politics", "democracy", "parliament", "constitution",
    "legislation", "referendum", "coalition", "opposition",
    "corruption", "transparency", "accountability", "bureaucracy",
    "diplomacy", "sovereignty", "treaty", "sanction",
    "humanitarian", "refugee", "discrimination", "prejudice",
    "stereotype", "diversity", "inclusion", "multiculturalism",
    "secularism", "nationalism", "liberalism", "conservatism",
    "federalism", "decentralization", "civil society",
    "public opinion", "lobbying", "electoral system",
    // Sciences et recherche
    "hypothesis", "methodology", "analysis", "synthesis",
    "evaluation", "observation", "variable", "correlation",
    "causation", "evidence", "conclusion", "peer review",
    "publication", "laboratory", "specimen", "molecule", "atom",
    "particle", "gravity", "radiation", "chromosome", "gene",
    "evolution", "natural selection", "photosynthesis", "osmosis",
    "combustion", "chemical reaction", "periodic table", "isotope",
    "neuron", "synapse", "metabolism", "genetics", "mutation",
    // Technologie avancée
    "artificial intelligence", "machine learning", "automation",
    "robotics", "algorithm", "database", "cybersecurity",
    "encryption", "blockchain", "virtual reality", "augmented reality",
    "cloud computing", "big data", "programming", "interface",
    "bandwidth", "connectivity", "infrastructure", "open source",
    "data mining", "machine translation", "deep learning",
    "neural network", "internet of things",
    // Psychologie et comportement
    "psychology", "behavior", "motivation", "perception", "cognition",
    "emotion", "personality", "identity", "consciousness",
    "subconscious", "trauma", "therapy", "resilience", "coping",
    "mindfulness", "habit", "addiction", "phobia", "disorder",
    "wellbeing", "self-esteem", "self-confidence", "assertiveness",
    "empathy", "social intelligence", "emotional regulation",
    "attachment", "defense mechanism", "projection", "rationalization",
    // Arts et culture avancés
    "renaissance", "baroque", "impressionism", "modernism",
    "postmodernism", "literature", "philosophy", "mythology",
    "symbolism", "metaphor", "narrative", "genre", "criticism",
    "aesthetic", "architecture", "heritage", "preservation",
    "restoration", "curator", "avant-garde", "installation art",
    "performance art", "conceptual art", "satire", "irony",
    "parody", "allegory", "allegory", "surrealism",
    // Environnement avancé
    "carbon footprint", "greenhouse gas", "fossil fuel",
    "nuclear energy", "hydroelectric", "geothermal", "biofuel",
    "emission", "desertification", "acidification", "microplastic",
    "biodegradable", "composting", "circular economy", "carbon neutral",
    "net zero", "tipping point", "feedback loop", "keystone species",
    "food chain", "food web", "biomass", "deforestation rate",
    "reforestation", "carbon capture", "offshore wind",
    // Droit et justice
    "legislation", "regulation", "enforcement", "violation",
    "penalty", "prosecution", "defendant", "plaintiff", "verdict",
    "appeal", "jurisdiction", "precedent", "constitutional",
    "civil rights", "intellectual property", "copyright", "patent",
    "trademark", "litigation", "arbitration", "mediation",
    "settlement", "injunction", "habeas corpus", "due process",
    // Santé publique
    "epidemiology", "pandemic", "endemic", "outbreak", "quarantine",
    "vaccination rate", "herd immunity", "clinical trial", "placebo",
    "dosage", "side effect", "contraindication", "prognosis",
    "mortality", "morbidity", "public health", "intervention",
    "screening", "diagnosis", "treatment protocol", "palliative care",
    "preventive medicine", "telemedicine", "bioethics",
    // Urbanisme
    "urbanization", "gentrification", "smart city", "green building",
    "density", "sprawl", "accessibility", "zoning", "master plan",
    "sustainable development", "public transport", "pedestrian zone",
    "mixed-use development", "brownfield", "affordable housing",
    // Philosophie et éthique
    "ethics", "morality", "justice", "equality", "rights",
    "responsibility", "autonomy", "integrity", "principle", "value",
    "dilemma", "consequence", "intention", "virtue", "pragmatism",
    "utilitarianism", "deontology", "relativism", "empiricism",
    "idealism", "determinism", "free will", "consciousness",
    // Médias et communication avancés
    "propaganda", "bias", "objectivity", "credibility", "source",
    "verification", "influence", "persuasion", "rhetoric",
    "discourse", "framing", "spin", "media literacy",
    "disinformation", "misinformation", "echo chamber", "deepfake",
    // Démographie et société
    "birth rate", "death rate", "life expectancy", "aging population",
    "migration", "diaspora", "minority", "majority", "census",
    "demographic shift", "social mobility", "class structure",
    "income inequality", "social exclusion", "empowerment",
    // Relations internationales
    "globalization", "multilateral", "bilateral", "alliance",
    "conflict", "peacekeeping", "diplomacy", "foreign policy",
    "trade agreement", "international law", "refugee crisis",
    "humanitarian aid", "development aid", "colonialism",
    "post-colonialism", "geopolitics",
    // Économie avancée B2
    "microfinance", "remittance", "shadow economy", "purchasing power parity",
    "Gini coefficient", "human development index", "supply and demand",
    "price elasticity", "consumer behavior", "market research",
    "brand loyalty", "value chain", "economic migration",
    "gross domestic product", "trade surplus", "balance of payments",
    "current account", "capital flight", "foreign direct investment",
    "public-private partnership", "economic sanctions",
    // Sociologie B2
    "social norms", "deviance", "conformity", "peer influence",
    "group dynamics", "power dynamics", "social status", "prestige",
    "stigma", "labeling theory", "social construction",
    "functionalism", "conflict theory", "symbolic interactionism",
    "social stratification", "class consciousness",
    "social reproduction", "cultural hegemony",
    // Psychologie avancée B2
    "cognitive dissonance", "confirmation bias", "anchoring bias",
    "availability heuristic", "framing effect", "priming",
    "social proof", "authority bias", "scarcity principle",
    "intrinsic motivation", "extrinsic motivation", "flow state",
    "self-determination theory", "locus of control",
    "emotional regulation", "defense mechanisms",
    // Sciences avancées B2
    "catalyst", "enzyme", "hormone", "antibody", "antigen",
    "receptor", "cell membrane", "organelle", "mitochondria",
    "protein synthesis", "DNA replication", "transcription",
    "translation", "genetic code", "mutation rate", "epigenetics",
    "stem cell", "cloning", "genome", "biome",
    // Droit avancé B2
    "habeas corpus", "due process", "judicial independence",
    "parliamentary sovereignty", "executive power",
    "civil liberties", "criminal law", "tort law", "contract law",
    "property law", "constitutional law", "administrative law",
    "class action", "statute of limitations", "burden of proof",
    "reasonable doubt", "circumstantial evidence",
    // Démographie B2
    "birth rate", "death rate", "life expectancy", "aging population",
    "demographic shift", "social mobility", "income inequality",
    "social exclusion", "empowerment", "minority rights",
    "census data", "migration pattern", "urbanization rate",
    // Santé publique avancée B2
    "herd immunity threshold", "clinical trial design", "randomized control",
    "double-blind study", "statistical significance", "mortality rate",
    "morbidity rate", "incidence", "prevalence", "risk factor",
    "protective factor", "health disparity", "determinants of health",
    // Technologie B2
    "API", "microservice", "containerization", "DevOps",
    "continuous integration", "agile development", "scrum",
    "technical debt", "scalability", "load balancing",
    "redundancy", "failover", "data center", "edge computing",
    "internet of things", "5G network", "digital transformation",
    // Environnement B2
    "carbon tax", "emissions trading", "green bond", "ESG investing",
    "sustainable finance", "life cycle assessment", "ecological footprint",
    "biocapacity", "overshoot", "regenerative agriculture",
    "permaculture", "agroforestry", "urban farming",
    "water scarcity", "desertification rate",
    // Santé mentale et société B2
    "mental health crisis", "burnout epidemic", "social isolation",
    "digital addiction", "compulsive behavior", "eating disorder",
    "body image", "self-harm", "suicidal ideation", "crisis intervention",
    "peer support", "mental health awareness", "stigma reduction",
    "psychological safety", "trauma-informed care",
    // Urbanisme et architecture B2
    "mixed-use zoning", "transit-oriented development",
    "walkability", "livability index", "urban heat island",
    "green corridor", "urban renewal", "historic preservation",
    "adaptive reuse", "modular construction", "3D printing construction",
    "earthquake-resistant design", "flood-proof building",
    // Énergie et climat B2
    "energy transition", "decarbonization", "electrification",
    "hydrogen economy", "battery storage", "smart grid",
    "energy poverty", "just transition", "stranded assets",
    "carbon budget", "net negative emissions", "direct air capture",
    "solar farm", "offshore wind farm", "tidal energy",
    // Commerce international B2
    "tariff", "quota", "non-tariff barrier", "dumping", "countervailing duty",
    "most-favored-nation", "free trade zone", "customs union",
    "common market", "economic union", "trade facilitation",
    "intellectual property rights", "technology transfer",
    // Innovation et entrepreneuriat B2
    "startup ecosystem", "accelerator", "incubator", "pitch deck",
    "seed funding", "series A", "venture capital", "angel investor",
    "exit strategy", "initial public offering", "market disruption",
    "minimum viable product", "product-market fit",
    "growth hacking", "lean startup",
    // Diplomatie et sécurité B2
    "soft power", "hard power", "smart power", "public diplomacy",
    "track-two diplomacy", "non-proliferation", "arms control",
    "ceasefire", "peace agreement", "peace process",
    "confidence-building measures", "military deterrence",
    "cyber warfare", "information warfare", "hybrid warfare",
    // Neurosciences et comportement B2
    "dopamine", "serotonin", "cortisol", "oxytocin",
    "fight-or-flight response", "chronic stress", "trauma response",
    "cognitive load", "attention span", "multitasking myth",
    "sleep deprivation", "circadian rhythm", "neuroplasticity",
    "habit loop", "reward circuit",
    // Droit international avancé B2
    "international humanitarian law", "law of armed conflict",
    "Geneva Convention", "refugee convention", "non-refoulement",
    "universal jurisdiction", "diplomatic immunity",
    "international criminal court", "war crimes tribunal",
    "sanctions regime", "asset freeze", "travel ban",
    // Philosophie pratique B2
    "moral dilemma", "ethical framework", "normative ethics",
    "applied ethics", "professional ethics", "code of conduct",
    "whistleblowing", "moral courage", "integrity",
    "accountability", "transparency", "governance",
  ],

  C1: [
    // Vocabulaire académique
    "epistemology", "ontology", "dialectic", "hermeneutics",
    "empiricism", "rationalism", "idealism", "materialism",
    "positivism", "phenomenology", "axiology", "teleology",
    "syllogism", "axiom", "theorem", "postulate", "corollary",
    "paradigm", "heuristic", "taxonomy", "lexicon", "corpus",
    "semiotics", "pragmatics", "morphology", "phonology",
    // Analyse et critique
    "juxtaposition", "dichotomy", "paradox", "ambiguity", "nuance",
    "connotation", "denotation", "subtext", "implication",
    "inference", "extrapolation", "interpolation",
    "contextualization", "deconstruction", "abstraction",
    "generalization", "particularity", "universality",
    "reductionism", "holism", "determinism", "stochastic",
    "probabilistic", "causal", "correlational",
    // Politique avancée
    "hegemony", "geopolitics", "neoliberalism", "authoritarianism",
    "totalitarianism", "federalism", "devolution",
    "technocracy", "plutocracy", "oligarchy", "meritocracy",
    "constitutionalism", "judicial review", "legislative process",
    "electoral college", "proportional representation",
    "gerrymandering", "filibuster", "bicameral", "unicameral",
    "supranational", "intergovernmental",
    // Sciences sociales
    "socialization", "stratification", "social mobility",
    "cultural capital", "habitus", "ideology", "alienation",
    "commodification", "cosmopolitanism", "intersectionality",
    "positionality", "standpoint theory", "discourse analysis",
    "ethnography", "qualitative research", "quantitative research",
    "longitudinal study", "meta-analysis", "peer review",
    "replication crisis", "sampling bias", "confounding variable",
    // Sciences naturelles avancées
    "thermodynamics", "electromagnetism", "quantum mechanics",
    "relativity", "cosmology", "neuroscience", "genomics",
    "proteomics", "nanotechnology", "biotechnology",
    "synthetic biology", "cognitive science", "astrophysics",
    "biochemistry", "bioinformatics", "epigenetics", "proteome",
    "metabolomics", "stem cell", "CRISPR", "gene editing",
    "immunotherapy", "mRNA vaccine",
    // Économie avancée
    "fiscal stimulus", "quantitative easing", "stagflation",
    "hyperinflation", "deflation", "balance of payments",
    "current account", "capital account", "trade surplus",
    "sovereign debt", "credit rating", "yield curve",
    "monetary union", "optimum currency area", "Keynesian",
    "neoclassical economics", "behavioral economics",
    "game theory", "Nash equilibrium", "moral hazard",
    "adverse selection", "information asymmetry",
    // Technologie de pointe
    "transhumanism", "superintelligence", "neuromorphic",
    "quantum computing", "edge computing", "digital twin",
    "metaverse", "decentralized finance", "non-fungible token",
    "autonomous vehicle", "brain-computer interface",
    "generative AI", "large language model", "diffusion model",
    "reinforcement learning", "transfer learning",
    "natural language processing", "computer vision",
    "explainable AI", "algorithmic bias", "digital sovereignty",
    // Droit international
    "jurisdiction", "extradition", "asylum", "statelessness",
    "jus cogens", "customary law", "treaty obligation",
    "reparations", "war crimes", "crimes against humanity",
    "international criminal court", "universal jurisdiction",
    "diplomatic immunity", "consular rights", "non-refoulement",
    "right of return", "self-determination", "territorial integrity",
    // Arts et littérature avancés
    "anachronism", "catharsis", "denouement", "diegesis",
    "ekphrasis", "epistolary", "intertextuality", "leitmotif",
    "metafiction", "pastiche", "polyphony", "stream of consciousness",
    "sublime", "tragicomedy", "unreliable narrator",
    "dramatic irony", "soliloquy", "mise en scène",
    "cinematography", "montage", "auteur theory",
    "postcolonial literature", "magical realism", "dystopia",
    "utopia", "speculative fiction",
    // Psychologie clinique avancée
    "psychoanalysis", "cognitive behavioral therapy",
    "neuroplasticity", "psychopathology", "dissociation",
    "narcissism", "borderline personality", "attachment theory",
    "developmental psychology", "metacognition",
    "executive function", "working memory", "implicit bias",
    "social cognition", "theory of mind", "neuropsychology",
    "psychometrics", "behavioral genetics",
    // Linguistique
    "syntax", "semantics", "pragmatics", "sociolinguistics",
    "code-switching", "lingua franca", "pidgin", "creole",
    "diglossia", "lexicography", "etymology", "neologism",
    "euphemism", "dysphemism", "doublespeak", "register",
    "idiolect", "dialect continuum", "language acquisition",
    "universal grammar", "language death", "revitalization",
    // Environnement C1
    "geoengineering", "rewilding", "ecosystem services",
    "biome", "ecological niche", "biomagnification",
    "eutrophication", "anthropocene", "sixth extinction",
    "planetary boundaries", "nitrogen cycle", "carbon sequestration",
    "ocean acidification", "permafrost thaw", "albedo effect",
    "thermohaline circulation", "monsoon disruption",
    // Leadership et management
    "strategic thinking", "systemic approach", "organizational culture",
    "transformational leadership", "servant leadership",
    "agile methodology", "stakeholder management",
    "crisis management", "change management",
    "succession planning", "corporate governance",
    "ethical leadership", "emotional intelligence",
    "negotiation strategy", "conflict resolution",
    "organizational behavior", "knowledge management",
    // Philosophie avancée
    "epistemological crisis", "ontological argument",
    "categorical imperative", "social contract", "veil of ignorance",
    "original position", "communitarianism",
    "egalitarianism", "cosmopolitan justice",
    "recognition theory", "deliberative democracy",
    "civil disobedience", "nonviolent resistance",
    "moral philosophy", "applied ethics", "bioethics",
    "environmental ethics", "technology ethics",
    // Rhétorique et discours C1
    "ethos", "pathos", "logos", "chiasmus", "anaphora", "epistrophe",
    "antithesis", "parallelism", "hyperbole", "understatement",
    "litotes", "circumlocution", "oxymoron", "invective",
    "encomium", "polemic", "manifesto", "treatise", "exegesis",
    "hermeneutic circle", "close reading", "textual analysis",
    // Théorie littéraire C1
    "intertextuality", "polyphony", "stream of consciousness",
    "unreliable narrator", "dramatic irony", "mise en abyme",
    "auteur theory", "magical realism", "dystopian fiction",
    "postcolonial literature", "ecocriticism", "narratology",
    "structuralism", "post-structuralism", "deconstruction",
    "reader-response theory", "new historicism",
    // Neurosciences avancées C1
    "prefrontal cortex", "amygdala", "hippocampus",
    "default mode network", "long-term potentiation",
    "synaptic pruning", "myelination", "neurotransmitter",
    "dopamine pathway", "serotonin", "GABA", "acetylcholine",
    "neurogenesis", "neurodegeneration", "plasticity window",
    "connectome", "brain mapping", "fMRI", "EEG",
    // Économie politique C1
    "Keynesian economics", "monetarism", "supply-side economics",
    "fiscal multiplier", "crowding out effect", "liquidity trap",
    "monetary base", "fractional reserve banking",
    "modern monetary theory", "helicopter money",
    "unconventional monetary policy", "forward guidance",
    "secular stagnation", "financialization", "rentier capitalism",
    // Méthodologie de recherche C1
    "thesis statement", "counterargument", "rebuttal", "concession",
    "hedging language", "academic register", "scholarly discourse",
    "annotated bibliography", "literature review",
    "theoretical framework", "conceptual framework",
    "research design", "sampling strategy", "triangulation",
    "epistemological position", "ontological stance",
    "axiomatic system", "falsifiability", "operationalization",
    // Sciences avancées C1
    "thermodynamic equilibrium", "entropy", "quantum entanglement",
    "wave-particle duality", "Heisenberg uncertainty principle",
    "general relativity", "dark matter", "dark energy",
    "string theory", "multiverse", "Higgs boson",
    "CRISPR gene editing", "mRNA technology", "proteomics",
    "metabolomics", "systems biology", "synthetic biology",
    // Politique avancée C1
    "political ontology", "securitization theory",
    "constructivism", "realism", "liberal institutionalism",
    "critical theory", "postcolonial theory", "feminist theory",
    "normative theory", "descriptive theory", "prescriptive theory",
    "path dependency", "punctuated equilibrium",
    "deliberative polling", "participatory democracy",
    "liquid democracy", "epistocracy",
    // Linguistique avancée C1
    "universal grammar", "generative grammar", "transformational grammar",
    "phrase structure", "deep structure", "surface structure",
    "semantic compositionality", "pragmatic inference",
    "Gricean maxims", "speech act theory", "illocutionary force",
    "perlocutionary effect", "language universals",
    "typological diversity", "language relativity", "Sapir-Whorf",
    // Éthique avancée C1
    "trolley problem", "doctrine of double effect",
    "principle of utility", "difference principle",
    "capabilities approach", "relational autonomy",
    "care ethics", "virtue ethics", "contractarianism",
    "metaethics", "normative ethics", "descriptive ethics",
    "moral realism", "moral anti-realism", "constructivism",
    "expressivism", "error theory",
    // Civilisation et histoire C1
    "historiography", "historical revisionism", "oral history",
    "material culture", "symbolic capital", "collective memory",
    "trauma studies", "memory politics", "transitional justice",
    "truth and reconciliation", "restorative justice",
    "genocide studies", "subaltern studies",
    "world-systems theory", "dependency theory",
    // Philosophie de l'esprit C1
    "qualia", "phenomenal consciousness", "hard problem of consciousness",
    "physicalism", "property dualism", "panpsychism",
    "eliminative materialism", "token identity theory",
    "multiple realizability", "functionalism", "computationalism",
    "extended mind theory", "enactivism", "embodied cognition",
    "intentionality", "aboutness", "representationalism",
    // Économie comportementale C1
    "bounded rationality", "satisficing", "prospect theory",
    "loss aversion", "status quo bias", "sunk cost fallacy",
    "mental accounting", "hyperbolic discounting", "time inconsistency",
    "nudge theory", "choice architecture", "libertarian paternalism",
    "default option", "opt-in versus opt-out",
    // Théorie politique avancée C1
    "agonistic pluralism", "radical democracy",
    "post-democracy", "oligarchic drift", "democratic backsliding",
    "competitive authoritarianism", "illiberal democracy",
    "populist radical right", "far-left extremism",
    "political polarization", "affective polarization",
    "epistemic bubble", "motivated reasoning",
    // Études culturelles C1
    "cultural imperialism", "soft power projection",
    "cultural appropriation", "cultural hybridity",
    "third culture", "creolization", "syncretism",
    "orientalism", "occidentalism", "ethnocentrism",
    "cultural relativism", "universalism versus particularism",
    // Méthodologie avancée C1
    "grounded theory", "discourse analysis",
    "critical discourse analysis", "thematic analysis",
    "content analysis", "narrative analysis", "phenomenological study",
    "ethnomethodology", "conversation analysis",
    "mixed methods research", "action research",
    "participatory action research",
    // Philosophie du langage C1
    "speech act", "illocutionary act", "perlocutionary act",
    "locutionary act", "pragmatic implicature", "conversational implicature",
    "Gricean maxim", "relevance theory", "deixis",
    "anaphora resolution", "presupposition", "assertion",
    "propositional content", "truth conditions", "possible worlds semantics",
    // Sociologie avancée C1
    "social capital", "bonding capital", "bridging capital",
    "network theory", "weak ties", "structural holes",
    "social network analysis", "diffusion of innovation",
    "tipping point theory", "collective action problem",
    "public goods game", "free rider problem",
    "institutional economics", "transaction cost theory",
    // Arts visuels et nouveaux médias C1
    "generative art", "computational creativity", "interactive installation",
    "immersive experience", "transmedia storytelling",
    "glitch aesthetics", "net art", "digital humanities",
    "cultural analytics", "distant reading", "stylometry",
    // Vocabulaire de précision C1
    "zeitgeist", "weltanschauung", "schadenfreude", "angst",
    "praxis", "dialectical materialism", "reification",
    "fetishism", "alienation of labor", "surplus value",
    "base and superstructure", "ideological state apparatus",
    "repressive state apparatus", "hegemonic discourse",
    "counter-hegemony", "subaltern voice",
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

interface ExistingWord {
  id: string;
  word: string;
  level: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un expert en linguistique anglais-français et en pédagogie des langues.
Pour chaque mot ou expression anglaise fournie, génère un objet JSON avec ces champs :
- "word": le mot/expression anglais tel quel
- "translation": la traduction française la plus courante et utile (concise, sans article)
- "phonetic": la transcription IPA simplifiée (sans les slashes / /)
- "category": une catégorie parmi : animaux, actions, nourriture, couleurs, corps, famille, lieux, objets, nature, temps, descriptions, personnes, arts, social, transport, technologie, santé, concepts, émotions, sciences, économie, politique, droit, éducation, sports, culture, thèmes, linguistique, philosophie, environnement, psychologie
- "emoji": UN seul emoji représentatif pour les mots CONCRETS (objet, animal, lieu, nourriture visible) ; chaîne vide "" pour les mots ABSTRAITS (verbes mentaux, adjectifs, concepts, adverbes, termes techniques)

Règles importantes :
- Mots abstraits (think, justice, freedom, algorithm...) → emoji: ""
- Mots concrets (cat, apple, house, car...) → emoji approprié
- Traduction concise : "voiture" pas "une voiture", "courir" pas "action de courir"
- Phonétique sans slashes : kæt pas /kæt/
- Pour les expressions multi-mots : traiter comme une unité

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

  // Charger les mots existants
  let existingWords: ExistingWord[] = [];
  if (fs.existsSync(outputPath)) {
    existingWords = JSON.parse(fs.readFileSync(outputPath, "utf-8")) as ExistingWord[];
    console.log(`📂 ${existingWords.length} mots existants chargés`);
  }

  const existingSet = new Set(existingWords.map((w) => w.word.toLowerCase()));
  const allWords: object[] = [...existingWords];
  let globalIndex = existingWords.length;

  let totalNew = 0;
  for (const [level, words] of Object.entries(SEED_WORDS)) {
    const newWords = words.filter((w) => !existingSet.has(w.toLowerCase()));
    totalNew += newWords.length;
  }
  console.log(`🆕 ${totalNew} nouveaux mots à générer\n`);

  for (const [level, words] of Object.entries(SEED_WORDS)) {
    const newWords = words.filter((w) => !existingSet.has(w.toLowerCase()));
    if (newWords.length === 0) {
      console.log(`✓ Niveau ${level} : déjà complet`);
      continue;
    }

    console.log(`\n🔤 Niveau ${level} — ${newWords.length} nouveaux mots`);
    const batchSize = 50;

    for (let i = 0; i < newWords.length; i += batchSize) {
      const batch = newWords.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(newWords.length / batchSize);
      console.log(`  📦 Batch ${batchNum}/${totalBatches} (${batch.length} mots)...`);

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
        existingSet.add(item.word.toLowerCase());
      }

      // Sauvegarde après chaque batch
      fs.writeFileSync(outputPath, JSON.stringify(allWords, null, 2), "utf-8");

      if (i + batchSize < newWords.length) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    const levelCount = (allWords as ExistingWord[]).filter((w) => w.level === level).length;
    console.log(`  💾 Niveau ${level} total: ${levelCount} mots (fichier: ${allWords.length})`);
  }

  // Résumé final
  const byLevel = (allWords as ExistingWord[]).reduce<Record<string, number>>((acc, w) => {
    acc[w.level] = (acc[w.level] || 0) + 1;
    return acc;
  }, {});

  console.log("\n✅ Génération terminée !");
  console.log(`📊 Total: ${allWords.length} mots`);
  for (const [lvl, count] of Object.entries(byLevel)) {
    console.log(`   ${lvl}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
