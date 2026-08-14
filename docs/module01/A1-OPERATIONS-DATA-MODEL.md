# A1 Operations — Data Model

Base **A1 Creative Agency Hub** `appvfR20qp1dh5bT0`.

## Entity Registry `tblrfAF2LmVIUQihF` (source of truth)
| Field | Type | Purpose |
|---|---|---|
| Entity ID | text | A1_CREATIVE / A1_SUPPLIERS / TBF_ENTERTAINMENT |
| Entity Name | text | display name |
| Business Lane | select | A1 Creative / A/1 Suppliers / TBF Entertainment / NEEDS REVIEW |
| Domains | long text | one per line |
| Addresses | long text | one per line |
| Approved Send From | email | the only reply identity |
| Send-As Configured | checkbox | false ⇒ config required ⇒ send blocked |
| Notes | long text | config status |

Seeded: A1 Creative (configured); A/1 Suppliers (alias config required); TBF (addresses config required).

## Inbox Queue `tblUFUnImwgHhHyqP` — Module 01 fields (added)
| Field | Type | Set by | Meaning |
|---|---|---|---|
| Entity | select | capture | ENTITY_ID as system data (locked) |
| Business Lane | select | capture | lane |
| Original Recipient | email | capture | ORIGINAL_TO (preserved through forward) |
| Approved Send From | email | capture (from registry) | reply identity; blank ⇒ config required |
| Send-From Config Required | checkbox | capture | true ⇒ send guard blocks |
| Ops Category | select (20) | agent/human | Lead…Unknown |
| Ops Priority | select | agent/human | P1–P4 |
| Ops Status | select (13) | agent/human | NEW…CLOSED |

Reused existing fields cover section-14 requirements: Email ID = Gmail Message ID, Thread ID =
Gmail Thread ID, Date Received = Received At, Sender = From, Summary = AI Summary, Required Action =
Recommended Next Action, Deadline = Detected Deadline, Approval Required = CEO Review Required,
Follow-Up Date, Response Status = Status, Closed Date = Closed At, Notes, Assigned To = Recommended Owner.

## Mapping rule
`resolveEntity(originalTo)` matches address then domain against the registry. No match ⇒
`ENTITY = NEEDS REVIEW`, `Send-From Config Required = true` (fail closed).
