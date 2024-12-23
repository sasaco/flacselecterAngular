import { Injectable } from '@angular/core';

@Injectable()
export class ElectronService {
  electron: {
    ipcRenderer: {
      send: (channel: string, data?: any) => void;
      sendSync: (channel: string, data?: any) => any;
      receive: (channel: string, func: Function) => void;
    };
  };

  constructor() {
    if (this.isElectron()) {
      this.electron = (window as any).electron;
    }
  }

  isElectron = () => {
    return window && (window as any).process && (window as any).process.type === 'renderer';
  }
}
