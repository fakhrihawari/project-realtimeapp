import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MapComponent } from './map.component';
import { SocketService } from './shared/services/socket.service';
import { MaterialModule} from '../shared/material/material.module';
// import { HighchartsChartComponent } from 'highcharts-angular';
import { HighchartsChartComponent} from '../../../node_modules/highcharts-angular/src/app/highcharts-chart.component'; 

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // HighchartsChartComponent,
    MaterialModule,
  ],
  declarations: [MapComponent, HighchartsChartComponent],
  providers: [MapService, SocketService]
})
export class MapModule { }
