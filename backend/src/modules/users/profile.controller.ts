import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getProfile(@Req() req: Request & { user: AuthUser }): Promise<AuthUser> {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch()
  updateProfile(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(req.user.id, dto);
  }
}
