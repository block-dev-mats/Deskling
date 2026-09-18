import { app, BrowserWindow, dialog, Menu, screen, type MenuItemConstructorOptions, type Tray } from 'electron';
import path from 'node:path';
import { failures, readPositions, TEST_IDS, type Result, type TestID } from './icon-probe';

const labels = {
  ok: 'position hittad', missing: 'saknas', denied: 'åtkomst nekad',
  timeout: 'Finder svarade inte', unavailable: 'position ej fastställd', outside: 'utanför primärskärmen',
  'no-position': 'Finder gav ingen individuell ikonposition',
};

export function installIconTest(tray: Tray, creature: BrowserWindow): () => void {
  const selected = new Set<TestID>();
  let markers: BrowserWindow[] = [];
  let results: Result[] = [];
  let busy = false;
  let generation = 0;
  let controller: AbortController | undefined;

  function clearMarkers() {
    for (const marker of markers) if (!marker.isDestroyed()) marker.destroy();
    markers = [];
  }

  function stop() {
    generation++;
    controller?.abort();
    controller = undefined;
    clearMarkers();
  }

  function menu() {
    const items: MenuItemConstructorOptions[] = [
      { label: 'Deskling · ikontest 2B', enabled: false },
      { label: 'Ögonblicksbild – uppdatera efter ikonflytt', enabled: false },
      ...TEST_IDS.map(id => ({
        label: `${id}: Deskling-2B-test-${id}.txt`, type: 'checkbox' as const,
        checked: selected.has(id), enabled: !busy,
        click: () => {
          if (selected.has(id)) selected.delete(id); else selected.add(id);
          stop(); results = []; menu();
        },
      })),
      { label: busy ? 'Läser… (högst 10 sekunder)' : 'Läs / uppdatera valda testikoner…',
        enabled: !busy && selected.size >= 2, click: () => { void update(); } },
      ...results.map(result => ({ label: `${result.id}: ${labels[result.status]}`, enabled: false })),
      { label: 'Rensa markörer / avbryt läsning', click: () => { stop(); busy = false; results = []; menu(); } },
      { type: 'separator' },
      { label: 'Avsluta Deskling', click: () => app.quit() },
    ];
    tray.setContextMenu(Menu.buildFromTemplate(items));
    // The same native actions are accessible to keyboard/assistive tools too.
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: 'Deskling', submenu: items }]));
    const summary = results.map(result => `${result.id}: ${labels[result.status]}`).join('. ');
    if (!creature.isDestroyed()) {
      void creature.webContents.executeJavaScript(
        `document.getElementById('creature').setAttribute('aria-label', ${JSON.stringify(`Deskling. Ikontest. ${summary || 'Ingen läsning gjord.'}`)})`,
      ).catch(() => {});
    }
  }

  async function update() {
    if (busy) return;
    stop(); results = []; busy = true; menu();
    const revision = generation;
    const ids = TEST_IDS.filter(id => selected.has(id));
    try {
      const choice = await dialog.showMessageBox({
        type: 'info', title: 'Läs testikonernas positioner',
        message: 'Endast läsning av valda syntetiska testobjekt',
        detail: `Valda filer: ${ids.map(id => `Deskling-2B-test-${id}.txt`).join(', ')}.\n\n` +
          'Finder tillfrågas endast om deras ikonpositioner. Inga filer listas, öppnas eller ändras. ' +
          'macOS kan be om Automation för Finder, under Electron eller appen som startade körningen. ' +
          'Ge inte Full diskåtkomst, skärminspelning eller Hjälpmedel.\n\n' +
          'Fortsätt endast om testikonerna är individuellt synliga på primärskärmen: inga travar, ' +
          'dolda skrivbordsikoner, Stage Manager eller fullskärmsläge. Dessa lägen kan inte verifieras här. ' +
          'Markörerna är testresultat att jämföra visuellt, inte ett bevis på stöd för andra visningslägen.',
        buttons: ['Avbryt', 'Läs testpositioner'], defaultId: 0, cancelId: 0,
        noLink: true,
      });
      if (revision !== generation || choice.response !== 1) return;
      controller = new AbortController();
      const bounds = screen.getPrimaryDisplay().bounds;
      const next = await readPositions(path.join(app.getAppPath(), 'src', 'finder-positions.applescript'), ids, bounds, controller.signal);
      if (revision !== generation) return;
      results = next;
      for (const result of results) {
        if (result.status !== 'ok') continue;
        const marker = new BrowserWindow({
          x: result.x - 40, y: result.y - 40, width: 80, height: 80,
          type: 'desktop', title: `Deskling test ${result.id}`, transparent: true,
          backgroundColor: '#00000000', frame: false, hasShadow: false,
          roundedCorners: false, show: false, focusable: false, resizable: false,
          movable: false, minimizable: false, maximizable: false, fullscreenable: false,
          skipTaskbar: true,
          webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: false },
        });
        markers.push(marker);
        marker.setIgnoreMouseEvents(true);
        marker.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        marker.webContents.on('will-navigate', event => event.preventDefault());
        await marker.loadFile(path.join(app.getAppPath(), 'src', 'marker.html'), { query: { id: result.id } });
        if (revision !== generation) return;
        marker.showInactive();
      }
    } catch {
      // Never surface raw Finder, process, URL or filesystem error text.
      if (revision === generation) { clearMarkers(); results = failures(ids, 'unavailable'); }
    } finally {
      if (revision === generation) { busy = false; controller = undefined; menu(); }
    }
  }

  function screenChanged() { stop(); busy = false; results = []; menu(); }
  screen.on('display-added', screenChanged);
  screen.on('display-removed', screenChanged);
  screen.on('display-metrics-changed', screenChanged);
  menu();
  return () => {
    screen.removeListener('display-added', screenChanged);
    screen.removeListener('display-removed', screenChanged);
    screen.removeListener('display-metrics-changed', screenChanged);
    stop();
  };
}
