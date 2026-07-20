import { base44 } from "@/api/base44Client";

const CHALLENGE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    scenario: { type: "string" },
    customer_name: { type: "string" },
    customer_role: { type: "string" },
    customer_gender: { type: "string", enum: ["male", "female"] },
    customer_age: { type: "string", enum: ["young", "adult", "senior"] },
    customer_persona: { type: "string" },
    customer_context: { type: "string" }
  },
  required: ["title", "scenario", "customer_name", "customer_role", "customer_gender", "customer_age", "customer_persona", "customer_context"]
};

const INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          type: { type: "string", enum: ["insight", "pain_point", "need"] }
        },
        required: ["text", "type"]
      }
    }
  },
  required: ["insights"]
};

const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    feedbacks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          feedback: { type: "string" },
          enthusiasm: { type: "string", enum: ["excited", "interested", "neutral", "skeptical"] }
        },
        required: ["feedback", "enthusiasm"]
      }
    }
  },
  required: ["feedbacks"]
};

const RATING_SCHEMA = {
  type: "object",
  properties: {
    value_score: { type: "number" },
    creativity_score: { type: "number" },
    uniqueness_score: { type: "number" },
    review: { type: "string" }
  },
  required: ["value_score", "creativity_score", "uniqueness_score", "review"]
};

