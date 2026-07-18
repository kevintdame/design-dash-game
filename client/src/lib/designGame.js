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

export async function generateConceptImage(solutionOverview, domain) {
  const prompt = `Flat 2D vector illustration showing a clean minimalist product or app UI mockup representing the concept: "${solutionOverview}". Colors: deep charcoal background (#2B303A), electric cyan (#00d4ff) and blue accents. Swiss minimalist flat design style, simple geometric shapes, clean bold outlines, no gradients, no 3D shading, no text.`;
  
  const res = await fetch("/api/generate-concept-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    throw new Error("Imagen 3 generation failed on the server");
  }
  const data = await res.json();
  return data.url;
}