// A small stand-in for a linter: every source and test file must parse.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith('.js') ? [join(dir, entry.name)] : [],
  );
}

let failed = 0;
for (const file of [...files('src'), ...files('test')]) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    failed++;
    process.stderr.write(error.stderr);
  }
}

if (failed > 0) process.exit(1);
console.log('lint: ok');
