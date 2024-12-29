import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { InputPageComponent } from './components/input-page/input-page.component';
import { OutputPageComponent } from './components/output-page/output-page.component';


const routes: Routes = [
    { path: '', redirectTo: '/input', pathMatch: 'full' },
    { path: 'input', component: InputPageComponent },
    { path: 'output', component: OutputPageComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
