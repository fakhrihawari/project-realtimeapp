import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';


import { MapModule } from './map/map.module';


@NgModule({
  declarations: [
    AppComponent,
    // MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,    
    MapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
