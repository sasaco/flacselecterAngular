import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  constructor(public electronService: ElectronService,
    private translate: TranslateService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.electron.ipcRenderer);
      console.log('NodeJS childProcess', electronService.electron.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  testDebugger() {
    // Add a breakpoint on the next line to test debugging
    const testValue = 42;
    console.log('Debug test value:', testValue);
  }
}
