import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const isOfflineMode = !apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '';

if (isOfflineMode) {
  console.warn("WARNING: No GEMINI_API_KEY configured. Server is running in OFFLINE DEMO MODE.");
}

const ai = isOfflineMode ? null : new GoogleGenAI({ apiKey });

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
      customer_context: "Evelyn fears losing her independence and being forced into sterile assisted living. She refuses to use standard clinical modifications (like industrial grab bars) because they ruin her home's aesthetic identity. She desires solutions that support safe movement seamlessly without looking clinical."
    }
  },
  "Sustainability": {
    "service": {
      title: "Neighborhood Circularity Hub",
      scenario: "Design a service that makes local composting and waste reduction easier for households.",
      customer_name: "Leo Jenkins",
      customer_role: "Community Garden Coordinator",
      customer_persona: "Leo Jenkins, 35, coordinates the community garden. He is community-focused, energetic, and wants to scale composting.",
      customer_context: "Leo is tired of washing moldy bins and sorting neighbor waste. Most neighbors want to do the right thing, but find composting too messy, smelly, and inconvenient for their busy routines. He needs a clean, effortless way to get families participating without smell or chores."
    }
  },
  "Education": {
    "app": {
      title: "Micro-Learning for Career Switchers",
      scenario: "Design a mobile app that helps busy, working adults learn new technical skills.",
      customer_name: "Sarah Chen",
      customer_role: "Night-Shift Nurse",
      customer_persona: "Sarah Chen, 29, works exhausting 12-hour night shifts. She is highly motivated to switch to health-tech but has zero continuous free time.",
      customer_context: "Sarah only has 5-10 minute coffee breaks during night shifts. Reading textbooks or watching long video lectures puts her to sleep instantly. She needs a way to make active learning progress in short windows without feeling like another tiring chore."
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

// ----------------------------------------------------
// API Routes
// ----------------------------------------------------

// 1. Generate Challenge
app.post('/api/challenge', async (req, res) => {
  const { domain, constraint } = req.body;

  if (isOfflineMode) {
    const sc = offlineScenarios[domain]?.[constraint];
    if (sc) return res.json(sc);
    return res.json({
      title: `${domain} Sprint Challenge`,
      scenario: `Design ${constraint === 'product' ? 'a physical product' : constraint === 'service' ? 'a service' : 'a mobile app'} resolving needs in ${domain}.`,
      customer_name: "Alex Taylor",
      customer_role: "End User",
      customer_persona: "Alex is a busy user seeking simplified experiences.",
      customer_context: "Alex is easily overwhelmed by complexity and values clean, elegant workflows."
    });
  }

  const constraintLabel = {
    app: "a mobile app",
    product: "a physical product",
    service: "a service experience",
    event: "an event or live experience"
  }[constraint] || constraint;

  const prompt = `You are a design thinking game master. Generate ONE compelling, realistic design challenge for a player to solve.

PLAYER-CHOSEN PARAMETERS:
- Domain: ${domain}
- Constraint: the player's solution MUST take the form of ${constraintLabel}. Frame the challenge and the customer so their problem naturally calls for ${constraintLabel}, and the player's ideas/final concept should be shaped around building ${constraintLabel}.

Requirements:
- A real-world product/service design problem in the "${domain}" domain that requires empathy and creativity. Keep the challenge description BROAD — frame the situation and the people involved, but do NOT reveal the customer's specific frustrations, needs, or pain points. Those must be discovered through the interview.
- "customer_persona" is the ONLY thing the player sees about the customer up front. It MUST be a neutral, high-level introduction: their name, age, role/profession, and a sentence or two of general context (where they work, their lifestyle broadly). Do NOT mention any frustrations, problems, struggles, pain points, needs, desires, or what they wish were different. The player should learn those only by interviewing.
- "customer_context" is internal context the LLM uses to answer interview questions and rate ideas consistently as this customer. Put ALL the rich detail here: their hidden frustrations, specific needs, deal-breakers, budget concerns, daily life details, emotional drivers, and what they secretly wish existed. The player NEVER sees this field.
- NO SOLUTIONS IN INTERVIEW: The customer's context and behavior must only focus on their daily life, feelings, and frustrations. Never mention, suggest, or discuss specific solutions, technology formats, or product features.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            scenario: { type: "STRING" },
            customer_name: { type: "STRING" },
            customer_role: { type: "STRING" },
            customer_persona: { type: "STRING" },
            customer_context: { type: "STRING" }
          },
          required: ["title", "scenario", "customer_name", "customer_role", "customer_persona", "customer_context"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
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
- Be conversational, warm, and natural. Respond in 2 to 4 complete sentences.
- Share concrete details about your daily routine, feelings, and frustrations.
- NO SOLUTIONS ALLOWED: You MUST ONLY talk about your daily experiences, routines, frustrations, feelings, and needs. NEVER suggest, propose, or discuss specific solutions, technology formats (like a mobile app, website, or physical device), or product features. If the designer asks about a solution, refocus on how it affects your feelings, daily life, or needs.
- Naturally hint that there's more beneath the surface so good follow-up questions feel rewarding.
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
  const prompt = `You are a design researcher. A designer just interviewed a potential customer. Synthesize the interview into 4-7 concise "sticky notes" capturing the most important things to remember for ideation.

CUSTOMER: ${challenge.customer_name} (${challenge.customer_role})

INTERVIEW TRANSCRIPT:
${transcript}

Rules:
- Base notes ONLY on what the customer actually said in the interview. Do not invent information.
- Each "text" must be short and punchy — like a real post-it note, max ~14 words.
- Classify each as one of: "insight" (a notable realization/behavior), "pain_point" (a frustration or obstacle), "need" (a latent need or wish).
- Aim for a mix of types when the interview supports it.
- NO SOLUTIONS: Ensure these stickies represent user insights, pain points, or needs, NOT solutions or technology features.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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

Rate this concept on three dimensions, each 1-100, based on how it lands for YOU as this customer:
- value_score: How much it solves a real problem you actually have and would pay/use for.
- creativity_score: How inventive and fresh the approach feels (not a generic solution).
- uniqueness_score: How differentiated it is from existing solutions on the market.

Then write a short, in-character review (2-4 sentences) as this customer reacting to the final concept.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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

// 6. Generate Feature Mockups (Cost-Free SVG Vector generator)
app.post('/api/generate-images', async (req, res) => {
  const { features, domain, constraint } = req.body;
  const featuresWithImages = features.map((f, index) => {
    const hues = [280, 340, 45, 170];
    const hue = hues[index % hues.length];
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="g_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="hsl(${hue}, 80%, 60%)" />
            <stop offset="100%" stop-color="hsl(${(hue + 40) % 360}, 80%, 45%)" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="16" fill="url(#g_${index})" />
        <circle cx="50" cy="50" r="24" fill="white" fill-opacity="0.2" />
        <path d="M35 50 L45 60 L65 40" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
    `.trim().replace(/\s+/g, ' ');
    
    const base64Svg = Buffer.from(svgString).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    
    return {
      ...f,
      image_url: dataUrl
    };
  });

  res.json({ features: featuresWithImages });
});

// 7. Database / Portfolio saving
app.post('/api/portfolio/save', async (req, res) => {
  const sessionData = {
    ...req.body,
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
  try {
    if (firestoreDb) {
      const snapshot = await firestoreDb.collection('game_sessions').orderBy('created_date', 'desc').limit(100).get();
      const list = [];
      snapshot.forEach(doc => list.push(doc.data()));
      res.json(list);
    } else {
      const list = readLocalDB();
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
      const item = list.find(s => s.id === id);
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
