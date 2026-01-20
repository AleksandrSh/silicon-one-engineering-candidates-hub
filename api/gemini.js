module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, systemPrompt = "" } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=" +
      encodeURIComponent(apiKey);

    const payload = {
      contents: [{ parts: [{ text: String(prompt) }] }],
      systemInstruction: systemPrompt ? { parts: [{ text: String(systemPrompt) }] } : undefined,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: "Gemini API error", details: data });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated.";
    return res.status(200).json({ text, raw: data });
  } catch (e) {
    return res.status(500).json({ error: "Unhandled server error" });
  }
};
