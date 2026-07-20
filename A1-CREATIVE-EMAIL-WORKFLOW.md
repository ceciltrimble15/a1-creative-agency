# A1 Creative — Email Command Workflow (Phase 1)

Built 2026-07-19. **A1 Creative email only.** Runs inside the existing
Airtable structures and connects back to the existing A1 Colossal ACOS
command layer. No second operating system was created.

## Direct connection method (no Make.com, no new platforms)

Mailbox **operations@a1creativeagency.com** (Google Workspace/Gmail) is
connected directly with **Google Apps Script** bound to that account —
native to the Workspace you already own. It reads Gmail, writes to Airtable
over the existing Airtable REST connection, and replies **in-thread from
operations@**. See [`google-apps-script/`](google-apps-script/). The Vercel
serverless backend stays as-is for the website/Twilio and is not part of the
email spine (it cannot act as the Gmail mailbox without new Google infra).

## Where it lives

| Layer | Base | ID |
|---|---|---|
| Email workflow (operational) | A1 Creative Agency Hub | `appvfR20qp1dh5bT0` |
| Intake table | Inbox Queue | `tblUFUnImwgHhHyqP` |
| Command layer (approvals/OS) | A1 Colossal Operating System (ACOS) | `appbJeQpEUFRV1Dim` |

The **Inbox Queue** table already existed and was *finalized* (not
duplicated). Existing fields were kept; the following fields were added to
complete the approve → send → log → follow-up loop:

- **AI Summary** — Claude-generated summary of the email
- **Approve / Edit / Reject** — Cecil's decision gate (green/yellow/red)
- **Final Copy** — the exact approved text that gets sent
- **Send From** — single option: *A1 Creative Mailbox (a1creativeagency.com)* → enforces one mailbox
- **Sent At** — stamped only after an approved reply is actually sent
- **Follow-Up Date** — next-touch date, feeds the operator view
- **ACOS Ref** — link back to the ACOS CEO Approval Queue record

## The flow (nothing auto-sends)

1. **Capture** — new inbound email → a row in Inbox Queue (Subject, From, Received At, Preview).
2. **Lane** — set **Brand** = company lane (A1 Creative in Phase 1).
3. **Process** — Claude fills AI Summary, Priority, Recommended Action, Claude Draft.
4. **Route to OS** — a matching item is logged in ACOS **04 – CEO Approval Queue** (Company = A1 Creative Agency).
5. **Decide** — Cecil sets **Approve / Edit / Reject**. On Edit, revised text → **Final Copy**.
6. **Send** — ONLY after Approve. **Send From = A1 Creative mailbox only.** Manual send in Phase 1.
7. **Log** — set Status (Approved & Sent / Edited & Sent), stamp **Sent At**, set **Follow-Up Date**.
8. **Follow-up** — operator view surfaces Follow-Up dates; CEO view surfaces items pending decision.

## Views (Interface: `pbdX8tw01CMshkBDI` — "A1 Creative — Email Command (Phase 1)")

- **Krisha — Operator View** (`pagQr6thsDvYp8FRk`) — editable grid, scoped to Brand = A1 Creative. Tabs: *Needs Processing*, *Approved – Ready to Send*, *Follow-Ups*.
- **Cecil — CEO Review** (`pagDeQidraydfFEBr`) — record-review, scoped to Brand = A1 Creative **and** Status = Pending Review. Read summary + draft, then set Approve / Edit / Reject.

## ACOS command-layer links (base `appbJeQpEUFRV1Dim`)

- **04 – CEO Approval Queue** → `recNSw0rn1XnkzZSa` (the live test-email approval item; back-links to the Inbox Queue row)
- **13 – SOP Library** → `recCkOtksyNEkpyeh` (this workflow documented as a repeatable SOP)
- **15 – Inbox / Work Queue** → `reczMMviFK27VCir2` (Phase 1 build logged for CEO review)

## Test record (proof)

Inbox Queue row `recoWerLjjOWtDYzp` — `[TEST]` labeled inbound from
`owner@trhuehaircare.com`, lane = A1 Creative, summarized, prioritized
(Review), drafted, Send From = A1 Creative mailbox, Follow-Up = 2026-07-22,
Status = **Pending Review**, Approve/Edit/Reject = **blank (awaiting CEO)**,
Sent At = **blank (not sent)**.

## Guardrails enforced

- Nothing auto-sends — send is manual and gated on Approve.
- A1 Creative lane only. TBF, A/1 Suppliers, and Holdings untouched.
- No existing records deleted. No second system created.

## Owner actions to go fully live

1. Deploy the Apps Script under operations@a1creativeagency.com and run `installTriggers` (see [`google-apps-script/README.md`](google-apps-script/README.md)).
2. Add the `AIRTABLE_TOKEN` script property and apply the `A1C/Intake` Gmail label to test messages.
3. Share the interface with Krisha (operator) and confirm Cecil's edit access on CEO Review.
