import { Routes } from '@angular/router';
import { InputPageComponent } from './components/input-page/input-page.component';
import { OutputPageComponent } from './components/output-page/output-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/input-page', pathMatch: 'full' },
    { path: 'input-page', component: InputPageComponent },
    { path: 'output-page', component: OutputPageComponent }
];