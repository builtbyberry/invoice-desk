import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, InvalidRequestError, NotFoundError } from '../src/invoices.js';

test('lists every invoice with no filters', () => {
  assert.equal(createStore().list().length, 12);
});

test('filters by status', () => {
  const rows = createStore().list({ status: 'paid' });

  assert.deepEqual(rows.map((row) => row.id), ['INV-1001', 'INV-1005']);
});

test('rejects an unknown status', () => {
  assert.throws(() => createStore().list({ status: 'late' }), InvalidRequestError);
});

test('filters by part of the customer name, ignoring case', () => {
  const rows = createStore().list({ customer: 'acme' });

  assert.deepEqual(rows.map((row) => row.id), ['INV-1002', 'INV-1010']);
});

test('a payment that covers the balance marks the invoice paid', () => {
  const store = createStore();

  const invoice = store.pay('INV-1007', 8500);

  assert.equal(invoice.amount_paid_cents, 8500);
  assert.equal(invoice.status, 'paid');
});

test('a partial payment leaves the invoice open', () => {
  const invoice = createStore().pay('INV-1002', 1000);

  assert.equal(invoice.amount_paid_cents, 1000);
  assert.equal(invoice.status, 'open');
});

test('a void invoice cannot take a payment', () => {
  assert.throws(() => createStore().pay('INV-1009', 100), InvalidRequestError);
});

test('an unknown invoice is not found', () => {
  assert.throws(() => createStore().get('INV-9999'), NotFoundError);
});
