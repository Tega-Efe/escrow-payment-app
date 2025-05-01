import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { EscrowTransaction} from '../models/payment';
import { Firestore, collection, doc, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EscrowService {
  private paystackUrl = 'https://api.paystack.co';

  constructor(
    private http: HttpClient,
    private firestore: Firestore
  ) {}

  initiateEscrowPayment(amount: number, email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      email,
      amount: amount * 100, // Convert to kobo
      split: {
        type: "percentage",
        bearer_type: "account",
        subaccounts: [
          {
            subaccount: environment.ESCROW_SUBACCOUNT_CODE,
            share: 100
          }
        ]
      }
    };

    return this.http.post(`${this.paystackUrl}/transaction/initialize`, payload, { headers });
  }

  createEscrowTransaction(transaction: Partial<EscrowTransaction>): Observable<void> {
    const escrowRef = doc(collection(this.firestore, 'escrow-transactions'));
    const escrowData: EscrowTransaction = {
      ...transaction,
      id: escrowRef.id,
      status: 'pending',
      createdAt: new Date()
    } as EscrowTransaction;

    return from(setDoc(escrowRef, escrowData));
  }

  verifyPayment(reference: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.paystackUrl}/transaction/verify/${reference}`, { headers });
  }

  releaseFunds(transactionId: string): Observable<void> {
    const escrowRef = doc(this.firestore, `escrow-transactions/${transactionId}`);
    return from(updateDoc(escrowRef, {
      status: 'released',
      releasedAt: new Date()
    }));
  }
}