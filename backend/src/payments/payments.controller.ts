import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':reservationId')
  @ApiOperation({ summary: 'Processa pagamento simulado da reserva' })
  process(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
    @Body() dto: ProcessPaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.process(reservationId, dto, userId);
  }
}
