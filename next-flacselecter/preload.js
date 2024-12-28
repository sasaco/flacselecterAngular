const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    readFile: (filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
    },
    writeFile: (filePath, data) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf8', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    platform: process.platform
  }
);
