import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
// TODO: Import @electron/remote once package is installed
// import { /* ... */ } from '@electron/remote';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable()
export class ElectronService {

  electron: {
    ipcRenderer: {
      send: (channel: string, data?: any) => void;
      sendSync: (channel: string, data?: any) => any;
      receive: (channel: string, func: Function) => void;
    };
    fs: {
      readFileSync: (path: string, options?: any) => Buffer | string;
      writeFileSync: (path: string, data: any, options?: any) => void;
    };
    childProcess: {
      spawn: (command: string, args?: string[], options?: any) => any;
    };
  };

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.electron = (window as any).electron;
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
