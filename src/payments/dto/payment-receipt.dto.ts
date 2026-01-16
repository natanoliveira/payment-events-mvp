import { ApiProperty } from '@nestjs/swagger';

export class PaymentReceiptDto {
  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  amount!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  personName!: string;

  @ApiProperty()
  personEmail!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
