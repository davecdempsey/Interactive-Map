import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Seat } from './seat';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  getSeatsApi: string =          'https://20ckmcssc2.execute-api.us-east-1.amazonaws.com/Stage/us/nc/0001/018/seats';
  createReservationApi: string = 'https://20ckmcssc2.execute-api.us-east-1.amazonaws.com/Stage/us/nc/0001/018/seats';
  deleteReservationApi: string = 'https://20ckmcssc2.execute-api.us-east-1.amazonaws.com/Stage/us/nc/0001/018/seats';
  private httpClient: HttpClient;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  /** GET seats from the server */
  getSeats(): Observable<Seat[]> {
    return this.http.get<Seat[]>(this.getSeatsApi)
      .pipe(
        tap(_ => this.log('fetched seats')),
        catchError(this.handleError<Seat[]>('getSeats', []))
      );
  }

  /** POST: add a new reservation to the database */
  addReservation(seat: Seat[]): Observable<Seat[]> {
    return this.http.post<Seat[]>(this.createReservationApi, seat, this.httpOptions)
      .pipe(
        tap(_ => this.log('added reservation')),
        catchError(this.handleError('addReservation', seat))
      );
  }

  /** DELETE: delete the reservation from the server */
  deleteReservation(seats: Seat[]): Observable<{}> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: seats
    }
    return this.http.delete<Seat>(this.deleteReservationApi, options)
    .pipe(
      catchError(this.handleError('deleteReservation', seats))
    );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log(`SeatService: ${message}`);
  }
}