import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

// Enable debugging
app.commandLine.appendSwitch('remote-debugging-port', '9222');
app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('v', '1');

// Disable GPU acceleration
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

let win: BrowserWindow | null;
const serve = process.argv.includes('--serve');

// Error handling for GPU process
app.on('gpu-process-crashed', (event, killed) => {
  console.error('GPU Process Crashed:', { event, killed });
});

function createWindow() {
  console.log('Creating window...');
  win = new BrowserWindow({
    width: 1024,
    height: 848,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  console.log('Window created, setting up event handlers...');

  // Debug loading issues
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', { errorCode, errorDescription });
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
    if (win) {
      win.show(); // Show window after content loads
    }
  });

  if (serve) {
    console.log('Loading development URL...');
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200').catch(err => {
      console.error('Failed to load dev server:', err);
    });
  } else {
    console.log('Loading production URL...');
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    })).catch(err => {
      console.error('Failed to load production file:', err);
    });
  }

  win.webContents.openDevTools();

  win.on('closed', () => {
    console.log('Window closed');
    win = null;
  });
}

app.on('ready', () => {
  console.log('App ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('App activated');
  if (win === null) {
    createWindow();
  }
});
