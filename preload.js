// Preload script to expose protected APIs to renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel, data) => {
        // whitelist channels
        const validChannels = ['read-csv-file'];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      sendSync: (channel, data) => {
        // whitelist channels
        const validChannels = ['read-csv-file'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.sendSync(channel, data);
        }
      },
      receive: (channel, func) => {
        const validChannels = ['read-csv-file'];
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
    },
    // Expose needed file system methods
    fs: {
      readFileSync: (path, options) => require('fs').readFileSync(path, options),
      writeFileSync: (path, data, options) => require('fs').writeFileSync(path, data, options)
    },
    // Expose needed child_process methods
    childProcess: {
      spawn: (command, args, options) => require('child_process').spawn(command, args, options)
    }
  }
);
