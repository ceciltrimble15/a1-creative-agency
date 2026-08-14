# A1 Operations — Manual Actions (Krisha / Cretia + Cecil)

## Krisha / Cretia (operations)
- Review the queue by **Entity** and **Ops Priority**; work Yellow items.
- Score agent accuracy (tier, category, draft usable?) and correct classifications.
- Confirm every record has a locked **Entity** and a resolved **Approved Send From**; if
  **Send-From Config Required** is checked or **Entity = NEEDS REVIEW**, do not send — route to setup.
- Watch **Follow-Up Status = Overdue**; nothing important should go silent.
- Never approve Red items — those are Cecil's.

## Cecil (CEO)
- Approve graduation from shadow (separate approval).
- Decide all Red items (contracts, legal, refunds, pricing, banking/tax, government, media, disputes).
- Supply **TBF** domains/addresses + approved send-from; approve the **A/1 Suppliers** Send-As alias.
- Approve any email-provider change (never automatic).

## Config-required checklist (blocks sending until done)
- [ ] Gmail Send-As alias `info@a1suppliers.org` verified → set registry Send-As Configured = true
- [ ] TBF domains/addresses + send-from supplied → fill registry row, Send-As Configured = true
- [ ] Original-recipient-preserving forwarding into operations@ configured per lane
