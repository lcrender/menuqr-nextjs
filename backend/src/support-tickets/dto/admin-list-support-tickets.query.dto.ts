import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminListSupportTicketsQueryDto {
  @ApiPropertyOptional({ enum: ['open', 'in_progress', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'in_progress', 'closed'])
  status?: 'open' | 'in_progress' | 'closed';

  @ApiPropertyOptional({ description: 'Búsqueda parcial por email de usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  userEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
