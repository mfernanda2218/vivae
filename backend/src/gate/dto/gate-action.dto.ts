import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GateActionDto {
  @ApiProperty({
    description: 'QR/link do ingresso ou codigo digitado manualmente',
    example: 'https://vivae.app/ingresso/abc123',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(500)
  identifier: string;

  @ApiPropertyOptional({
    description:
      'Evento esperado pela portaria para detectar ingresso de outro evento',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;
}
