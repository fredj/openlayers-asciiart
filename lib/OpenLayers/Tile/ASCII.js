/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Tile.js
 */

/**
 * Class: OpenLayers.Tile.ASCII
 *
 * Inherits from:
 *  - <OpenLayers.Tile>
 */
OpenLayers.Tile.ASCII = OpenLayers.Class(OpenLayers.Tile, {

    /**
     * APIProperty: blockSize
     * {Integer} The block size in pixel.  Default is 4.
     */
    blockSize: 4,

    /**
     * APIProperty: fontRatio
     * {Float} The font height/width ratio.  Default is 5/3.
     */
    fontRatio: 5/3,

    /**
     * APIProperty: gradient
     * {Array(String)} A list a character replacement ordered by
     *     relative luminance.  Default is '@80GCLft1i;:,. '
     */
    gradient: '@80GCLft1i;:,. '.split(''),
    //gradient: '@8Oo:. '.split(''),
    //gradient: "MWNHKQDXS65YJtjci=+>!;:~'. ".split(''),
    //gradient: 'MHb6j+:. '.split(''),
    //gradient: '"█▓▒░ '.split(''),

    /**
     * Method: draw
     * Check that a tile should be drawn, and draw it.
     *
     * Returns:
     * {Boolean} Was a tile drawn?
     */
    draw: function() {
        var drawn = OpenLayers.Tile.prototype.draw.apply(this, arguments);
        if (drawn) {
            if (this.isLoading) {
                //if we're already loading, send 'reload' instead of 'loadstart'.
                this.events.triggerEvent("reload");
            } else {
                this.isLoading = true;
                this.events.triggerEvent("loadstart");
            }
            this.positionTile();
            this.renderTile();
        } else {
            this.unload();
        }
        return drawn;
    },

    /**
     * Method: renderTile
     * Internal function to actually initialize the image tile,
     *     position it correctly, and set its url.
     */
    renderTile: function() {
        this.layer.div.appendChild(this.getTile());
        this.url = this.layer.getURL(this.bounds);
        this.initImage();
    },

    /**
     * Method: positionTile
     * Using the properties currenty set on the layer, position the tile correctly.
     * This method is used both by the async and non-async versions of the Tile.Image
     * code.
     */
    positionTile: function() {
        var style = this.getTile().style;
        style.left = this.position.x + "%";
        style.top = this.position.y + "%";
        style.width = this.size.w + "%";
        style.height = this.size.h + "%";
    },

    /**
     * Method: clear
     * Remove the tile from the DOM, clear it of any image related data so that
     * it can be reused in a new location.
     */
    clear: function() {
        if (this.img) {
            OpenLayers.Event.stopObservingElement(this.img);
            var tile = this.getTile();
            if (tile.parentNode === this.layer.div) {
                this.layer.div.removeChild(tile);
            }
            this.img.src = '';
            this.element.innerHTML = '';
        }
    },

    destroy: function() {
        this.clear();
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: getImage
     * Returns or creates and returns the tile image.
     */
    getImage: function() {
        if (!this.img) {
            this.img = document.createElement("img");
            this.img.crossOrigin = '';
        }
        return this.img;
    },

    /**
     * Method: initImage
     * Creates the content for the frame on the tile.
     */
    initImage: function() {
        if (this.url) {
            var img = this.getImage();
            OpenLayers.Event.stopObservingElement(img);
            OpenLayers.Event.observe(img, "load",
                OpenLayers.Function.bind(this.onImageLoad, this));
            OpenLayers.Event.observe(img, "error",
                OpenLayers.Function.bind(this.onImageError, this));
            this.imageReloadAttempts = 0;
            img.src = this.url;
        }
    },

    /**
     * Method: getTile
     * Get the tile's markup.
     *
     * Returns:
     * {DOMElement} The tile's markup
     */
    getTile: function() {
        if (!this.element) {
            this.element = document.createElement('pre');
            this.element.className = 'olTileASCII';
            this.element.style.position = 'absolute';
            this.element.style.fontSize = this.fontRatio * this.blockSize + 'px'
            this.element.style.lineHeight = this.blockSize + 'px';
        }
        return this.element;
    },

    /**
     * Method: onImageLoad
     * Handler for the image onload event
     */
    onImageLoad: function() {
        OpenLayers.Event.stopObservingElement(this.img);

        var canvas = document.createElement("canvas");
        canvas.width = this.size.w;
        canvas.height = this.size.h;
        var canvasContext = canvas.getContext("2d");
        canvasContext.drawImage(this.img, 0, 0);

        var chars = [];
        for (var ih = 0; ih < canvas.height; ih += this.blockSize) {
            for (var iw = 0; iw < canvas.width; iw += this.blockSize) {
                var data = canvasContext.getImageData(iw, ih, this.blockSize, this.blockSize).data;
                chars.push(this.pixelsToChar(data));
            }
            chars.push("\n");
        }
        this.element.innerHTML = chars.join('');

        this.isLoading = false;
        this.events.triggerEvent("loadend");
    },

    pixelsToChar: function(pixels) {
        var luma = 0;
        for (var i = 0, len = pixels.length; i < len; i += 4) {
            // fully transparent pixels are considered white
            luma += pixels[i + 3] == 0 ?
                255 : (3 * pixels[i] + 4 * pixels[i + 1] + pixels[i + 2]) >>> 3;
        }
        luma = luma / (pixels.length / 4);
        return this.gradient[Math.floor(luma / 256 * this.gradient.length)];
    },

    /**
     * Method: onImageError
     * Handler for the image onerror event
     */
    onImageError: function() {
        if (this.img.src != null) {
            this.imageReloadAttempts++;
            if (this.imageReloadAttempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
                this.img.src = this.layer.getURL(this.bounds);
            } else {
                OpenLayers.Event.stopObservingElement(this.img);
                this.isLoading = false;
                this.events.triggerEvent("loadend");
            }
        }
    },

    CLASS_NAME: "OpenLayers.Tile.ASCII"
});
