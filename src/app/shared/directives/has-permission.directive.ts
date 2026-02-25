import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from 'src/app/core/services/permission.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { Action, Resource, ProfileSlug } from 'src/app/shared/entity/user.profile.entity';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);
  private conditions: Array<[Resource, Action] | ProfileSlug> = [];

  constructor() {
    effect(() => {
      // Re-evaluate when the user profile changes or when userService is initialized
      const profile = this.permissionService.currentUserProfile();
      const isInit = this.userService.isInitialized();
      
      this.updateView();
    });
  }

  @Input()
  set appHasPermission(value: [Resource, Action] | ProfileSlug | Array<[Resource, Action] | ProfileSlug> | undefined) {
    if (!value) {
      this.conditions = [];
    } else if (Array.isArray(value)) {
      // Check if it's a single [Resource, Action] OR an array of multiple conditions
      // A [Resource, Action] is an array of exactly 2 strings
      if (value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'string' && !Array.isArray(value[0])) {
        // It's a single [Resource, Action]
        this.conditions = [value as [Resource, Action]];
      } else {
        // It's an array of conditions (already as ProfileSlug[] or [[Resource, Action], ...])
        this.conditions = value as Array<[Resource, Action] | ProfileSlug>;
      }
    } else {
      // It's a single ProfileSlug
      this.conditions = [value];
    }
    this.updateView();
  }

  private updateView() {
    const profile = this.permissionService.currentUserProfile();
    const isInitialized = this.userService.isInitialized();

    // Si no está inicializado, limpiamos y salimos
    if (!isInitialized) {
      if (this.viewContainer.length > 0) this.viewContainer.clear();
      return;
    }
    
    // Si no hay condiciones, se permite por defecto
    if (this.conditions.length === 0) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
      return;
    }

    const isAllowed = this.conditions.some(condition => {
      if (Array.isArray(condition)) {
        const [resource, action] = condition;
        return this.permissionService.hasPermission(resource, action);
      } else {
        return this.permissionService.hasProfile(condition);
      }
    });

    if (isAllowed) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      if (this.viewContainer.length > 0) {
        this.viewContainer.clear();
      }
    }
  }
}
