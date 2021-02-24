// Resources Used:
// https://tech.xing.com/xing-locator-an-interactive-floor-plan-using-rails-and-leaflet-js-8795e7a79f36
// https://leafletjs.com/examples/crs-simple/crs-simple.html
// https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet/
// https://stackoverflow.com/questions/62931213/how-to-add-leaflet-draw-for-non-geographical-map-e-g-floor-plan
// http://bl.ocks.org/uafrazier/d589caa322f1b1e7c651
// https://www.digitalocean.com/community/tutorials/angular-angular-and-leaflet
// https://www.angularjswiki.com/angular/how-to-read-local-json-files-in-angular/

import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import json from '../../assets/InteractiveMapDataSourse.json';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})


export class MapComponent implements AfterViewInit {
  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    // Third Zoom Level
    var reservedx2 = L.icon({
      iconUrl: '../../assets/reservedSeat.png',
      shadowUrl: '../../assets/reservedSeat.png',

      iconSize:     [40, 45], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [20, 22], // point of the icon which will correspond to marker's location
      shadowAnchor: [20, 22],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var reservablex2 = L.icon({
      iconUrl: '../../assets/reservableSeat.png',
      shadowUrl: '../../assets/reservableSeat.png',

      iconSize:     [40, 45], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [20, 22], // point of the icon which will correspond to marker's location
      shadowAnchor: [20, 22],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var selectedx2 = L.icon({
      iconUrl: '../../assets/selectedSeat.png',
      shadowUrl: '../../assets/selectedSeat.png',

      iconSize:     [40, 45], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [20, 22], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    // Second Zoom Level
    var reservedx1 = L.icon({
      iconUrl: '../../assets/reservedSeat.png',
      shadowUrl: '../../assets/reservedSeat.png',

      iconSize:     [20, 22], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [10, 11], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var reservablex1 = L.icon({
      iconUrl: '../../assets/reservableSeat.png',
      shadowUrl: '../../assets/reservableSeat.png',

      iconSize:     [20, 22], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [10, 11], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var selectedx1 = L.icon({
      iconUrl: '../../assets/selectedSeat.png',
      shadowUrl: '../../assets/selectedSeat.png',

      iconSize:     [20, 22], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [10, 11], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    // First Zoom Level
    var reservedx0 = L.icon({
      iconUrl: '../../assets/reservedSeat.png',
      shadowUrl: '../../assets/reservedSeat.png',

      iconSize:     [10, 11], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var reservablex0 = L.icon({
      iconUrl: '../../assets/reservableSeat.png',
      shadowUrl: '../../assets/reservableSeat.png',

      iconSize:     [10, 11], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    var selectedx0 = L.icon({
      iconUrl: '../../assets/selectedSeat.png',
      shadowUrl: '../../assets/selectedSeat.png',

      iconSize:     [10, 11], // size of the icon
      shadowSize:   [0, 0], // size of the shadow
      iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
      shadowAnchor: [0, 0],  // the same for the shadow
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    let reservedStatus = "reserved";
    let reservableStatus = "reservable";

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
        minZoom: -0.3,
        maxZoom: 1,
        zoomSnap: 0.01,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });


    var image = L.imageOverlay(svgLocation, bounds).addTo(map);
    // map.fitBounds(bounds);
    map.setView([svgHeight/2, svgWidth/2], -0.3);

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

        // console.log("adding x: " + x + " y: " + y + "\n" + "modified x: " + modifiedX + " y: " + modifiedY);

        var markerLatLong = L.latLng(newPosition);
        
        let reserved = seat.status == reservedStatus;
        var reserveButton = reserved ? "Reserved" : "<button>Reserve</button>";
        var icon = reserved ? reservedx1 : reservablex1;
        var marker = L.marker(markerLatLong, {icon: icon} ).addTo(map);
        marker.bindPopup('<div class="card">' +
                            '<h1 style = "margin:0;">' + seat.name + '</h1>' +
                            '<p class="title" style = "margin:0;"> Floor: ' + seat.floor + '</p>' +
                            '<p style = "margin:0;">' + seat.building + '</p>' +
                            '<p style = "margin:0;">'+ reserveButton +'</p>' +
                        '</div>');
        

        map.on('zoomend', function() {
          var currentZoom = map.getZoom();
          let reserved = seat.status == reservedStatus;
          if(currentZoom < -0.5) {
            var icon = reserved ? reservedx0 : reservablex0;
            marker.setIcon(icon);          
          } else if(currentZoom > -0.5 && currentZoom < 0.5) {
            var icon = reserved ? reservedx1 : reservablex1;
            marker.setIcon(icon);
          } else if(currentZoom > 1) {
            var icon = reserved ? reservedx2 : reservablex2;
            marker.setIcon(icon);
          }
          marker.getIcon().iconSize = [0, 0];

          console.log("------------------" + "\n" + 
                      "marker.getIcon().iconSize: " + marker.getIcon().iconSize);
        });
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

    map.on('zoomend', function() {
      var currentZoom = map.getZoom();
      var percentageOfMap = currentZoom;
      if (currentZoom < 0) {
        percentageOfMap = -1 * currentZoom + 1;
      }
      var newWidth = percentageOfMap * svgWidth;
      var newHeight = percentageOfMap * svgHeight;
      // var iconHeight = reservedx1.iconSize.height * percentageOfMap;

      console.log("------------------" + "\n" + 
                  "currentZoom: " + currentZoom + "\n" + 
                  "percentageOfMap: " + percentageOfMap + "\n" + 
                  "newWidth: " + newWidth + "\n" + 
                  "newHeight: " + newHeight + "\n" + 
                  "reservedx1.iconSize: " + reservedx1.size);
    });
  }
}