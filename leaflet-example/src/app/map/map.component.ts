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
import { AfterViewInit, Component, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import json from '../../assets/DEC21.json';
import { ApiService } from '../api.service';
import { Seat } from '../seat'
import { Reservation } from "../reservation";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})


export class MapComponent implements AfterViewInit {

  assetPath = '../../assets/';

  filterDate:Date;

  emailAddress:string;

  seats: Seat[];
  map:L.map;

  markers:L.Marker[];

  startFilterTime:string;
  endFilterTime:string;

  // Seat Label
  seatIconWidth;
  seatIconHeight;
  
  constructor(private apiService: ApiService, private elementRef: ElementRef, private datepipe: DatePipe) {}

  ngAfterViewInit(): void {
    this.initPOC();

    this.markers = [];
    this.initMap();
    
    this.updateSeats();
  }

  updateSeats(): void {
    console.log('updateSeats');
    if (this.markers == null) {
      console.log('this.markers == null');
      return;
    }
    if (this.markers.length > 0) {
      this.removeAllMarkers();
    }

    // json.seats.forEach(seat => this.addSeat(seat));
    // json.seats.forEach(seat => this.addSeatAsImage(seat));

    // this.parseSVG();
  }

  // SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
  //   return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
  // };  

  parseSVG() {

    var svgLocation = this.assetPath + json.svg;

    getAndModifySVG(svgLocation).then(handleSVG);

    // console.log(svgText);

    // const parser = new DOMParser();

    // const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

    // console.log(svgDoc);

    function getAndModifySVG(url) {
      return fetch(url)
                // Get SVG response as text
                .then(response => response.text())
                // Parse to a DOM tree using DOMParser
                .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                // // Find path with id="myPath" and return the d attribute
                // .then(data => data.getElementById("seats"))
    }

    function handleSVG(data) {
      console.log(data);
      var root = data.rootElement;
      var seats = data.getElementById("seats");

      for (var i = 0; i < seats.children.length; i += 1) {
        var path = seats.children[i];

        var point = root.createSVGPoint();
        point.x = 0;  // replace this with the x co-ordinate of the path segment
        point.y = 0;  // replace this with the y co-ordinate of the path segment
  
  
        // var matrix = path.getTransformToElement(root);
        var matrix = root.getScreenCTM().inverse().multiply(path.getScreenCTM());
        var position = point.matrixTransform(matrix);
  
        // console.log(path.id + " has x: " + position.x + " y: " + position.y);

        // console.log(path.id + " has x: " + path.getAttributeNS() + " y: " + position.y);

        if (path.children.lenghth < 1) {
          continue;
        }

        if (path.id === "_x32_123-01" ) {
          debugger
        }
        // var element = path.children[0];

        // console.log(path.children[0]);

        // var x = element.transform.baseVal[0].matrix.e;
        // var y = element.transform.baseVal[0].matrix.f;

        // Instead of taking into account transformations on the element,
        // invert the transformations and apply them to the point.
        // if (element.transform && element.transform.baseVal) {
        //   // Get the transformation matrix information.
        //   var transform = element.transform.baseVal.consolidate();
        //   if (transform) {
        //       // Calculate the inverse of the transformation matrix.
        //       var transformMatrix = transform.matrix;
        //       var inverseTM = transformMatrix.inverse();

        //       // Calculate the new x and y values as a matrix multiplication of
        //       // the inverse transformation matrix and the vector (x,y,1).
        //       //
        //       //   a c e       x       a*x + c*y + e       newX
        //       // ( b d f ) * ( y ) = ( b*x + d*y + f ) = ( newY )
        //       //   0 0 1       1             1              1
        //       //

        //       // debugger
        //       var newX, newY;
        //       newX = inverseTM.a*x + inverseTM.c*y + inverseTM.e;
        //       newY = inverseTM.b*x + inverseTM.d*y + inverseTM.f;
        //       x = newX;
        //       y = newY;
        //   }
        // }

        // console.log(path.id + " has x: " + x + " y: " + y);

      }
    }
  }



  removeAllMarkers():void {
    var i;
    for (i = 0; i < this.markers.length; i += 1) {
      this.map.removeLayer(this.markers[i]);
    }
    this.markers = [];
  }

