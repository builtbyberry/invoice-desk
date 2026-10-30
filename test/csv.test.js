import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, toCsv } from '../src/invoices.js';

test('the export has a header row', () => {
  const csv = toCsv(createStore().list());

  assert.ok(csv.startsWith('id,customer,amount,issued_on,due_on,status'));
});

test('the export has one line per invoice', () => {
  const rows = createStore().list({ status: 'paid' });

  assert.equal(toCsv(rows).trim().split('\n').length, rows.length + 1);
});
