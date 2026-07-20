import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HfInference } from '@huggingface/inference';

dotenv.config();

// Bypass automatic Google Cloud Metadata checks on hosted VMs (like Render)
// to prevent conflicting OAuth 2 access token header injections
process.env.GCP_METADATA_HOST = '127.0.0.1';
process.env.GCE_METADATA_HOST = '127.0.0.1';
process.env.NO_GCE_CHECK = 'true';

// Sanitize environment variables to prevent Google Gen AI SDK from automatically
// detecting GCP VM credentials and failing with ACCESS_TOKEN_TYPE_UNSUPPORTED
const conflictingGcpKeys = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_GCLOUD_ADC_PATH',
  'GOOGLE_API_KEY',
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_CLOUD_LOCATION',
  'GCP_PROJECT',
  'GCP_PROJECT_ID'
];
conflictingGcpKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`Sanitizing/removing conflicting environment variable: ${key}`);
    delete process.env[key];
  }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const isOfflineMode = !apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '';

if (isOfflineMode) {
  console.warn("WARNING: No GEMINI_API_KEY configured. Server is running in OFFLINE DEMO MODE.");
}

const ai = isOfflineMode ? null : new GoogleGenAI({ apiKey });

async function generateContentWithRetry(params, retries = 2, delay = 1000) {
  if (isOfflineMode) return null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = err.status || (err.error && err.error.code);
      const isTransient = status === 503 || status === 429 || (err.message && err.message.toLowerCase().includes("demand"));
      if (isTransient && i < retries) {
        console.warn(`Gemini call failed with transient error (status ${status}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

// Initialize Firebase Admin or Fallback Database
let firestoreDb = null;
const LOCAL_DB_PATH = path.resolve('portfolio_db.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firestoreDb = admin.firestore();
    console.log("Firebase Admin initialized via service account JSON.");
  } catch (err) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON, using local DB:", err);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    firestoreDb = admin.firestore();
    console.log("Firebase Admin initialized via applicationDefault.");
  } catch (err) {
    console.error("Error loading application default credentials, using local DB:", err);
  }
} else {
  console.log("No Firebase config found. Initializing local JSON database fallback.");
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([]));
  }
}

// ----------------------------------------------------
// Local DB Helpers
// ----------------------------------------------------
function readLocalDB() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeLocalDB(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// ----------------------------------------------------
// Offline Datasets for Demo Mode Only (When NO key is provided)
// ----------------------------------------------------
const offlineScenarios = {
  "Health & Wellness": {
    "product": {
      title: "The Independent Living Initiative",
      scenario: "Design a physical product that enhances the daily wellness or safety of an individual within their own home.",
      customer_name: "Evelyn Vance",
      customer_role: "Retired Architect",
      customer_persona: "Evelyn is a 74-year-old retired architect living alone in a modernist home she designed herself. She values architectural elegance, proud independence, and hates clinical assistance aids.",
      customer_context: "Evelyn fears losing her independence and being forced into sterile assisted living. She refuses to use standard clinical modifications (like industrial grab bars) because they ruin her home's aesthetic identity. She desires solutions that support safe movement seamlessly without looking clinical.",
      customer_gender: "female",
      customer_age: "senior"
    }
  },
  "Sustainability": {
    "service": {
      title: "Neighborhood Circularity Hub",
      scenario: "Design a service that makes local composting and waste reduction easier for households.",
      customer_name: "Leo Jenkins",
      customer_role: "Community Garden Coordinator",
      customer_persona: "Leo Jenkins, 35, coordinates the community garden. He is community-focused, energetic, and wants to scale composting.",
      customer_context: "Leo is tired of washing moldy bins and sorting neighbor waste. Most neighbors want to do the right thing, but find composting too messy, smelly, and inconvenient for their busy routines. He needs a clean, effortless way to get families participating without smell or chores.",
      customer_gender: "male",
      customer_age: "adult"
    }
  },
  "Education": {
    "app": {
      title: "Micro-Learning for Career Switchers",
      scenario: "Design a mobile app that helps busy, working adults learn new technical skills.",
      customer_name: "Sarah Chen",
      customer_role: "Night-Shift Nurse",
      customer_persona: "Sarah Chen, 29, works exhausting 12-hour night shifts. She is highly motivated to switch to health-tech but has zero continuous free time.",
      customer_context: "Sarah only has 5-10 minute coffee breaks during night shifts. Reading textbooks or watching long video lectures puts her to sleep instantly. She needs a way to make active learning progress in short windows without feeling like another tiring chore.",
      customer_gender: "female",
      customer_age: "adult"
    }
  }
};

const offlineDialogues = {
  "Evelyn Vance": {
    qa: [
      { keywords: ["health", "feel", "well"], response: "My health is quite fine, thank you. I keep myself active with watercolor projects and garden work, though I have to be more mindful of my steps." },
      { keywords: ["active", "garden", "walk"], response: "I walk through the house regularly to keep the layout feeling fluid, though I have to admit I've become a bit more deliberate about my footing." },
      { keywords: ["home", "architect", "house"], response: "I designed this home thirty years ago. It is an extension of my identity and architectural legacy, and I refuse to ruin its beauty." },
      { keywords: ["frustrat", "annoy", "difficult"], response: "I'm frustrated by losing the fluid, graceful movement I used to enjoy. Home aids look clinical, and I won't have them in my house." },
      { keywords: ["sterile", "living", "assisted"], response: "I fear being forced into some sterile assisted living home. That drives me to be cautious, but I want tools that support me invisibly." },
      { keywords: ["product", "design", "look"], response: "I care about how my home feels. If changes look clinical or like hospital gear, it would make me feel like I'm losing my dignity." }
    ],
    fallback: "I value independence and architectural beauty. Ask me about my daily habits or feelings about modifications.",
    insights: [
      { text: "Evelyn views her home as an extension of her identity and architectural legacy.", type: "insight" },
      { text: "Mobility is tied to her dignity and sense of control over her environment.", type: "insight" },
      { text: "Fear of being forced into sterile assisted living drives her cautious behavior.", type: "pain_point" },
      { text: "Frustration with losing the fluid, graceful movement she previously enjoyed.", type: "pain_point" },
      { text: "Need for home modifications that maintain aesthetic beauty rather than looking clinical.", type: "need" }
    ],
    feedbacks: [
      { feedback: "A fitness device standing in my living room is intrusive. Unless disguised as art, it's a non-starter.", enthusiasm: "skeptical" },
      { feedback: "An automated walker is far too clinical. It highlights physical limitations rather than supporting fluid movement.", enthusiasm: "skeptical" },
      { feedback: "A subtle wooden balance rail integrated into the wall panels? Now that respects my design aesthetic while aiding balance.", enthusiasm: "excited" }
    ],
    verdict: {
      value: 85,
      creativity: 80,
      uniqueness: 82,
      review: "The proposal for an architectural guide-rail system shows excellent empathy. It serves my need for stability without highlighting any physical limitations or looking clinical."
    }
  },
  "Leo Jenkins": {
    qa: [
      { keywords: ["compost", "waste", "bin"], response: "Composting is vital, but managing smelly bins and washing out moldy waste is really holding participation back." },
      { keywords: ["neighbors", "community", "participat"], response: "Most neighbors want to do the right thing, but they find composting too messy and time-consuming for their busy routines." },
      { keywords: ["annoy", "frustrat", "problem"], response: "Dealing with individual smelly bins and plastic contamination is exhausting. We need a clean, centralized solution." },
      { keywords: ["service", "work", "delivery"], response: "I don't know how it should be structured. I just know that if it adds more than a minute of work or creates a mess, neighbors will refuse to participate." }
    ],
    fallback: "Composting is great, but convenience is key. Ask about neighbor habits or my frustrations with the current setup.",
    insights: [
      { text: "Leo sees community engagement as the key to long-term sustainability.", type: "insight" },
      { text: "Cleanliness and convenience are the biggest barriers to neighbors adopting composting.", type: "need" },
      { text: "Frustration with lack of participation from busy families who find sorting compost too time-consuming.", type: "pain_point" },
      { text: "Need for a centralized, well-managed system rather than individual responsibilities.", type: "need" }
    ],
    feedbacks: [
      { feedback: "A sorting guide app doesn't solve the smell. Neighbors will still find it too messy.", enthusiasm: "skeptical" },
      { feedback: "An organic waste pickup service with clean bin swapping sounds amazing. That solves the convenience barrier.", enthusiasm: "excited" },
      { feedback: "Paying neighbors to compost is unsustainable. We need community pride, not financial gimmicks.", enthusiasm: "neutral" }
    ],
    verdict: {
      value: 80,
      creativity: 75,
      uniqueness: 78,
      review: "The localized clean-swap bin service hits the nail on the head. It directly targets the odor and convenience pain points, ensuring high adoption."
    }
  },
  "Sarah Chen": {
    qa: [
      { keywords: ["nurse", "hospital", "shift"], response: "I work 12-hour night shifts. I'm exhausted afterward, which makes traditional classes impossible to follow." },
      { keywords: ["learn", "code", "study"], response: "I try to watch video tutorials, but I fall asleep instantly. I need hands-on, bite-sized practice." },
      { keywords: ["time", "busy", "schedule"], response: "I only have small 5-10 minute gaps of time during my coffee breaks. That's my only window." },
      { keywords: ["app", "screen", "mobile"], response: "Honestly, I don't care about the format. I just need something that actually keeps me awake and engaged during my 10-minute break windows." }
    ],
    fallback: "Learning code is my ticket to health-tech, but energy is low. Ask me about study blocks or shift routines.",
    insights: [
      { text: "Sarah wants to switch to tech but has zero continuous free blocks of time.", type: "insight" },
      { text: "Hands-on exercises are more engaging than reading or watching videos.", type: "need" },
      { text: "Needs positive reinforcement and simple reminders to build a daily habit.", type: "need" },
      { text: "Exhausted after long nursing shifts, making it hard to concentrate on dry textbooks.", type: "pain_point" }
    ],
    feedbacks: [
      { feedback: "Flashcards are too passive. I need to write actual code snippets to learn.", enthusiasm: "skeptical" },
      { feedback: "A compiler that runs on mobile with gamified levels and instant feedback is perfect for my 10-minute breaks.", enthusiasm: "excited" },
      { feedback: "A peer mentoring program is hard to schedule. I can't align time slots with my night shifts.", enthusiasm: "skeptical" }
    ],
    verdict: {
      value: 88,
      creativity: 82,
      uniqueness: 85,
      review: "A gamified micro-coding compiler is exactly what I need. It fits perfectly into 10-minute shifts, keeping me awake and learning actively."
    }
  }
};

function assignCustomerImage(challenge) {
  const gender = (challenge.customer_gender || "female").toLowerCase();
  const age = (challenge.customer_age || "adult").toLowerCase();
  const name = challenge.customer_name || "Customer";

  const avatarMap = {
    female: {
      young: ["avatar_female_young_0.png", "avatar_female_young_8.png"],
      adult: ["avatar_female_adult_4.png", "avatar_female_adult_6.png"],
      senior: ["avatar_female_senior_2.png"]
    },
    male: {
      young: ["avatar_male_young_3.png"],
      adult: ["avatar_male_adult_1.png", "avatar_male_adult_5.png", "avatar_male_adult_7.png"],
      senior: ["avatar_male_senior_9.png"]
    }
  };

  const genderList = avatarMap[gender] || avatarMap.female;
  const list = genderList[age] || genderList.adult;

  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const file = list[sum % list.length];
  return `/avatars/${file}`;
}

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

// 1. Generate Challenge
app.post('/api/challenge', async (req, res) => {
  const { domain } = req.body;

  if (isOfflineMode) {
    const domainScenarios = offlineScenarios[domain] || {};
    const firstScenario = Object.values(domainScenarios)[0];
    if (firstScenario) {
      const copy = { ...firstScenario };
      copy.customer_image = assignCustomerImage(copy);
      return res.json(copy);
    }
    const fallback = {
      title: `${domain} Sprint Challenge`,
      scenario: `Design a solution resolving needs in ${domain}.`,
      customer_name: "Alex Taylor",
      customer_role: "End User",
      customer_persona: "Alex is a busy user seeking simplified experiences.",
      customer_context: "Alex is easily overwhelmed by complexity and values clean, elegant workflows.",
      customer_gender: "male",
      customer_age: "adult"
    };
    fallback.customer_image = assignCustomerImage(fallback);
    return res.json(fallback);
  }

  const randomSeed = Math.random().toString(36).substring(7);
  const prompt = `You are a design thinking game master. Generate ONE compelling, realistic design challenge for a player to solve.

[RANDOM SEED: ${randomSeed}]

PLAYER-CHOSEN PARAMETERS:
- Domain: ${domain}

Requirements:
- A real-world design problem in the "${domain}" domain. Keep the challenge title and scenario BROAD, intuitive, and extremely easy for anyone to understand at a glance.
- PUNCHY & SIMPLE LANGUAGE: Write in plain, everyday English. Do NOT use academic, dry, corporate, or technical jargon (e.g., avoid terms like "closing the loop", "waste management practices", "municipal infrastructure", "decentralized networks", "optimization"). Keep the scenario description under 2 sentences.
- Open-Ended Challenge: Do NOT force any solution format (like an app, product, or service). The challenge must be open-ended, allowing the player to design any solution that helps the customer.
- Do NOT reveal the customer's specific frustrations, needs, or pain points in the scenario. Those must be discovered through the interview.
- "customer_persona" is the ONLY thing the player sees about the customer up front. It MUST be a neutral, high-level introduction: their name, age, role/profession, and a sentence or two of general context (where they work, their lifestyle broadly). Do NOT mention any frustrations, problems, struggles, pain points, needs, desires, or what they wish were different. The player should learn those only by interviewing.
- "customer_context" is internal context the LLM uses to answer interview questions and rate ideas consistently as this customer. Put ALL the rich detail here: their hidden frustrations, specific needs, deal-breakers, budget concerns, daily life details, emotional drivers, and what they secretly wish existed. The player NEVER sees this field.
- NO SOLUTIONS IN INTERVIEW: The customer's context and behavior must only focus on their daily life, feelings, and frustrations. Never mention, suggest, or discuss specific solutions, technology formats, or product features.
- DIVERSITY: Ensure the customer name, age, specific profession, and background vary widely. Choose from a rich set of unique names and distinct roles (e.g. students, retail managers, elderly gardeners, night security guards, etc.) to keep the game fresh. Never generate the same name or profile twice.
- customer_gender: Strictly set to 'male' or 'female' to match their name.
- customer_age: Strictly set to 'young', 'adult', or 'senior' to match their age and profession.
`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        temperature: 1.0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            scenario: { type: "STRING" },
            customer_name: { type: "STRING" },
            customer_role: { type: "STRING" },
            customer_persona: { type: "STRING" },
            customer_context: { type: "STRING" },
            customer_gender: { type: "STRING", enum: ["male", "female"] },
            customer_age: { type: "STRING", enum: ["young", "adult", "senior"] }
          },
          required: ["title", "scenario", "customer_name", "customer_role", "customer_persona", "customer_context", "customer_gender", "customer_age"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    data.customer_image = assignCustomerImage(data);
    res.json(data);
  } catch (err) {
    console.error("Generate Challenge error:", err);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// 2. Chat / Answer as Customer
app.post('/api/chat', async (req, res) => {
  const { challenge, question, priorQA } = req.body;

  if (isOfflineMode) {
    const db = offlineDialogues[challenge.customer_name];
    if (db) {
      const query = question.toLowerCase();
      const match = db.qa.find(qa => qa.keywords.some(k => query.includes(k)));
      if (match) {
        return res.json({ answer: match.response });
      }
      return res.json({ answer: db.fallback });
    }
    return res.json({ answer: "That is an interesting question, tell me more." });
  }

  const systemInstruction = `You are role-playing as a potential customer being interviewed for a design challenge. Stay strictly in character and answer as this person would — based on your personality, life, and priorities.

CHARACTER DETAILS:
Name: ${challenge.customer_name}
Role: ${challenge.customer_role}
Persona: ${challenge.customer_persona}
Internal context (your hidden priorities, daily routines, feelings, and frustrations): ${challenge.customer_context}

RULES OF CONVERSATION:
- Answer as this customer in first person. Do not break character or mention being an AI.
- Be conversational, warm, and natural. Respond in 1 to 3 short, simple sentences.
- PROGRESSIVE DISCLOSURE: Do NOT dump all your frustrations, context, or needs at once! Answer ONLY the specific question asked. If the question is broad or open-ended (e.g., "what is it like" or "tell me about yourself"), give a general high-level overview of your day. Only reveal specific pain points, numbers, or emotional needs when the user asks targeted follow-up questions probing those exact topics.
- Keep each response focused on a single topic or point. Do not mix multiple frustrations or needs in a single turn.
- Naturally hint that there's more beneath the surface (e.g., say "It gets pretty hectic around lunch" instead of explaining all the cleanup issues) so good follow-up questions feel rewarding and necessary.
- NO SOLUTIONS ALLOWED: You MUST ONLY talk about your daily experiences, routines, frustrations, feelings, and needs. NEVER suggest, propose, or discuss specific solutions, technology formats (like a mobile app, website, or physical device), or product features. If the designer asks about a solution, refocus on how it affects your feelings, daily life, or needs.
- Stay consistent with your internal context.`;

  const contents = [];
  if (priorQA && priorQA.length > 0) {
    priorQA.forEach(qa => {
      contents.push({ role: 'user', parts: [{ text: qa.question }] });
      contents.push({ role: 'model', parts: [{ text: qa.answer }] });
    });
  }
  contents.push({ role: 'user', parts: [{ text: question }] });

  console.log("=== CHAT INPUT ===");
  console.log("System Instruction:", systemInstruction);
  console.log("Question:", question);

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 1024,
        temperature: 0.7
      }
    });
    console.log("=== CHAT RESPONSE ===");
    console.log("Returned Text:", response.text);
    res.json({ answer: response.text.trim() });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// 3. Synthesize Insights (Insight Wall)
app.post('/api/insights', async (req, res) => {
  const { challenge, qa } = req.body;

  if (isOfflineMode) {
    const db = offlineDialogues[challenge.customer_name];
    if (db) return res.json({ insights: db.insights });
    return res.json({
      insights: [
        { text: "Wants simplified workflows.", type: "insight" },
        { text: "Exhausted by complex interfaces.", type: "pain_point" },
        { text: "Needs faster, friction-free settings.", type: "need" }
      ]
    });
  }

  const transcript = qa.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join("\n\n");
  const prompt = `You are a design researcher. A designer just interviewed a potential customer. Synthesize the interview into concise "sticky notes" (minimum 0, maximum 7) capturing the most important things to remember for ideation.

CUSTOMER: ${challenge.customer_name} (${challenge.customer_role})

INTERVIEW TRANSCRIPT:
${transcript}

Rules:
- STRICT GROUNDING: Base notes ONLY on what the customer actually said in the provided INTERVIEW TRANSCRIPT. Do NOT invent, assume, or extrapolate any information.
- If the transcript is empty, contains only greeting exchanges, or contains no meaningful details/frustrations/needs, you MUST return an empty list of insights (i.e., return "insights": []).
- Each "text" must be short and punchy — like a real post-it note, max ~14 words.
- Classify each as one of: "insight" (a notable realization/behavior), "pain_point" (a frustration or obstacle), "need" (a latent need or wish).
- NO SOLUTIONS: Ensure these stickies represent user insights, pain points, or needs, NOT solutions or technology features.
`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            insights: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING" },
                  type: { type: "STRING", enum: ["insight", "pain_point", "need"] }
                },
                required: ["text", "type"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (err) {
    console.error("Synthesize Insights error:", err);
    res.status(500).json({ error: "Failed to synthesize insights" });
  }
});

// 4. Get Idea Feedback
app.post('/api/feedback', async (req, res) => {
  const { challenge, ideas } = req.body;

  if (isOfflineMode) {
    const db = offlineDialogues[challenge.customer_name];
    if (db) {
      return res.json({
        feedbacks: [
          { feedback: db.feedbacks[0].feedback, enthusiasm: db.feedbacks[0].enthusiasm },
          { feedback: db.feedbacks[1].feedback, enthusiasm: db.feedbacks[1].enthusiasm },
          { feedback: db.feedbacks[2].feedback, enthusiasm: db.feedbacks[2].enthusiasm }
        ]
      });
    }
    return res.json({
      feedbacks: [
        { feedback: "This does not seem to address my daily struggles directly.", enthusiasm: "skeptical" },
        { feedback: "It is an interesting approach, let's explore it further.", enthusiasm: "interested" },
        { feedback: "This is a great idea and seems very aligned with what I need!", enthusiasm: "excited" }
      ]
    });
  }

  const ideasText = ideas.map((idea, i) => `Idea ${i + 1}: ${idea}`).join("\n");
  const prompt = `You are role-playing as this potential customer. A designer is sharing ${ideas.length} ideas with you to get your honest reaction.

DESIGN CHALLENGE: ${challenge.title} — ${challenge.scenario}

YOUR CHARACTER:
Name: ${challenge.customer_name}
Role: ${challenge.customer_role}
Persona: ${challenge.customer_persona}
Internal context: ${challenge.customer_context}

THE DESIGNER'S IDEAS:
${ideasText}

For EACH idea (in order), give honest, specific feedback from your perspective as this customer — what you love, what concerns you, what's missing. Respond in 2 sentences or less. Match the "enthusiasm" to how you actually feel about that idea.
`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            feedbacks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  feedback: { type: "STRING" },
                  enthusiasm: { type: "STRING", enum: ["excited", "interested", "neutral", "skeptical"] }
                },
                required: ["feedback", "enthusiasm"]
              }
            }
          },
          required: ["feedbacks"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (err) {
    console.error("Get Idea Feedback error:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// 5. Rate Final Concept
app.post('/api/rate', async (req, res) => {
  const { challenge, concept } = req.body;

  if (isOfflineMode) {
    const db = offlineDialogues[challenge.customer_name];
    if (db) return res.json(db.verdict);
    return res.json({
      value: 75,
      creativity: 80,
      uniqueness: 72,
      review: "A solid final proposal that covers my workflow needs. Good job exploring these directions!"
    });
  }

  const conceptText = typeof concept === "string"
    ? concept
    : "USER PROBLEM: " + concept.problem + " | SOLUTION OVERVIEW: " + concept.solutionOverview + " | KEY FEATURES: " + (concept.features || []).map(function (f, i) { return (i + 1) + ". " + f.title + ": " + f.description; }).join("; ");

  const prompt = `You are role-playing as this potential customer. The designer has iterated and is presenting their FINAL concept to you. Rate it honestly from your perspective as this customer.

DESIGN CHALLENGE: ${challenge.title} — ${challenge.scenario}

YOUR CHARACTER:
Name: ${challenge.customer_name}
Role: ${challenge.customer_role}
Persona: ${challenge.customer_persona}
Internal context: ${challenge.customer_context}

THE DESIGNER'S FINAL CONCEPT:
${conceptText}

Rate this concept on three dimensions, each 1-100, based on how it lands for YOU as this customer.
CRITICAL RULES FOR ACCURACY:
- Compare the concept strictly against YOUR actual problems, frustrations, and needs described in your "Internal context" above.
- If the concept does NOT solve your main frustrations, is unrelated to the design challenge, or is a generic distraction (like a binge watching app for a teacher wanting nutrition/time help), you MUST score the value_score extremely low (below 35).
- Do not be nice or give pity scores if the solution is off-topic. A high score should only be given if the designer solves your specific problems.
- value_score: How much it solves a real problem you actually have and would pay/use for.
- creativity_score: How inventive and fresh the approach feels.
- uniqueness_score: How differentiated it is from existing solutions on the market.

Then write a short, in-character review (2-4 sentences) as this customer reacting to the final concept, explaining why the concept is or isn't relevant to your needs.
`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            value_score: { type: "INTEGER" },
            creativity_score: { type: "INTEGER" },
            uniqueness_score: { type: "INTEGER" },
            review: { type: "STRING" }
          },
          required: ["value_score", "creativity_score", "uniqueness_score", "review"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    res.json({
      value: data.value_score,
      creativity: data.creativity_score,
      uniqueness: data.uniqueness_score,
      review: data.review
    });
  } catch (err) {
    console.error("Rate Concept error:", err);
    res.status(500).json({ error: "Failed to evaluate concept" });
  }
});

// Helper to proxy fetch an external image and return it as a Base64 data URL to prevent browser CORS/ad-blocker blocks
async function fetchAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: status ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
}

// Unified multi-tier image generator cascade (No Pollinations AI fallback, strictly shows errors if keys fail)
async function generateImageBase64(prompt, width = 400, height = 300) {
  const deepinfraApiKey = process.env.DEEPINFRA_API_KEY;
  const hfApiKey = process.env.HF_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Tier 1: DeepInfra (FLUX-1-dev) - highest quality
  if (deepinfraApiKey) {
    try {
      console.log("Attempting DeepInfra FLUX-1-dev generation...");
      const response = await fetch("https://api.deepinfra.com/v1/openai/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${deepinfraApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX-1-dev",
          prompt: prompt,
          size: `${width}x${height}`,
          n: 1,
          response_format: "b64_json"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const base64Image = data.data?.[0]?.b64_json;
        if (base64Image) {
          console.log("DeepInfra generation successful!");
          return `data:image/jpeg;base64,${base64Image}`;
        }
      } else {
        const text = await response.text();
        console.warn(`DeepInfra failed with status ${response.status}: ${text}`);
      }
    } catch (err) {
      console.warn("DeepInfra generation failed, trying next tier:", err.message);
    }
  }

  // Tier 2: Google AI Studio (Imagen)
  if (!isOfflineMode && geminiApiKey) {
    try {
      console.log("Attempting Google AI Studio Imagen generation...");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: width === height ? '1:1' : '4:3'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const base64Image = data.generatedImages?.[0]?.image?.imageBytes;
        if (base64Image) {
          console.log("Google AI Studio generation successful!");
          return `data:image/jpeg;base64,${base64Image}`;
        }
      } else {
        console.warn(`Google API failed with status ${response.status}`);
      }
    } catch (err) {
      console.warn("Google AI Studio generation failed, trying next tier:", err.message);
    }
  }

  // Tier 3: Hugging Face (FLUX.1-schnell via HfInference SDK)
  if (hfApiKey) {
    try {
      console.log("Attempting Hugging Face FLUX.1-schnell generation via SDK...");
      const hf = new HfInference(hfApiKey);
      const blob = await hf.textToImage({
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt
      });
      const buffer = await blob.arrayBuffer();
      console.log("Hugging Face FLUX.1 generation successful!");
      return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    } catch (err) {
      console.warn("Hugging Face SDK generation failed:", err.message);
      throw err;
    }
  }

  throw new Error("No image generation API keys available or all generators failed.");
}

// Helper to use Gemini to translate concept info into descriptive vector graphic prompts and classify if it is a mobile app
async function expandConceptVisualPrompt(conceptName, solutionOverview, features = []) {
  if (isOfflineMode) {
    const lower = (solutionOverview || "").toLowerCase() + " " + (conceptName || "").toLowerCase();
    const isApp = lower.includes("app") || lower.includes("mobile") || lower.includes("web") || lower.includes("software") || lower.includes("screen") || lower.includes("planner");
    return {
      isApp,
      visualSnippet: isApp ? "a clean food cover plate symbol next to a stopwatch icon" : "a modern functional design logo",
      typographySnippet: "flowing, modern artistic script font with clean, elegant hand-lettered flourishes",
      vibe: isApp ? "tech" : "organic"
    };
  }

  const featuresText = Array.isArray(features) && features.length > 0 
    ? features.map((f, i) => `- Feature ${i+1} (${f.title}): ${f.description}`).join("\n") 
    : "";

  try {
    const prompt = `You are a logo designer. Translate the following product concept into a centered, modern flat 2D vector brand logo layout.
RULES:
1. Describe a single, simple, minimalist vector symbol (e.g., "a stopwatch with a leaf symbol", or "a silver cloche with sparkles"). Keep it extremely short (under 6 words). DO NOT describe it as "centered" or "symmetrical".
2. DO NOT use abstract metaphors, sci-fi, or fantasy concepts (e.g., NO 'orbs', 'pulses', 'magic glows', 'hologram', 'nebula', 'energy waves', 'magical effects').
3. DO NOT include any text, labels, numbers, letters, or layout words inside the visualSnippet description. It must specify visual objects and shapes ONLY.
4. DO NOT describe any physical phones, device frames, bezels, notches, app screens, layouts, dashboards, user interfaces, or realistic backgrounds. Keep the visualSnippet purely as a brief 3-5 word label of the symbol itself.
5. Select a highly creative, custom typographic style (font style and layout description) for the typographySnippet that matches the product's name and personality.
6. Classify the concept's personality vibe into one of four values: "tech" (for software, tools, productivity, speed, engineering), "organic" (for wellness, natural, food, community, warmth), "luxury" (for premium, high-end, elegant, calm, classical), or "playful" (for fun, children, games, casual, energetic).

Product Concept Title: "${conceptName}"
Product Concept Overview: "${solutionOverview}"
${featuresText ? `Key Features:\n${featuresText}` : ""}

Respond ONLY with a JSON object in this exact format:
{
  "isApp": true or false,
  "visualSnippet": "brief 3-5 word name of the symbol",
  "typographySnippet": "1-sentence description of the custom typography design style",
  "vibe": "tech" or "organic" or "luxury" or "playful"
}

Do not include markdown tags, code blocks, or extra text.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response?.text;
    if (text) {
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(cleanText);
      if (parsed && typeof parsed.isApp === 'boolean' && parsed.visualSnippet && parsed.typographySnippet && parsed.vibe) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to expand visual prompt with Gemini, using static logic:", err.message);
  }

  // Static fallback if Gemini fails
  const lower = (solutionOverview || "").toLowerCase() + " " + (conceptName || "").toLowerCase();
  const isApp = lower.includes("app") || lower.includes("mobile") || lower.includes("web") || lower.includes("software") || lower.includes("screen") || lower.includes("planner");
  return {
    isApp,
    visualSnippet: isApp ? "a clean food plate symbol next to a delivery vehicle outline" : "a modern geometric design structure with indicators",
    typographySnippet: "flowing, modern artistic script font with clean, elegant hand-lettered flourishes",
    vibe: isApp ? "tech" : "organic"
  };
}

// Helper to translate features into literal icon descriptions to prevent FLUX from rendering text labels
async function expandFeatureVisualPrompt(title, description, domain) {
  if (isOfflineMode) {
    return "a simple geometric symbol";
  }
  const prompt = `You are a design assistant. Translate the following product feature into a 1-sentence description of a creative, simple vector icon.
RULES:
1. Describe a single, literal icon object or creative symbol combination.
2. DO NOT include the feature title, description, or any text/letters in the description. The description must specify visual shapes ONLY.
3. DO NOT use abstract terms (orbs, pulses, glows, magic).
4. The icon description must be strictly for a flat 2D vector graphic. Do not use words like "glowing", "3D", "embossed", "gradient", "realistic", "shaded", "highlights", or "shadows".
5. Be highly creative. Instead of a single boring literal object, suggest combining two simple outline shapes to create a unique visual metaphor.

FEW-SHOT EXAMPLES:
- Feature: "Low Cost" (A cheap price or deal) -> Output: "a simple outline of a price tag combined with a coin slot"
- Feature: "Fun Music" (Plays music or sounds) -> Output: "a musical note symbol integrated with a clean heart shape outline"
- Feature: "Aesthetic" (Beautiful layout) -> Output: "a clean four-pointed sparkle outline star"
- Feature: "Free Plan" (Costs zero dollars) -> Output: "a simple coin outline with a slash mark through the center"
- Feature: "Conversational" (Chat or sound) -> Output: "a speech bubble outline with a small soundwave line inside"

Feature Title: "${title}"
Feature Description: "${description}"
App Domain: "${domain}"

Respond ONLY with a JSON object in this exact format:
{
  "iconSnippet": "1-sentence description of a single simple vector icon combining 1-2 shapes"
}`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response?.text;
    if (text) {
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(cleanText);
      if (parsed && parsed.iconSnippet) {
        return parsed.iconSnippet;
      }
    }
  } catch (err) {
    console.warn("Failed to expand feature prompt:", err.message);
  }
  return "a clean minimalist symbol";
}

// 6. Generate Concept Image using Google AI Studio Imagen 3
app.post('/api/generate-concept-image', async (req, res) => {
  const { solutionOverview, domain, conceptName, features } = req.body;

  // Use Gemini to expand the prompt and classify isApp
  const expansion = await expandConceptVisualPrompt(conceptName, solutionOverview, features);
  console.log("Concept Image visual expansion returned:", expansion);

  // Pure, text-free brand mark icon prompt
  const promptText = `A centered, clean flat 2D vector brand mark icon on a solid deep charcoal (#2B303A) background. The icon features a simple, stylized geometric symbol of: ${expansion.visualSnippet}. Colors: bright electric cyan (#00d4ff) and solid white (#ffffff) accents. Swiss minimalist flat design style, crisp clean outlines, solid shapes, absolutely no text, no letters, no words, no phone mockups, no device frames, no drop shadows.`;

  try {
    // Standardize main logo concept image to a neat, square 1:1 format (1024x1024) for ultimate sharpness
    const url = await generateImageBase64(promptText, 1024, 1024);
    res.json({ url });
  } catch (err) {
    console.error("Concept logo image generation failed:", err);
    res.status(500).json({ error: "Failed to generate concept image" });
  }
});

// 6b. Generate Feature Images using Google AI Studio Imagen 3
app.post('/api/generate-feature-images', async (req, res) => {
  const { features, domain } = req.body;
  try {
    const featuresWithImages = await Promise.all(
      features.map(async (f) => {
        const iconSnippet = await expandFeatureVisualPrompt(f.title, f.description, domain);
        console.log(`Feature icon translation for "${f.title}":`, iconSnippet);
        
        const prompt = `A centered, clean flat 2D vector graphic icon on a solid deep charcoal (#2B303A) background. The icon shows a simple, stylized outline of: ${iconSnippet}. The outline is drawn in solid white (#ffffff) and features a small accent detail drawn in bright electric cyan (#00d4ff). Swiss minimalist flat design style, crisp clean outlines, solid shapes, absolutely no text, no letters, no words, no phone mockups, no drop shadows.`;
        const image_url = await generateImageBase64(prompt, 512, 512);
        return { ...f, image_url };
      })
    );
    res.json({ features: featuresWithImages });
  } catch (err) {
    console.error("Feature image generation failed:", err);
    res.status(500).json({ error: "Failed to generate feature images" });
  }
});

// 6c. Get Concept Personality Vibe dynamically using Gemini
app.post('/api/concept-vibe', async (req, res) => {
  const { conceptName, solutionOverview } = req.body;
  try {
    const expansion = await expandConceptVisualPrompt(conceptName, solutionOverview, []);
    res.json({ vibe: expansion.vibe });
  } catch (err) {
    console.warn("Concept vibe classification failed:", err);
    res.json({ vibe: "organic" });
  }
});

// 7. Database / Portfolio saving
app.post('/api/portfolio/save', async (req, res) => {
  const sessionData = {
    ...req.body,
    user_id: req.body.user_id || req.body.userId || 'anonymous',
    id: String(Date.now()),
    created_date: new Date().toISOString()
  };

  try {
    if (firestoreDb) {
      await firestoreDb.collection('game_sessions').doc(sessionData.id).set(sessionData);
      console.log("Session saved successfully to Firebase Firestore.");
    } else {
      const list = readLocalDB();
      list.push(sessionData);
      writeLocalDB(list);
      console.log("Session saved successfully to local JSON database.");
    }
    res.json({ success: true, id: sessionData.id });
  } catch (err) {
    console.error("Save Portfolio error:", err);
    res.status(500).json({ error: "Failed to save portfolio session" });
  }
});

// 8. Database / Portfolio listing
app.get('/api/portfolio', async (req, res) => {
  const { userId } = req.query;
  try {
    if (firestoreDb) {
      let query = firestoreDb.collection('game_sessions');
      if (userId) {
        query = query.where('user_id', '==', userId);
      }
      // Note: order by created_date might require a composite index in Firestore if combined with where, 
      // but if Firestore isn't indexed, it can fail. To be safe, we order on the client side 
      // or retrieve first and sort to prevent Firestore index errors from blocking the user.
      const snapshot = await query.get();
      const list = [];
      snapshot.forEach(doc => list.push(doc.data()));
      list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      res.json(list.slice(0, 100));
    } else {
      let list = readLocalDB();
      if (userId) {
        list = list.filter(s => s.user_id === userId || s.userId === userId);
      }
      list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      res.json(list);
    }
  } catch (err) {
    console.error("List Portfolio error:", err);
    res.status(500).json({ error: "Failed to retrieve portfolio list" });
  }
});

// 9. Database / Portfolio detail by ID
app.get('/api/portfolio/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (firestoreDb) {
      const doc = await firestoreDb.collection('game_sessions').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Portfolio session not found" });
      }
      res.json(doc.data());
    } else {
      const list = readLocalDB();
      const item = list.find(s => String(s.id) === String(id));
      if (!item) {
        return res.status(404).json({ error: "Portfolio session not found" });
      }
      res.json(item);
    }
  } catch (err) {
    console.error("Get Portfolio detail error:", err);
    res.status(500).json({ error: "Failed to retrieve portfolio detail" });
  }
});

