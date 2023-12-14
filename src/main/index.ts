import { app, BrowserWindow, ipcMain } from 'electron';
import { chromium } from 'playwright';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const createWindow = (): void => {
  let x = 20
  let y = 20
  const frontWindow = BrowserWindow.getFocusedWindow()
  if (frontWindow) {
    const bounds = frontWindow.getBounds()
    x = bounds.x + 20
    y = bounds.y + 20
  }

  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    x,
    y,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    show: false,
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
};

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


async function startPlaywrightTrace() {
  const browser1 = await chromium.connectOverCDP(`http://127.0.0.1:9222`);
  await browser1.contexts()[0].tracing.start({ screenshots: true, snapshots: true, sources: true });
  
  const page1 = await browser1.contexts()[0].newPage();
  await page1.goto('https://github.com');
  
  const page2 = await browser1.contexts()[0].newPage();
  await page2.goto('https://www.google.com');
  
  await browser1.contexts()[0].tracing.stop({ path: 'file.zip' });
}


/**
 * Respond to IPC request for a new window
 */
ipcMain.on('trace-run', () => {
  startPlaywrightTrace();
})