const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false,
    windowed: true,
    icon: path.join(__dirname, '../src/sps.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('http://localhost:3000');
}
app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('save-contact-data', async (event, data) => {
    const filePath = path.join(__dirname, '../src/contacts.json');
    try {
      let contacts = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        contacts = JSON.parse(fileContent);
      }
      contacts.push(data);
      fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving contact data:', error);
      return { success: false, error: error.message };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
