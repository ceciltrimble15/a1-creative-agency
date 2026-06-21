/* Inbox_Events ingestion layer — the single front door for all inbound activity.

   Locked rule: no Lead or Task is created before an Inbox_Events record exists
   or is matched. Every channel (website form, Twilio, later Outlook/Calendly/
   payments) calls ingestEvent() FIRST, then promotes the returned event.

   Dormant until enabled: handlers gate their call on INBOX_ENABLED. This module
   has no side effects unless invoked, and creates nothing unless the dedup gate
   passes. */

import { createEvent, findEventBySourceId } from './airtable.js';
import { deriveBrand } from './brand.js';

/* Feature-flag check so callers can branch without duplicating the env read. */
export function inboxEnabled() {
  return /^(1|true|yes|on)$/i.test(process.env.INBOX_ENABLED || '');
}

/* Capture (or dedup) one inbound event.

   Returns:
     { ok:true, deduped:false, id, brand, brandMatched }  → new event created
     { ok:true, deduped:true,  id, brand }                → already seen, no-op
     { ok:false, error }                                  → nothing created

   Fail-safe: if the dedup lookup itself fails (network/creds), we do NOT
   create the event. Treating an errored lookup as "not found" would let
   duplicates leak — the exact outcome this system must prevent. */
export async function ingestEvent({
  sourceEventId,
  eventType,
  sourcePlatform,
  brandSignals = {},
  contact = {},
  message,
  dateReceived,
  raw,
} = {}) {
  // Universal Data Rule: no record without a dedup key.
  if (!sourceEventId) {
    return { ok: false, error: 'missing source_event_id' };
  }

  const { brand, matched } = deriveBrand(brandSignals);

  // Dedup gate — check before create.
  const existing = await findEventBySourceId(sourceEventId);
  if (!existing.ok) {
    return { ok: false, error: `dedup check failed: ${existing.error}`, brand };
  }
  if (existing.record) {
    return { ok: true, deduped: true, id: existing.record.id, brand };
  }

  const fields = {
    source_event_id: sourceEventId,
    event_type: eventType,
    source_platform: sourcePlatform,
    date_received: dateReceived || new Date().toISOString(),
    contact_name: contact.name,
    business_name: contact.business,
    phone: contact.phone,
    email: contact.email,
    message,
    brand,
    status: 'New',
    raw_payload: raw ? JSON.stringify(raw) : undefined,
  };
  for (const key of Object.keys(fields)) {
    if (fields[key] === undefined || fields[key] === '') delete fields[key];
  }

  const created = await createEvent(fields);
  if (!created.ok) {
    return { ok: false, error: created.error, brand };
  }
  return { ok: true, deduped: false, id: created.id, brand, brandMatched: matched };
}
