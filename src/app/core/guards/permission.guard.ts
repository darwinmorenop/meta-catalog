import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);

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

    if (this.permissionService.hasPermission(resource, action)) {
      return true;
    }

    // Redirect to unauthorized page
    return this.router.createUrlTree(['/unauthorized']);
  }
}
