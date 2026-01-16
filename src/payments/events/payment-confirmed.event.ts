import { PaymentReceipt } from '../payment-receipt';

export class PaymentConfirmedEvent {
  constructor(public readonly receipt: PaymentReceipt) {}
}
