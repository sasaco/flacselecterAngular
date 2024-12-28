export interface IElectronAPI {
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<void>;
  showOpenDialog: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  platform: string;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
