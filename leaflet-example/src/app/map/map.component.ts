// Resources Used:
// https://tech.xing.com/xing-locator-an-interactive-floor-plan-using-rails-and-leaflet-js-8795e7a79f36
// https://leafletjs.com/examples/crs-simple/crs-simple.html
// https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet/
// https://stackoverflow.com/questions/62931213/how-to-add-leaflet-draw-for-non-geographical-map-e-g-floor-plan
// http://bl.ocks.org/uafrazier/d589caa322f1b1e7c651
// https://www.digitalocean.com/community/tutorials/angular-angular-and-leaflet
// https://www.angularjswiki.com/angular/how-to-read-local-json-files-in-angular/

// Changing background to white
// https://stackoverflow.com/questions/13851888/how-can-i-change-the-default-loading-tile-color-in-leafletjs

import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import json from '../../assets/DEC21.json';
import { ApiService } from '../api.service';
import { Seat } from '../seat'
import { Reservation } from "../reservation";
import * as SPD from "svg-path-d"; 
import { Point, Rect } from 'svg-path-d/dist/utils';

import svgPath from 'svgpath';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})


export class MapComponent implements AfterViewInit {

  @ViewChild("mapContainer") mapContainer: ElementRef;
  
  assetPath = '../../assets/';

  filterDate:Date;

  emailAddress:string;

  seats: Seat[];

  map:L.map;
  markers:L.Marker[];
  images:L.ImageOverlay[];

  startFilterTime:string;
  endFilterTime:string;

  // Seat Label
  seatIconRadius;

  seatLocations;

  percentSize;

  overlayLayer;

  initialZoomLevel;
  currentWindowWidth: number;

  svgWidth;
  svgHeight;

  svg;
  
  constructor(private apiService: ApiService, private elementRef: ElementRef, private datepipe: DatePipe) {}

  ngAfterViewInit(): void {
    this.initialZoomLevel = 0.0;
    this.setWindowSize();

    this.initPOC();

    this.seatLocations = {};
    this.markers = [];
    // this.updatemap();

    this.updateSeats();
  }

  @HostListener('window:resize')
  onResize() {
    this.setWindowSize();
  }

  private setWindowSize() {
    this.currentWindowWidth = window.innerWidth;
  }

  modifyPixel(pixel) {
    return pixel * this.percentSize;
  }

  resizeMap() {
    this.caculatePercentSize();

    if (this.overlayLayer == null) {
      return;
    }

    // SVG Asset Size
    let svgWidth = this.modifyPixel(this.svgWidth);
    let svgHeight = this.modifyPixel(this.svgHeight);

    var bounds = [[0,0], [-1 * svgHeight, svgWidth]];

    this.overlayLayer.setBounds(bounds);
    this.map.setMaxBounds (bounds);
    this.map.setView([svgHeight/2, svgWidth/2], this.initialZoomLevel);
  }

  private caculatePercentSize() {
    var width = this.mapContainer.nativeElement.offsetWidth;
    var height = this.mapContainer.nativeElement.offsetHeight;

    let heightPercentage = height/this.svgHeight;
    let widthPercentage = width/this.svgWidth;

    if (heightPercentage > widthPercentage) {
      this.percentSize = widthPercentage;
    } else {
      this.percentSize = heightPercentage;
    }
  }

  updateSeats(): void {
    if (this.markers == null) {
      this.markers = [];
    }

    if (this.images == null) {
      this.images = [];
    }

    if (this.markers.length > 0) {
      this.removeAllMarkers();
    }

    if (this.images.length > 0) {
      this.removeAllImages();
    }

    this.parseSVG();
  }

  getSVGViewBox(data) {
    this.svgHeight = data.firstElementChild.viewBox.baseVal.height;
    this.svgWidth = data.firstElementChild.viewBox.baseVal.width;
  }

  getIconRadius(data) {
    let circle = data.getElementById("circle-2");
    this.seatIconRadius = circle.getAttribute("r") * 2
  }

