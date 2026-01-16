import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserActiveSelectorDialogComponent } from 'src/app/features/users/dialog/active-selector/user-active-selector-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule, MatMenuModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  themeService = inject(ThemeService);
  userService = inject(UserService);

  navItems = [
    { label: 'Campañas', icon: 'campaign', route: '/campaigns' },
    { label: 'Categorías', icon: 'category', route: '/categories' },
    { label: 'Usuarios', icon: 'group', route: '/users' }
  ];

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  openActiveUserSelector() {
    this.dialog.open(UserActiveSelectorDialogComponent, {
      width: '500px'
    });
  }
}

