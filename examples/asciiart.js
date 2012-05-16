var map;

// This is my api key, don't use it. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "Am8aOpNMQEbMlrtBAkv_Q4vUETK6p8lVkY9D18hmLgHXY8C96DYUUQVa5k-Av8Or";

var TileOptions = function() {
    this.blockSize = 8;
    this.gradient = '@80GCLft1i;:,. '.split('');
};

var gradients = [
    '@80GCLft1i;:,. '.split(''),
    '@8Oo:. '.split(''),
    'MHb6j+:. '.split(''),
    '"█▓▒░ '.split('')
];

function init() {
    var tileOptions = new TileOptions();

    var osm_ascii = new OpenLayers.Layer.OSM("Mapnik ASCII", null, {
        tileClass: OpenLayers.Tile.ASCII,
        tileOptions: tileOptions
    });
    var osm = new OpenLayers.Layer.OSM("Mapnik");

    var bing_ascii = new OpenLayers.Layer.Bing({
        name: "Bing road ASCII",
        key: apiKey,
        type: "Road",
        tileClass: OpenLayers.Tile.ASCII,
        tileOptions: tileOptions
    });

    var mapbox_streets_ascii = new OpenLayers.Layer.OSM("MapBox Streets", [
        'http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://b.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://c.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png',
        'http://d.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png'
    ], {
        numZoomLevels: 17,
        attribution: "<a href='http://mapbox.com/about/maps'>Terms &amp; Feedback</a>",
        tileClass: OpenLayers.Tile.ASCII,
        tileOptions: tileOptions
    });

    map = new OpenLayers.Map('map', {
        layers: [mapbox_streets_ascii, osm_ascii, osm, bing_ascii],
        theme: null
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomTo(2);

    // controls init
    var gui = new dat.GUI();

    gui.add(tileOptions, 'blockSize', 1, 16).step(1)
        .onFinishChange(function(value) {
            update_tile_option(this.property, value);
        });
    gui.add(tileOptions, 'gradient', gradients)
        .onFinishChange(function(value) {
            update_tile_option(this.property, value);
        });
}

function update_tile_option(key, value) {
    for (var i = 0, len = map.layers.length; i < len; i++) {
        map.layers[i].tileOptions[key] = value;
        map.layers[i].clearGrid();
        map.layers[i].redraw();
    }
}
