import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiProperty({ description: 'Nombre del tenant', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Plan del tenant', enum: ['free', 'basic', 'pro', 'premium'], required: false })
  @IsString()
  @IsIn(['free', 'basic', 'pro', 'premium'])
  @IsOptional()
  plan?: string;

  @ApiProperty({ description: 'Status del tenant', enum: ['active', 'blocked', 'suspended'], required: false })
  @IsString()
  @IsIn(['active', 'blocked', 'suspended'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Configuraciones del tenant', required: false })
  @IsOptional()
  settings?: any;
}

