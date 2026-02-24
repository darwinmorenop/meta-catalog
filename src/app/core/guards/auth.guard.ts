import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isInitialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      // Redirect to login page
      return router.createUrlTree(['/login']);
    })
  );
};
