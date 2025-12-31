import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PostgresService } from '../../common/database/postgres.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly postgres: PostgresService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const users = await this.postgres.queryRaw<any>(
      `SELECT id, email, role, tenant_id as "tenantId" 
       FROM users 
       WHERE id = $1 AND deleted_at IS NULL AND is_active = true 
       LIMIT 1`,
      [payload.sub],
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const user = users[0];

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}

