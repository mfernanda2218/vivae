import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiPropertyOptional({ description: 'ID externo da Ticketmaster' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({ description: 'Título do evento' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descrição do evento' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'URL da imagem de capa' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Categoria (Music, Sports, Arts, etc.)' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Data e hora do evento (ISO 8601)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Local do evento' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Capacidade total de ingressos' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  capacity: number;

  @ApiProperty({ description: 'Preço do ingresso em BRL' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}