  handleSVGSeats(seats) {
    // console.log(seats);
    for (var i = 0; i < seats.children.length; i += 1) {
      var seat = seats.children[i];
      var seatChildren = seat.children;

      var seatRect = null;
      for (var j = 0; j < seatChildren.length; j += 1) {
        var seatChild = seatChildren[j];

        if (seatChild.getAttribute("d") == null) {
          continue;
        }

        let path = SPD.fromString(seatChild.getAttribute("d"));

        // console.log(path);
        let rect = SPD.getBoundingRect(path);
        // console.log(rect);
        if (seatRect == null) {
          seatRect = rect;
        } else {
          SPD.utils.addRect(seatRect, rect);
        }
      }
      // console.log(this.getCenter(seatRect));

      // console.log(seat);
      if (this.seatLocations == null) {
        this.seatLocations = {};
      }
      if (seatRect != null) {
        let seatName = seat.getAttribute("data-name");
        // console.log(seat.id + " has name " + seatName);
        // console.log(seat.attributes);
        this.seatLocations[seat.getAttribute("data-name")] = this.getCenter(seatRect);
      }
    }

    for(var key in this.seatLocations) {
      var value = this.seatLocations[key];
      this.addParsedSeats(key, value);
    }
  }

  getCenter(rect:Rect):SPD.utils.Point {
    let width = rect.right - rect.left;
    let x = (width / 2) + rect.left;

    let height = rect.top - rect.bottom;
    let y = (height / 2) + rect.bottom;

    return {x: x, y: y};
  }

  parseSVG(forceReload = false) {
    var svgLocation = this.assetPath + json.svg;
    this.getAndModifySVG(svgLocation, forceReload)
  }

  getAndModifySVG(url, forceReload = false) {
    if (this.svg != null && forceReload == false) {
      this.getSVGViewBox(this.svg);
      this.updatemap();
      this.handleSVGSeats(this.svg.getElementById("seats"));
      return;
    }
    return fetch(url)
              // Get SVG response as text
              .then(response => {return response.text()})
              // Parse to a DOM tree using DOMParser
              .then(str => (new DOMParser()).parseFromString(str, "text/xml"))
              // // Find path with id="myPath" and return the d attribute
              .then(data => {
                this.svg = data;

                this.getIconRadius(data);

                this.getSVGViewBox(data);

                this.updatemap();

                this.handleSVGSeats(data.getElementById("seats"));
                // console.log(data);
              })
  }

  addParsedSeats(seatName, point) {
    var x = point.x;
    var y = point.y;

    var modifiedX = this.modifyPixel(this.modifyXPositionForBounds(x));
    var modifiedY = this.modifyPixel(this.modifyYPositionForBounds(y));

    var newPosition = this.modifyForGeoJSON(modifiedX, modifiedY);

    var markerLatLong = L.latLng(newPosition);

    var halfIconWidth = this.modifyPixel(this.seatIconRadius) * 0.5;
    var halfIconHeight = this.modifyPixel(this.seatIconRadius) * 0.5;

    var bounds = [
      [markerLatLong.lat - halfIconWidth, markerLatLong.lng - halfIconHeight],
      [markerLatLong.lat + halfIconWidth, markerLatLong.lng + halfIconHeight]
    ];

    var image = L.imageOverlay(this.imageFor(seatName), bounds);

    image.addTo(this.map);

    var icon = this.iconFor(seatName, false);
    var marker = L.marker(markerLatLong, {icon : icon, opacity: 0}).addTo(this.map);
    // marker.bindTooltip(seatName, {permanent: true, direction: "top"}).openTooltip();
  }

  removeAllMarkers():void {
    for (var i = 0; i < this.markers.length; i += 1) {
      this.map.removeLayer(this.markers[i]);
    }
    this.markers = [];
  }

  removeAllImages():void {
    for (var i = 0; i < this.images.length; i += 1) {
      this.map.removeLayer(this.images[i]);
    }
    this.images = [];
  }

  private updatemap() {
    if (this.map == null) {
      this.initMap();
    }
    this.resizeMap();
  }

