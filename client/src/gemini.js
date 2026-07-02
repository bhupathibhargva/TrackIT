// gemini.js — the single place the app talks to Google's Gemini API.
// Every AI feature (chat, auto-schedule, reprioritize) goes through callGemini.
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Send a prompt to Gemini and return its reply parsed as JSON.
 * All our prompts (see prompts.js) instruct the model to answer with JSON only.
 * Throws on HTTP errors or unparseable replies — callers show a friendly
 * message in the chat log.
 */
export async function callGemini(apiKey, prompt) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    // Key goes in a header, not the URL — URLs leak into logs and history.
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500 },
    }),
  });
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  // The model sometimes wraps its JSON in a ```json fence despite being told
  // not to — strip the fence before parsing.
  return JSON.parse(rawText.replace(/```json|```/g, '').trim());
}
