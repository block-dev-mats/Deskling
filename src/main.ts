import { app, BrowserWindow, Menu, nativeImage, screen, Tray } from 'electron';
import path from 'node:path';

app.setName('Deskling');
app.setPath('userData', path.join(app.getPath('appData'), 'Deskling-2A'));

let creature: BrowserWindow | undefined;
let tray: Tray | undefined;
const smokeTest = process.argv.includes('--smoke-test');

if (process.platform !== 'darwin') {
  console.error('Deskling steg 2A kräver macOS.');
  app.exit(1);
} else if (!app.requestSingleInstanceLock()) {
  if (smokeTest) console.error('Avsluta den körande Deskling-instansen före smoke-testet.');
  app.exit(smokeTest ? 1 : 0);
} else {
  app.whenReady().then(async () => {
    app.setActivationPolicy('accessory');
    Menu.setApplicationMenu(null);

    tray = new Tray(nativeImage.createEmpty());
    tray.setTitle('Deskling');
    tray.setToolTip('Deskling – skrivbordsvarelse');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Deskling · experiment 2A', enabled: false },
      { type: 'separator' },
      { label: 'Avsluta Deskling', click: () => app.quit() },
    ]));

    const area = screen.getPrimaryDisplay().workArea;
    creature = new BrowserWindow({
      width: 180,
      height: 180,
      x: area.x + 40,
      y: area.y + area.height - 200,
      type: 'desktop',
      title: 'Deskling',
      transparent: true,
      backgroundColor: '#00000000',
      frame: false,
      hasShadow: false,
      roundedCorners: false,
      show: false,
      focusable: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        devTools: false,
        backgroundThrottling: true,
      },
    });
    creature.setIgnoreMouseEvents(true);
    creature.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    creature.webContents.on('will-navigate', event => event.preventDefault());
    creature.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    creature.webContents.session.setPermissionCheckHandler(() => false);
    creature.webContents.on('render-process-gone', () => app.exit(1));
    await creature.loadFile(path.join(app.getAppPath(), 'src', 'creature.html'));
    creature.showInactive();
    if (smokeTest) {
      const { runSmokeTest } = await import('./smoke.js');
      await runSmokeTest(creature, tray);
      app.quit();
    }
  }).catch((error: unknown) => {
    console.error(smokeTest ? error : 'Deskling kunde inte starta.');
    app.exit(1);
  });
}

app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => tray?.destroy());
process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());
