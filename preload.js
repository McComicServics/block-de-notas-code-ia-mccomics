const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  saveFile: (content) => ipcRenderer.send('save-file', content),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Clean up listeners when window is about to be closed
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('file-opened');
});