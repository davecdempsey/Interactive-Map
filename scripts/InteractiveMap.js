// Resources Used:
// https://tech.xing.com/xing-locator-an-interactive-floor-plan-using-rails-and-leaflet-js-8795e7a79f36
// https://leafletjs.com/examples/crs-simple/crs-simple.html
// https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet/
// https://stackoverflow.com/questions/62931213/how-to-add-leaflet-draw-for-non-geographical-map-e-g-floor-plan
// http://bl.ocks.org/uafrazier/d589caa322f1b1e7c651

// create popup contents
var customPopup = 
'<div class="card">\
    <h1 id="seat-number" style = "margin:0;">Seat Number</h1>\
    <p id="floor" class="title" style = "margin:0;">Floor</p>\
    <p id="building" style = "margin:0;">Building</p>\
    <p style = "margin:0;"><button>Reserve</button></p>\
</div>';

function handle(json) {

    // SVG Asset Size
    var svgWidth = json.svgWidth;
    var svgHeight = json.svgHeight;

    // // Seat Label
    var seatLabelWidth = json.seatLabelWidth;
    var seatLabelHeight = json.seatLabelHeight;

    // // Top Left
    var topLeftX = json.topLeftX;
    var topLeftY = json.topLeftY;

    var svgLocation = json.svg;

    var bounds = [[0,0], [-1 * svgHeight, svgWidth]];
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 1,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });


    var image = L.imageOverlay(svgLocation, bounds).addTo(map);
    map.fitBounds(bounds);

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

    function addToMap(seat) {
        var x = seat.x;
        var y = seat.y;

        var modifiedX = modifyXPositionForBounds(x);
        var modifiedY = modifyYPositionForBounds(y);

        var newPosition = modifyForGeoJSON(modifiedX, modifiedY);

        console.log("adding x: " + x + " y: " + y + "\n" + "modified x: " + modifiedX + " y: " + modifiedY);

        var markerLatLong = L.latLng(newPosition);
        var marker = L.marker(markerLatLong).addTo(map);
        marker.bindPopup('<div class="card">' +
                            '<h1 style = "margin:0;">' + seat.name + '</h1>' +
                            '<p class="title" style = "margin:0;"> Floor: ' + seat.floor + '</p>' +
                            '<p style = "margin:0;">' + seat.building + '</p>' +
                            '<p style = "margin:0;"><button>Reserve</button></p>' +
                        '</div>');

        // marker.bindPopup(customPopup);
        // marker.on('click', onClick)
        // marker.myJsonData = seat;
    }

    function onClick(e) {
        var marker = e.target;
        console.log(marker.myJsonData);
        // L.DomUtil.get('seat-number').textContent = seat.name;
        // L.DomUtil.get('floor').textContent = seat.floor;
        // L.DomUtil.get('building').textContent = seat.building;
    }

    json.seats.forEach(addSeat);
    function addSeat(item, index) {
        addToMap(item);
    }
}
