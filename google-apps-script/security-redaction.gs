/**
 * security-redaction.gs — mask sensitive data BEFORE any model call.
 * Records only the CATEGORIES masked. Never stores/returns the original values.
 * maskSensitiveData(text) -> { text, categories:[String], pii:Boolean }
 */

function maskSensitiveData(text) {
  var categories = {};
  var out = String(text || '');

  function apply(re, placeholder, cat) {
    if (re.test(out)) { categories[cat] = true; out = out.replace(re, placeholder); }
    re.lastIndex = 0;
  }

  // Order matters: most specific first.
  apply(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REDACTED]', 'SSN');
  apply(/\b\d{2}-\d{7}\b/g, '[EIN REDACTED]', 'EIN');
  // Payment card: 13–16 digits, optionally space/dash separated.
  apply(/\b(?:\d[ -]?){13,16}\b/g, '[CARD NUMBER REDACTED]', 'CARD');
  // Bank account / routing with context words.
  apply(/\b(account|acct|a\/c)\s*(number|no\.?|#)?\s*[:#]?\s*\d{6,17}\b/gi, '[BANK ACCOUNT REDACTED]', 'BANK_ACCOUNT');
  apply(/\b(routing|aba|rtn)\s*(number|no\.?|#)?\s*[:#]?\s*\d{9}\b/gi, '[ROUTING NUMBER REDACTED]', 'ROUTING');
  // Credentials / secrets / tokens.
  apply(/\b(password|passwd|pwd)\s*[:=]\s*\S+/gi, '[CREDENTIAL REDACTED]', 'CREDENTIAL');
  apply(/\b(api[_-]?key|access[_-]?token|secret|bearer)\s*[:=]?\s*[A-Za-z0-9_\-\.]{8,}/gi, '[CREDENTIAL REDACTED]', 'CREDENTIAL');
  apply(/\bsk-[A-Za-z0-9_\-]{10,}\b/g, '[CREDENTIAL REDACTED]', 'CREDENTIAL');
  // One-time / authentication codes.
  apply(/\b(otp|one[-\s]?time|verification|auth(?:entication)?)\s*(code)?\s*[:#]?\s*\d{4,8}\b/gi, '[AUTHENTICATION CODE REDACTED]', 'AUTH_CODE');

  var cats = Object.keys(categories);
  return { text: out, categories: cats, pii: cats.length > 0 };
}
