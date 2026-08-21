import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID do evento publicado' })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Quantidade de ingressos',
    minimum: 1,
    maximum: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
