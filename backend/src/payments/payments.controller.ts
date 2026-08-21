import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':reservationId')
  @ApiOperation({ summary: 'Processa pagamento simulado da reserva' })
  process(
    @Param('reservationId') reservationId: string,
    @Body() dto: ProcessPaymentDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.paymentsService.process(reservationId, dto, userId);
  }
}
