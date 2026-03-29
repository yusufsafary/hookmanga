export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const response = await fetch('https://api.bluesminds.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BLUESMINDS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: input.trim() }],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Bluesminds API error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || '';

    if (!output) {
      return res.status(502).json({ error: 'Empty response from API' });
    }

    return res.status(200).json({ output });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
