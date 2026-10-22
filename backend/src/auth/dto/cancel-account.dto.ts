import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ACCOUNT_CANCEL_REASONS = [
  'not_using',
  'too_expensive',
  'missing_features',
  'found_alternative',
  'technical_issues',
  'other',
] as const;

export type AccountCancelReason = (typeof ACCOUNT_CANCEL_REASONS)[number];

export class CancelAccountDto {
  @ApiProperty({ enum: ACCOUNT_CANCEL_REASONS })
  @IsIn(ACCOUNT_CANCEL_REASONS, { message: 'Elegí un motivo de la lista' })
  reason: AccountCancelReason;

  @ApiPropertyOptional({ description: 'Detalle si el motivo es otro' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detail?: string;
}
