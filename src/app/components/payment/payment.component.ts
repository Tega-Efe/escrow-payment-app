import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { VesicashService } from '../../services/visicash.service';
import { environment } from '../../../environments/environment';

declare const FlutterwaveCheckout: any;

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="payment-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Escrow Payment</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="initializePayment()" #paymentForm="ngForm">
            <mat-form-field>
              <input matInput type="email" [(ngModel)]="buyerEmail" 
                     name="buyerEmail" placeholder="Your Email" required>
            </mat-form-field>
            
            <mat-form-field>
              <input matInput type="email" [(ngModel)]="sellerEmail" 
                     name="sellerEmail" placeholder="Seller Email" required>
            </mat-form-field>

            <mat-form-field>
              <input matInput type="number" [(ngModel)]="amount" 
                     name="amount" placeholder="Amount" required>
            </mat-form-field>

            <mat-form-field>
              <input matInput [(ngModel)]="description" 
                     name="description" placeholder="Transaction Description" required>
            </mat-form-field>

            <button mat-raised-button color="primary" 
                    type="submit" [disabled]="!paymentForm.valid">
              Pay with Escrow
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="transaction">
        <mat-card-header>
          <mat-card-title>Transaction Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Status: {{transaction.status}}</p>
          <p>Transaction ID: {{transaction.transactionId}}</p>
          <button mat-button color="accent" 
                  *ngIf="transaction.status === 'payment_held'"
                  (click)="releaseFunds()">
            Release Funds
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    button {
      width: 100%;
    }
  `]
})
export class PaymentComponent implements OnInit {
  buyerEmail: string = '';
  sellerEmail: string = '';
  amount: number = 0;
  description: string = '';
  transaction: any;

  constructor(
    private vesicashService: VesicashService,
  ) {}

  ngOnInit() {}

  
  initializePayment() {
    this.vesicashService.createTransaction({
      title: 'Product Purchase',
      description: this.description,
      amount: this.amount,
      currency: 'NGN',
      buyerId: this.buyerEmail,
      sellerId: this.sellerEmail,
      inspectionPeriod: 3
    }).subscribe(response => {
      const vesicashTransaction = response.data;
      this.transaction = vesicashTransaction;
      
      // Initialize Flutterwave payment
      FlutterwaveCheckout({
        public_key: environment.FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: vesicashTransaction.transactionId,
        amount: this.amount,
        currency: "NGN",
        payment_options: "card,ussd,banktransfer",
        customer: {
          email: this.buyerEmail,
          name: this.buyerEmail.split('@')[0], // Using email as name
        },
        customizations: {
          title: "Escrow Payment",
          description: this.description,
          logo: "https://your-logo-url.png", // Add your logo URL
        },
        callback: (response: any) => {
          // Close payment modal
          response.modal.close();
          
          if (response.status === "successful") {
            // Verify the transaction on your backend
            this.vesicashService.acceptTransaction(this.transaction.transactionId)
              .subscribe(() => {
                this.transaction.status = 'payment_held';
              });
          }
        },
        onclose: () => {
          console.log('Payment was cancelled');
        }
      });
    });
  }
  handlePaymentCancel() {
    console.log('Payment was cancelled');
  }

  releaseFunds() {
    if (this.transaction?.transactionId) {
      this.vesicashService.releaseFunds(this.transaction.transactionId)
        .subscribe(() => {
          this.transaction.status = 'completed';
        });
    }
  }
}

