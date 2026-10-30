import { createServer as createHttpServer } from 'node:http';
import { createStore, InvalidRequestError, NotFoundError, toCsv } from './invoices.js';

export function createServer(store = createStore()) {
  return createHttpServer(async (req, res) => {
    try {
      await route(store, req, res);
    } catch (error) {
      if (error instanceof NotFoundError) return send(res, 404, { error: error.message });
      if (error instanceof InvalidRequestError) return send(res, 400, { error: error.message });
      console.error(error);
      send(res, 500, { error: 'Something went wrong.' });
    }
  });
}

async function route(store, req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && url.pathname === '/up') {
    return send(res, 200, { ok: true });
  }

  if (parts[0] !== 'invoices') {
    return send(res, 404, { error: 'Not found.' });
  }

  // GET /invoices?status=open&customer=acme
  if (req.method === 'GET' && parts.length === 1) {
    return send(res, 200, { data: store.list(filtersFrom(url)) });
  }

  // GET /invoices/export.csv?status=open
  if (req.method === 'GET' && parts[1] === 'export.csv' && parts.length === 2) {
    res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8' });
    return res.end(toCsv(store.list(filtersFrom(url))));
  }

  // GET /invoices/:id
  if (req.method === 'GET' && parts.length === 2) {
    return send(res, 200, { data: store.get(parts[1]) });
  }

  // POST /invoices/:id/pay  { "cents": 5000 }
  if (req.method === 'POST' && parts.length === 3 && parts[2] === 'pay') {
    const body = await readJson(req);
    return send(res, 200, { data: store.pay(parts[1], body.cents) });
  }

  send(res, 404, { error: 'Not found.' });
}

function filtersFrom(url) {
  const filters = {};
  for (const key of ['status', 'customer']) {
    if (url.searchParams.has(key)) filters[key] = url.searchParams.get(key);
  }
  return filters;
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;

  try {
    return raw === '' ? {} : JSON.parse(raw);
  } catch {
    throw new InvalidRequestError('Body must be JSON.');
  }
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}
