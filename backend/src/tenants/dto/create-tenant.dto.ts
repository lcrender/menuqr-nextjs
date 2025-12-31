import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Nombre del tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Plan del tenant', enum: ['free', 'basic', 'premium'] })
  @IsString()
  @IsIn(['free', 'basic', 'premium'])
  plan: string;

  @ApiProperty({ description: 'Configuraciones del tenant', required: false })
  @IsOptional()
  settings?: any;
}

