import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../database/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { CartService } from '../cart/cart.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { AuthTokensDto, UserProfileDto } from './dto/auth-response.dto.js';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const rawAccess = this.configService.get<string>('JWT_ACCESS_SECRET');
    const rawRefresh = this.configService.get<string>('JWT_REFRESH_SECRET');
    const isProd = process.env.NODE_ENV === 'production';

    if (
      isProd &&
      (!rawAccess ||
        !rawRefresh ||
        rawAccess.includes('super-secret') ||
        rawRefresh.includes('super-secret') ||
        rawAccess.length < 32)
    ) {
      throw new Error(
        'CRITICAL SECURITY ERROR: In production mode, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to unique, cryptographically strong strings (at least 32 characters) and cannot use repository defaults.',
      );
    }

    this.accessSecret =
      rawAccess || 'dev-only-secret-jwt-access-key-atoz-heavy-equipment';
    this.refreshSecret =
      rawRefresh || 'dev-only-secret-jwt-refresh-key-atoz-heavy-equipment';
    this.accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    this.refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d';

    this.googleClientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  /**
   * Register a new customer account and issue initial JWT pair
   */
  async register(
    dto: RegisterDto,
    ipAddress?: string,
  ): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    this.logger.log(`New user registered: ${user.email} (${user.id})`);

    const tokens = await this.generateTokenPair(user, dto.deviceInfo, ipAddress);
    return {
      user: this.usersService.sanitizeUser(user) as unknown as UserProfileDto,
      tokens,
    };
  }

  /**
   * Authenticate user credentials and issue fresh JWT pair with device tracking
   */
  async login(
    dto: LoginDto,
    ipAddress?: string,
  ): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Your account is inactive or suspended. Please contact support.',
      );
    }

    const tokens = await this.generateTokenPair(user, dto.deviceInfo, ipAddress);

    this.logger.log(
      `User logged in: ${user.email} from ${dto.deviceInfo || 'Unknown device'}`,
    );

    return {
      user: this.usersService.sanitizeUser(user) as unknown as UserProfileDto,
      tokens,
    };
  }

  /**
   * Authenticate via Google OAuth OpenID Connect ID Token, auto-provision user, issue tokens, and merge guest cart
   */
  async loginWithGoogle(
    dto: GoogleLoginDto,
    ipAddress?: string,
    guestSessionId?: string,
  ): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    let ticket;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: this.googleClientId,
      });
    } catch (error) {
      this.logger.warn(`Google token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired Google ID token');
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException(
        'Google token does not contain a verified email address',
      );
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name;
    const givenName = payload.given_name;
    const familyName = payload.family_name;
    const picture = payload.picture;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      const randomPassword = randomUUID() + randomUUID();
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(randomPassword, saltRounds);

      user = await this.usersService.create({
        email,
        passwordHash,
        firstName: givenName || (name ? name.split(' ')[0] : 'Customer'),
        lastName:
          familyName ||
          (name && name.split(' ').length > 1
            ? name.split(' ').slice(1).join(' ')
            : null),
        avatarUrl: picture || null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      });

      this.logger.log(`New user auto-created via Google OAuth: ${user.email} (${user.id})`);
    } else {
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException(
          'Your account is inactive or suspended. Please contact support.',
        );
      }

      // Update avatar or email verification if missing
      const updateData: {
        isEmailVerified?: boolean;
        emailVerifiedAt?: Date;
        avatarUrl?: string;
      } = {};

      if (!user.isEmailVerified) {
        updateData.isEmailVerified = true;
        updateData.emailVerifiedAt = new Date();
      }
      if (!user.avatarUrl && picture) {
        updateData.avatarUrl = picture;
      }

      if (Object.keys(updateData).length > 0 && this.prisma.isConnected) {
        try {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        } catch {}
      }

      this.logger.log(`Existing user logged in via Google OAuth: ${user.email} (${user.id})`);
    }

    // Merge any active guest cart
    const sessionToMerge = dto.guestSessionId || guestSessionId;
    if (sessionToMerge) {
      try {
        await this.cartService.mergeCart(sessionToMerge, user.id);
        this.logger.log(`Merged guest cart ${sessionToMerge} into user ${user.id}`);
      } catch (err) {
        this.logger.warn(
          `Guest cart merge warning for session ${sessionToMerge}: ${(err as Error).message}`,
        );
      }
    }

    const tokens = await this.generateTokenPair(user, dto.deviceInfo, ipAddress);

    return {
      user: this.usersService.sanitizeUser(user) as unknown as UserProfileDto,
      tokens,
    };
  }

  /**
   * Refresh Token Rotation: Validate, revoke old token, and issue new pair
   */
  async refreshTokens(
    dto: RefreshTokenDto,
    ipAddress?: string,
  ): Promise<{ user: UserProfileDto; tokens: AuthTokensDto }> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or already rotated');
    }

    if (storedToken.isRevoked) {
      // Possible token theft detection: revoke all sessions for this user for security
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      this.logger.warn(
        `Revoked token reuse detected for user ${storedToken.userId}! Invalidating all sessions.`,
      );
      throw new UnauthorizedException('Compromised session detected. Please log in again.');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired. Please log in again.');
    }

    // Invalidate the old refresh token (Strict Token Rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account not found or inactive');
    }

    const tokens = await this.generateTokenPair(
      user,
      dto.deviceInfo || storedToken.deviceInfo || undefined,
      ipAddress,
    );

    return {
      user: this.usersService.sanitizeUser(user) as unknown as UserProfileDto,
      tokens,
    };
  }

  /**
   * Logout: Invalidate the refresh token for this specific device/session
   */
  async logout(refreshToken: string): Promise<{ success: boolean; message: string }> {
    if (!refreshToken) {
      return { success: true, message: 'Successfully logged out' };
    }

    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });

    return { success: true, message: 'Session successfully terminated' };
  }

  /**
   * Helper: Generate access + refresh token pair and persist refresh token hash
   */
  private async generateTokenPair(
    user: User,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthTokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: '30d',
    });

    const tokenHash = this.hashToken(refreshToken);

    // Expiration date: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      if (this.prisma.isConnected) {
        await this.prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash,
            deviceInfo: deviceInfo || null,
            ipAddress: ipAddress || null,
            expiresAt,
            isRevoked: false,
          },
        });
      }
    } catch (e) {
      this.logger.warn(`Could not persist refresh token: ${(e as Error).message}`);
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Deterministic SHA-256 token hashing for secure DB index lookup
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
