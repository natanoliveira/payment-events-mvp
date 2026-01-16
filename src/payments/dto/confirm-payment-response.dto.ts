import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../payment.entity';
import { PaymentReceiptDto } from './payment-receipt.dto';

export class ConfirmPaymentResponseDto {
  @ApiProperty({ type: Payment })
  payment!: Payment;

  @ApiProperty({ type: PaymentReceiptDto })
  receipt!: PaymentReceiptDto;
}
