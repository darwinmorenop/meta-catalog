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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserActiveSelectorDialogComponent } from 'src/app/features/users/dialog/active-selector/user-active-selector-dialog.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Action, ProfileSlug, Resource } from 'src/app/shared/entity/user.profile.entity';
import { AuthService } from 'src/app/core/services/auth/auth.service';

import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';
import { SupabaseAuthService } from 'src/app/core/services/admin/supabase/supabase.auth.service';

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
    MatProgressSpinnerModule,
    HasPermissionDirective
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})
export class AppComponent {
  public router = inject(Router);
  private dialog = inject(MatDialog);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = AppComponent.name;
  themeService = inject(ThemeService);
  userService = inject(UserService);
  permissionService = inject(PermissionService);
  authService = inject(AuthService);
  supabaseAuthService = inject(SupabaseAuthService);

  readonly Resource = Resource;
  readonly Action = Action;
  readonly ProfileSlug = ProfileSlug;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly navItems: any[] = [
    { label: 'Tienda', icon: 'storefront', route: '/store', permissions: [[Resource.store, Action.view]] },
    {
      label: 'Productos',
      icon: 'inventory_2',
      permissions: [[Resource.products, Action.view]],
      children: [
        { label: 'Precios', icon: 'payments', route: '/products-price-dashboard' },
        {
          label: 'Flujo',
          icon: 'sync_alt',
          permissions: [[Resource.inventory_movements, Action.view], [Resource.sales, Action.view], [Resource.inventory_stock, Action.view]],
          children: [
            { label: 'Movimientos', icon: 'history', route: '/inventory/movements', permissions: [[Resource.inventory_movements, Action.view]] },
            { label: 'Compras', icon: 'inventory_2', route: '/inventory/stock-entry', permissions: [[Resource.inventory_stock, Action.view]] },
            { label: 'Ventas', icon: 'analytics', route: '/sales/inventory', permissions: [[Resource.sales, Action.view]] }
          ]
        }
      ]
    },
    {
      label: 'Compras',
      icon: 'shopping_bag',
      permissions: [[Resource.inventory_inbound, Action.view]],
      children: [
        { label: 'Documentos', icon: 'inventory', route: '/inventory/inbound' },
        { label: 'Registrar', icon: 'add_circle', route: '/inventory/inbound/register' }
      ]
    },
    {
      label: 'Ventas',
      icon: 'receipt_long',
      permissions: [[Resource.sales, Action.view]],
      children: [
        { label: 'Documentos', icon: 'receipt_long', route: '/sales' },
        { label: 'Registrar', icon: 'add_shopping_cart', route: '/sales/register' }
      ]
    },
    {
      label: 'Usuarios',
      icon: 'group',
      permissions: [[Resource.users, Action.view]],
      children: [
        { label: 'Cuenta', icon: 'account_circle', route: '/users/account' },
        { label: 'Listado', icon: 'list', route: '/users' },
        { label: 'Agenda', icon: 'contact_mail', route: '/users/agenda' },
        {
          label: 'Listas',
          icon: 'view_list',
          children: [
            { label: 'General', icon: 'list', route: '/users/lists' },
            { label: 'Favoritos', icon: 'favorite', route: '/favorites' },
            { label: 'Seguimiento', icon: 'track_changes', route: '/tracking' },
            { label: 'Stock', icon: 'notifications', route: '/stock-notifier' }
          ]
        }
      ]
    },
    {
      label: 'Admin',
      icon: 'admin_panel_settings',
      permissions: [ProfileSlug.admin],
      children: [
        {
          label: 'Productos',
          icon: 'inventory_2',
          children: [
            { label: 'Scrap', icon: 'inventory_2', route: '/scraps/products' },
            { label: 'General', icon: 'list', route: '/products' },
            { label: 'Media', icon: 'image', route: '/products-media-dashboard' }
          ]
        },
        { label: 'Scrap', icon: 'sync', route: '/scraps' },
        { label: 'Categorías', icon: 'category', route: '/categories' },
        { label: 'Campañas', icon: 'campaign', route: '/campaigns' },
        {
          label: 'Usuarios',
          icon: 'group',
          children: [
            { label: 'Perfiles', icon: 'security', route: '/users/profiles' }
          ]
        }
      ]
    },
    { label: 'Carrito', icon: 'shopping_cart', route: '/cart/dashboard', permissions: [[Resource.cart, Action.view]] }
  ];

  /**
   * Aplana los hijos de un nav item para mostrarlos en un único mat-menu (sin sub-menús anidados).
   * Los grupos se separan con divisores y cabeceras.
   */
  flattenForToolbar(children: any[]): any[] {
    const result: any[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.children) {
        // Divisor antes del grupo (si no está vacío y el último no es un divisor)
        if (result.length > 0 && result[result.length - 1].type !== 'divider') {
          result.push({ type: 'divider' });
        }

        // Cabecera del grupo
        result.push({ type: 'header', label: child.label, icon: child.icon, permissions: child.permissions });

        // Hijos del grupo (solo un nivel de profundidad extra)
        for (const grandchild of child.children) {
          result.push({ type: 'item', ...grandchild });
        }

        // Divisor después del grupo (si no es el último top-level item)
        if (i < children.length - 1) {
          result.push({ type: 'divider' });
        }
      } else {
        result.push({ type: 'item', ...child });
      }
    }
    return result;
  }

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
    this.supabaseAuthService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
