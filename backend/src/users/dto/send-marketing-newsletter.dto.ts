import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { TENANT_PLAN_KEYS } from '../../common/plan-limits/plan-limits.constants';

export const MARKETING_AUDIENCES = ['test', 'verified', 'all', 'plan'] as const;
export type MarketingAudience = (typeof MARKETING_AUDIENCES)[number];

export class SendMarketingNewsletterDto {
  @ApiProperty({ enum: MARKETING_AUDIENCES })
  @IsIn(MARKETING_AUDIENCES)
  audience!: MarketingAudience;

  @ApiProperty({ description: 'Asunto del email' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ description: 'Cuerpo HTML (contenido interno; el sistema aplica el shell)' })
  @IsString()
  @MinLength(10)
  @MaxLength(100_000)
  bodyHtml!: string;

  @ApiPropertyOptional({ enum: ['es', 'en'], default: 'es' })
  @IsOptional()
  @IsIn(['es', 'en'])
  lang?: 'es' | 'en';

  @ApiPropertyOptional({ description: 'Email de prueba (audience=test)' })
  @ValidateIf((o) => o.audience === 'test')
  @IsEmail()
  testEmail?: string;

  @ApiPropertyOptional({ description: 'Plan del tenant (audience=plan)', enum: TENANT_PLAN_KEYS })
  @ValidateIf((o) => o.audience === 'plan')
  @IsIn([...TENANT_PLAN_KEYS])
  plan?: (typeof TENANT_PLAN_KEYS)[number];
}
