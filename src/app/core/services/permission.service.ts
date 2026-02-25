import { Injectable, inject, computed } from '@angular/core';
import { UserService } from 'src/app/core/services/users/user.service';
import { Action, Resource, ProfileSlug } from 'src/app/shared/entity/user.profile.entity';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userService = inject(UserService);

  currentUserProfile = this.userService.currentUserProfile;

  private readonly profileWeights: Record<string, number> = {
    [ProfileSlug.admin]: 4,
    [ProfileSlug.manager_ultra]: 3,
    [ProfileSlug.manager_pro]: 2,
    [ProfileSlug.client_basic]: 1,
    [ProfileSlug.client_free]: 0
  };

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

  hasProfile(slug: ProfileSlug): boolean {
    const profile = this.currentUserProfile();
    if (!profile) return false;
    
    // Si el perfil actual es admin, tiene todos los perfiles de menor jerarquía
    if (profile.slug === ProfileSlug.admin) return true;

    const currentWeight = this.profileWeights[profile.slug as ProfileSlug] ?? -1;
    const requiredWeight = this.profileWeights[slug] ?? 999;
    
    return currentWeight >= requiredWeight;
  }
}
