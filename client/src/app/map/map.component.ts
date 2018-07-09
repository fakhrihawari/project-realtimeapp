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
import * as Highcharts from 'highcharts';  


@Component({
  selector: 'tcc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
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
  coor;

  //data
  source: any;
  markers: any;
  // differ: any;

  // Charts

  Highcharts = Highcharts;
  updateFlag = false; 
 
  oneToOneFlag = true
  spline_data = [1, 2, 0, 4, 6, 2, 3, 1];
  spline_data_length = this.spline_data.length;

  optInput = {
    title: {
      text: 'Chart Scatter'
    },
   
    series: [{
      type:"scatter",
      name:"Incident",
      data: [1, 2, 0,4,6,2,3,1]
    }]
  };
  optInput2 = {
    chart: {  events: {} },
    title: {
      text: 'Chart Bar'
    },
    //put click on chart
    plotOptions:{
      bar:{
        point:{
          events:{
            click:(e)=>{
              // e.point to see data series info
              // console.log(e.point.series.name);
              this.chartClick(e);
            }
          }
        }
      }

    },
    series: [{
      type: "bar",
      name: "Roberry",
      data: [this.spline_data.length]//[1, 2, 0, 4, 6, 2, 3, 1],
      },
      {
        type: "bar",
        name: "Roberry2",
        data: [this.spline_data.length-5],
      },
    ]
  };
  optInput3 = {
    title: {
      text: 'Chart area'
    },
    series: [{
      name: "Theft",
      type: "area",
      data: [1, 2, 0, 4, 6, 2, 3, 1]
    }]
  };
  optInput4 = {
    chart: { events: {} },
    plotOptions: {
      spline: {
        point: {
          events: {
            click: (e) => {
              this.chartClick(e);
            }
          }
        }
      }

    }, 
    title: {
      text: 'Chart spline'
    },
    // event:{
    //   load:this.chartsData()
    // },
    series: [{
      name: "Spline series",
      type: "spline",
      data: this.spline_data//[1, 2, 0, 4, 6, 2, 3, 1]
    }]
  };

  constructor(private mapService: MapService, private socketService: SocketService, iterasi: IterableDiffers) {
    // this.differ = iterasi.find([]).create(null);
   }

  ngOnInit() {
    
    this.initializeMap();
    this.initIoConnection();
    
    console.log(this.maps);
    // console.log("spline",this.spline_data);
  
        
   
  }
  
  ngAfterViewInit(){
    setInterval(()=>{
      this.optInput2 = {
        chart: { events: {} },
        title: {
          text: 'Chart Bar'
        },
        //put click on chart
        plotOptions: {
          bar: {
            point: {
              events: {
                click: (e) => {
                  // e.point to see data series info
                  // console.log(e.point.series.name);
                  this.chartClick(e);
                }
              }
            }
          }

        },
        series: [{
          type: "bar",
          name: "Roberry",
          data: [this.maps.length]//[this.spline_data.length]//[1, 2, 0, 4, 6, 2, 3, 1],
        },
        {
          type: "bar",
          name: "Roberry2",
          data: [this.maps.length],
        },
        ]
      };
    },2000);
   
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
        console.log("cek array maps", this.maps.length)
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
      this.coor = coordinates;
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
      // tmp.className = 'marker'; 
      tmp.className = 'marker-robbery';

      let popup = new mapboxgl.Popup({offset:25})
                              .setText(datum.properties.message)
      
      new mapboxgl.Marker(tmp)
        .setLngLat(datum.geometry.coordinates)
        .setPopup(popup)
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


  
  chartsData(){
    
    console.log("before",this.optInput4)
    let y = Math.floor((Math.random() * 10)+1);
      this.spline_data.push(y);
      
    let a = this.spline_data;
   

    this.optInput = {
      title: {
        text: 'Chart Scatter'
      },
      series: [{
        type: "scatter",
        name: "Incident",
        data: this.spline_data//[1, 2, 0, 4, 6, 2, 3, 1]
      }]
    };
        
    this.optInput2 = {
      chart: { events: {} },
      title: {
        text: 'Chart Bar'
      },
      plotOptions: {
        bar: {
          point: {
            events: {
              click: (e) => {
                this.chartClick(e);
              }
            }
          }
        }
        
      },      
      series: [
        {
          type: "bar",
          name: "Roberry",
          data: [this.spline_data.length]//[1, 2, 0, 4, 6, 2, 3, 1, 4],
        },
        {
          type: "bar",
          name: "Roberry2",
          data: [this.spline_data.length-5+(Math.floor(Math.random()*10)+1)]//[10, 20, 20, 41, 60, 20, 30, 10, 5],
        },
      ]
    };
    
    this.optInput3 = {
      title: {
        text: 'Chart area'
      },
      series: [{
        name: "Theft",
        type: "area",
        data: this.spline_data//[1, 2, 0, 4, 6, 2, 3, 1]
      }]
    };
    
    this.optInput4 = {
      chart:{events:{}},
      plotOptions: {
        spline: {
          point: {
            events: {
              click: (e) => {
                this.chartClick(e);
              }
            }
          }
        }

      }, 
      title: {
        text: 'Chart spline'
      },      
      series: [{
        name: "Spline series",
        type: "spline",
        data: a
      }]
    };   
    

  }

  chartClick(e){
    alert(e.point.series);
    console.log("Nama: "+e.point.series.name+" ; "+"Nila: "+e.point.y);
  }

  
}
