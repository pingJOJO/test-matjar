import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...id_token_from_google',
    description: 'Signed OpenID Connect idToken issued by Google Identity Services',
  })
  @IsString({ message: 'idToken must be a string' })
  @IsNotEmpty({ message: 'idToken is required' })
  idToken!: string;

  @ApiPropertyOptional({
    example: 'Chrome 122 on Windows 11',
    description: 'Client device information for audit and session tracking',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiPropertyOptional({
    example: 'session-guest-uuid-1234',
    description: 'Optional guest session ID to merge active guest shopping cart on login',
  })
  @IsOptional()
  @IsString()
  guestSessionId?: string;
}
