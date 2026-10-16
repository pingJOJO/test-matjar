import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: 'Ahmed Ali', description: 'Recipient full name' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @ApiProperty({ example: '+966501234567', description: 'Contact telephone' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;

  @ApiProperty({ example: 'King Fahd Road, Al Olaya', description: 'Street address line 1' })
  @IsString()
  @IsNotEmpty({ message: 'Street address line 1 is required' })
  streetLine1!: string;

  @ApiPropertyOptional({ example: 'Apt 402, Building B', description: 'Street address line 2' })
  @IsOptional()
  @IsString()
  streetLine2?: string;

  @ApiProperty({ example: 'Riyadh', description: 'City name' })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @ApiPropertyOptional({ example: 'Riyadh Province', description: 'State, province, or region' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '12214', description: 'Postal or ZIP code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'SA', description: 'ISO 2-letter country code', default: 'SA' })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string = 'SA';
}

export class CheckoutDto {
  @ApiProperty({
    type: AddressDto,
    description: 'Shipping destination address',
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty({ message: 'Shipping address is required' })
  shippingAddress!: AddressDto;

  @ApiPropertyOptional({
    type: AddressDto,
    description: 'Billing address (defaults to shipping address if omitted)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @ApiPropertyOptional({
    example: 'customer@example.com',
    description: 'Customer contact email (mandatory for guest checkout)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid customer email address' })
  customerEmail?: string;

  @ApiPropertyOptional({
    example: '+966501234567',
    description: 'Customer primary contact phone',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    example: 'Please leave package by the front door.',
    description: 'Special delivery instructions or notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'AED',
    description: 'ISO currency code (e.g. AED, USD, SAR). Defaults to USD.',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'guest-session-uuid-12345',
    description: 'Session ID if performing guest checkout',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
