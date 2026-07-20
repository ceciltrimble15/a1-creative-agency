/**
 * agent-provider.gs — provider-independent model adapter.
 * All provider-specific logic is isolated here. No key or payload is ever logged.
 */

/** Public entry: send a built prompt to the configured model, return parsed JSON object.
 *  Returns { ok, data, error, rawText }. Never throws. */
function callAgentModel(prompt) {
  var cfg = getConfig();
  if (!cfg.aiApiKey) return { ok: false, error: 'MISSING_API_KEY' };
  if (dailyLimitReached_(cfg)) return { ok: false, error: 'DAILY_LIMIT_REACHED' };

  var resp;
  try {
    if (cfg.aiProvider === 'openai') resp = callOpenAI_(cfg, prompt);
    else resp = callAnthropic_(cfg, prompt); // default
  } catch (e) {
    return { ok: false, error: 'PROVIDER_ERROR: ' + safeErr_(e) };
  }
  incrementDailyCallCount_();

  if (!resp || resp.httpCode >= 300) {
    return { ok: false, error: 'HTTP_' + (resp ? resp.httpCode : 'NULL') };
  }
  var text = resp.text;
  var parsed = tryParseJson_(text);
  if (!parsed.ok) return { ok: false, error: 'JSON_PARSE_FAILED', rawText: clip_(text) };
  return { ok: true, data: parsed.value, rawText: clip_(text) };
}

// ── Anthropic ────────────────────────────────────────────────────────────
function callAnthropic_(cfg, prompt) {
  var url = 'https://api.anthropic.com/v1/messages';
  var payload = {
    model: cfg.aiModel,
    max_tokens: 1024,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }]
  };
  var res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    headers: { 'x-api-key': cfg.aiApiKey, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  var text = '';
  if (code < 300) {
    try { var j = JSON.parse(body); text = (j.content && j.content[0] && j.content[0].text) || ''; }
    catch (e) { text = ''; }
  }
  return { httpCode: code, text: text };
}

// ── OpenAI-compatible ────────────────────────────────────────────────────
function callOpenAI_(cfg, prompt) {
  var url = 'https://api.openai.com/v1/chat/completions';
  var payload = {
    model: cfg.aiModel,
    messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    temperature: 0
  };
  var res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + cfg.aiApiKey },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  var text = '';
  if (code < 300) {
    try { var j = JSON.parse(body); text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; }
    catch (e) { text = ''; }
  }
  return { httpCode: code, text: text };
}

// ── Daily call tracking (Script Properties, date-stamped) ─────────────────
function dailyCallKey_() {
  return 'AGENT_CALLS_' + Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMdd');
}
function getDailyCallCount() { return propInt_(dailyCallKey_(), 0); }
function incrementDailyCallCount_() {
  var k = dailyCallKey_();
  PropertiesService.getScriptProperties().setProperty(k, String(getDailyCallCount() + 1));
}
function dailyLimitReached_(cfg) { return getDailyCallCount() >= cfg.dailyAgentCallLimit; }

// ── Model governance ─────────────────────────────────────────────────────
/** Blocks live processing when the model config is not validated for the running model. */
function validateModelConfiguration() {
  var cfg = getConfig();
  var validatedModel = prop_('MODEL_VALIDATED_FOR', '');
  var status = (validatedModel === cfg.aiModel) ? 'Validated' : 'Blocked';
  return {
    provider: cfg.aiProvider, model: cfg.aiModel, status: status,
    reason: status === 'Blocked'
      ? 'Running model "' + cfg.aiModel + '" differs from validated "' + validatedModel + '". Re-run tests + CEO approval, then set MODEL_VALIDATED_FOR.'
      : 'Model matches validated configuration.'
  };
}

/** Manual smoke test — safe fixture, no PII. Run from the editor. */
function testAgentConnection() {
  var prompt = buildAgentPrompt({
    subject: 'Do you build websites?', from: 'prospect@example.com',
    receivedAt: new Date().toISOString(), hasAttachments: false,
    body: 'Hi, I run a small salon and want a website with online booking. Pricing?'
  });
  var r = callAgentModel(prompt);
  logAgentAction({ action: 'AGENT_SMOKE_TEST', functionName: 'testAgentConnection',
    result: r.ok ? 'ok' : 'failed', reason: r.ok ? '' : r.error });
  return r;
}

// ── helpers ──────────────────────────────────────────────────────────────
function tryParseJson_(text) {
  if (!text) return { ok: false };
  var t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
  var start = t.indexOf('{'), end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return { ok: false };
  try { return { ok: true, value: JSON.parse(t.slice(start, end + 1)) }; }
  catch (e) { return { ok: false }; }
}
function safeErr_(e) { return _scrub_(String(e && e.message ? e.message : e)); }
function clip_(s) { s = String(s || ''); return s.length > 4000 ? s.slice(0, 4000) : s; }
