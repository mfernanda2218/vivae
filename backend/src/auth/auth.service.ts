import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException('Email ja cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        role: dto.role || 'CUSTOMER',
      },
      select: this.publicUserSelect(),
    });
    this.logger.log({
      action: 'auth.register',
      userId: user.id,
      role: user.role,
    });

    return this.session(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (!process.env.JWT_SECRET) {
      this.logger.warn('JWT_SECRET ausente; usando segredo de desenvolvimento');
    }

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.logger.log({ action: 'auth.login', userId: user.id, role: user.role });

    return this.session(publicUser);
  }

  private session(user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }) {
    if (!user.id || !user.role) {
      throw new BadRequestException('Usuario invalido');
    }

    return {
      accessToken: this.jwt.sign({ sub: user.id, role: user.role }),
      user,
    };
  }

  private publicUserSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
    } as const;
  }
}
