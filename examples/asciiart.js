var map;

// This is my api key, don't use it. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "Am8aOpNMQEbMlrtBAkv_Q4vUETK6p8lVkY9D18hmLgHXY8C96DYUUQVa5k-Av8Or";

function init() {
    var osm_ascii = new OpenLayers.Layer.OSM("Mapnik ASCII", null, {
        tileClass: OpenLayers.Tile.ASCII
    });
    var osm = new OpenLayers.Layer.OSM("Mapnik");

    var bing_ascii = new OpenLayers.Layer.Bing({
        name: "Bing road ASCII",
        key: apiKey,
        type: "Road",
        tileClass: OpenLayers.Tile.ASCII
    });

    var mapbox_streets_ascii = new OpenLayers.Layer.OSM("MapBox Streets", [
        'http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://b.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://c.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://d.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png'
    ], {
        numZoomLevels: 17,
        attribution: "<a href='http://mapbox.com/about/maps'>Terms &amp; Feedback</a>",
        tileClass: OpenLayers.Tile.ASCII
    });

    map = new OpenLayers.Map('map', {
        layers: [mapbox_streets_ascii, osm_ascii, osm, bing_ascii],
        theme: null
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomTo(2);
}
