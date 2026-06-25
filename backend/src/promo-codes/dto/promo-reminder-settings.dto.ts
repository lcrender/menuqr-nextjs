import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PromoReminderRuleDto {
  @IsInt()
  @Min(1)
  daysBefore!: number;

  @IsString()
  subject!: string;

  @IsString()
  bodyHtml!: string;
}

export class UpdatePromoReminderSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PromoReminderRuleDto)
  reminders?: PromoReminderRuleDto[];
}
