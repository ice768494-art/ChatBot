const SYSTEM_PROMPT = `You are Nova AI, a helpful, friendly assistant.
Give clear, accurate, age-appropriate answers.
For coding questions, provide practical explanations and working examples.
If you are uncertain, say so rather than inventing facts.
Keep answers reasonably concise unless the user asks for detail.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not configured in Vercel Environment Variables."
    });
  }

  try {
    const body = req.body || {};
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    const messages = incoming
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));

    if (!messages.length) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "AI provider request failed."
      });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "The AI returned an empty response." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
