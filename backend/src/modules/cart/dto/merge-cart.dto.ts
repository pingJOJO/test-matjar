import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({
    example: 'guest-session-uuid-12345',
    description: 'The guest session ID whose items should be merged into the logged-in user cart',
  })
  @IsString()
  @IsNotEmpty({ message: 'Guest session ID is required for merging' })
  guestSessionId!: string;
}
