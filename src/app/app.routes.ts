import { Routes } from '@angular/router';
import { PaymentComponent } from './components/payment/payment.component';

export const routes: Routes = [
  { path: '', redirectTo: '/payment', pathMatch: 'full' },
  { path: 'payment', component: PaymentComponent }
];