import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @ApiPropertyOptional({ description: 'Método de pagamento simulado' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    description:
      'Resultado forçado para demonstrar pagamento aprovado ou recusado',
    enum: ['APPROVED', 'DECLINED'],
  })
  @IsOptional()
  @IsIn(['APPROVED', 'DECLINED'])
  outcome?: 'APPROVED' | 'DECLINED';
}
