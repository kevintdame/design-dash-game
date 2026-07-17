import { GoogleGenAI } from '@google/genai';

const apiKey = 'AQ.Ab8RN6LYz7czutBWDa9pL6WP6607TIokm3dBGmdJuL3FhlBmbQ';
const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Say Hello!',
    });
    console.log(`-> SUCCESS for ${modelName}:`, response.text);
    return true;
  } catch (err) {
    console.log(`-> FAILED for ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  await testModel('gemini-3.1-flash-lite');
  await testModel('gemini-3-flash-preview');
}

run();