const ROOMS_DB_PATH = path.resolve('rooms_db.json');

function readRoomsDB() {
  try {
    if (!fs.existsSync(ROOMS_DB_PATH)) {
      fs.writeFileSync(ROOMS_DB_PATH, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(ROOMS_DB_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeRoomsDB(data) {
  fs.writeFileSync(ROOMS_DB_PATH, JSON.stringify(data, null, 2));
}

async function getRoom(roomId) {
  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection('game_rooms').doc(roomId).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("Firestore getRoom failed, falling back to local rooms DB:", e);
    }
  }
  const db = readRoomsDB();
  return db[roomId] || null;
}

async function saveRoom(room) {
  if (firestoreDb) {
    try {
      await firestoreDb.collection('game_rooms').doc(room.id).set(room);
      return;
    } catch (e) {
      console.error("Firestore saveRoom failed, falling back to local rooms DB:", e);
    }
  }
  const db = readRoomsDB();
  db[room.id] = room;
  writeRoomsDB(db);
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function evaluateRoomBattle(room) {
  const challenge = room.challenge;
  const playersList = [];
  for (const pid of Object.keys(room.players)) {
    const p = room.players[pid];
    playersList.push({
      id: pid,
      name: p.name,
      concept: p.concept
    });
  }

  if (isOfflineMode) {
    const ranking = playersList.map(p => p.id);
    const scores = playersList.map(p => ({
      player_id: p.id,
      value: 80,
      creativity: 85,
      uniqueness: 78
    }));
    const feedbacks = playersList.map(p => ({
      player_id: p.id,
      feedback: `Offline Demo Mode: ${p.name}'s concept is solid and aligns well with the customer's desires.`
    }));
    return {
      ranking: ranking,
      scores: scores,
      feedbacks: feedbacks,
      review: "Offline Demo Mode: All submitted concepts show a strong understanding of the customer's needs and lifestyle."
    };
  }

  const prompt = `You are role-playing as the customer: ${challenge.customer_name} (${challenge.customer_role}).
${playersList.length} designers have built competing concepts to solve your frustrations.

CUSTOMER CONTEXT:
${challenge.customer_context}

${playersList.map((p, i) => `
CONCEPT ${i + 1} (by ${p.name}, Player ID: ${p.id}):
- Problem Statement: ${p.concept ? p.concept.problem : "No problem statement submitted"}
- Solution Overview: ${p.concept ? p.concept.solutionOverview : "No solution overview submitted"}
- Features: ${p.concept && p.concept.features ? p.concept.features.map(f => f.title + ": " + f.description).join("; ") : "No features submitted"}
`).join("\n")}

STRICT EVALUATION RULES:
- Evaluate each concept strictly and honestly based ONLY on the text provided above.
- Compare each concept to your actual problems, frustrations, and needs. Do not be nice or give pity scores. If a concept is off-topic, incomplete, or fails to address your needs, rate it very low (below 35).
- Do NOT invent, assume, or hallucinate details, features, or problem statements for any player. If a player's concept is incomplete, empty, or missing sections, evaluate it strictly as empty, award a score of 0 for those incomplete dimensions, and state the omission in your review.

Task:
Compare all concepts side-by-side. 
Rate each concept 1-100 on value, creativity, and uniqueness.
Rank the designers from 1st to last.
Write a 3-5 sentence review explaining your rankings and why you selected the 1st place concept as the winner.
Write a 2-3 sentence direct customer feedback commentary for EACH player individually (explaining how well their specific solution addresses your needs).`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            ranking: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            scores: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  player_id: { type: "STRING" },
                  value: { type: "INTEGER" },
                  creativity: { type: "INTEGER" },
                  uniqueness: { type: "INTEGER" }
                },
                required: ["player_id", "value", "creativity", "uniqueness"]
              }
            },
            feedbacks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  player_id: { type: "STRING" },
                  feedback: { type: "STRING" }
                },
                required: ["player_id", "feedback"]
              }
            },
            review: { type: "STRING" }
          },
          required: ["ranking", "scores", "feedbacks", "review"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (err) {
    console.error("Gemini Battle Evaluation failed:", err);
    return {
      ranking: playersList.map(p => p.id),
      scores: playersList.map(p => ({
        player_id: p.id,
        value: 70,
        creativity: 70,
        uniqueness: 70
      })),
      feedbacks: playersList.map(p => ({
        player_id: p.id,
        feedback: "An error occurred during evaluation. Here is the fallback feedback for your concept."
      })),
      review: "An error occurred during evaluation. All designs have been graded equally."
    };
  }
}

