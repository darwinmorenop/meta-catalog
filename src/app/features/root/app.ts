import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserActiveSelectorDialogComponent } from 'src/app/features/users/dialog/active-selector/user-active-selector-dialog.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';
import { AuthService } from 'src/app/core/services/auth/auth.service';

import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    HasPermissionDirective
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})
export class AppComponent {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = AppComponent.name;
  themeService = inject(ThemeService);
  userService = inject(UserService);
  permissionService = inject(PermissionService);
  authService = inject(AuthService);

  readonly Resource = Resource;
  readonly Action = Action;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  navItems = [
    { label: 'Campañas', icon: 'campaign', route: '/campaigns', resource: Resource.campaigns },
    { label: 'Categorías', icon: 'category', route: '/categories', resource: Resource.categories },
    { label: 'Scrap', icon: 'inventory_2', route: '/scraps', resource: Resource.scraps },
  ];

  navigateTo(route: string) {
    const context = "navigateTo";
    this.loggerService.trace(`Navigating to: ${route}`, this.CLASS_NAME, context);
    this.router.navigate([route]);
    if (this.sidenav && this.sidenav.mode === 'over') {
        this.sidenav.close();
    }
  }

  openActiveUserSelector() {
    this.dialog.open(UserActiveSelectorDialogComponent, {
      width: '500px'
    });
  }

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
