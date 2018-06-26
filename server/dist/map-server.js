"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var mongodb_1 = require("mongodb");
var MapServer = /** @class */ (function () {
    function MapServer() {
        this.db = null;
        // private connections = "mongodb://localhost:27017/map"
        this.connections = "mongodb://localhost:27017";
        this.store = [];
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        this.monggoDB();
    }
    MapServer.prototype.createApp = function () {
        this.app = express();
    };
    MapServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    MapServer.prototype.config = function () {
        this.port = process.env.PORT || MapServer.PORT;
    };
    MapServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    MapServer.prototype.monggoDB = function () {
        var _this = this;
        mongodb_1.MongoClient.connect(this.connections, function (err, database) {
            if (err) {
                console.log(err);
            }
            else {
                _this.db = database.db('map');
                console.log('success');
            }
        });
    };
    MapServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s', _this.port);
            //get data from mongo
            _this.io.emit('array', _this.store);
            _this.getDbStore('maps');
            _this.io.emit('mongo', _this.storeMongo);
            socket.on('map', function (map) {
                console.log('[server](map):%s', JSON.stringify(map));
                _this.io.emit('map', map);
                _this.store.push(map);
                _this.io.emit('array', _this.store);
                // console.log(this.store);
                console.log("###########");
                //send to mongo DB
                _this.dbStore(map, 'maps');
                //get  mongo DB
                _this.getDbStore('maps');
                //emit mongoDB
                // this.io.emit('mongo', this.storeMongo);
                console.log("KOK Pending", _this.storeMongo);
            });
            socket.on('map2', function (data) {
                console.log(data);
                _this.io.emit('map2', data);
            });
            // socket.on('array',()=>{
            //     console.log('array');
            // })
            socket.on('disconnect', function () {
                console.log('Client Disconnected');
            });
        });
    };
    MapServer.prototype.dbStore = function (data, collectionName) {
        console.log("TES");
        this.db.collection(collectionName).insertOne(data);
    };
    MapServer.prototype.getDbStore = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.db.collection(collectionName).find().toArray()];
                    case 1:
                        _a.storeMongo = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MapServer.prototype.getApp = function () {
        return this.app;
    };
    MapServer.PORT = 8282;
    return MapServer;
}());
exports.MapServer = MapServer;
