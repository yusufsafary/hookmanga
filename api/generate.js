export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'Input is required' });
  }

  // Batasi panjang input (keamanan)
  if (input.length > 2000) {
    return res.status(400).json({ error: 'Input too long' });
  }

  try {
    const response = await fetch('https://api.bluesminds.com/v1/agent/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // API key aman — diambil dari Environment Variables Vercel
        'Authorization': `Bearer ${process.env.BLUESMINDS_API_KEY}`
      },
      body: JSON.stringify({ input: input.trim() })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Bluesminds API error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();

    // Ambil teks output — sesuaikan field ini jika struktur response Bluesminds berbeda
    const output =
      data.output ||
      data.result ||
      data.text ||
      data.content ||
      data.response ||
      '';

    if (!output) {
      console.error('Empty output from Bluesminds:', JSON.stringify(data));
      return res.status(502).json({ error: 'Empty response from API' });
    }

    return res.status(200).json({ output });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
