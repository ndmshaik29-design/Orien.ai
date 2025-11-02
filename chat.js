// Vercel serverless function for chat proxy
// Save as api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: 'Upstream error', details: txt });
    }
    const data = await r.json();
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || (data.choices && data.choices[0] && data.choices[0].text) || 'No reply';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
