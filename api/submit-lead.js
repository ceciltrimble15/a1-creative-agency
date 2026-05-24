export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, date, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing env vars: AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const notesParts = [];
  if (service) notesParts.push(`Service: ${service}`);
  if (date) notesParts.push(`Preferred Date: ${date}`);
  if (message) notesParts.push(`Message: ${message}`);

  const fields = {
    'Lead Name': name,
    'Phone': phone,
    'Email ': email,
    'lead_status': 'new',
    'Source': 'Website form ',
    'Client': 'TRHUE Hair Care',
  };

  if (notesParts.length > 0) fields['Notes'] = notesParts.join('\n');
  if (date) fields['date'] = date;

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Leads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable API error:', JSON.stringify(data));
      return res.status(502).json({ error: data.error?.message || 'Failed to create lead in Airtable' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Submit lead exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
