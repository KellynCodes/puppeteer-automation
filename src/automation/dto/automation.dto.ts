import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  Matches,
  Length,
} from 'class-validator';

export class AddCardDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'User ID to unlock stored Paramount+ credentials',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '4111111111111111',
    description: 'Card number (16 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'Invalid card number format' })
  cardNumber: string;

  @ApiProperty({ example: 'John Doe', description: 'Cardholder name' })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @ApiProperty({ example: '12', description: 'Expiry month (01-12)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Invalid expiry month' })
  expiryMonth: string;

  @ApiProperty({ example: '2025', description: 'Expiry year (YYYY)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'Invalid expiry year' })
  expiryYear: string;

  @ApiProperty({ example: '123', description: 'CVV (3-4 digits)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, { message: 'Invalid CVV' })
  cvv: string;

  @ApiProperty({ example: '10001', description: 'ZIP/Postal code' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  zipCode: string;
}

export class CardLogResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({
    example: 'add_card',
    enum: ['add_card', 'update_card', 'login'],
  })
  action: string;

  @ApiProperty({ example: 'success', enum: ['success', 'failed', 'pending'] })
  status: string;

  @ApiProperty({ example: '1111' })
  cardLast4Digits?: string;

  @ApiProperty({ example: 'John Doe' })
  cardHolder?: string;

  @ApiProperty({ example: 'Card added successfully' })
  errorMessage?: string;

  @ApiProperty({ example: 1500 })
  duration?: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
