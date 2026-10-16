import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import {
  AuthResponseDto,
  UserProfileDto,
} from './dto/auth-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { SanitizedUser } from '../users/users.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Register New Account',
    description:
      'Creates a new customer account, validates password strength, and issues initial mobile/web JWT token pair.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'User registered successfully and token pair generated',
    type: AuthResponseDto,
  })
  @SwaggerResponse({
    status: 409,
    description: 'Conflict: An account with this email address already exists',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request: Input validation failed',
  })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.register(dto, ipAddress);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate User (Login)',
    description:
      'Validates user credentials and issues short-lived Access Token (15m) + long-lived Refresh Token (30d) tied to client device info.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized: Invalid email or password, or suspended account',
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, ipAddress);
  }

  @Post('google')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Optional guest session ID to merge active guest shopping cart on login',
  })
  @ApiOperation({
    summary: 'Google OAuth Single Sign-On (SSO)',
    description:
      'Authenticates user via signed Google OpenID Connect ID Token, auto-provisions customer profile if new, issues JWT token pair, and merges guest shopping cart.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Google authentication successful',
    type: AuthResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized: Invalid Google ID token or suspended account',
  })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() req: Request,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.loginWithGoogle(dto, ipAddress, sessionId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate and Refresh Tokens',
    description:
      'Implements Refresh Token Rotation: revokes the existing refresh token and generates a brand new token pair to prevent session hijacking.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Tokens successfully refreshed and rotated',
    type: AuthResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized: Refresh token invalid, expired, or revoked',
  })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.refreshTokens(dto, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Terminate Session (Logout)',
    description:
      'Invalidates the active refresh token for the specified client device, ending the authenticated session.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Session successfully revoked',
  })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Authenticated User Profile',
    description:
      'Retrieves the sanitized profile of the currently logged-in user using the Bearer JWT Access Token.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Authenticated user profile retrieved successfully',
    type: UserProfileDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized: Missing, invalid, or expired Access Token',
  })
  async getProfile(@CurrentUser() user: SanitizedUser) {
    return user;
  }
}
