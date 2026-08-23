// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGateDto } from './dto/create-gate.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: 'Lista usuarios para perfis operacionais' })
  findAll(@Headers('x-user-id') actorId?: string) {
    return this.usersService.findAll(actorId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuario autenticado pelo header' })
  findMe(@Headers('x-user-id') actorId?: string) {
    return this.usersService.findMe(actorId);
  }

  @Post('gate')
  @ApiOperation({ summary: 'Organizador cria usuario de portaria' })
  createGate(
    @Body() dto: CreateGateDto,
    @Headers('x-organizer-id') organizerId?: string,
  ) {
    return this.usersService.createGate(dto, organizerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha usuario com permissao de acesso' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') actorId?: string,
  ) {
    return this.usersService.findOne(id, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados cadastrais do usuario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Headers('x-user-id') actorId?: string,
  ) {
    return this.usersService.update(id, dto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove usuario sem vinculos operacionais' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') actorId?: string,
  ) {
    return this.usersService.remove(id, actorId);
  }
}