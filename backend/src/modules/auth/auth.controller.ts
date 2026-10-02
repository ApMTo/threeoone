import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AppConfigService } from '../../config/config.service';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import { AUTH_COOKIE, CSRF_HEADER } from './auth.constants';
import { AuthService } from './auth.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthResponseBody, AuthUser, RegisterPendingResponse } from './types/auth.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto): Promise<RegisterPendingResponse> {
    return this.authService.register(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Body() dto: ConfirmEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseBody> {
    const result = await this.authService.confirmEmail(dto);
    setAuthCookies(res, this.config, result.sessionId, result.csrfToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      csrfToken: result.csrfToken,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseBody> {
    const result = await this.authService.login(dto);
    setAuthCookies(res, this.config, result.sessionId, result.csrfToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      csrfToken: result.csrfToken,
    };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseBody> {
    const sessionId = req.cookies?.[AUTH_COOKIE.sessionId] as string | undefined;
    const csrfFromHeader = req.header(CSRF_HEADER);
    const csrfFromCookie = req.cookies?.[AUTH_COOKIE.csrfToken] as string | undefined;
    const csrfToken = csrfFromHeader || csrfFromCookie;

    try {
      const result = await this.authService.refresh(sessionId, csrfToken);
      setAuthCookies(res, this.config, result.sessionId, result.csrfToken);
      return {
        user: result.user,
        accessToken: result.accessToken,
        sessionId: result.sessionId,
        csrfToken: result.csrfToken,
      };
    } catch (error) {
      clearAuthCookies(res, this.config);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const sessionId = req.cookies?.[AUTH_COOKIE.sessionId] as string | undefined;
    await this.authService.logout(sessionId);
    clearAuthCookies(res, this.config);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: AuthUser }): AuthUser {
    return req.user;
  }
}
