// src/users/dto/create-gate.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateGateDto {
    @ApiProperty({ example: 'Portaria Evento X' })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name: string;

    @ApiProperty({ example: 'portaria@evento.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(120)
    password: string;

    @ApiPropertyOptional({
        description: 'Eventos que esta portaria pode validar',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    eventIds?: string[];
}