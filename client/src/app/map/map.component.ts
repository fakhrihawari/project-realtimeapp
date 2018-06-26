import { element } from 'protractor';
import { Event } from './shared/model/event';
import { Component, OnInit, AfterViewInit, OnChanges, DoCheck, IterableDiffers } from '@angular/core';
import { MapModel,FeatureCollection } from './map-model';
import { MapService } from './map.service';
import mapboxgl = require('mapbox-gl');
import {SocketService} from './shared/services/socket.service';
import { Action } from './shared/model/action';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';



@Component({
  selector: 'tcc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  // socket
  action = Action; 
  maps: MapModel[]=[];
  ioConnection:any;

  /// default settings
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/dark-v9';
  lat = 37.75;
  lng = -122.41;
  message = 'Hello World!';


  //data
  source: any;
  markers: any;
  // differ: any;

  constructor(private mapService: MapService, private socketService: SocketService, iterasi: IterableDiffers) {
    // this.differ = iterasi.find([]).create(null);
   }

  ngOnInit() {
    
    this.initializeMap();
    this.initIoConnection();
    
    console.log(this.maps);   

    
  
        
   
  } 

  private initIoConnection(){
    this.socketService.initSocket();
    this.ioConnection = this.socketService.onMap().subscribe((map:MapModel)=>{
      this.maps.push(map); 
      
      console.log("push",this.maps);     
    });
    console.log("IO",this.ioConnection);   

    this.socketService.onMapEvent(Event.CONNECT).subscribe(()=>{
      console.log('connected');
    });
    
    
    this.socketService.getMongoMap().subscribe((mongomap) => {
      console.log("MongoMap", mongomap);
      //addmarkers
      this.addMarkers(mongomap);
      if (this.maps.length < 1) {
          this.maps = mongomap;
        } else{
          console.log('exist or not',this.maps);
          
        }
      // this.maps = mongomap;
      console.log(this.maps);
      // add Layer
      this.map.on('load', () => {
        console.log('POPULATe to add layer')
        let data = new FeatureCollection(mongomap)
        this.source.setData(data)
      })
    })

    // ######IGNORE##########
    // this.socketService.getMap()
    //   .subscribe((z) => {
    //     console.log("datageo", z);
    //     //add marker
    //     this.addMarkers(z);
    //     z.forEach(element => {
    //       this.maps.push(element);
          
    //     });
    //     // add Layer
    //     this.map.on('load', () => {
    //       console.log('POPULATe to add layerZ')
    //       let data = new FeatureCollection(this.maps);
    //       this.source.setData(data)
    //     })
    //   });

    // this.socketService.getMap()
    //   .subscribe((z) => {
    //     console.log("datageo", z);
    //     //add marker
    //     this.addMarkers(z);
    //     if(this.maps.length<1){
    //       this.maps = z;
    //     } else{
    //       console.log('sudah ada');
    //     }
        
    //     // add Layer
    //     this.map.on('load', () => {
    //       console.log('POPULATe to add layer')
    //       let data = new FeatureCollection(z)
    //       this.source.setData(data)
    //     })
    //   });


  //original
    // this.socketService.getMap()
    // .subscribe((z)=>{
    //   console.log("datageo",z);
    //   //add marker
    //   this.addMarkers(z);    
    //    this.maps = z;
    //  // add Layer
    //   this.map.on('load',()=>{
    //     console.log('POPULATe to add layer')
    //     let data = new FeatureCollection(z)
    //     this.source.setData(data)
    //   })
    // });

   

    // this.socketService.onwtv();

    // ######IGNORE-END##########

    this.socketService.onMapEvent(Event.DISCONNECT).subscribe(() => {
      console.log('disconnected');
    })

    
  }

  private initializeMap() {
    /// locate the user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.map.flyTo({
          center: [this.lng, this.lat]
        })
      });
    }

    this.buildMap()

  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });

    

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

     

    //// Add Marker on Click
    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat]
      
      console.log(coordinates,"CEK KOORDINAT");
      const newMarker = new MapModel(coordinates, { message: this.message })
      this.map.flyTo({ center: coordinates})
      console.log("NEW",newMarker);
      this.socketService.send(newMarker); 
      // this.socketService.wtv();  
      
      
             
    });    

   
    this.map.on('load', () => {   
      
     
      this.map.addSource('firebase', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

       this.source = this.map.getSource('firebase')

      this.socketService.getMap()
        .subscribe((z)=>{
          console.log('MAPudah nambah belum',this.maps);
          console.log('ADD layerOnBuild',z);
          // let data = new FeatureCollection(z);
          let data = new FeatureCollection(this.maps)
          this.addMarkers(this.maps);
          this.source.setData(data)
        })

      // this.socketService.getMongoMap()
      //     .subscribe((mongoDB)=>{
      //       console.log('ADD layer')
      //       let data = new FeatureCollection(mongoDB)
      //       this.source.setData(data)
      //     })
      
      
      this.map.addLayer({
        id: 'firebase',
        source: 'firebase',
        type: 'symbol',
        layout: {
          'text-field': '{message}',
          'text-size': 24,
          'text-transform': 'uppercase',
          'icon-image': 'rocket-15',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      })


    })


  }

  flyTo(data: MapModel) {
    this.map.flyTo({
      center: data.geometry.coordinates
    })
  }

  addMarkers(data: MapModel[]){
    data.forEach(datum=>{
      console.log("MARKER");
      let tmp = document.createElement('div');
      tmp.className = 'marker'; 
  
      new mapboxgl.Marker(tmp)
        .setLngLat(datum.geometry.coordinates)
        .addTo(this.map);
        
    })

   
  }

  // addLayer(data){

  //   data = new FeatureCollection(data);

  //   // this.map.on('click', () => {




  //   //   // this.map.addSource('firebase', {
  //   //   //   type: 'geojson',
  //   //   //   data: {
  //   //   //     type: 'FeatureCollection',
  //   //   //     features: []
  //   //   //   }
  //   //   // });

  //   //   // this.source = this.map.getSource('firebase')

  //   //   this.socketService.getMap()
  //   //     .subscribe((z) => {
  //   //       console.log('ADD layer')
  //   //       let data = new FeatureCollection(z)
  //   //       this.source.setData(data)
  //   //     })

  //   //   this.map.addLayer({
  //   //     id: 'firebase',
  //   //     source: 'firebase',
  //   //     type: 'symbol',
  //   //     layout: {
  //   //       'text-field': '{message}',
  //   //       'text-size': 24,
  //   //       'text-transform': 'uppercase',
  //   //       'icon-image': 'rocket-15',
  //   //       'text-offset': [0, 1.5]
  //   //     },
  //   //     paint: {
  //   //       'text-color': '#f16624',
  //   //       'text-halo-color': '#fff',
  //   //       'text-halo-width': 2
  //   //     }
  //   //   })


  //   // })

  //   this.source.setData(data)

  // }

  
}
