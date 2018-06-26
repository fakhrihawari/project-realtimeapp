import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './map.service';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { MapComponent } from './map.component';
import { SocketService } from './shared/services/socket.service';
import { MaterialModule} from '../shared/material/material.module'
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [MapComponent],
  providers: [MapService, SocketService]
})
export class MapModule { }
