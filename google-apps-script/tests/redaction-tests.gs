/** tests/redaction-tests.gs — PII/secret masking before any model call (39). */
function runRedactionTests_() {
  var m = maskSensitiveData('SSN 123-45-6789, card 4111 1111 1111 1111, routing number 021000021, password: hunter2');
  T_check(39, 'PII detected', m.pii === true, m);
  T_check('39a', 'SSN value removed', m.text.indexOf('123-45-6789') === -1 && m.categories.indexOf('SSN') !== -1, m.categories);
  T_check('39b', 'Card value removed', m.text.indexOf('4111 1111 1111 1111') === -1 && m.categories.indexOf('CARD') !== -1, m.categories);
  T_check('39c', 'Routing value removed', m.text.indexOf('021000021') === -1 && m.categories.indexOf('ROUTING') !== -1, m.categories);
  T_check('39d', 'Credential value removed', m.text.indexOf('hunter2') === -1 && m.categories.indexOf('CREDENTIAL') !== -1, m.categories);
  var clean = maskSensitiveData('Hi, I want a website for my salon.');
  T_check('39e', 'Clean text → no PII', clean.pii === false && clean.categories.length === 0, clean);
}
