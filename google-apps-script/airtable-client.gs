/**
 * airtable-client.gs — thin Airtable REST client used by all Phase 2A modules.
 * Writes use field NAMES + typecast so new Phase 2 fields work before field IDs exist.
 */

function at_url_(base, table, qs) {
  return 'https://api.airtable.com/v0/' + base + '/' + encodeURIComponent(table) + (qs ? '?' + qs : '');
}
function at_headers_() {
  var token = getConfig().airtableToken;
  if (!token) throw new Error('Missing AIRTABLE_TOKEN');
  return { Authorization: 'Bearer ' + token };
}
function at_fetch_(method, url, body) {
  var opts = { method: method, headers: at_headers_(), muteHttpExceptions: true };
  if (body) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(body); }
  var res = UrlFetchApp.fetch(url, opts);
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('Airtable ' + method + ' ' + code + ': ' + res.getContentText());
  var txt = res.getContentText();
  return txt ? JSON.parse(txt) : {};
}

function atSelect(base, table, formula, pageSize) {
  var qs = 'pageSize=' + (pageSize || 25);
  if (formula) qs += '&filterByFormula=' + encodeURIComponent(formula);
  return (at_fetch_('get', at_url_(base, table, qs)).records) || [];
}
function atCreate(base, table, fieldsByName) {
  return at_fetch_('post', at_url_(base, table), { fields: fieldsByName, typecast: true });
}
function atUpdate(base, table, id, fieldsByName) {
  return at_fetch_('patch', at_url_(base, table) + '/' + id, { fields: fieldsByName, typecast: true });
}

/** Escape a value for use inside an Airtable filterByFormula string literal. */
function atQuote(v) { return "'" + String(v).replace(/'/g, "\\'") + "'"; }

/** True if any record already has this Gmail Message ID (dedupe). */
function atMessageExists(messageId) {
  var f = '{' + FLD.gmailMessageId + '}=' + atQuote(messageId);
  return atSelect(CFG_HUB_BASE, CFG_INBOX_TBL, f, 1).length > 0;
}
