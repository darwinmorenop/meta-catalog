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
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserActiveSelectorDialogComponent } from 'src/app/features/users/dialog/active-selector/user-active-selector-dialog.component';

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
    MatExpansionModule
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})
export class AppComponent {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  themeService = inject(ThemeService);
  userService = inject(UserService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  navItems = [
    { label: 'Campañas', icon: 'campaign', route: '/campaigns' },
    { label: 'Categorías', icon: 'category', route: '/categories' },
  ];

  navigateTo(route: string) {
    console.log('Navigating to:', route);
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
}