// Flat vector avatars with gender and age designations, matched to generated customers.
const AVATARS = [
  { id: 0, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/3ef44e49c_generated_image.png", gender: "female", age: "young" },
  { id: 1, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/60bd73ce8_generated_image.png", gender: "male", age: "adult" },
  { id: 2, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/4864d2a03_generated_image.png", gender: "female", age: "senior" },
  { id: 3, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/50a95c964_generated_image.png", gender: "male", age: "young" },
  { id: 4, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/1cbddc309_generated_image.png", gender: "female", age: "adult" },
  { id: 5, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/27d2525e8_generated_image.png", gender: "male", age: "adult" },
  { id: 6, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/6dcbf9fde_generated_image.png", gender: "female", age: "adult" },
  { id: 7, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/b3bbc48a6_generated_image.png", gender: "male", age: "adult" },
  { id: 8, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/c1a500da9_generated_image.png", gender: "female", age: "young" },
  { id: 9, url: "https://media.base44.com/images/public/6a5962edf3c7c68b316e8e83/d1efadc16_generated_image.png", gender: "male", age: "senior" }
];

export async function generateCustomerPortrait(challenge) {
  const gender = (challenge.customer_gender || "").toLowerCase();
  const age = (challenge.customer_age || "").toLowerCase();
  let matches = AVATARS.filter((a) => a.gender === gender && a.age === age);
  if (matches.length === 0) matches = AVATARS.filter((a) => a.gender === gender);
  if (matches.length === 0) matches = AVATARS;
  return matches[Math.floor(Math.random() * matches.length)].url;
}

export async function generateChallenge(domain) {
  const prompt = `You are a design thinking game master. Generate ONE compelling, realistic design challenge for a player to solve.

PLAYER-CHOSEN PARAMETER:
- Domain: ${domain}

The solution form is open-ended — it could be an app, a physical product, a service, an event, or any combination. Do NOT force a specific solution type; let the customer's problem naturally suggest what kind of solution fits, and let the player decide.

Requirements:
- A real-world product/service design problem in the "${domain}" domain that requires empathy and creativity. Keep the "title" very short and punchy — max 6 words, like a catchy headline. Keep the "scenario" to 1-2 simple sentences that frame the situation broadly — do NOT reveal the customer's specific frustrations, needs, or pain points. Those must be discovered through the interview.
- "customer_gender" must be either "male" or "female", chosen to fit the character naturally.
- "customer_age" must be one of "young" (18-29), "adult" (30-59), or "senior" (60+), chosen to fit the character naturally.
- "customer_persona" is the ONLY thing the player sees about the customer up front. It MUST be a neutral, high-level introduction: their name, age, role/profession, and a sentence or two of general context (where they work, their lifestyle broadly). Do NOT mention any frustrations, problems, struggles, pain points, needs, desires, or what they wish were different. The player should learn those only by interviewing.
- "customer_context" is internal context the LLM uses to answer interview questions and rate ideas consistently as this customer. Put ALL the rich detail here: their hidden frustrations, specific needs, deal-breakers, budget concerns, daily life details, emotional drivers, and what they secretly wish existed. The player NEVER sees this field.

Return JSON matching the schema.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: CHALLENGE_SCHEMA,
    add_context_from_internet: true,
    model: "gemini_3_flash"
  });
  const customer_image = await generateCustomerPortrait(res);
  return { ...res, customer_image };
}

export async function answerAsCustomer(challenge, question, priorQA) {
  const history = priorQA.length
    ? `\n\nPrior interview Q&A so far:\n${priorQA.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join("\n")}`
    : "";

  const prompt = `You are role-playing as a potential customer being interviewed for a design challenge. Stay strictly in character and answer as this person would — based on your personality, life, and priorities.

HOW TO ANSWER NATURALLY:
- Answer ONLY the specific question asked. Do not volunteer your whole story, dump multiple frustrations, or preemptively reveal needs the interviewer hasn't probed toward. A real person wouldn't hand over their full problem list unprompted.
- Be conversational, honest, and specific — but human-scale. 1-3 sentences is usually right; give a little more only when the question genuinely calls for it.
- If the question is broad, give a brief honest answer and let the interviewer dig deeper with follow-ups. If it's narrow, answer the narrow thing.
- Naturally hint that there's more beneath the surface (you can be a little vague or mention "it's complicated") so good follow-up questions feel rewarding — but don't spell everything out.
- Stay consistent with your internal context; don't contradict your hidden priorities, but don't reveal them unless the interviewer earns it by asking.

DESIGN CHALLENGE: ${challenge.title} — ${challenge.scenario}

YOUR CHARACTER:
Name: ${challenge.customer_name}
Role: ${challenge.customer_role}
Persona: ${challenge.customer_persona}
Internal context (your hidden priorities/feelings): ${challenge.customer_context}
${history}

The designer (interviewer) asks you:
"${question}"

Answer now in first person, in character. Do not break character or mention being an AI.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "automatic"
  });
  return typeof res === "string" ? res : String(res);
}

export async function synthesizeInsights(challenge, qa) {
  if (!qa || qa.length === 0) return [];
  const transcript = qa.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join("\n\n");
  const prompt = `You are a design researcher. A designer just interviewed a potential customer. Your job is to extract ONLY what the customer actually, explicitly said in their answers — nothing more.

CUSTOMER: ${challenge.customer_name} (${challenge.customer_role})

INTERVIEW TRANSCRIPT:
${transcript}

STRICT RULES:
- Every note must be a direct paraphrase of something the customer EXPLICITLY stated in an answer above. If they didn't say it, it doesn't go on a note.
- Do NOT infer, assume, imagine, or pull from any background knowledge about the scenario or customer. Do NOT invent pain points, needs, or behaviors the customer never voiced.
- If an answer was vague, off-topic, a deflection, or didn't reveal anything concrete about the customer's life, frustrations, behaviors, or needs, it produces NO notes.
- If the whole interview failed to surface any concrete, useful information about the customer, return an empty "insights" array: {"insights": []}.
- Only produce a note when the customer genuinely revealed something worth remembering for ideation. Fewer accurate notes beat more fabricated ones.
- Each "text" must be short and punchy — like a real post-it note, max ~14 words.
- Classify each as one of: "insight" (a notable realization/behavior), "pain_point" (a frustration or obstacle), "need" (a latent need or wish).
Return JSON.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: INSIGHTS_SCHEMA,
    model: "automatic"
  });
  return (res.insights || []).slice(0, 8);
}

export async function getIdeaFeedback(challenge, ideas) {
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

For EACH idea (in order), give honest, specific feedback from your perspective as this customer — what you love, what concerns you, what's missing. Match the "enthusiasm" to how you actually feel about that idea. Return JSON with a "feedbacks" array in the SAME ORDER as the ideas.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: FEEDBACK_SCHEMA,
    model: "automatic"
  });
  return res.feedbacks || [];
}

export async function rateFinalConcept(challenge, concept) {
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

CRITICAL RULES:
- Rate ONLY what the designer actually wrote above. Do NOT invent, assume, or imagine features, benefits, or details that are not explicitly stated in their concept text.
- Compare the designer's solution to YOUR actual problems, frustrations, and needs from your internal context. Evaluate whether the concept concretely addresses THOSE specific problems.
- If the concept doesn't address your real problems, or is vague/generic/irrelevant to what you actually struggle with, score it LOW — do not fill in gaps with what you secretly wish for.
- If the concept is unrelated to the design challenge or doesn't solve a real problem you have, give it a low value_score (below 40).
- Your review must react to what was ACTUALLY presented — never praise features the designer didn't describe. If something is missing or unclear, say so honestly.

Rate this concept on three dimensions, each 1-100:
- value_score: How well this solution addresses YOUR actual problems and frustrations. Compare each aspect of the concept to your real needs — does it solve them? Score based on how much your real problems would actually be resolved by what the designer described.
- creativity_score: How inventive and fresh the approach feels (not a generic or obvious solution).
- uniqueness_score: How differentiated it is from existing solutions on the market.

Then write a short, in-character review (2-4 sentences) as this customer: compare what the designer presented to your actual problems, and say whether and how it addresses them. Return JSON.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: RATING_SCHEMA,
    model: "automatic"
  });
  return {
    value: clamp(res.value_score),
    creativity: clamp(res.creativity_score),
    uniqueness: clamp(res.uniqueness_score),
    review: res.review
  };
}

export async function generateFeatureImages(features, domain) {
  return Promise.all(
    features.map(function (f) {
      var prompt = 'Clean, modern product concept illustration for a "' + domain + '" design challenge. Feature concept: "' + f.title + '" — ' + f.description + ". Render a polished, realistic mockup-style image, soft natural lighting, minimal uncluttered background, professional product-photography aesthetic. No text, words, or logos in the image.";
      return base44.integrations.Core.GenerateImage({ prompt: prompt }).then(function (res) {
        return Object.assign({}, f, { image_url: (res && res.url) || null });
      }).catch(function () {
        return Object.assign({}, f, { image_url: null });
      });
    })
  );
}

export async function generateConceptImage(solutionOverview, domain) {
  const prompt = `Flat vector illustration showing the ACTUAL product or service described below, depicted as concretely and specifically as possible — render the real physical object, app screen, device, or service moment a user would interact with, not abstract shapes or generic icons. Concept: ${solutionOverview}. Show specific product details: form factor, screen layouts, buttons, physical components, or the service-in-use moment that this concept implies. Swiss minimalist design aesthetic: deep charcoal background (#2B303A), electric cyan (#00D4FF) accents, clean bold silhouettes, simple geometric shapes, minimal shading, solid color blocks, friendly stylized illustration style. Solid dark background. No text, words, or logos in the image.`;
  try {
    const res = await base44.integrations.Core.GenerateImage({ prompt });
    return (res && res.url) || null;
  } catch {
    return null;
  }
}

function clamp(n) {
  const num = Number(n);
  if (isNaN(num)) return 50;
  return Math.max(1, Math.min(100, Math.round(num)));
}