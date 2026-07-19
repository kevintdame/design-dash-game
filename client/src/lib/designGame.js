export async function generateChallenge(domain) {
  const res = await fetch("/api/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  });
  if (!res.ok) {
    throw new Error("Couldn't generate a challenge.");
  }
  return await res.json();
}

export async function answerAsCustomer(challenge, question, priorQA) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge, question, priorQA })
  });
  if (!res.ok) {
    throw new Error("Couldn't get a response from the customer.");
  }
  const data = await res.json();
  return data.answer;
}

export async function synthesizeInsights(challenge, qa) {
  if (!qa || qa.length === 0) return [];
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge, qa })
  });
  if (!res.ok) {
    throw new Error("Couldn't synthesize insights.");
  }
  const data = await res.json();
  return data.insights || [];
}

export async function getIdeaFeedback(challenge, ideas) {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge, ideas })
  });
  if (!res.ok) {
    throw new Error("Couldn't get feedback from the customer.");
  }
  const data = await res.json();
  return data.feedbacks || [];
}

export async function rateFinalConcept(challenge, concept) {
  const res = await fetch("/api/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge, concept })
  });
  if (!res.ok) {
    throw new Error("Couldn't rate final concept.");
  }
  const data = await res.json();
  return {
    value: data.value,
    creativity: data.creativity,
    uniqueness: data.uniqueness,
    review: data.review
  };
}

export async function generateFeatureImages(features, domain) {
  const res = await fetch("/api/generate-feature-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features, domain })
  });
  if (!res.ok) {
    return features.map(f => ({ ...f, image_url: null }));
  }
  const data = await res.json();
  return data.features || features;
}

export async function generateConceptImage(solutionOverview, domain, conceptName = "") {
  const res = await fetch("/api/generate-concept-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ solutionOverview, domain, conceptName })
  });
  if (!res.ok) {
    throw new Error("Imagen 3 generation failed on the server");
  }
  const data = await res.json();
  return data.url;
}

export function getConceptAspectRatioClass(solutionOverview = "", conceptName = "") {
  const lower = (String(solutionOverview) + " " + String(conceptName)).toLowerCase();
  const isApp = lower.includes("app") || lower.includes("mobile") || lower.includes("web") || lower.includes("software") || lower.includes("screen") || lower.includes("planner") || lower.includes("meditation");
  return isApp ? "aspect-[3/4]" : "aspect-[4/3]";
}