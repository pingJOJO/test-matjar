import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'customer@example.com' })
  email!: string;

  @ApiProperty({ example: 'Ahmed', nullable: true })
  firstName?: string | null;

  @ApiProperty({ example: 'Ali', nullable: true })
  lastName?: string | null;

  @ApiProperty({ example: '+966500000000', nullable: true })
  phone?: string | null;

  @ApiProperty({ example: 'CUSTOMER', enum: ['CUSTOMER', 'ADMIN', 'MANAGER', 'SUPPORT'] })
  role!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  status!: string;

  @ApiProperty({ example: false })
  isEmailVerified!: boolean;

  @ApiProperty({ example: '2026-10-09T15:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-09T15:00:00.000Z' })
  updatedAt!: Date;
}

export class AuthTokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Short-lived JWT Access Token (15 minutes validity)',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Long-lived JWT Refresh Token (30 days validity)',
  })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: 900, description: 'Access token expiration in seconds (15 min)' })
  expiresIn!: number;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}
