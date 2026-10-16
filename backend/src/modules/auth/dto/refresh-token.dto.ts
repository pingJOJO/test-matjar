import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Valid JWT Refresh Token issued by the server',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;

  @ApiPropertyOptional({
    example: 'iPhone 15 Pro / iOS 18 (AtoZ App v1.0)',
    description: 'Client device information for refreshed session audit',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
