# invoice-desk

A small invoices API: Node 22, no dependencies, no database. Invoices load from `src/data/invoices.json` into memory each time the server or a test starts.

## Commands

- `npm test` runs every test (Node's built-in test runner).
- `npm run lint` checks every file parses.
- `npm start` serves the API on http://localhost:3000.

## Conventions

- Money is whole cents in data and in the API (`amount_cents`, `paid_cents`). Format it with `formatMoney()` from `src/utils.js`, and only at the edges.
- Dates are `YYYY-MM-DD` strings.
- Errors: throw `NotFoundError` (404) or `InvalidRequestError` (400) from `src/invoices.js`; the server turns them into JSON `{ "error": "..." }`.
- Every route has a test in `test/server.test.js` that goes through HTTP.
- The JSON shape of an invoice is a contract other teams use. Don't rename or remove a field.