// --- Multiplayer Room Endpoints ---

// 1. Create Room
app.post('/api/rooms/create', async (req, res) => {
  const { creatorName, domain, timerDuration } = req.body;

  let roomId = generateRoomCode();
  let existing = await getRoom(roomId);
  while (existing) {
    roomId = generateRoomCode();
    existing = await getRoom(roomId);
  }

  let challenge = null;
  if (isOfflineMode) {
    const domainScenarios = offlineScenarios[domain] || {};
    const baseChallenge = Object.values(domainScenarios)[0];
    if (baseChallenge) {
      challenge = { ...baseChallenge };
    } else {
      challenge = {
        title: `${domain} Sprint Challenge`,
        scenario: `Design a solution in the domain of ${domain}.`,
        customer_name: "Alex Taylor",
        customer_role: "End User",
        customer_persona: "Alex is a busy user seeking simplified experiences.",
        customer_context: "Alex is easily overwhelmed by complexity.",
        customer_gender: "male",
        customer_age: "adult"
      };
    }
  } else {
    const prompt = `You are a design thinking game master. Generate ONE compelling, realistic design challenge for a player to solve.
PLAYER-CHOSEN PARAMETERS:
- Domain: ${domain}
Requirements same as normal challenges:
- A real-world design problem in the "${domain}" domain. Broad and intuitive.
- Punchy and simple language under 2 sentences.
- customer_persona is neutral (no struggles/needs).
- customer_context holds hidden details (frustrations, specific needs).
- customer_gender: Strictly set to 'male' or 'female' to match their name.
- customer_age: Strictly set to 'young', 'adult', or 'senior' to match their age.`;

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          temperature: 1.0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              scenario: { type: "STRING" },
              customer_name: { type: "STRING" },
              customer_role: { type: "STRING" },
              customer_persona: { type: "STRING" },
              customer_context: { type: "STRING" },
              customer_gender: { type: "STRING", enum: ["male", "female"] },
              customer_age: { type: "STRING", enum: ["young", "adult", "senior"] }
            },
            required: ["title", "scenario", "customer_name", "customer_role", "customer_persona", "customer_context", "customer_gender", "customer_age"]
          }
        }
      });
      challenge = JSON.parse(response.text.trim());
    } catch (err) {
      console.error("Multiplayer challenge generation failed, using offline fallback:", err);
      const domainScenarios = offlineScenarios[domain] || {};
      const baseChallenge = Object.values(domainScenarios)[0];
      challenge = baseChallenge ? { ...baseChallenge } : {
        title: `${domain} Sprint Challenge`,
        scenario: `Design a solution in the domain of ${domain}.`,
        customer_name: "Alex Taylor",
        customer_role: "End User",
        customer_persona: "Alex is a busy user seeking simplified experiences.",
        customer_context: "Alex is easily overwhelmed by complexity.",
        customer_gender: "male",
        customer_age: "adult"
      };
    }
  }

  challenge.customer_image = assignCustomerImage(challenge);

  const room = {
    id: roomId,
    domain,
    constraint: "",
    challenge,
    status: 'lobby',
    creator_name: creatorName,
    timer_duration: timerDuration || 480,
    start_time: null,
    deadline: null,
    players: {
      "player_1": { name: creatorName, submitted: false, concept: null }
    },
    results: null
  };

  await saveRoom(room);
  res.json(room);
});

