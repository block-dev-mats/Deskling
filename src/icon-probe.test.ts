import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { test } from 'node:test';
import { parseReply, readPositions, validSelection } from './icon-probe';

const screen = { x: 0, y: 0, width: 1440, height: 900 };
const ids = ['A', 'B'] as const;

test('selection accepts only two or three distinct synthetic IDs', () => {
  assert.equal(validSelection(['A', 'B']), true);
  assert.equal(validSelection(['A', 'B', 'C']), true);
  for (const value of [[], ['A'], ['A', 'A'], ['A', '../other'], ['A', 'B', 'C', 'D']]) {
    assert.equal(validSelection(value), false);
  }
});

test('fresh positions retain identity and point coordinates; missing removes that position', () => {
  assert.deepEqual(parseReply('A|ok|120|180\nB|ok|300|400', ids, screen), [
    { id: 'A', status: 'ok', x: 120, y: 180 }, { id: 'B', status: 'ok', x: 300, y: 400 },
  ]);
  assert.deepEqual(parseReply('A|ok|220|280\nB|missing', ids, screen), [
    { id: 'A', status: 'ok', x: 220, y: 280 }, { id: 'B', status: 'missing' },
  ]);
});

test('denial, timeout and unavailable replies contain no stale coordinates', () => {
  for (const status of ['denied', 'timeout'] as const) {
    assert.deepEqual(parseReply(status, ids, screen), ids.map(id => ({ id, status })));
  }
  assert.deepEqual(parseReply('A|unavailable\nB|unavailable', ids, screen), ids.map(id => ({ id, status: 'unavailable' })));
});

test('malformed, swapped, duplicate, nonfinite or coincident replies fail closed', () => {
  for (const reply of [
    'B|ok|10|20\nA|ok|30|40', 'A|ok|10|20\nA|missing',
    'A|ok|NaN|20\nB|missing', 'A|ok|99999999999999999999|20\nB|missing',
    'A|ok|100|200\nB|ok|100|200', 'A|ok|10|20\nB|missing\nC|missing',
    'A|ok|10|20\nB|missing|UNTRUSTED_TEXT', 'UNTRUSTED_ERROR_TEXT',
  ]) {
    assert.deepEqual(parseReply(reply, ids, screen), ids.map(id => ({ id, status: 'unavailable' })));
  }
});

test('sentinel and other-screen coordinates are never guessed or clamped', () => {
  assert.deepEqual(parseReply('A|ok|-1|-1\nB|ok|1440|200', ids, screen), [
    { id: 'A', status: 'no-position' }, { id: 'B', status: 'outside' },
  ]);
});

test('process errors are sanitized and invocation uses bounded execFile, never a shell', async t => {
  const processError = Object.assign(new Error('SYNTHETIC_PRIVATE_ERROR'), { killed: true });
  const stub = t.mock.method(childProcess, 'execFile', (...args: unknown[]) => {
    assert.equal(args[0], '/usr/bin/osascript');
    assert.deepEqual(args[1], ['/synthetic/finder-positions.applescript', 'A', 'B']);
    const options = args[2] as Record<string, unknown>;
    assert.equal(options.timeout, 10000);
    assert.equal(options.maxBuffer, 4096);
    assert.equal(options.killSignal, 'SIGKILL');
    assert.equal(options.shell, undefined);
    const callback = args[3] as (error: Error, stdout: string, stderr: string) => void;
    queueMicrotask(() => callback(processError, 'SYNTHETIC_PRIVATE_STDOUT', 'SYNTHETIC_PRIVATE_STDERR'));
    return {} as childProcess.ChildProcess;
  });
  assert.deepEqual(await readPositions('/synthetic/finder-positions.applescript', ids, screen, new AbortController().signal),
    ids.map(id => ({ id, status: 'timeout' })));
  const aborted = new AbortController();
  aborted.abort();
  assert.deepEqual(await readPositions('/synthetic/finder-positions.applescript', ids, screen, aborted.signal),
    ids.map(id => ({ id, status: 'unavailable' })));
  assert.equal(stub.mock.callCount(), 1);
});
