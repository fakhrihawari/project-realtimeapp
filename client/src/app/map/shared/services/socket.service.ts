
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Event } from '../model/event';
import {MapModel} from '../../map-model'

// coba
import { MongoClient, Db, InsertOneWriteOpResult, MongoError } from 'mongodb';
import * as socketIo from 'socket.io-client';
const SERVER_URL = 'http://localhost:8282';


@Injectable()
export class SocketService {
  //coba
  public db: any = null;
  private connections = "mongodb://localhost:27017";
  
  private socket;

  public initSocket():void{
    this.socket = socketIo(SERVER_URL);
  }

  public send(map:MapModel){
    this.socket.emit('map',map);
  }

  // public wtv() {
  //   this.socket.emit('map2', 'halo halo bandung ibukota periangan');
  // }

  // public onwtv(){
  //   this.socket.on('map2',(data)=>{console.log('dari socket',data)})
  // }

  public onMap():Observable<MapModel>{
    return new Observable<MapModel>(observer=>{
      this.socket.on('map', (data: MapModel)=>{observer.next(data)})
    })
  }

  

  public onMapEvent(event: Event): Observable<any>{
    return new Observable<any>(observer=>{
      this.socket.on(event,()=>{observer.next(event)})
    })

  }

  public getMap(){
    return new Observable<any>(observer=>{
      this.socket.on('array',(data)=>{observer.next(data)})
    });
    // this.socket.on('array', (data) => { console.log("CEK123",data) })
   

  }

  public getMongoMap(){
    return new Observable<any>(observer=>{
      this.socket.on('mongo',(data)=>{observer.next(data)})
    })
  }


  // constructor() { }
  
  //coba
  // public monggoDB() {
  //   MongoClient.connect(this.connections, (err: MongoError, database) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       this.db = database.db('map');
  //       console.log('success');
  //     }
  //   })
  //   return this.db.collection('maps').find().toArray();


  // }

}
