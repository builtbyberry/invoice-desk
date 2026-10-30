# invoice-desk

A small invoices API for the course **Claude as a partner, not autocomplete**. Use it for the exercises if you don't have a repository of your own that suits them.

It's deliberately small and deliberately imperfect: real-looking code, a `CLAUDE.md` that isn't quite right, tests that don't all prove what they claim, and tickets written the way tickets usually are.

## Set up

You need Node 22 or later and a GitHub account. Nothing to install.

1. On GitHub, choose **Use this template**, then **Create a new repository**. Check **Include all branches**, so your copy has the `flawed-review` branch for lesson 6. Then clone your copy.
2. Run `npm test`. Every test should pass.
3. In `.claude/release-config.json`, replace `OWNER` with your GitHub user or organization. You need this only for Part 2 (Marshall).

The API, once you run `npm start`:

| Route | What it does |
|---|---|
| `GET /invoices` | Lists invoices. Filters: `status` (`open`, `paid`, `void`) and `customer` (part of the name). |
| `GET /invoices/:id` | One invoice. |
| `GET /invoices/export.csv` | The same list as CSV, with the same filters. |
| `POST /invoices/:id/pay` | Records a payment: `{ "cents": 5000 }`. |
| `GET /up` | Health check. |

## The tickets

Tickets 1 and 2 are for Part 1, one each. Tickets 3 to 5 are one small release for Part 2.

When the course tells you to pick a ticket, take it from here. Each ticket is written as a teammate would write it, no more and no less: if it doesn't answer something, that's part of the exercise.

---

### Ticket 1: Filter invoices by issue date

**As** someone in accounts, **I want** to list invoices issued in a date range, **so that** I can check a month's billing.

**Acceptance criteria**

- `GET /invoices` accepts `issued_from` and `issued_to`, both `YYYY-MM-DD`.
- Both ends are inclusive: `issued_from=2026-09-01&issued_to=2026-09-30` includes invoices issued on the 1st and the 30th.
- Either can be given alone.
- They combine with the existing `status` and `customer` filters.
- A date that isn't a real `YYYY-MM-DD` date is a 400 with an error message.
- The CSV export accepts the same two filters.

---

### Ticket 2: CSV export breaks on some customer names

**Bug.** Accounts opened last month's export in a spreadsheet and the columns were shifted on some rows. It looks like it happens for customers with a comma in their name, like "Acme, Inc.".

**Acceptance criteria**

- Every row of `GET /invoices/export.csv` opens in a spreadsheet with the right value in each column, whatever is in the customer's name.
- The header and column order don't change.

---

### Ticket 3: Show when an invoice is overdue

**As** someone in accounts, **I want** each invoice to say whether it's overdue and what's still owed, **so that** I can chase the right customers.

**Acceptance criteria**

- Each invoice in the API has two new fields: `balance_cents` (amount less what's been paid) and `overdue` (`true` or `false`).
- An invoice is overdue when it's open, has a balance, and its due date is before today.
- Paid and void invoices are never overdue.
- Tests don't depend on the real date: they can set what "today" is.
- No existing field changes.

---

### Ticket 4: List overdue invoices

**Depends on ticket 3.**

**As** someone in accounts, **I want** to list only overdue invoices, **so that** my morning list is the customers to chase.

**Acceptance criteria**

- `GET /invoices?overdue=true` lists only overdue invoices; `overdue=false` lists the rest.
- It combines with the other filters, and the CSV export accepts it too.
- Any other value for `overdue` is a 400.

---

### Ticket 5: Send a payment reminder

**Depends on ticket 3.**

**As** someone in accounts, **I want** to record that I've sent a customer a reminder, **so that** the team doesn't chase the same invoice twice.

**Acceptance criteria**

- `POST /invoices/:id/remind` records a reminder on the invoice, with the time it was sent, and returns the invoice with a `reminders` list.
- Only overdue invoices can be reminded. Anything else is a 400 with an error message.
- Reminders can't be sent too often.
- No email is sent; this only records the reminder. Email comes later.
