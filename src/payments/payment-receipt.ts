export interface PaymentReceipt {
  paymentId: string;
  reference: string;
  amount: string;
  currency: string;
  personName: string;
  personEmail: string;
  createdAt: Date;
}
