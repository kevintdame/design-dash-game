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
    const prompt = `Clean, modern product concept illustration for a "${domain}" design challenge. Feature concept: "${f.title}" — ${f.description}. Render a polished, realistic mockup-style image, Swiss minimalist design aesthetic: deep charcoal background (#2B303A), electric cyan (#00D4FF) accents, clean bold silhouettes, simple geometric shapes, minimal shading, solid color blocks, friendly stylized illustration style. Solid dark background. No text, words, or logos in the image.`;
    const seed = Math.floor(Math.random() * 100000) + index;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=300&height=300&nologo=true&seed=${seed}`;
    return {
      ...f,
      image_url: imageUrl
    };
  });
}

export async function generateConceptImage(solutionOverview, domain) {
  const prompt = `Flat vector illustration showing the ACTUAL product or service described below, depicted as concretely and specifically as possible — render the real physical object, app screen, device, or service moment a user would interact with, not abstract shapes or generic icons. Concept: ${solutionOverview}. Show specific product details: form factor, screen layouts, buttons, physical components, or the service-in-use moment that this concept implies. Swiss minimalist design aesthetic: deep charcoal background (#2B303A), electric cyan (#00D4FF) accents, clean bold silhouettes, simple geometric shapes, minimal shading, solid color blocks, friendly stylized illustration style. Solid dark background. No text, words, or logos in the image.`;
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&seed=${seed}`;
}