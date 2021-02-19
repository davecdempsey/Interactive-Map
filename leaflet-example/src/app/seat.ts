import { Reservation } from "./reservation";

export class Seat {
    seatCode: string;
    seatName: string;
    buildingCode: string;
    FloorCode: string;
    reservations:Reservation[];
}
