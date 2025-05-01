export interface EscrowTransaction {
  id?: string;
  title: string;
  description: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  inspectionPeriod: number;
  status: 'pending' | 'held' | 'released' | 'refunded';
  paymentRef?: string;
  createdAt?: Date;
  releasedAt?: Date;
}

export interface VesicashTransactionPayload {
  title: string;
  description: string;
  currency: string;
  amount: number;
  payment_source: string;
  inspection_period: number;
  buyer: {
      email: string;
  };
  seller: {
      email: string;
  };
}