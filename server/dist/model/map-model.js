"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapModel = /** @class */ (function () {
    function MapModel(coordinates, properties) {
        this.properties = properties;
        this.type = "Feature";
        this.geometry = {
            type: "Point",
            coordinates: coordinates
        };
    }
    return MapModel;
}());
exports.MapModel = MapModel;
