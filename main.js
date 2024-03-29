import { app, BrowserWindow, shell } from "electron";
import path from "path";
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Live Reload
if(isDev) {
  import('electron-reload').then(module => {
    module(__dirname, {
      electron: path.join(__dirname, "node_modules", ".bin", "electron"),
      awaitWriteFinish: true,
    });
  }).catch(err => console.log(err));
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 725,
    height: 1100,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("public/index.html");

  // Open the DevTools.
  if(isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Open links in OSs default browser instead of Electron
  mainWindow.webContents.on('new-window', (event, url) => {
    // stop Electron from opening another BrowserWindow
    event.preventDefault()
    // open the url in the default system browser
    shell.openExternal(url)
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  app.quit();
});

if (process.platform === "darwin") {
  app.dock.setIcon(path.join(__dirname, "public/favicon.png"));
}