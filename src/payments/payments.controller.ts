import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { ConfirmPaymentResponseDto } from './dto/confirm-payment-response.dto';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Confirmar pagamento' })
  @ApiBody({ type: ConfirmPaymentDto })
  @ApiCreatedResponse({
    description: 'Pagamento confirmado com recibo',
    type: ConfirmPaymentResponseDto,
  })
  @Post('confirm')
  async confirm(@Body() body: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(body);
  }

  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiOkResponse({ description: 'Lista de pagamentos', type: Payment, isArray: true })
  @Get()
  async list() {
    return this.paymentsService.listPayments();
  }

  @ApiOperation({ summary: 'Listar pagamentos por pessoa' })
  @ApiParam({ name: 'personId', description: 'ID da pessoa' })
  @ApiOkResponse({ description: 'Pagamentos da pessoa', type: Payment, isArray: true })
  @Get('person/:personId')
  async listByPerson(@Param('personId') personId: string) {
    return this.paymentsService.listPaymentsByPerson(personId);
  }
}
