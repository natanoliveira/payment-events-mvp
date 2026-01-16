import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 125.5 })
  amount!: number;

  @ApiProperty({ example: 'BRL' })
  currency!: string;

  @ApiProperty({ example: 'ORDER-123' })
  reference!: string;

  @ApiProperty({ example: 'uuid-da-pessoa' })
  personId!: string;
}
