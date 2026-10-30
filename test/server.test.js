import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from './helpers.js';

test('GET /invoices returns the list', async () => {
  const api = await startApi();
  const res = await api.request('/invoices?status=open');
  const body = await res.json();
  await api.close();

  assert.equal(res.status, 200);
  assert.ok(body.data.every((invoice) => invoice.status === 'open'));
  assert.deepEqual(Object.keys(body.data[0]), [
    'id', 'customer', 'email', 'amount_cents', 'paid_cents', 'amount', 'issued_on', 'due_on', 'status',
  ]);
});

test('GET /invoices with a bad status is a 400', async () => {
  const api = await startApi();
  const res = await api.request('/invoices?status=late');
  await api.close();

  assert.equal(res.status, 400);
});

test('GET /invoices/:id for an unknown invoice is a 404', async () => {
  const api = await startApi();
  const res = await api.request('/invoices/INV-9999');
  await api.close();

  assert.equal(res.status, 404);
});

test('POST /invoices/:id/pay records a payment', async () => {
  const api = await startApi();
  const res = await api.request('/invoices/INV-1003/pay', {
    method: 'POST',
    body: JSON.stringify({ cents: 5000 }),
  });
  const body = await res.json();
  await api.close();

  assert.equal(res.status, 200);
  assert.equal(body.data.paid_cents, 15000);
});

test('GET /invoices/export.csv is CSV', async () => {
  const api = await startApi();
  const res = await api.request('/invoices/export.csv');
  await api.close();

  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/csv/);
});
