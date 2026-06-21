/* Brand routing — the single source of truth for which brand an inbound event
   belongs to. Brand is decided ONCE here at ingestion and inherited by the
   Lead/Task/Escalation it produces; downstream code never re-derives it.

   Locked routing signals (do not change without CEO approval):
     A1 Creative    → +15134403329 · a1creativeagency.com · operations@…
     A/1 Suppliers  → +15138667141 · a1suppliers.org · info@… / Shuri@…

   No silent guessing: when no signal matches, default to A1 Creative and flag
   matched:false so the caller can raise a review task + log a warning. */

export const BRANDS = {
  A1: 'A1 Creative',
  SUPPLIERS: 'A/1 Suppliers',
};

const ROUTES = [
  {
    brand: BRANDS.A1,
    phones: ['+15134403329'],
    domains: ['a1creativeagency.com'],
  },
  {
    brand: BRANDS.SUPPLIERS,
    phones: ['+15138667141'],
    domains: ['a1suppliers.org'],
  },
];

/* Last 10 digits, so +1513…, 1513…, 513… and formatted variants all compare
   equal. Brand routing only needs to tell our two numbers apart. */
function phoneKey(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  return digits.slice(-10);
}

function domainOf(emailOrHost) {
  if (!emailOrHost) return '';
  const s = String(emailOrHost).trim().toLowerCase();
  const afterAt = s.includes('@') ? s.split('@').pop() : s;
  return afterAt.replace(/^www\./, '');
}

/* Resolve brand from any available signal. Phone is checked first (most
   reliable for calls/SMS), then email/mailbox domain, then form origin host.
   Returns { brand, matched, signal }. */
export function deriveBrand({ toPhone, fromEmail, mailbox, originHost } = {}) {
  const toKey = phoneKey(toPhone);
  if (toKey) {
    for (const route of ROUTES) {
      if (route.phones.some((p) => phoneKey(p) === toKey)) {
        return { brand: route.brand, matched: true, signal: 'phone' };
      }
    }
  }

  for (const value of [mailbox, fromEmail, originHost]) {
    const domain = domainOf(value);
    if (!domain) continue;
    for (const route of ROUTES) {
      if (route.domains.includes(domain)) {
        const signal = value === originHost ? 'origin_host' : 'email_domain';
        return { brand: route.brand, matched: true, signal };
      }
    }
  }

  // No usable signal — never guess silently.
  return { brand: BRANDS.A1, matched: false, signal: 'default' };
}
