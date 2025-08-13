const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click() {
          openFile();
        },
      },
      {
        label: 'Save',
        click() {
          saveFile();
        },
      },
      { role: 'quit' },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' },
    ],
  },
];

function openFile() {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile'],
    })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            console.error('File read error:', err);
            return;
          }
          mainWindow.webContents.send('file-opened', data);
        });
      }
    });
}

function saveFile() {
  dialog
    .showSaveDialog(mainWindow, {
      title: 'Save File',
      defaultPath: 'document.txt',
    })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePath;
        // Assuming the content is sent from the renderer process
        ipcMain.once('save-file', (event, content) => {
          fs.writeFile(filePath, content, (err) => {
            if (err) {
              console.error('File write error:', err);
            }
          });
        });
      }
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
