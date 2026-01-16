import { OnEvent } from '@nestjs/event-emitter';
import { PaymentConfirmedEvent } from '../payments/events/payment-confirmed.event';

export class GenerateReceiptListener {
  @OnEvent('payment.confirmed')
  handlePaymentConfirmed(event: PaymentConfirmedEvent) {
    console.log(
      `Recibo gerado para pagamento ${event.receipt.paymentId} com referencia ${event.receipt.reference}`,
    );
  }
}
