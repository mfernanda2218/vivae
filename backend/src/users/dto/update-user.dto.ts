import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Cliente Vivae' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'cliente@vivae.app' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password?: string;

  @ApiPropertyOptional({ enum: ['CUSTOMER', 'ORGANIZER', 'GATE', 'ADMIN'] })
  @IsOptional()
  @IsIn(['CUSTOMER', 'ORGANIZER', 'GATE', 'ADMIN'])
  role?: 'CUSTOMER' | 'ORGANIZER' | 'GATE' | 'ADMIN';
}
