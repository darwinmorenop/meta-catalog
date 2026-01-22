import { Injectable, inject, computed } from '@angular/core';
import { UserService } from 'src/app/core/services/users/user.service';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userService = inject(UserService);

  currentUserProfile = this.userService.currentUserProfile;

  hasPermission(resource: Resource, action: Action): boolean {
    const profile = this.currentUserProfile();

    // If no profile or no permissions, deny access
    if (!profile || !profile.permissions) {
      return false;
    }

    // Get permissions for the specific resource
    const resourcePermissions = profile.permissions[resource];

    if (!resourcePermissions) {
        return false;
    }

    // Check if the user has the 'admin' action for this resource, which usually implies full access
    if (resourcePermissions.includes(Action.admin)) {
        return true;
    }

    // Check if the specific action is allowed
    return resourcePermissions.includes(action);
  }
}
