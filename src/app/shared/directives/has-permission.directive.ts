import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private resource: Resource | undefined;
  private action: Action | undefined;

  constructor() {
    effect(() => {
      // Re-evaluate when the user profile changes
      this.permissionService.currentUserProfile();
      this.updateView();
    });
  }

  @Input()
  set appHasPermission(value: [Resource, Action]) {
    this.resource = value[0];
    this.action = value[1];
    this.updateView();
  }

  private updateView() {
    if (this.resource && this.action && this.permissionService.hasPermission(this.resource, this.action)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
