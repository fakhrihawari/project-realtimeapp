"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var map_server_1 = require("./map-server");
var app = new map_server_1.MapServer().getApp();
exports.app = app;
