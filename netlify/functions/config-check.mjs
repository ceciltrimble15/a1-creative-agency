/* Diagnostic endpoint — reports whether each integration is configured IN THE
   CURRENT DEPLOY CONTEXT, and whether the Airtable token actually works against
   the base. Returns ONLY booleans + HTTP status codes — never any secret value,
   record data, or token. Safe to open in a browser.

   Open:  https://<preview-or-site>/api/config-check
   Use it to confirm env vars reached the Deploy-preview context (the usual gap)
   and that the Airtable token has access to the base. Remove once forms work. */

const present = (v) => typeof v === 'string' && v.trim().length > 0;

export const handler = async (event) => {
  const env = process.env;

  const airtableToken = env.AIRTABLE_API_KEY || env.AIRTABLE_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID;

  // Which variable is actually in use, and the token FORMAT (not its value).
  // Airtable killed legacy "key..." API keys in 2024 — only "pat..." Personal
  // Access Tokens work. Reveals format only; never the secret itself.
  const tokenFormat = !present(airtableToken)
    ? 'missing'
    : airtableToken.startsWith('pat')
      ? 'pat (Personal Access Token — correct)'
      : airtableToken.startsWith('key')
        ? 'legacy key (DEAD — Airtable disabled these; make a pat... token)'
        : 'unrecognized format';
  const airtableTokenDiag = {
    sourceVar: present(env.AIRTABLE_API_KEY)
      ? 'AIRTABLE_API_KEY'
      : present(env.AIRTABLE_TOKEN)
        ? 'AIRTABLE_TOKEN'
        : 'none',
    bothVarsSet: present(env.AIRTABLE_API_KEY) && present(env.AIRTABLE_TOKEN),
    tokenFormat,
    tokenLength: present(airtableToken) ? airtableToken.trim().length : 0,
    hasSurroundingWhitespace: present(airtableToken) && airtableToken !== airtableToken.trim(),
  };

  const vars = {
    AIRTABLE_API_KEY_or_TOKEN: present(airtableToken),
    AIRTABLE_BASE_ID: present(baseId),
    RESEND_API_KEY: present(env.RESEND_API_KEY),
    NOTIFY_FROM: present(env.NOTIFY_FROM),
    TWILIO_ACCOUNT_SID: present(env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN: present(env.TWILIO_AUTH_TOKEN),
    TWILIO_PHONE_NUMBER: present(env.TWILIO_PHONE_NUMBER),
    OWNER_CELL: present(env.OWNER_CELL),
  };

  // Live Airtable connectivity test — proves the token works AND can see the
  // base. Reads at most 1 record from Business Assessments but returns NOTHING
  // from it: only the HTTP status + a plain-English verdict.
  let airtable = { tested: false };
  if (present(airtableToken) && present(baseId)) {
    const table = env.AIRTABLE_ASSESSMENTS_TABLE || 'Business Assessments';
    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?maxRecords=1`,
        { headers: { Authorization: `Bearer ${airtableToken}` } }
      );
      let verdict;
      if (res.status === 200) verdict = 'OK — token valid and base reachable';
      else if (res.status === 401) verdict = 'FAIL — token invalid or expired (401)';
      else if (res.status === 403) verdict = 'FAIL — token lacks access to this base/table (403)';
      else if (res.status === 404) verdict = 'FAIL — base id or table name not found (404)';
      else verdict = `Unexpected status ${res.status}`;
      airtable = { tested: true, status: res.status, verdict };
    } catch (err) {
      airtable = { tested: true, status: 0, verdict: `Network error: ${err.message}` };
    }
  } else {
    airtable = { tested: false, verdict: 'Skipped — AIRTABLE token and/or base id missing in this context' };
  }

  const body = {
    deployContext: env.CONTEXT || 'unknown', // 'production' | 'deploy-preview' | 'branch-deploy'
    branch: env.BRANCH || 'unknown',
    envVarsPresent: vars,
    airtableToken: airtableTokenDiag,
    airtableLiveTest: airtable,
    note: 'Booleans and status codes only — no secret values are ever returned.',
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body, null, 2),
  };
};
