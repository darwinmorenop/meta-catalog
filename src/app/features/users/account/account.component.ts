import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from 'src/app/core/services/users/user.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { Router } from '@angular/router';
import { SupabaseAuthService } from 'src/app/core/services/admin/supabase/supabase.auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  userService = inject(UserService);
  themeService = inject(ThemeService);
  authService = inject(SupabaseAuthService);
  router = inject(Router);

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