  private initMap(): void {
    // SVG Asset Size
    let svgWidth = json.svgWidth;
    let svgHeight = json.svgHeight;

    // // Seat Label
    this.seatIconWidth = json.iconWidth;
    this.seatIconHeight = json.iconHeight;

    var svgLocation = this.assetPath + json.svg;

    var bounds = [[0,0], [-1 * svgHeight, svgWidth]];
    this.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -0.4,
        maxZoom: 2,
        zoomSnap: 0.01,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });


    let imageOverlay = L.imageOverlay(svgLocation, bounds).addTo(this.map);
    this.map.setView([svgHeight/2, svgWidth/2], -0.4);

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
      var offsetX = this.seatIconWidth / 2
      return offsetX + x;
  }

  modifyYPositionForBounds(y) {
      var offsetY = this.seatIconHeight / 2
      return -1 * offsetY - y;
  }

  // Swap the x and y coordinates
  // https://gis.stackexchange.com/questions/54065/leaflet-geojson-coordinate-problem
  modifyForGeoJSON(x, y) {
      return [y, x];
  }

  addSeatAsImage(seat):void {
    console.log("addSeatAsImage");

    var x = seat.x;
    var y = seat.y;

    var modifiedX = this.modifyXPositionForBounds(x);
    var modifiedY = this.modifyYPositionForBounds(y);

    var newPosition = this.modifyForGeoJSON(modifiedX, modifiedY);

    var markerLatLong = L.latLng(newPosition);

    var halfIconWidth = this.seatIconWidth * 0.5;
    var halfIconHeight = this.seatIconHeight * 0.5;

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

  addSeat(seat):void {
    console.log("addSeat");
      var x = seat.x;
      var y = seat.y;

      var modifiedX = this.modifyXPositionForBounds(x);
      var modifiedY = this.modifyYPositionForBounds(y);

      var newPosition = this.modifyForGeoJSON(modifiedX, modifiedY);


      var markerLatLong = L.latLng(newPosition);
      
      let reserved = this.reservedStatusFor(seat.seatCode);

      let printedOutCorrect = false;
      let reservations = this.reservationsFor(seat.seatCode);
      if (this.isReservationUsers(reservations)) {
        if (reservations.length > 0) {
          let debug = this.reservationsInFilterForDebugFor(seat.seatCode);
          if (debug == '') {
            console.log(seat.seatCode + ' no overlapping reservations');
          } else {
            printedOutCorrect = true;
            console.log(debug);
          }
        }
      }
      
      var queries:string[] = this.popupQueries(seat);
      var icon = this.iconFor(seat.seatCode, printedOutCorrect);
      var marker = L.marker(markerLatLong, {icon: icon} ).addTo(this.map);
      marker.bindPopup(this.popupFor(seat));
      marker.on("popupopen", () => {
        for (var i = 0; i < queries.length; i += 1) {
          let query = queries[i];
          // console.log(query);
          // console.log(this.elementRef.nativeElement);
          this.elementRef.nativeElement
          .querySelector(query)
          .addEventListener("click", e => {
            if (reserved) {
              // console.log(e);
              this.remove(seat.seatCode, e);
            } else {
              // console.log(e);
              this.reserve(seat.seatCode);
            }
          });
        }
      });

      marker.on("click", () => {
        this.selected(seat.seatCode);
      });

      marker.bindTooltip(seat.name, {permanent: true, direction: "top"}).openTooltip();
      
      // https://stackoverflow.com/questions/63740716/how-to-call-outer-class-function-from-inner-function-in-javascript
      this.map.on('zoomend', () => {
        marker.setIcon(this.iconFor(seat.seatCode, false));
        this.updateTooltipFor(marker, printedOutCorrect);
      });

      marker.setIconAngle(seat.angle);

      this.markers.push(marker);
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

    var newWidth = percentageOfMap * this.seatIconWidth;
    var halfWidth = newWidth/ 2;

    var newHeight = percentageOfMap * this.seatIconHeight;
    var halfHeight = newHeight/ 2;

    // marker.getTooltip().offset = [newHeight * 10, newHeight * 20];
    marker.getTooltip().offset = L.point(0, newHeight);
    if (debug) {
      console.log(newHeight);
      console.log(marker.getTooltip().offset);
    }
  }

  imageFor(seatCode):string {
    let reservations = this.reservationsInFilterFor(seatCode);
    let reserved = reservations.length > 0;  
    let reservedIcon = this.isReservationUsers(reservations) ? this.userReservedSeat() : this.reservedSeat();
    return reserved ? reservedIcon : this.reservableSeat(); 
  }

  iconFor(seatCode, debug):L.icon {
    console.log("iconFor");
    var currentZoom = this.map.getZoom();
    var percentageOfMap = currentZoom;
    
    if (currentZoom < 0) {
      percentageOfMap = currentZoom + 1;
    } else {
      percentageOfMap += 1;
    }

    // var newWidth = percentageOfMap * this.seatIconWidth;
    // var halfWidth = newWidth/ 2;

    var newWidth = this.seatIconWidth;
    var halfWidth = newWidth/ 2;

    // var newHeight = percentageOfMap * this.seatIconHeight;
    // var halfHeight = newHeight/ 2;

    var newHeight = this.seatIconHeight;
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
      popupAnchor:  [0, halfHeight], // point from which the popup should open relative to the iconAnchor
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
