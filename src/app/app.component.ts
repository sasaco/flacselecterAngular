import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { AppConfig } from '../environments/environment';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  constructor(public electronService: ElectronService) {

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.electron.ipcRenderer);
      console.log('NodeJS childProcess', electronService.electron.childProcess);
    } else {
      console.log('Mode web');
    }
  }
}
