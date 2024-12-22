/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

interface Window {
  process: any;
  require: any;
  electron: {
    ipcRenderer: {
      send(channel: string, ...args: any[]): void;
      sendSync(channel: string, ...args: any[]): any;
      receive(channel: string, func: Function): void;
    };
    fs: {
      readFileSync(path: string, options?: any): Buffer | string;
      writeFileSync(path: string, data: any, options?: any): void;
    };
    childProcess: {
      spawn(command: string, args?: string[], options?: any): any;
    };
  };
}
