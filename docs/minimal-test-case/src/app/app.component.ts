import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';

@Component({
  selector: 'app-root',
  template: '<h1>Test Application</h1>'
})
export class AppComponent {
  constructor(private electronService: ElectronService) {
    console.log('ElectronService:', this.electronService.isElectron());
  }
}
