import 'reflect-metadata';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';

import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputDataService } from './providers/input-data.service';
import { InputPageComponent } from './components/input-page/input-page.component';
import { OutputPageComponent } from './components/output-page/output-page.component';

@NgModule({ declarations: [
        AppComponent,
        WebviewDirective,
        InputPageComponent,
        OutputPageComponent
    ],
    bootstrap: [
        AppComponent
    ], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule
    ], providers: [
        ElectronService,
        InputDataService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