  private initMap(): void {

    this.caculatePercentSize();
    
    // SVG Asset Size
    let svgWidth = this.modifyPixel(this.svgWidth);
    let svgHeight = this.modifyPixel(this.svgHeight);

    var svgLocation = this.assetPath + json.svg;

    var bounds = [[0,0], [-1 * svgHeight, svgWidth]];
    this.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -0.4,
        maxZoom: 20,
        zoomSnap: 0.01,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });


    this.overlayLayer = L.imageOverlay(svgLocation, bounds).addTo(this.map);
    this.map.setView([svgHeight/2, svgWidth/2], this.initialZoomLevel);

    // changing zoom controls
    // https://stackoverflow.com/questions/33614912/how-to-locate-leaflet-zoom-control-in-a-desired-position
    // Create additional Control placeholders
    function addControlPlaceholders(map) {
      var corners = map._controlCorners,
            l = 'leaflet-',
            container = map._controlContainer;

        function createCorner(vSide, hSide) {
            var className = l + vSide + ' ' + l + hSide;

            corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }

        createCorner('top', 'left');
        createCorner('top', 'right');
        createCorner('bottom', 'left');
        createCorner('bottom', 'right');
    
        createCorner('top', 'center');
        createCorner('middle', 'center');
        createCorner('middle', 'left');
        createCorner('middle', 'right');
        createCorner('bottom', 'center');
    }
    addControlPlaceholders(this.map);

    // Change the position of the Zoom Control to a newly created placeholder.
    this.map.zoomControl.setPosition('bottomcenter');
  }

  userReservedSeat() {
    return this.assetPath + 'userReservedSeat.svg';
  }

  reservedSeat() {
    return this.assetPath + 'reservedSeat.svg';
  }

  reservableSeat() {
    return this.assetPath + 'reservableSeat.svg';
  }

  modifyXPositionForBounds(x) {
      // var offsetX = this.seatIconWidth / 2
      // return offsetX + x;

      return x;
  }

  modifyYPositionForBounds(y) {
      // var offsetY = this.seatIconHeight / 2
      // return -1 * offsetY - y;

      return -1 * y;
  }

  // Swap the x and y coordinates
  // https://gis.stackexchange.com/questions/54065/leaflet-geojson-coordinate-problem
  modifyForGeoJSON(x, y) {
      return [y, x];
  }

  addSeatAsImage(seat):void {
    var x = seat.x;
    var y = seat.y;

    var modifiedX = this.modifyPixel(this.modifyXPositionForBounds(x));
    var modifiedY = this.modifyPixel(this.modifyYPositionForBounds(y));

    var newPosition = this.modifyForGeoJSON(modifiedX, modifiedY);

    var markerLatLong = L.latLng(newPosition);

    var halfIconWidth = this.modifyPixel(this.seatIconRadius) * 0.5;
    var halfIconHeight = this.modifyPixel(this.seatIconRadius) * 0.5;

    var bounds = [
      [markerLatLong.lat - halfIconWidth, markerLatLong.lng - halfIconHeight],
      [markerLatLong.lat + halfIconWidth, markerLatLong.lng + halfIconHeight]
    ];

    var image = L.imageOverlay(this.imageFor(seat.code), bounds);

    image.addTo(this.map);

    var icon = this.iconFor(seat, false);
    var marker = L.marker(markerLatLong, {icon : icon, opacity: 0}).addTo(this.map);
    marker.bindTooltip(seat.code, {permanent: true, direction: "top"}).openTooltip();
  }
  
  selected(seatCode) {
    console.log("click " + seatCode);
  }

  popupQueries(seat):string[] {
    var queries:string[] = [];
    let reserved = this.reservedStatusFor(seat.seatCode);
    if (reserved == false) {
      queries.push('.reserve');
    } else {
      let reservations = this.reservationsInFilterFor(seat.seatCode);
      for (var i = 0; i < reservations.length; i += 1) {
        queries.push('.remove'+i);
      }
    }
    // console.log('popupQueries: \n' + queries);
    return queries;
  }

  popupFor(seat):string {
    
    let reservations = this.reservationsInFilterFor(seat.seatCode);
    let reserved = this.reservedStatusFor(seat.seatCode);

    if (reserved == false) {
      let reserveButton = "<button class='reserve'>Reserve</button>";
      var timeFrame = this.startFilterTime + ' - ' + this.endFilterTime;
      return '<div class="card">' +
                '<h1 style = "margin:0;">' + seat.name + '</h1>' +
                '<p class="title" style = "margin:0;"> Floor: ' + seat.floor + '</p>' +
                '<p style = "margin:0;">' + seat.building + '</p>' +
                '<p style = "margin:0;">' + reserveButton + '  ' + timeFrame + '</p>' +
              '</div>';
    }

    // console.log('---------------------------' + seat.name);
    // console.log(seat.name + ' is reserved: ' + reserved);
    // console.log(reservations);

    var reservationButtonsSection = "";
    for (var i = 0; i < reservations.length; i += 1) {
      let lineBreak = i == reservations.length - 1 ? "" : "\n";
      let reservation = reservations[i];
      let timeFrame = reservation.start  + ' - ' + reservation.end;

      var removeReservation = "<button class='remove" + i + "' id = '" + timeFrame + "'>Remove Reservation</button>";
      if (reservations[i].emailAddress != this.emailAddress) {
        removeReservation = "Reserved ";
      }

      reservationButtonsSection += '<p style = "margin:0;">' + removeReservation + '  ' + timeFrame + '</p>' + lineBreak; 
    }

    // console.log('---------------------------' + seat.name);
    // console.log(reservationButtonsSection);

    var popup = '<div class="card">' +
                  '<h1 style = "margin:0;">' + seat.name + '</h1>' +
                  '<p class="title" style = "margin:0;"> Floor: ' + seat.floor + '</p>' +
                  '<p style = "margin:0;">' + seat.building + '</p>' +
                  reservationButtonsSection +
                '</div>';
    return popup;
  }

  reservationsInFilterForDebugFor(seatCode):string {
    var debugString:string = '';
    var allReservations = this.reservationsFor(seatCode);
    for (var i = 0; i < allReservations.length; i += 1) {
      var reservation = allReservations[i];
      debugString += 'seatCode:' + seatCode + ' has reservations overlap: ' + this.doesReservationOverlap(reservation) + '\n' + this.printOutReservation(reservation)+ '\n';
    }
    return debugString;
  }

  reservationsInFilterFor(seatCode):Reservation[] {
    var reservations:Reservation[] = [];
    var allReservations = this.reservationsFor(seatCode);
    for (var i = 0; i < allReservations.length; i += 1) {
      var reservation = allReservations[i];
      if (this.doesReservationOverlap(reservation)) {
        reservations.push(reservation);
      }
    }
    return reservations;
  }

  reservationsFor(seatCode):Reservation[] {
    if (this.seats == null || this.seats.length < 1) {
      return [];
    }
    var seat = this.seatFor(seatCode);
    if (seat == null) {
      return [];
    }
    return seat.reservations;
  }

  updateTooltipFor(marker, debug) {
    var currentZoom = this.map.getZoom();
    var percentageOfMap = currentZoom;
    
    if (currentZoom < 0) {
      percentageOfMap = currentZoom + 1;
    } else {
      percentageOfMap += 1;
    }

    var newWidth = percentageOfMap * this.seatIconRadius;
    var halfWidth = newWidth/ 2;

    var newHeight = percentageOfMap * this.seatIconRadius;
    var halfHeight = newHeight/ 2;

    // marker.getTooltip().offset = [newHeight * 10, newHeight * 20];
    marker.getTooltip().offset = L.point(0, newHeight);
    if (debug) {
      // console.log(newHeight);
      // console.log(marker.getTooltip().offset);
    }
  }

  imageFor(seatCode):string {
    let reservations = this.reservationsInFilterFor(seatCode);
    let reserved = reservations.length > 0;  
    let reservedIcon = this.isReservationUsers(reservations) ? this.userReservedSeat() : this.reservedSeat();
    return reserved ? reservedIcon : this.reservableSeat(); 
  }

  iconFor(seatCode, debug):L.icon {
    // console.log("iconFor");
    var currentZoom = this.map.getZoom();
    var percentageOfMap = currentZoom;
    
    if (currentZoom < 0) {
      percentageOfMap = currentZoom + 1;
    } else {
      percentageOfMap += 1;
    }

    var newWidth = this.modifyPixel(percentageOfMap * this.seatIconRadius);
    var halfWidth = newWidth/ 2;

    var newHeight = this.modifyPixel(percentageOfMap * this.seatIconRadius);
    var halfHeight = newHeight/ 2;


    let reservations = this.reservationsInFilterFor(seatCode);
    let reserved = reservations.length > 0;  
    let reservedIcon = this.isReservationUsers(reservations) ? this.userReservedSeat() : this.reservedSeat();
    let iconURL = reserved ? reservedIcon : this.reservableSeat(); 

    if (debug) {
      console.log(seatCode + ' is reserved: ' + reserved + ' using icon ' + iconURL);
    }
    return L.icon({
      iconUrl: iconURL,
      iconSize:     [newWidth, newHeight], // size of the icon
      iconAnchor:   [halfWidth, halfHeight], // point of the icon which will correspond to marker's location
      popupAnchor:  [0, 0], // point from which the popup should open relative to the iconAnchor
      tooltipAchor: [newWidth, newHeight]
    });
  }

  isReservationUsers(reservations):boolean {
    for (var i = 0; i < reservations.length; i += 1) {
      if (reservations[i].emailAddress == this.emailAddress) {
        return true;
      }
    }
    return false;
  }

  reservedStatusFor(seatCode):boolean {
    return this.reservationsInFilterFor(seatCode).length > 0;
  }

  seatFor(seatCode):Seat {
    for (var i = 0; i < this.seats.length; i += 1) {
      var seat = this.seats[i];
      if (seat.seatName == seatCode) {
        return seat;
      }
    }
    return null;
  }

  startDateFilter():Date  {
    let startDateFilter = this.formatDate(this.filterDate)+'T' + this.startFilterTime;
    return new Date(startDateFilter); 
  }

  endDateFilter():Date {
    let endDateFilter = this.formatDate(this.filterDate)+'T' + this.endFilterTime;
    return new Date(endDateFilter); 
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  doesReservationOverlap(reservation) {
    let startReservation = reservation.date + 'T' + reservation.start;
    let endReservation = reservation.date + 'T' + reservation.end;
    let startDateOfReservation = new Date(startReservation);
    let endDateOfReservation = new Date(endReservation);
    return this.doDatesOverlaps(startDateOfReservation, endDateOfReservation, this.startDateFilter(), this.endDateFilter());
  }

  printOutReservation(reservation) {
    let startReservation = reservation.date + 'T' + reservation.start;
    let endReservation = reservation.date + 'T' + reservation.end;
    let startDateOfReservation = new Date(startReservation);
    let endDateOfReservation = new Date(endReservation);

    // console.log('startDateOfReservation:' + startDateOfReservation.getTime() + '\n' +
    //             'endDateOfReservation:' + endDateOfReservation.getTime() + '\n' +
    //             'this.startDateFilter():' + this.startDateFilter().getTime() + '\n' +
    //             'this.endDateFilter():' + this.endDateFilter().getTime());

    return 'startReservation:' + reservation.date + ' ' + reservation.start + '\n' +
           'endReservation:' + reservation.date + ' ' + reservation.end + '\n' +
           'startFilterTime:' + this.formatDate(this.filterDate)+ ' ' + this.startFilterTime + '\n' +
           'endFilterTime:' + this.formatDate(this.filterDate)+ ' ' + this.endFilterTime + '\n' +
           'startDateOfReservation:' + startDateOfReservation.getTime() + '\n' +
           'endDateOfReservation:' + endDateOfReservation.getTime() + '\n' +
           'this.startDateFilter():' + this.startDateFilter().getTime() + '\n' +
           'this.endDateFilter():' + this.endDateFilter().getTime();
  }

  // https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap#answer-325964
  doDatesOverlaps(date1Start, date1End, date2Start, date2End):boolean {
    return Math.max(date1Start.getTime(), date2Start.getTime()) < Math.min(date1End.getTime(), date2End.getTime());
  }

  //------------------------------ POC

  mapDate:Date;

  initPOC(): void {
    this.startFilterTime = this.allDayTimeBlock().start;
    this.endFilterTime = this.allDayTimeBlock().end;

    this.markers = [];
    this.filterDate = new Date();
    this.emailAddress = "davecdempseydev@gmail.com";
    this.mapDate = new Date();
    // this.getSeats();
  }
  
  getSeats(): void {
    this.apiService.getSeats()
    .subscribe(
      seats => this.seats = seats,
      err => console.error('Observer got an error: ' + err),
      () => this.updateSeats()
    );
  }

  reloadFunction() {
    this.getSeats();
  } 

  allDayTimeBlock():TimeBlock {
    let timeBlock = new TimeBlock();
    timeBlock.start = '08:00:00';
    timeBlock.end = '15:00:00';
    return timeBlock;
  }

  halfDayMorningBlock():TimeBlock {
    let timeBlock = new TimeBlock();
    timeBlock.start = '08:00:00';
    timeBlock.end = '12:00:00';
    return timeBlock;
  }

  halfDayAfternoonBlock():TimeBlock {
    let timeBlock = new TimeBlock();
    timeBlock.start = '12:00:00';
    timeBlock.end = '15:00:00';
    return timeBlock;
  }

  allDay() {
    this.startFilterTime = this.allDayTimeBlock().start;
    this.endFilterTime = this.allDayTimeBlock().end;

    this.updateSeats();
  }

  halfDayMorning() {
    this.startFilterTime = this.halfDayMorningBlock().start;
    this.endFilterTime = this.halfDayMorningBlock().end;

    this.updateSeats();
  }

  halfDayAfternoon() {
    this.startFilterTime = this.halfDayAfternoonBlock().start;
    this.endFilterTime = this.halfDayAfternoonBlock().end;

    this.updateSeats();
  }

  reserve(seatCode) {
    let seat = this.seatObjectFor(seatCode)
    if (seat == null) {
      return;
    }

    var seatReservation = new Seat();
    seatReservation.FloorCode = seat.FloorCode;
    seatReservation.buildingCode = seat.buildingCode;
    seatReservation.seatCode = seat.seatCode;
    seatReservation.reservations = [];

    var reservation = new Reservation();
    reservation.date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    reservation.emailAddress = this.emailAddress;
    reservation.start = this.startFilterTime;
    reservation.end = this.endFilterTime;

    seatReservation.reservations.push(reservation);

    var seatReservations:Seat[] = [];
    seatReservations.push(seatReservation);

    console.log(seatReservations);
    this.apiService.addReservation(seatReservations)
    .subscribe(
      seat => console.log(seat),
      err => console.error('Observer got an error: ' + err),
      () => this.reloadFunction()
    );
  }

  remove(seatCode, e) {
    // console.log('remove: \n' + seatCode);
    // console.log(e.srcElement.id);
    let seat = this.seatObjectFor(seatCode)
    if (seat == null) {
      return;
    }

    var seatReservation = new Seat();
    seatReservation.FloorCode = seat.FloorCode;
    seatReservation.buildingCode = seat.buildingCode;
    seatReservation.seatCode = seat.seatCode;
    seatReservation.seatName = seat.seatName;
    seatReservation.reservations = [];

    var reservationTimeBlock = this.reservationFor(e.srcElement.id); 

    var reservation = this.reservationIdFor(reservationTimeBlock, seat);

    if (reservation == null) {
      console.log("Didn't Find Reservation");
      return;
    }

    console.log('remove: \n' + seat.seatCode + " with reservation " + e.srcElement.id);

    seatReservation.reservations.push(reservation);

    var seatReservationsToCancel:Seat[] = [];
    seatReservationsToCancel.push(seatReservation);

    console.log(seatReservationsToCancel);
    this.apiService.deleteReservation(seatReservationsToCancel)
    .subscribe(
      seat => console.log(seat),
      err => console.error('Observer got an error: ' + err),
      () => this.reloadFunction()
    );
  }

  reservationIdFor(timeBlock:TimeBlock, seat:Seat):Reservation {
    for (var i = 0; i < seat.reservations.length; i += 1) {
      let reservation = seat.reservations[i];
      if (reservation.start == timeBlock.start && reservation.end == timeBlock.end) {
        return reservation;
      }
    }
    return null;
  }

  reservationFor(timeFrame): TimeBlock {
    function isTimeFrameTimeBlock(timeFrame:string, timeBlock:TimeBlock): boolean {
      let blockTimeFrame = timeBlock.start + " - " + timeBlock.end;
      return timeFrame == blockTimeFrame;
    }

    if (isTimeFrameTimeBlock(timeFrame, this.halfDayMorningBlock())) {
      return this.halfDayMorningBlock();
    }

    if (isTimeFrameTimeBlock(timeFrame, this.halfDayAfternoonBlock())) {
      return this.halfDayAfternoonBlock();
    }

    return this.allDayTimeBlock();
  }

  seatObjectFor(seatCode):Seat {
    var i;
    for (i = 0; i < this.seats.length; i += 1) {
      var seat = this.seats[i];
      if (seat.seatName == seatCode) {
        return seat;
      }
    }
    return null;
  }
}

export class TimeBlock {
  start:string;
  end:string;
}
