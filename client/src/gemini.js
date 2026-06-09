const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function callGemini(apiKey, prompt) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    // Key goes in a header, not the URL — URLs leak into logs and history
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500 },
    }),
  });
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(rawText.replace(/```json|```/g, '').trim());
}
