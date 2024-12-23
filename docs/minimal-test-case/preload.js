const { contextBridge, ipcRenderer } = require('electron');

const validChannels = ['read-csv-file'];

contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel, data) => {
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      sendSync: (channel, data) => {
        if (validChannels.includes(channel)) {
          return ipcRenderer.sendSync(channel, data);
        }
      },
      receive: (channel, func) => {
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
    }
  }
);
