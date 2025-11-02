// Vercel serverless function for image generation proxy
// Save as api/image.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024'
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: 'Upstream error', details: txt });
    }
    const data = await r.json();
    // Expect data.data[0].url
    const imageUrl = (data.data && data.data[0] && data.data[0].url) || null;
    if (!imageUrl) return res.status(502).json({ error: 'No image returned', details: data });
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
