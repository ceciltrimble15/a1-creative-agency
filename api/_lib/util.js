/* Small shared helpers with no external dependencies. */

/* Due date for a follow-up: today if it's a weekday, otherwise the next
   business day (Mon–Fri). Returns an ISO date string (YYYY-MM-DD) so it
   drops straight into an Airtable Date field. */
export function nextBusinessDayISO(from = new Date()) {
  const d = new Date(from);
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  if (day === 6) d.setUTCDate(d.getUTCDate() + 2); // Sat -> Mon
  else if (day === 0) d.setUTCDate(d.getUTCDate() + 1); // Sun -> Mon
  return d.toISOString().slice(0, 10);
}

/* Brand label used in notifications. The lead endpoint is multi-tenant
   (A1 Creative agency + TRHUE), so the email subject reflects the client
   that actually submitted. */
export function brandLabel(client) {
  if (!client) return 'A1 Creative';
  return /a1/i.test(client) ? 'A1 Creative' : client;
}
