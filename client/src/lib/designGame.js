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
  const res = await fetch("/api/generate-images", {
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
  const domStr = domain ? String(domain).toUpperCase() : "PROTOTYPE";
  // Return a clean programmatic SVG mockup representation
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="200" height="150">
      <rect width="200" height="150" fill="#20262e" rx="16" />
      <defs>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.8" />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="170" height="80" fill="url(#cyanGrad)" rx="8" opacity="0.15" />
      <circle cx="50" cy="55" r="18" fill="url(#cyanGrad)" />
      <rect x="80" y="44" width="90" height="6" fill="#ffffff" rx="3" opacity="0.9" />
      <rect x="80" y="58" width="70" height="5" fill="#ffffff" rx="2.5" opacity="0.5" />
      <rect x="15" y="110" width="170" height="1" fill="#2e3366" />
      <text x="18" y="130" fill="#00d4ff" font-family="sans-serif" font-size="9" font-weight="bold">${domStr} CONCEPT</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}