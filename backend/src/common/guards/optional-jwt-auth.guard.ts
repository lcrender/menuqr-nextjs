import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * JWT opcional: si hay token válido, establece req.user; si no, deja continuar sin user.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const result = super.canActivate(context);
    if (typeof result === 'boolean') return result;
    if (result instanceof Promise) return result.catch(() => true);
    return result.pipe(catchError(() => of(true)));
  }

  handleRequest<TUser = any>(err: any, user: any): TUser | undefined {
    if (err || !user) return undefined;
    return user;
  }
}
