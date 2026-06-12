/* Stable quote-intake URL: /quote → 302 to wherever intake currently lives.
   Point all CTAs and printed QR codes here; when the intake destination
   changes (e.g. Airtable form → native website form), update the
   QUOTE_FORM_URL env var instead of editing buttons or reprinting codes. */
export default function handler(req, res) {
  const target = process.env.QUOTE_FORM_URL || 'https://a1creativeagency.com';
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, target);
}
