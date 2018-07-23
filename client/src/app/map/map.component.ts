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
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators, ValidatorFn, NgForm, FormGroupDirective } from '@angular/forms';
import { literal } from '@angular/compiler/src/output/output_ast';



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
  incident_id ='none';
  coor;
  // filter
  // type_incident=["Fire","Flood","Gletser","Hazard","Not Sure"]
  type_incident = ["crash","drought","fire", "flood", "gletser", "hazard", "landslide"]
  type_incidentLow = ["fire", "flood", "gletser", "hazard", "question"]
 inputForm=true;
 addPointButton=false;
 filter=[];
 filterProvince=[];
 filterCap = ["in", "incident_id"];
 provinceDistrict:string; //"badakhshan";

  list_province = ["badakhshan","baghlan","kunduz","takhar","balkh",
                  "faryab","jowzan","samangan","sar-e pol","kabul",
                  "kapisa", "logar", "panjshir", "parwan", "wardak",
                  "kunar", "laghman", "nangarhar", "nuristan", "badghis",
                  "bamyan", "farah", "ghor", "herat", "ghazni", "khost",
                  "paktia","paktika", "daykundi", "helmand", "kandahar", "nimur",
                  "oruzgan", "zabul"];
  
  list_district = { "badakhshan": ['arghanj khwa','argo','baharak','darayim',
                                   'fayzabad','ishkashim','jurm','khash',
                                   'khwahsan','kishim','kohistan','kuf ab',
                                   'kuran wa munjan','maimay','nusay','ragh',
                                   'shahri buzurg','shekay','shighnan','shuhada',
                                   'tagab','tishkan','wakhan','wurduj','yaftali sufla',
                                   'yamgan','yawan','zebak'],
                    "baghlan": ["andharab","baghlan","baghlani jadid","burka","dahana i guri","dih salah","dushi","farang wa gharu","guzhargi nur","khinjan","khost wa fereng","khwaja hijran","nahrin","puli hisar","puli khumri","tala wa barfak"],
                    "kunduz":["ali abad","archi","chardara","imam sahib","khan abad","kunduz","qalay-i-zal"],
                    "takhar":["baharak","bangi","chah ab","chal","darqad","dashti qala","farkhar","hazar sumuch","iskhamis","kalafagan","khwaja baha wuddin","khwaja ghar","namak ab","rustaq","taluqan","warsaj","yangi qala"],
                    "balkh":["balkh","chahar bolak","chahar kint","chimtal","dawlatabad","dihdadi","kaldar","khulmi","kishnindih","marmul","mazar-e Sharif","nahri shani","sholgara","shortepa","zari"],
                    "faryab":["almar","andkhoy","bilchiragh","dawlat abad","gurziwan","khani chahar bagh","khawaja sabz posh","kohistan","maymana","pashtun kot","qaramqol","qaysar","qurghan","shirin tagab"],
                    "jowzan":["aqcha","darzab","fayzabad","khamyab","khaniqa","khawaja du koh","mardyan","mingajik","qarqin","qush tepa","shibirgan"],
                    "samangan":["aybak","dara-I-Sufi balla","dara-I-Sufi Payan","feroz nakhchir","hazrati sultan","khuram wa sarbagh","ruyi du ab"],
                    "sar-e pol":["balkhab","gosfandi","kohistanat","sangcharak","sar-e pul","sayyad", "sozma qala"],
                    "kabul":["bagrami","chahar asyab","deh sabz","farza","guldara","istalif","kabul","kalakan","khaki jabbar","mir bacha kot","mussahi","paghman","qarabagh","shakardara","surobi"],
                    "kapisa":["alasay","hesa awal kohistan","hesa duwun kohistan","koh band","mahmud raqi","nijrab","tagab"],
                    "logar":["azra","baraki barak","charkh","kharwar","khoshi","mohammad agha","pul-i-alam"],
                    "panjshir":["anaba","bazarak","darah","khenj","paryan","rokha","shotul"],
                    "parwan":["bagram","chaharikar","ghorband","jabal saraj","kohi safi","salang","sayed khel","shekh ali","shinwari","surkhi parsa"],
                    "wardak":["chaki","day mirdad","hisa-i-awali bihsud","jaghatu","jalrez","markazi bihsud","maydan shahr","nirkh","saydabad"],
                    "kunar":["asadabad","bar kunar","chapa dara","chawkay","dangam","dara-i-pech","ghaziabad","khas kunar","marawara","narang wa badil","nari","nurgal","shaygal wa shiltan","sirkanay","wata pur"],
                    "laghman":["alingar","alishing","baad pakh","dawlat shah","mihtarlam","qarghayi"],
                    "nangarhar":["achin","bati kot","behsud","chaparhar","dara-i-nur","dih bala","dur baba","goshta","hisarak","jalalabad","kama","khogyani","kot","kuz kunar","lal pur","muhmand dara","nazyan","pachir wa agam","rodat","sherzad","shinwar","surkh rod"],
                    "nuristan":["bargi matal","du ab","kamdesh","mandol","nurgaram","parun","wama","waygal"],
                    "badghis":["ab kamari","ghormach","jawand","muqur","murghab","qadis","qala-i-naw"],
                    "bamyan":["bayman","kahmard","panjab","sayghan","shibar","waras","yakawlang"],
                    "farah":["anar dara","bakwa","bala buluk","farah","gulistan","khaki safed","lash wa juwayn","pur chaman","pusht rod","qala i kah","shib koh"],
                    "ghor":["chaghcharcaran","charsada","dawlat yar","du layna","lal wa sarjangal","pasaband","saghar","shahrak","taywara","tulak"],
                    "herat":["adraskan","chishti sharif","farsi","ghoryan","gulran","guzara","hirat","injil","karukh","kohsan","kushk","kushki kuhna","obe","pashtun zarghun","shindad","zinda jan"],
                    "ghazni":["ab band","ajristan","andar","dih yak","gelan","ghazni city","giro","jaghatu district","jaghuri","khugiani","khwaja umari","malistan","muqur","nawa","nawur","qarabagh","rashidan","waghaz","zana khan"],
                    "khost":["bak","gurbuz","jaji maydan","khost","mandozai","musa khel","nadir shah kot","qalandar","sabari","shamal","spera","tani","tere zayi"],
                    "paktia":["ahmadabad","chamkani","dand wa patan","gardez","jaji","jani khail","lazha ahmad khel","sayed karam","shwak","wuza zadran","zurmat"],
                    "paktika":["barmal","dila","gayan","gomal","janikhel","mata khan","nika","omna","sar hawza","sarobi","sharan","terwa","urgun","wazakhwa","wor mamay","yahya khel","yusuf khel","zarghun shahr","ziruk"],
                    "daykundi":["gizab","ishtarlay","khajran","khadir","kiti","miramor","nili","sangtakht","shahristan"],
                    "helmand":["baghran","dishu","garmsir","gerishk","kajaki","khanashin","lashkargah","majrah","musa qala","nad ali","nawa-l-barakzayi","nawzad","sangin","washir"],
                    "kandahar":["arghandab","dand","arghistan","daman","ghorak","kandahar","khakrez","maruf","maywand","miyan nasheen","naish","panjwaye","reg","shah wali kot","shorabak","spin boldak","zhari","takhta pool"],
                    "nimur":["chahar burjak","chakhansur","kang","khash rod","zaranj"],
                    "oruzgan":["chora","deh rahwod","khas uruzgan","shahidi hassas", "tairin kowt"],
                    "zabul":["argahandab","atghar","daychopan","kakar","mizan","naw bahar","qalat","shah joy","shamulzayi","shinkay","tarnak wa jaldak"]
                  };
  
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

  // Form
  form:FormGroup;

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

  constructor(private mapService: MapService, 
              private socketService: SocketService, 
              private fb: FormBuilder) {
    // this.differ = iterasi.find([]).create(null);
   }

  ngOnInit() {
    
    this.initializeMap();
    this.initIoConnection();
    
    console.log("MAPS",this.maps);
    // console.log("spline",this.spline_data);

    //FORM
    this.form = this.fb.group({
      message:'',
      incident:['', Validators.required],
      province:'',
      district:'',
      coordinate:[[],Validators.required]
    })
  
    console.log(this.list_district["kabul"]);
    console.log(this.provinceDistrict);
        
   
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
      console.log("MAPS",this.maps);

      // add Layer ##ADDing Layer##
      this.map.on('load', () => {
        console.log('POPULATe to add layer')
        let data = new FeatureCollection(mongomap)
        this.source.setData(data)
       })
      // ##ADDing Layer-END##
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
        this.lat = 34.543896//position.coords.latitude;
        this.lng = 69.160652//position.coords.longitude;
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
      zoom: 5.5,//13,
      center: [this.lng, this.lat]
    });

    

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

     

    //// Add Marker on Click
    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat]
      this.coor = coordinates;
      console.log(coordinates,"CEK KOORDINAT");
      // const newMarker = new MapModel(coordinates, { message: this.message, incident_id: this.incident_id })
      // this.map.flyTo({ center: coordinates})
      // console.log("NEW",newMarker);
      // this.socketService.send(newMarker); 
      
     
      
             
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


      // ##IGNORE##
      // this.socketService.getMongoMap()
      //     .subscribe((mongoDB)=>{
      //       console.log('ADD layer')
      //       let data = new FeatureCollection(mongoDB)
      //       this.source.setData(data)
      //     })
      // // ##IGNORE-END##
      
      // add Layer ##ADDing Layer##
      // this.map.addLayer({
      //   id: 'firebase-shadow-1',
      //   source: 'firebase',
      //   // ##### circle transparant

      //   // ######circle
      //   type: "circle",
      //   paint: {
      //     "circle-color": "#11b4da",
      //     "circle-radius": 40,
      //     // "circle-stroke-width": 0.5,
      //     // "circle-stroke-color": "#fff",
      //     "circle-opacity": 0.5
      //   }

      // })

      // this.map.addLayer({
      //   id: 'firebase-shadow-2',
      //   source: 'firebase',
      //   // ##### circle transparant

      //   // ######circle
      //   type: "circle",
      //   paint: {
      //     "circle-color": "#11b4da",
      //     "circle-radius": 20,
      //     // "circle-stroke-width": 0.5,
      //     // "circle-stroke-color": "#fff",
      //     "circle-opacity": 0.8
      //   }

      // })

      this.map.addLayer({
        id: 'firebase',
        source: 'firebase',
        // ##### circle transparant
       
        // ######circle
        type: "circle",
        paint: {
          "circle-color":  "#fff",
          "circle-radius": 4,
          "circle-stroke-width": 0.1,
          "circle-stroke-color": "#11b4da",
          
        }
        // ######SYmbol
        // type: 'symbol',
        // layout: {
        //   'text-field': '{message}',
        //   'text-size': 14,
        //   'text-transform': 'uppercase',
        //   'icon-image': 'rocket-15',
        //   'text-offset': [0, 2.0]
        // },
        // paint: {
        //   'text-color': '#2491eb',
        //   'text-halo-color': '#fff',
        //   'text-halo-width': 2
        // }
      })
      // // add Layer ##ADDing Layer##
      
      


    })


  }

  flyTo(data: MapModel) {
    this.map.flyTo({
      center: data.geometry.coordinates,
      zoom:20
    })
  }

  addMarkers(data: MapModel[]){
    data.forEach(datum=>{
      console.log("MARKER", datum);
      let tmp = document.createElement('div');
      let province = datum.properties.province;
      let district = datum.properties.district;
      let new_province = province.replace(" ", "-");
      let new_district = district.replace(" ", "-");
      if (datum.properties.incident_id === "flood") {
        tmp.className = 'marker-flood';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "fire") {
        tmp.className = 'marker-fire';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "gletser") {
        tmp.className = 'marker-gletser';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "hazard") {
        tmp.className = 'marker-hazard';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "crash"){
        tmp.className = 'marker-crash';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "landslide"){
        tmp.className = 'marker-landslide';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      } else if (datum.properties.incident_id === "drought") {
        tmp.className = 'marker-drought';
        tmp.classList.add(new_province);
        tmp.classList.add(new_district);
      }      
      else {
        tmp.className = 'marker-question-mark';
      }


      let popup = new mapboxgl.Popup({offset:25})
                              .setText(datum.properties.message)
      
      new mapboxgl.Marker(tmp, {offset:[0,-6]})
        .setLngLat(datum.geometry.coordinates)
        .setPopup(popup)        
        .addTo(this.map);

      
        
    })

   
  }

  //trying Highcharts 
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

  // FORM
  onSubmit(formData: any, formDirective: FormGroupDirective){
    console.log(this.form.value, this.form.valid);
    if(this.form.valid){
      let coordinates = this.form.value.coordinate;
      let m = this.form.value.message;
      let i = this.form.value.incident;
      let p = this.form.value.province;
      let d = this.form.value.district;
      let new_d = d.replace(" ","-")
      console.log(new_d);
      const newMarker = new MapModel(coordinates, { message: m, incident_id: i, province:p, district:new_d });
      this.map.flyTo({ center: coordinates });
      console.log("NEW", newMarker);
      this.socketService.send(newMarker);
      formDirective.resetForm();
      this.form.reset();
    }else{
      console.log('Input Required');
    }
   
    
  }

  //########### FIlLTER-START
  // Button Filter
  // fire(){
  //   this.map.setFilter('firebase', ['==', "incident_id", "Fire"]);
  //   // console.log(document.getElementsByClassName("marker-fire").length);
  //   //  document.getElementsByClassName("marker-fire")[0].style.display = 'none';
   
  //   // x[0].style.display = "none";
  //   let notElements = document.querySelectorAll('div[class^="marker-"]') as HTMLCollectionOf<HTMLElement>
  //   let floorElements = document.getElementsByClassName("marker-fire") as HTMLCollectionOf<HTMLElement>;
  //   let lengthClassName = floorElements.length;
  //   let notlengthClassName = notElements.length;
  //   for (let i = 0; i < notlengthClassName; i++) {
  //     notElements[i].style.display = 'none';
  //   }
    
  //   for(let i=0;i<lengthClassName;i++){
  //     floorElements[i].style.display = 'block';
  //   } 
    
  // }

  // flood() {
  //   this.map.setFilter('firebase', ['==', "incident_id", "Flood"]);
  //   let notElements = document.querySelectorAll('div[class^="marker-"]') as HTMLCollectionOf<HTMLElement>;//document.getElementsByClassName("marker-fire") as HTMLCollectionOf<HTMLElement>;
  //   let floodElements = document.getElementsByClassName("marker-flood") as HTMLCollectionOf<HTMLElement>;
  //   let notlengthClassName = notElements.length;
  //   let floodlengthClassName = floodElements.length;
  //   for (let i = 0; i < notlengthClassName; i++) {
  //     notElements[i].style.display = 'none';
  //   }
  //   for (let i = 0; i < floodlengthClassName; i++) {
  //     floodElements[i].style.display = 'block';
  //   }
  // }

  // all(){
  //   this.map.setFilter('firebase', ['in', "incident_id", "Fire", "Flood", "Gletser", "Hazard", "Not Sure"]);  
  //   // let allMarker = document.getElementsByClassName("marker-flood") as HTMLCollectionOf<HTMLElement>;
  //   let allMarker = document.querySelectorAll('div[class^="marker-"]') as HTMLCollectionOf<HTMLElement>;
  //   let lengthClassName = allMarker.length;
  //   // console.log(lengthClassName);
  //   for (let i = 0; i < lengthClassName; i++) {
  //     allMarker[i].style.display = 'block';
  //   } 
  // }

  // TO Filter
  generalFilter(filtermarker:string[]){
    console.log("GF",filtermarker);
    let incidentElements = document.querySelectorAll('div[class^="marker-"]') as HTMLCollectionOf<HTMLElement>;
    
    let notlengthClassName = incidentElements.length;
    
    // if(filtermarker.length>0){
    //   for (let i = 0; i < notlengthClassName; i++) {
    //     incidentElements[i].style.display = 'none';
    //   }
    // }
    // else{  
    //   for (let i = 0; i < notlengthClassName; i++) {
    //     incidentElements[i].style.display = 'block';
    //   }
     
      
    // }

    // for(let i =0;i<filtermarker.length;i++){

    //   let x = document.getElementsByClassName('marker-'+filtermarker[i]) as HTMLCollectionOf<HTMLElement>;
    //   for (let i = 0; i < x.length; i++) {
    //     x[i].style.display = 'block';
    //   } 
    // }

    if (filtermarker.length > 0 ) {
      for (let i = 0; i < notlengthClassName; i++) {
        incidentElements[i].style.display = 'none';
      }

      for (let i = 0; i < filtermarker.length; i++) {
        if (this.filterProvince.length > 0) {
          for (let j = 0; j < this.filterProvince.length; j++) {
            let twoclass = document.getElementsByClassName('marker-' + filtermarker[i] + " " + this.filterProvince[j]) as HTMLCollectionOf<HTMLElement>;
            console.log("TWO CLASS OR MORE", twoclass.length);
            twoclass[i].style.display = 'block';
          }
        } else {
          let twoclass = document.getElementsByClassName('marker-' + filtermarker[i]) as HTMLCollectionOf<HTMLElement>;
          console.log("ONE CLASS OR MORE", twoclass.length);
          for (let i = 0; i < twoclass.length; i++) {
            twoclass[i].style.display = 'block';
          }

        }

      }


      
    } else if ( this.filterProvince.length > 0){
      for (let i = 0; i < notlengthClassName; i++) {
        incidentElements[i].style.display = 'none';
      }
      for (let i = 0; i <  this.filterProvince.length; i++) {
        if (filtermarker.length> 0) {
          for (let j = 0; j < this.filterProvince.length; j++) {
            let twoclass = document.getElementsByClassName('marker-' + filtermarker[j] + " " + this.filterProvince[i]) as HTMLCollectionOf<HTMLElement>;
            console.log("TWO CLASS OR MORE", twoclass.length);
            twoclass[i].style.display = 'block';
          }
        } else {
          let twoclass = document.getElementsByClassName(this.filterProvince[i]) as HTMLCollectionOf<HTMLElement>;
          console.log("ONE CLASS OR MORE", twoclass.length);
          for (let i = 0; i < twoclass.length; i++) {
            twoclass[i].style.display = 'block';
          }

        }

      }

    }
    else if(filtermarker.length <1 && this.filterProvince.length<1 ) {
      for (let i = 0; i < notlengthClassName; i++) {
        incidentElements[i].style.display = 'block';
      }


    }
    
    // for(let i =0;i<filtermarker.length;i++){
    //   if(this.filterProvince.length>0){
    //     for (let j = 0; j < this.filterProvince.length; j++) {
    //       let twoclass = document.getElementsByClassName('marker-' + filtermarker[i]+" "+this.filterProvince[j]) as HTMLCollectionOf<HTMLElement>;
    //       console.log("TWO CLASS OR MORE", twoclass.length);
    //       twoclass[i].style.display = 'block';
    //     }
    //   } else{
    //     let twoclass = document.getElementsByClassName('marker-' + filtermarker[i]) as HTMLCollectionOf<HTMLElement>;
    //     console.log("ONE CLASS OR MORE", twoclass.length);
    //     for (let i = 0; i < twoclass.length; i++) {        
    //       twoclass[i].style.display = 'block';
    //     } 
        
    //   }     
      
    // }
    
  }
  // TO Filter
  generalSetFilter(array){
    let a = array//['in',"incident_id","drought", "fire"]
    if(array.length>2){
      this.map.setFilter('firebase', array);
      // this.map.setFilter('firebase', a);
      console.log("array",array);
    }else{
      this.map.setFilter('firebase', ['in', "incident_id","crash","drought","fire","flood","gletser","hazard","landslide"]);
    }


  }

  // TO filter
  filterProvDistrict(filter:string[]){
    let lengtharray = filter.length;

    let incidentElements = document.querySelectorAll('div[class^="marker-"]') as HTMLCollectionOf<HTMLElement>;
    let notlengthClassName = incidentElements.length;
    if (filter.length > 0) {
      for (let i = 0; i < notlengthClassName; i++) {
        incidentElements[i].style.display = 'none';
      }
      // this.generalFilter(this.filter);
    } else {
      for (let i = 0; i < notlengthClassName; i++) {
        incidentElements[i].style.display = 'block';
        console.log(incidentElements[i].style.display);        
      }
      
     
    }


    for(let i=0;i<lengtharray;i++){
      let provinceElement = document.getElementsByClassName(filter[i]) as HTMLCollectionOf<HTMLElement>;
      console.log(provinceElement.length);
      for(let i=0;i<provinceElement.length;i++){
        provinceElement[i].style.display = 'block';
        
      }
          
    }
    
  }
  //########## FILLTER-END

  // #####OPEN-CLOSE ADD FORM########
  openFormMap(){
    this.inputForm = false;
    this.addPointButton = true;
  }

  closeForm(){
    this.inputForm = true;
    this.addPointButton = false;
  }

 // #####OPEN-CLOSE ADD FORM -  END########

  onCheckChange(e,item){
      
    if (e.checked){     
      this.filter.push(item);
      this.filterCap.push(item);
      console.log(this.filter);
    }else{
      console.log(item);
      let x = this.filter.indexOf(item)
      let y = this.filterCap.indexOf(item);
    
      this.filter.splice(x,1);
      this.filterCap.splice(y,1);
      console.log(this.filter);
    }

    this.generalFilter(this.filter);   
    // this.generalSetFilter(this.filterCap);
    

  }

  onProvinceDistrictfilter(e,item){
    let rmspace = item.replace(" ","-")
    if (e.checked) {
      this.filterProvince.push(rmspace);
      
      console.log(this.filterProvince);
    } else {
      
      let x = this.filterProvince.indexOf(rmspace);  
      console.log(x); 

      this.filterProvince.splice(x, 1);      
      console.log(this.filterProvince);
    }
    // this.filterProvDistrict(this.filterProvince); 
    this.generalFilter(this.filter);

  }
  

  
}
