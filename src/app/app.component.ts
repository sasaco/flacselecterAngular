import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { AppConfig } from '../environments/environment';
import packageJson from '../../package.json';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [RouterModule]
})
export class AppComponent {
  public version: string;

  constructor(public electronService: ElectronService) {
    this.version = packageJson.version;
    if (electronService.isElectron) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }
}