// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGateDto } from './dto/create-gate.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles('ADMIN', 'ORGANIZER')
  @ApiOperation({ summary: 'Lista usuarios para perfis operacionais' })
  findAll(@CurrentUser('id') actorId: string) {
    return this.usersService.findAll(actorId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuario autenticado' })
  findMe(@CurrentUser('id') actorId: string) {
    return this.usersService.findMe(actorId);
  }

  @Post('gate')
  @Roles('ORGANIZER')
  @ApiOperation({ summary: 'Organizador cria usuario de portaria' })
  createGate(
    @Body() dto: CreateGateDto,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.usersService.createGate(dto, organizerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha usuario com permissao de acesso' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.findOne(id, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados cadastrais do usuario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.update(id, dto, actorId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove usuario sem vinculos operacionais' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.remove(id, actorId);
  }
}