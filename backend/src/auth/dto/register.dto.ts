import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Cliente Vivae' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'cliente@vivae.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password: string;

  @ApiPropertyOptional({ enum: ['CUSTOMER', 'ORGANIZER'] })
  @IsOptional()
  @IsIn(['CUSTOMER', 'ORGANIZER'])
  role?: 'CUSTOMER' | 'ORGANIZER';
}
