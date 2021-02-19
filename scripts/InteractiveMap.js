// Resources Used:
    // https://tech.xing.com/xing-locator-an-interactive-floor-plan-using-rails-and-leaflet-js-8795e7a79f36
    // https://leafletjs.com/examples/crs-simple/crs-simple.html
    // https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet/
    // https://stackoverflow.com/questions/62931213/how-to-add-leaflet-draw-for-non-geographical-map-e-g-floor-plan

    // Box Size
    var mapBoxWidth = 1600
    var mapBoxHeight = 900

    var halfMapBoxWidth = mapBoxWidth / 2
    var halfMapBoxHeight = mapBoxHeight / 2

    // SVG Asset Size
    var svgWidth = 1920;
    var svgHeight = 1080;
    
    var halfSVGWidth = svgWidth / 2.0;
    var halfSVGHeight = svgHeight / 2.0;

    // True SVG Size Inside of the file
    var trueSVGWidth = 1417.7; 
    var trueSVGHeight = 962.29;

    var halfTrueSVGWidth = trueSVGWidth / 2.0;
    var halfTrueSVGHeight = trueSVGHeight / 2.0;

    // True SVG Offset
    var trueSVGOffsetWidth = svgWidth - trueSVGWidth;
    var trueSVGOffsetHeight = svgHeight - trueSVGHeight;

    // Map Box Ratio
    var mapBoxWidthRadio = mapBoxWidth / svgWidth
    var mapBoxHeightRadio = mapBoxHeight / svgHeight

    // True SVG Offset Multiplied By Ratio
    var halfTrueSVGWidthInMapBox = halfTrueSVGWidth / mapBoxWidthRadio;
    var halfTrueSVGHeightInMapBox = halfTrueSVGHeight / mapBoxHeightRadio;

    // True SVG Offset Multiplied By Ratio
    var offsetTrueWidth = trueSVGOffsetWidth / mapBoxWidthRadio;
    var offsetTrueHeight = trueSVGOffsetHeight / mapBoxHeightRadio;

    // console.log("halfMapBoxWidth: " + halfMapBoxWidth);
    // console.log("halfMapBoxHeight: " + halfMapBoxHeight);
    // console.log("halfSVGWidth: " + halfSVGWidth);
    // console.log("halfSVGHeight: " + halfSVGHeight);
    // console.log("halfTrueSVGWidth: " + halfTrueSVGWidth);
    // console.log("halfTrueSVGHeight: " + halfTrueSVGHeight);
    // console.log("trueSVGOffsetWidth: " + trueSVGOffsetWidth);
    // console.log("trueSVGOffsetHeight: " + trueSVGOffsetHeight);
    // console.log("mapBoxWidthRadio: " + mapBoxWidthRadio);
    // console.log("mapBoxHeightRadio: " + mapBoxHeightRadio);
    // console.log("offsetTrueWidth: " + offsetTrueWidth);
    // console.log("offsetTrueHeight: " + offsetTrueHeight);

    var seatLabelWidth = 28.852
    var seatLabelHeight = 5.778
    
    var bounds = [[0,0], [-1 * svgHeight, svgWidth]];
    var map = L.map('map', {
		crs: L.CRS.Simple,
        minZoom: 1,
        maxZoom: 1,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });

    var image = L.imageOverlay('floormap.svg', bounds).addTo(map);
    map.fitBounds(bounds);


    // Top Left
    var topLeftX = (trueSVGOffsetWidth / 2);
    var topLeftY = 0;

    console.log("topLeftX: " + topLeftX + " topLeftY: " + topLeftY);

    function modifyXPositionForBounds(x) {
        var offsetX = seatLabelWidth / 2
        return offsetX + x;
    }

    function modifyYPositionForBounds(y) {
        var offsetY = seatLabelHeight / 2
        return -1 * offsetY - y;
    }

    // Swap the x and y coordinates
    // https://gis.stackexchange.com/questions/54065/leaflet-geojson-coordinate-problem
    function modifyForGeoJSON(x, y) {
        return [y, x];
    }

    function addToMap(x, y) {
        var modifiedX = modifyXPositionForBounds(x);
        var modifiedY = modifyYPositionForBounds(y);

        var newPosition = modifyForGeoJSON(modifiedX, modifiedY);

        console.log("adding x: " + x + " y: " + y + "\n" + "modified x: " + modifiedX + " y: " + modifiedY);

        var marker = L.latLng(newPosition);
        L.marker(marker).addTo(map);
    }
    
    addToMap(300.4, 67.665)
    addToMap(300.4, 108.275)
    addToMap(300.4, 149.005)

    addToMap(337.04, 67.665)

    map.setView( [337.04, 67.665], 1);