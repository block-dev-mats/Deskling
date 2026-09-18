import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { app, type BrowserWindow, type Tray } from 'electron';

// Opt-in checks of our own renderer only. No Desktop or other app inspection.
export async function runSmokeTest(window: BrowserWindow, tray: Tray): Promise<void> {
  const timeout = setTimeout(() => app.exit(1), 25000);
  try {
    assert.equal(window.isVisible(), true);
    assert.equal(window.isFocusable(), false);
    assert.equal(window.isFocused(), false);
    assert.equal(window.isAlwaysOnTop(), false);
    assert.equal(tray.isDestroyed(), false);
    const isolation = await window.webContents.executeJavaScript(`({
      require: typeof require, process: typeof process,
      background: getComputedStyle(document.body).backgroundColor,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
    })`);
    assert.equal(isolation.require, 'undefined');
    assert.equal(isolation.process, 'undefined');
    assert.equal(isolation.background, 'rgba(0, 0, 0, 0)');

    const image = await window.webContents.capturePage();
    const pixels = image.toBitmap();
    assert.equal(pixels[3], 0, 'The window corner must be transparent');
    assert.ok(pixels.some((value, index) => index % 4 === 3 && value > 0), 'The figure must contain visible pixels');

    // Wait for a real scheduled movement, not a forced test-only animation.
    if (!isolation.reduced) {
      let moving = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        const transform = await window.webContents.executeJavaScript(
          "getComputedStyle(document.getElementById('creature')).transform",
        );
        if (transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
          moving = true;
          break;
        }
        await delay(100);
      }
      assert.ok(moving, 'A scheduled movement must occur while visible');
    }
    await delay(1800);
    assert.equal(await window.webContents.executeJavaScript('document.getAnimations().length'), 0);
    assert.equal(window.isFocused(), false);
    console.log('PASS: visible native window, nonfocusable, no always-on-top, transparent pixels, isolated renderer, finite movement/rest, tray exists.');
    if (isolation.reduced) console.log('Reduced motion is enabled: movement was correctly skipped.');

    // Warm up CPU deltas, then sample the quiet portion of the cycle.
    app.getAppMetrics();
    const samples: { cpuPercent: number; workingSetMiB: number }[] = [];
    for (let sample = 0; sample < 3; sample++) {
      await delay(2000);
      const metrics = app.getAppMetrics();
      samples.push({
        cpuPercent: Number(metrics.reduce((total, metric) => total + metric.cpu.percentCPUUsage, 0).toFixed(2)),
        workingSetMiB: Math.round(metrics.reduce((total, metric) => total + metric.memory.workingSetSize, 0) / 1024),
      });
    }
    console.log('Idle samples (all Electron processes, 3 × 2 seconds):', JSON.stringify(samples));
    console.log('OS interaction, occlusion and full shutdown still require native/manual checks.');
  } finally {
    clearTimeout(timeout);
  }
}
