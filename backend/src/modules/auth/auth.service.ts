import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { AppConfigService } from '../../config/config.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordResetService } from './password-reset.service';
import { PendingRegistrationService } from './pending-registration.service';
import { SessionService } from './session.service';
import type { JwtPayload } from './types/jwt-payload.type';
import type { AuthUser, AuthResult, RegisterPendingResponse } from './types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly pendingRegistration: PendingRegistrationService,
    private readonly passwordReset: PasswordResetService,
    private readonly mailService: MailService,
    private readonly config: AppConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterPendingResponse> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const token = this.pendingRegistration.createToken();

    await this.pendingRegistration.save(token, {
      email,
      fullName: dto.fullName.trim(),
      dateOfBirth: dto.dateOfBirth,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const confirmUrl = this.pendingRegistration.buildConfirmUrl(token);
    await this.mailService.sendAccountConfirmation(email, dto.fullName.trim(), confirmUrl);

    return {
      message: 'We sent a confirmation link to your email',
      email,
    };
  }

  async confirmEmail(dto: ConfirmEmailDto): Promise<AuthResult> {
    const pending = await this.pendingRegistration.get(dto.token);
    if (!pending) {
      throw new BadRequestException('Confirmation link is invalid or expired');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: pending.email,
          fullName: pending.fullName,
          dateOfBirth: new Date(pending.dateOfBirth),
          passwordHash: pending.passwordHash,
        },
      });

      await this.pendingRegistration.remove(dto.token, pending.email);
      return this.issueAuth(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        await this.pendingRegistration.remove(dto.token, pending.email);
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueAuth(user);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    // Always return the same message to avoid email enumeration.
    const message = 'If an account exists for that email, we sent a reset link';

    if (!user) {
      return { message };
    }

    const token = this.passwordReset.createToken();
    await this.passwordReset.save(token, user.email);
    const resetUrl = this.passwordReset.buildResetUrl(token);
    await this.mailService.sendPasswordReset(user.email, user.fullName, resetUrl);

    return { message };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const email = await this.passwordReset.getEmail(dto.token);
    if (!email) {
      throw new BadRequestException('Reset link is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const updated = await this.prisma.user.updateMany({
      where: { email },
      data: { passwordHash },
    });

    await this.passwordReset.remove(dto.token, email);

    if (updated.count === 0) {
      throw new BadRequestException('Reset link is invalid or expired');
    }

    return { message: 'Password updated. You can sign in with your new password.' };
  }

  async refresh(sessionId: string | undefined, csrfToken: string | undefined): Promise<AuthResult> {
    if (!sessionId || !csrfToken) {
      throw new UnauthorizedException('Missing session credentials');
    }

    const session = await this.sessionService.get(sessionId);
    if (!session || session.csrfToken !== csrfToken) {
      if (sessionId) {
        await this.sessionService.remove(sessionId);
      }
      throw new UnauthorizedException('Invalid session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      await this.sessionService.remove(sessionId);
      throw new UnauthorizedException('User not found');
    }

    await this.sessionService.remove(sessionId);
    return this.issueAuth(user);
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (sessionId) {
      await this.sessionService.remove(sessionId);
    }
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  async validateUserById(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.toAuthUser(user) : null;
  }

  private async issueAuth(user: {
    id: string;
    email: string;
    fullName: string;
    dateOfBirth: Date;
    role: 'customer' | 'admin';
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResult> {
    const { sessionId, refreshToken, csrfToken } = this.sessionService.createIds();

    await this.sessionService.save(sessionId, {
      userId: user.id,
      refreshTokenHash: this.sessionService.hashRefreshToken(refreshToken),
      csrfToken,
      createdAt: new Date().toISOString(),
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwtAccessSecret,
      expiresIn: this.config.jwtAccessExpiresIn as `${number}m`,
    });

    return {
      user: this.toAuthUser(user),
      accessToken,
      sessionId,
      csrfToken,
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    fullName: string;
    dateOfBirth: Date;
    role: 'customer' | 'admin';
    createdAt: Date;
    updatedAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth.toISOString().slice(0, 10),
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
