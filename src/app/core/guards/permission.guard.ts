import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';
import { UserService } from 'src/app/core/services/users/user.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);
  private router = inject(Router);

  private isInitialized$ = toObservable(this.userService.isInitialized);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const resource = route.data['resource'] as Resource;
    const action = route.data['action'] as Action;

    if (!resource || !action) {
      // If no permission is required, allow access
      return true;
    }

    return this.isInitialized$.pipe(
      filter(initialized => initialized), // Wait until initialized is true
      take(1),
      map(() => {
        if (this.permissionService.hasPermission(resource, action)) {
          return true;
        }
        // Redirect to unauthorized page
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
