// Resources Used:
// https://tech.xing.com/xing-locator-an-interactive-floor-plan-using-rails-and-leaflet-js-8795e7a79f36
// https://leafletjs.com/examples/crs-simple/crs-simple.html
// https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet/
// https://stackoverflow.com/questions/62931213/how-to-add-leaflet-draw-for-non-geographical-map-e-g-floor-plan

// SVG Asset Size
var svgWidth = 1920;
var svgHeight = 1080;

// True SVG Size Inside of the file
var trueSVGWidth = 1417.7; 
var trueSVGHeight = 962.29;

// True SVG Offset
var trueSVGOffsetWidth = svgWidth - trueSVGWidth;
var trueSVGOffsetHeight = svgHeight - trueSVGHeight;

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