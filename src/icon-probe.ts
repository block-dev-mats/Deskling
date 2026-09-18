import { execFile } from 'node:child_process';

export const TEST_IDS = ['A', 'B', 'C'] as const;
export type TestID = typeof TEST_IDS[number];
export type Failure = 'missing' | 'denied' | 'timeout' | 'unavailable' | 'outside' | 'no-position';
export type Result = { id: TestID; status: Failure } | { id: TestID; status: 'ok'; x: number; y: number };
export type Bounds = { x: number; y: number; width: number; height: number };

export function validSelection(ids: readonly string[]): ids is TestID[] {
  return ids.length >= 2 && ids.length <= 3 && new Set(ids).size === ids.length
    && ids.every(id => TEST_IDS.includes(id as TestID));
}

export function failures(ids: readonly TestID[], status: Failure): Result[] {
  return ids.map(id => ({ id, status }));
}

// Finder's desktop point is interpreted directly in primary-screen points.
// No calibration offsets, guessed positions, Retina division or clamping.
export function parseReply(reply: string, ids: readonly TestID[], bounds: Bounds): Result[] {
  const safeFailure = () => failures(ids, 'unavailable');
  if (!validSelection(ids)) return safeFailure();
  const text = reply.trim();
  if (text === 'denied' || text === 'timeout') return failures(ids, text);
  const rows = text.split(/\r?\n/);
  if (rows.length !== ids.length) return safeFailure();
  const results: Result[] = [];
  for (const [index, row] of rows.entries()) {
    const fields = row.split('|');
    const id = ids[index];
    if (fields[0] !== id) return safeFailure();
    if (fields.length === 2 && (fields[1] === 'missing' || fields[1] === 'unavailable')) {
      results.push({ id, status: fields[1] });
    } else if (fields.length === 4 && fields[1] === 'ok' && fields.slice(2).every(value => /^-?\d+$/.test(value))) {
      const x = Number(fields[2]);
      const y = Number(fields[3]);
      if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) return safeFailure();
      if (x === -1 && y === -1) {
        results.push({ id, status: 'no-position' });
      } else if (x < bounds.x || y < bounds.y || x >= bounds.x + bounds.width || y >= bounds.y + bounds.height) {
        results.push({ id, status: 'outside' });
      } else {
        results.push({ id, status: 'ok', x, y });
      }
    } else return safeFailure();
  }
  // Coincident points may represent collapsed stacks, not individual icons.
  const points = results.filter(result => result.status === 'ok');
  if (new Set(points.map(point => `${point.x},${point.y}`)).size !== points.length) return safeFailure();
  return results;
}

export function readPositions(script: string, ids: readonly TestID[], bounds: Bounds, signal: AbortSignal): Promise<Result[]> {
  if (!validSelection(ids) || signal.aborted) return Promise.resolve(failures(ids, 'unavailable'));
  return new Promise(resolve => {
    execFile('/usr/bin/osascript', [script, ...ids], {
      timeout: 10000, maxBuffer: 4096, killSignal: 'SIGKILL', signal,
    }, (error, stdout) => {
      // stderr and error messages can contain private data: never log or forward.
      if (error) resolve(failures(ids, error.killed && !signal.aborted ? 'timeout' : 'unavailable'));
      else resolve(parseReply(stdout, ids, bounds));
    });
  });
}
