import fs from 'fs';
import path from 'path';

const envPath = path.resolve('../server/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim().replace(/['"]/g, '') : null;

const prompt = "A flat vector illustration of a happy cartoon cat, Swiss design style, solid dark background";

async function test() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    console.log("Status Code:", response.status);
    const data = await response.json();
    console.log("Response JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
