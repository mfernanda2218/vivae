import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiPropertyOptional({ description: 'ID externo da Ticketmaster' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalId?: string;

  @ApiProperty({ description: 'Titulo do evento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  title: string;

  @ApiProperty({ description: 'Descricao do evento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ description: 'URL da imagem de capa' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ description: 'Categoria (Music, Sports, Arts, etc.)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @ApiProperty({ description: 'Data e hora do evento (ISO 8601)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Local do evento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  location: string;

  @ApiProperty({ description: 'Capacidade total de ingressos' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  capacity: number;

  @ApiProperty({ description: 'Preco do ingresso em BRL' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}
