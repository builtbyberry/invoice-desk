import { createServer } from '../src/server.js';
import { createStore } from '../src/invoices.js';

// Starts the API on a free port with a fresh store, and returns a fetch helper.
export async function startApi(store = createStore()) {
  const server = createServer(store);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;

  return {
    request: (path, init) => fetch(base + path, init),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
