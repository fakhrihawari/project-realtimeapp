
import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { MapModel } from './model/map-model';
import { MongoClient, Db, InsertOneWriteOpResult, MongoError } from 'mongodb';

export class MapServer {
    public static readonly PORT:number = 8282;
    private app: express.Application;
    private server: Server;
    private io:SocketIO.Server;
    private port: string | number;
    public db:any = null;
    
    // private connections = "mongodb://localhost:27017/map"
    private connections = "mongodb://localhost:27017"

    store=[];
    storeMongo;

    constructor(){
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        this.monggoDB();
    }

    private createApp():void{
        this.app = express();
    }

    private createServer():void {
        this.server = createServer(this.app);
    }

    private config():void{
        this.port = process.env.PORT || MapServer.PORT;
    }

    private sockets():void{
        this.io = socketIo(this.server);
    }

    public monggoDB():void{
        MongoClient.connect(this.connections, (err:MongoError, database)=>{
            if(err){
                console.log(err);
            } else{
                this.db = database.db('map');
                console.log('success');
            }
        })

        
    }

    private listen():void{
        this.server.listen(this.port,()=>{
            console.log('Running server on port %s', this.port);
        });

      
        
        this.io.on('connect',(socket:any)=>{
            console.log('Connected client on port %s',this.port);

            //get data from mongo
            this.io.emit('array', this.store);
            this.getDbStore('maps');
            this.io.emit('mongo',this.storeMongo);

            socket.on('map',(map:MapModel)=>{
                console.log('[server](map):%s',JSON.stringify(map));
                this.io.emit('map',map);
                this.store.push(map);
                this.io.emit('array', this.store);
                // console.log(this.store);
                console.log("###########")
                //send to mongo DB

                this.dbStore(map, 'maps');
                 //get  mongo DB
                this.getDbStore('maps');
                this.io.emit('mongo', this.storeMongo);
                
                //emit mongoDB
                // this.io.emit('mongo', this.storeMongo);
                console.log("KOK Pending",this.storeMongo)                
                
            });

            // socket.on('map2',(data)=>{
            //     console.log(data);
            //     this.io.emit('map2', data)
            // })
            
            
            
            // socket.on('array',()=>{
            //     console.log('array');
                
            // })

            

            socket.on('disconnect',()=>{
                console.log('Client Disconnected');
            });
        });
    }

    private dbStore(data, collectionName: string){
       console.log("TES");       

        this.db.collection(collectionName).insertOne(data);

        
       
        
    }

    private async getDbStore(collectionName: string){
        this.storeMongo = await this.db.collection(collectionName).find().toArray();
        // console.log('from mongo', this.storeMongo);


    }

   

    public getApp(): express.Application {
        return this.app;
    }
}