

import { Injectable } from '@angular/core';
import { environment} from '../../environments/environment';
// import * as mapboxgl from 'mapbox-gl';
import mapboxgl = require('mapbox-gl');


import { MapModel } from './map-model';

// var apiToken = environment.MAPBOX_API_KEY;


@Injectable()
export class MapService {
  
  
  constructor() { 
    mapboxgl.accessToken = environment.mapbox.accessToken;
    
  }

  

}
