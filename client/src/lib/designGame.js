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
  return features.map((f, index) => {
    const prompt = `Minimalist vector icon illustration of a product feature: "${f.title}" — ${f.description}. UI element/mockup style, flat design, clean bold outlines, deep charcoal gray background, electric cyan and blue details. Friendly stylized design vector. No text, words, labels, or logos in the image.`;
    const seed = Math.floor(Math.random() * 100000) + index;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=300&height=300&nologo=true&seed=${seed}`;
    return {
      ...f,
      image_url: imageUrl
    };
  });
}

export async function generateConceptImage(solutionOverview, domain) {
  const prompt = `Flat vector illustration showing the product concept: "${solutionOverview}" in the domain of "${domain}". Swiss minimalist design aesthetic: deep charcoal slate background, electric cyan (#00d4ff) and blue accents, clean bold silhouettes, simple geometric shapes, minimal shading, solid color blocks, friendly stylized illustration style. No text, words, labels, or logos in the image.`;
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&seed=${seed}`;
}