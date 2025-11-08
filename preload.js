const { contextBridge } = require('electron');

// Expose Electron app information to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isPackaged: process.env.ELECTRON_IS_PACKAGED === 'true',
  userDataPath: process.env.ELECTRON_USER_DATA_PATH || ''
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});