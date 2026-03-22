import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

/**
 * Rutas en la raíz de la app (siempre registradas con AppModule).
 * Útil para health checks / probes aunque otros módulos fallen al cargar.
 */
@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
