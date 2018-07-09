import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import {ChartModule } from 'angular-highcharts';
// import { HighchartsChartComponent} from 'highcharts-angular';
// import { HighchartsChartComponent } from '../../node_modules/highcharts-angular/src/app/highcharts-chart.component'; 


import { MapModule } from './map/map.module';


@NgModule({
  declarations: [
    AppComponent,
    // HighchartsChartComponent,
    // MapComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ChartModule,
    SharedModule,    
    MapModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
