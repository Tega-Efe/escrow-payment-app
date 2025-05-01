import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EscrowTransaction, VesicashTransactionPayload } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class VesicashService {
  private apiUrl = 'https://api.vesicash.com/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${environment.VESICASH_SECRET_KEY}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  createTransaction(transaction: Partial<EscrowTransaction>): Observable<any> {
    const payload: VesicashTransactionPayload = {
      title: transaction.title || '',
      description: transaction.description || '',
      currency: transaction.currency || 'NGN',
      amount: transaction.amount || 0,
      payment_source: 'flutterwave',
      inspection_period: transaction.inspectionPeriod || 3,
      buyer: {
        email: transaction.buyerId || '',
      },
      seller: {
        email: transaction.sellerId || '',
      }
    };

    return this.http.post(
      `${this.apiUrl}/transactions`, 
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }



  getTransactionStatus(transactionId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/transactions/${transactionId}`,
      { headers: this.getHeaders() }
    );
  }

  acceptTransaction(transactionId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/transactions/${transactionId}/accept`,
      {},
      { headers: this.getHeaders() }
    );
  }

  releaseFunds(transactionId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/transactions/${transactionId}/release`,
      {},
      { headers: this.getHeaders() }
    );
  }
}