const GEMINI_ENDPOINT = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

export async function callGemini(apiKey, prompt) {
  const response = await fetch(GEMINI_ENDPOINT(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500 },
    }),
  });
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(rawText.replace(/```json|```/g, '').trim());
}
