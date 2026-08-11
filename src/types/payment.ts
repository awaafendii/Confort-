export type PaymentMethod =
  | 'ESPECE'
  | 'ORANGE_MONEY'
  | 'MOMO'
  | 'PAYCARD'
  | 'VISA'
  | 'KULU';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id: string;
  userId: string;
  rideId?: string;
  amount: number;
  currency: 'GNF';
  type: TransactionType;
  method: PaymentMethod;
  description: string;
  date: string;
  status: PaymentStatus;
}

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  method: PaymentMethod;
  label: string;
  isDefault: boolean;
  last4?: string;
}