// 2. Join Room
app.post('/api/rooms/join', async (req, res) => {
  const { roomId, playerName } = req.body;
  if (!roomId || !playerName) {
    return res.status(400).json({ error: "Missing roomId or playerName" });
  }

  const room = await getRoom(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (room.status === 'finished') {
    return res.status(400).json({ error: "Game has already finished in this room" });
  }
  if (room.status === 'playing') {
    const now = new Date();
    if (room.deadline && now > new Date(room.deadline)) {
      return res.status(400).json({ error: "Game submission period has already ended" });
    }
  } else if (room.status !== 'lobby') {
    return res.status(400).json({ error: "Cannot join this room" });
  }

  const currentPlayers = Object.keys(room.players);
  if (currentPlayers.length >= 5) {
    return res.status(400).json({ error: "Room is full (max 5 players)" });
  }

  // Check if player name already exists in room
  const nameExists = currentPlayers.some(pid => room.players[pid].name.toLowerCase() === playerName.toLowerCase());
  if (nameExists) {
    return res.status(400).json({ error: "Name is already taken in this room" });
  }

  const nextPlayerId = `player_${currentPlayers.length + 1}`;
  room.players[nextPlayerId] = { name: playerName, submitted: false, concept: null };

  await saveRoom(room);
  res.json(room);
});

// 3. Start Game (Host only)
app.post('/api/rooms/:id/start', async (req, res) => {
  const { id } = req.params;
  const room = await getRoom(id.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (room.status !== 'lobby') {
    return res.status(400).json({ error: "Game already started" });
  }

  const startTime = new Date();
  const deadline = new Date(startTime.getTime() + room.timer_duration * 1000);

  room.status = 'playing';
  room.start_time = startTime.toISOString();
  room.deadline = deadline.toISOString();

  await saveRoom(room);
  res.json(room);
});

// 4. Get Room Status (with auto-evaluation trigger on deadline pass)
app.get('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const room = await getRoom(id.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });

  if (room.status === 'playing' && room.deadline) {
    const now = new Date();
    const deadlineTime = new Date(room.deadline);
    if (now > deadlineTime) {
      console.log(`Room ${room.id} deadline passed. Auto-triggering battle evaluation.`);
      room.status = 'evaluating';
      await saveRoom(room);

      const results = await evaluateRoomBattle(room);
      room.results = results;
      room.status = 'finished';
      await saveRoom(room);
    }
  }

  res.json(room);
});

// 5. Submit Player Concept
app.post('/api/rooms/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { playerName, concept } = req.body;
  
  const room = await getRoom(id.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });

  const playerId = Object.keys(room.players).find(pid => room.players[pid].name === playerName);
  if (!playerId) {
    return res.status(400).json({ error: "Player not found in this room" });
  }

  room.players[playerId].submitted = true;
  room.players[playerId].concept = concept;
  await saveRoom(room);

  // Check if all joined players have submitted
  const allSubmitted = Object.keys(room.players).every(pid => room.players[pid].submitted);
  if (allSubmitted && room.status === 'playing') {
    room.status = 'evaluating';
    await saveRoom(room);

    const results = await evaluateRoomBattle(room);
    room.results = results;
    room.status = 'finished';
    await saveRoom(room);
  }

  res.json(room);
});

// Serve static client assets in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));
  
  // Serve the React app's index.html for all other non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});
