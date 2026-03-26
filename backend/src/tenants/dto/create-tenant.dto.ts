import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Nombre del tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Plan del tenant', enum: ['free', 'starter', 'pro', 'premium', 'pro_team'] })
  @IsString()
  @IsIn(['free', 'starter', 'pro', 'premium', 'pro_team'])
  plan: string;

  @ApiProperty({ description: 'Configuraciones del tenant', required: false })
  @IsOptional()
  settings?: any;
}

