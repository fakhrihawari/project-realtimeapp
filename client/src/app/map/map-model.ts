export interface IGeometry{
    type:string;
    coordinates:number[];
}

export interface IGeoJson{
    _id?:any;
    type:string
    geometry:IGeometry;
    properties?:any;
    $key?:string;
}
export class MapModel implements IGeoJson {
    type="Feature";
    geometry:IGeometry;
    constructor(coordinates, public properties?){
        this.geometry= {
            type:"Point",
            coordinates :coordinates

        }
    }

}

export class FeatureCollection {
    type = 'FeatureCollection'
    constructor(public features: Array<MapModel>) { }
}
