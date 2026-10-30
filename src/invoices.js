import { readFileSync } from 'node:fs';
import { formatCents } from './money.js';

const STATUSES = ['open', 'paid', 'void'];

export class NotFoundError extends Error {}
export class InvalidRequestError extends Error {}

// An in-memory store loaded from a JSON file. Each test makes its own.
export function createStore(path = new URL('./data/invoices.json', import.meta.url)) {
  const invoices = JSON.parse(readFileSync(path, 'utf8'));

  return {
    list(filters = {}) {
      let rows = invoices;

      if (filters.status !== undefined) {
        if (!STATUSES.includes(filters.status)) {
          throw new InvalidRequestError(`Unknown status "${filters.status}".`);
        }
        rows = rows.filter((invoice) => invoice.status === filters.status);
      }

      if (filters.customer !== undefined) {
        const needle = filters.customer.toLowerCase();
        rows = rows.filter((invoice) => invoice.customer.toLowerCase().includes(needle));
      }

      return rows.map(present);
    },

    get(id) {
      return present(find(invoices, id));
    },

    pay(id, cents) {
      const invoice = find(invoices, id);

      if (!Number.isInteger(cents) || cents <= 0) {
        throw new InvalidRequestError('Payment must be a positive whole number of cents.');
      }
      if (invoice.status !== 'open') {
        throw new InvalidRequestError(`Invoice ${id} is ${invoice.status} and can't take a payment.`);
      }

      invoice.paid_cents = Math.min(invoice.amount_cents, invoice.paid_cents + cents);
      if (invoice.paid_cents === invoice.amount_cents) {
        invoice.status = 'paid';
      }

      return present(invoice);
    },
  };
}

function find(invoices, id) {
  const invoice = invoices.find((row) => row.id === id);

  if (!invoice) {
    throw new NotFoundError(`Invoice ${id} not foud.`);
  }

  return invoice;
}

// What the API returns for one invoice.
function present(invoice) {
  return {
    id: invoice.id,
    customer: invoice.customer,
    email: invoice.email,
    amount_cents: invoice.amount_cents,
    paid_cents: invoice.paid_cents,
    amount: formatCents(invoice.amount_cents),
    issued_on: invoice.issued_on,
    due_on: invoice.due_on,
    status: invoice.status,
  };
}

// Kept from the first version of the export. Nothing calls it now.
export function legacyTotal(rows) {
  return rows.reduce((sum, row) => sum + row.amount_cents, 0) / 100;
}

export function toCsv(rows) {
  const header = 'id,customer,amount,issued_on,due_on,status';
  const lines = rows.map((row) =>
    [row.id, row.customer, formatCents(row.amount_cents), row.issued_on, row.due_on, row.status].join(','),
  );

  return [header, ...lines].join('\n') + '\n';
}
