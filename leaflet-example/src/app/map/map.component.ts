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
import json from '../../assets/InteractiveMapDataSourse.json';
import './Marker.Rotate.js';
import { ApiService } from '../api.service';
import { Seat } from '../seat'
import { Reservation } from "../reservation";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements AfterViewInit {

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
    json.seats.forEach(seat => this.addSeat(seat));
  }

  removeAllMarkers():void {
    var i;
    for (i = 0; i < this.markers.length; i += 1) {
      this.map.removeLayer(this.markers[i]);
    }
    this.markers = [];
  }

  private initMap(): void {
    let reservedStatus = "reserved";
    let reservableStatus = "reservable";

    // SVG Asset Size
    let svgWidth = json.svgWidth;
    let svgHeight = json.svgHeight;

    // // Seat Label
    this.seatIconWidth = json.iconWidth;
    this.seatIconHeight = json.iconHeight;

    var svgLocation = json.svg;

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


    L.imageOverlay(svgLocation, bounds).addTo(this.map);
    this.map.setView([svgHeight/2, svgWidth/2], -0.4);
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

  addSeat(seat):void {
      var x = seat.x;
      var y = seat.y;

      var modifiedX = this.modifyXPositionForBounds(x);
      var modifiedY = this.modifyYPositionForBounds(y);

      var newPosition = this.modifyForGeoJSON(modifiedX, modifiedY);


      var markerLatLong = L.latLng(newPosition);
      
      let reserved = this.reservedStatusFor(seat.seatCode);

      var buttonType = reserved ? ".remove" : ".reserve";
      var queries:string[] = this.popupQueries(seat);
      var icon = this.iconFor(seat.seatCode);
      var marker = L.marker(markerLatLong, {icon: icon} ).addTo(this.map);
      marker.bindPopup(this.popupFor(seat));
      marker.on("popupopen", () => {
        for (var i = 0; i < queries.length; i += 1) {
          let query = queries[i];
          console.log(query);
          console.log(this.elementRef.nativeElement);
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
      
      // https://stackoverflow.com/questions/63740716/how-to-call-outer-class-function-from-inner-function-in-javascript
      this.map.on('zoomend', () => {
        marker.setIcon(this.iconFor(seat.seatCode));
      });

      marker.setIconAngle(seat.angle);

      this.markers.push(marker);
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
    console.log('popupQueries: \n' + queries);
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
      reservationButtonsSection += '<p style = "margin:0;">' + removeReservation + '  ' + timeFrame + '</p>' + lineBreak; 
    }

    console.log('---------------------------' + seat.name);
    console.log(reservationButtonsSection);

    var popup = '<div class="card">' +
                  '<h1 style = "margin:0;">' + seat.name + '</h1>' +
                  '<p class="title" style = "margin:0;"> Floor: ' + seat.floor + '</p>' +
                  '<p style = "margin:0;">' + seat.building + '</p>' +
                  reservationButtonsSection +
                '</div>';
    return popup;
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
    var seat = this.seatFor(seatCode);
    if (seat == null) {
      return [];
    }
    return seat.reservations;
  }

  iconFor(seatCode):L.icon {
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
    let reserved = this.reservedStatusFor(seatCode);  
    let iconURL = reserved ? '../../assets/reservedSeat.png' : '../../assets/reservableSeat.png'; 
    return L.icon({
      iconUrl: iconURL,
      iconSize:     [newWidth, newHeight], // size of the icon
      iconAnchor:   [halfWidth, halfHeight], // point of the icon which will correspond to marker's location
      popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
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

  doDatesOverlaps(date1Start, date1DEnd, date2Start, date2End):boolean {
    return ((date1Start.getTime() >= date2Start.getTime() && date1Start.getTime() <= date2End.getTime()) || 
           (date2Start.getTime() >= date1Start.getTime() && date2Start.getTime() <= date1DEnd.getTime()));
  }

  //------------------------------ POC

  mapDate:Date;

  initPOC(): void {
    this.startFilterTime = this.allDayTimeBlock().start;
    this.endFilterTime = this.allDayTimeBlock().end;

    this.markers = [];
    this.filterDate = new Date();
    this.emailAddress = "muath.ali@duke-energy.com";
    this.mapDate = new Date();
    this.getSeats();
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
    timeBlock.end = '11:00:00';
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
